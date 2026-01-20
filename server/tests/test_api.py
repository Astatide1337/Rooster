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
