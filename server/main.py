import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from mongoengine import connect

load_dotenv()

app = Flask(__name__)
# Security: Enforce strong secret key in production
if os.getenv('FLASK_DEBUG', 'False').lower() != 'true' and not os.getenv('SECRET_KEY'):
    raise ValueError("No SECRET_KEY set for production application. Please set it in .env")

app.secret_key = os.getenv("SECRET_KEY", "dev-secret")

# MongoDB Configuration
connect(host=os.getenv('MONGO_URI', 'mongodb://localhost:27017/class_roster'))

 # Enable CORS for development; allow credentials so SPA can use cookies
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')])

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


# ----- Global Error Handlers -----
from flask import jsonify
from mongoengine.errors import ValidationError as MongoValidationError

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
from routes.api import api_bp
app.register_blueprint(api_bp, url_prefix='/api')

from routes.classrooms import classrooms_bp
app.register_blueprint(classrooms_bp, url_prefix='/api/classrooms')

from routes.roster import roster_bp
app.register_blueprint(roster_bp, url_prefix='/api/roster')

from routes.grades import grades_bp
app.register_blueprint(grades_bp, url_prefix='/api/grades')

from routes.auth import auth_bp
app.register_blueprint(auth_bp)

from routes.announcements import announcements_bp
app.register_blueprint(announcements_bp, url_prefix='/api/announcements')


if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode)
