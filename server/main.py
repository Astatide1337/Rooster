import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from mongoengine import connect

load_dotenv()

app = Flask(__name__)
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


# Register blueprints (implemented in routes/)
try:
    from routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
except Exception:
    # routes not created yet
    pass

try:
    from routes.classrooms import classrooms_bp
    app.register_blueprint(classrooms_bp, url_prefix='/api/classrooms')
except Exception:
    pass

try:
    from routes.roster import roster_bp
    app.register_blueprint(roster_bp, url_prefix='/api/roster')
except Exception:
    pass

try:
    from routes.grades import grades_bp
    app.register_blueprint(grades_bp, url_prefix='/api/grades')
except Exception:
    pass

try:
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)
except Exception:
    pass

try:
    from routes.announcements import announcements_bp
    app.register_blueprint(announcements_bp, url_prefix='/api/announcements')
except Exception:
    pass


if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode)
