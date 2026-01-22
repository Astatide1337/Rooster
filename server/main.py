from routes.announcements import announcements_bp
from routes.auth import auth_bp
from routes.grades import grades_bp
from routes.roster import roster_bp
from routes.classrooms import classrooms_bp
from routes.api import api_bp
from mongoengine.errors import ValidationError as MongoValidationError
import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from mongoengine import connect

load_dotenv()

app = Flask(__name__)
# Security: Enforce strong secret key in production
if os.getenv('FLASK_DEBUG', 'False').lower() != 'true' and not os.getenv('SECRET_KEY'):
    raise ValueError(
        "No SECRET_KEY set for production application. Please set it in .env")

app.secret_key = os.getenv("SECRET_KEY", "dev-secret")

# MongoDB Configuration - skip if in test mode (tests use mongomock)
if not os.getenv('TESTING'):
    connect(host=os.getenv('MONGO_URI', 'mongodb://localhost:27017/class_roster'))

 # Enable CORS for development; allow credentials so SPA can use cookies
CORS(app, supports_credentials=True, origins=[
     os.getenv('FRONTEND_URL', 'http://localhost:5173')])

# Configure session cookie for cross-site OAuth redirects in dev.
# `SameSite=None` with `Secure=True` is required by modern browsers to allow
# cookies to be set during third-party redirects (Google -> your /auth route).
# Localhost is treated as a secure context in most browsers, so `Secure=True`
# works for development. Adjust for production as needed.
app.config.update({
    'SESSION_COOKIE_SAMESITE': 'None',
    'SESSION_COOKIE_SECURE': True,
    'SESSION_COOKIE_HTTPONLY': True,
})


@app.route('/')
def hello_world():
    return 'Hello, World!'


# ----- Health Check Endpoints -----
@app.route('/health')
def health_check():
    """Liveness probe - confirms the application is running."""
    return jsonify({'status': 'healthy'}), 200


@app.route('/ready')
def readiness_check():
    """Readiness probe - confirms the application can serve requests."""
    try:
        from mongoengine import get_db
        get_db().command('ping')
        return jsonify({'status': 'ready', 'database': 'connected'}), 200
    except Exception as e:
        app.logger.error(f"Readiness check failed: {e}")
        return jsonify({'status': 'not ready', 'database': 'disconnected'}), 503


# ----- Global Error Handlers -----


@app.errorhandler(MongoValidationError)
def handle_mongo_validation_error(error):
    """Handle Mongoengine validation errors (e.g., bad email format)."""
    # Parse the error message to be more user-friendly
    message = str(error)
    # Try to extract the field name and reason
    # Example: ValidationError (User:None) (Invalid email address: Doe: ['email'])
    if 'Invalid email address' in message:
        message = "Invalid email address provided."
    elif 'required' in message.lower():
        message = "A required field is missing."
    else:
        # Generic fallback
        message = f"Validation error: {message}"

    return jsonify({'error': message}), 400


@app.errorhandler(Exception)
def handle_generic_exception(error):
    """Catch-all handler for unexpected server errors."""
    # Log the full error for debugging
    app.logger.exception("Unhandled exception: %s", error)
    # Return a generic message to the user (don't expose internal details)
    return jsonify({'error': 'An unexpected server error occurred. Please try again later.'}), 500


# Register blueprints (implemented in routes/)
app.register_blueprint(api_bp, url_prefix='/api')

app.register_blueprint(classrooms_bp, url_prefix='/api/classrooms')

app.register_blueprint(roster_bp, url_prefix='/api/roster')

app.register_blueprint(grades_bp, url_prefix='/api/grades')

app.register_blueprint(auth_bp)

app.register_blueprint(announcements_bp, url_prefix='/api/announcements')


if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode)
