"""
Tests for API user endpoints.
"""


class TestUserAPI:
    """Test user-related API endpoints."""

    def test_get_user_unauthorized(self, client):
        """Getting user without session should return 401."""
        response = client.get('/api/user')

        assert response.status_code == 401
        data = response.get_json()
        assert data['user'] is None

    def test_get_user_authenticated(self, authenticated_client):
        """Getting user with valid session should return user data."""
        client, user = authenticated_client

        response = client.get('/api/user')

        assert response.status_code == 200
        data = response.get_json()
        assert 'user' in data
        assert data['user']['email'] == 'instructor@example.com'
        assert data['user']['name'] == 'Test Instructor'
        assert data['user']['role'] == 'instructor'


class TestUserUpdate:
    """Test user update endpoint role restrictions."""

    def test_new_user_can_set_role(self, app):
        """New user without role can set their role."""
        from models import User

        client = app.test_client()

        # Create user without role
        user = User(
            name='New User',
            email='newuser@example.com',
            google_id='new123'
        )
        user.save()

        try:
            with client.session_transaction() as sess:
                sess['user_id'] = str(user.id)

            response = client.post('/api/user/update', json={
                'role': 'student',
                'major': 'Computer Science',
                'grad_year': 2027,
                'student_id': '12345678'
            })

            assert response.status_code == 200
            user.reload()
            assert user.role == 'student'
            assert user.major == 'Computer Science'
        finally:
            user.delete()

    def test_existing_user_cannot_change_role(self, authenticated_client):
        """Existing user with role cannot change it."""
        client, user = authenticated_client

        original_role = user.role

        response = client.post('/api/user/update', json={
            'role': 'student'  # Try to change from instructor to student
        })

        assert response.status_code == 200
        user.reload()
        assert user.role == original_role  # Role unchanged
