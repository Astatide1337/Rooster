"""
Tests for health check endpoints.
"""


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_health_endpoint_returns_200(self, client):
        """Health endpoint should return 200 with healthy status."""
        response = client.get('/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
    
    def test_ready_endpoint_returns_status(self, client):
        """Ready endpoint should return database connection status."""
        response = client.get('/ready')
        
        # With mongomock, this should return ready
        assert response.status_code in [200, 503]
        data = response.get_json()
        assert 'status' in data
        assert 'database' in data


class TestRootEndpoint:
    """Test root endpoint."""
    
    def test_root_returns_hello_world(self, client):
        """Root endpoint should return Hello, World!"""
        response = client.get('/')
        
        assert response.status_code == 200
        assert b'Hello, World!' in response.data
