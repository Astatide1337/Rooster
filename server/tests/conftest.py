"""
Pytest fixtures for testing the Flask application.
"""
import pytest
import os
import sys

# Set test environment variables BEFORE any imports
os.environ['FLASK_DEBUG'] = 'True'
os.environ['SECRET_KEY'] = 'test-secret-key-for-testing-only-64-chars-long-string-here'
os.environ['MONGO_URI'] = 'mongodb://localhost:27017/test_db'
os.environ['FRONTEND_URL'] = 'http://localhost:5173'
os.environ['OAUTH_CLIENT_ID'] = 'test-client-id'
os.environ['OAUTH_CLIENT_SECRET'] = 'test-client-secret'
os.environ['OAUTH_REDIRECT_URI'] = 'http://localhost:5000/auth'
# Prevent main.py from connecting to real MongoDB
os.environ['TESTING'] = 'True'

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    # Patch mongoengine to use mongomock before importing app
    import mongomock
    import mongoengine

    # Disconnect any existing connections
    mongoengine.disconnect_all()

    # Connect with mongomock
    mongoengine.connect(
        'test_db',
        mongo_client_class=mongomock.MongoClient,
        uuidRepresentation='standard'
    )

    from main import app as flask_app

    flask_app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
    })

    yield flask_app

    # Cleanup
    mongoengine.disconnect_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def authenticated_client(client, app):
    """Create test client with authenticated session."""
    from models import User

    # Create a test user
    test_user = User(
        email='instructor@example.com',
        google_id='test-google-id-instructor-12345',
        name='Test Instructor',
        role='instructor'
    )
    test_user.save()

    # Set session
    with client.session_transaction() as sess:
        sess['user_id'] = str(test_user.id)

    yield client, test_user

    # Cleanup
    test_user.delete()


@pytest.fixture
def student_client(app):
    """Create test client with authenticated student session."""
    from models import User

    client = app.test_client()

    # Create a test student
    test_student = User(
        email='student@example.com',
        google_id='test-student-google-id-12345',
        name='Test Student',
        role='student',
        student_id='STU001',
        major='Computer Science'
    )
    test_student.save()

    # Set session
    with client.session_transaction() as sess:
        sess['user_id'] = str(test_student.id)

    yield client, test_student

    # Cleanup
    test_student.delete()
