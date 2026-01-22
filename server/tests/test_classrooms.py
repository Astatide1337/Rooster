"""
Tests for classroom management endpoints.
"""
from models import Classroom


class TestClassroomAPI:
    """Test classroom CRUD operations."""

    def test_list_classrooms_unauthorized(self, client):
        """Listing classrooms without auth should return 401."""
        response = client.get('/api/classrooms/')

        assert response.status_code == 401

    def test_list_classrooms_empty(self, authenticated_client):
        """Listing classrooms with no classes should return empty list."""
        client, user = authenticated_client

        response = client.get('/api/classrooms/')

        assert response.status_code == 200
        data = response.get_json()
        assert data == []

    def test_create_classroom(self, authenticated_client):
        """Creating a classroom should return the new class."""
        client, user = authenticated_client

        response = client.post('/api/classrooms/', json={
            'name': 'Test Class 101',
            'term': 'Fall 2026',
            'section': 'A'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Test Class 101'
        assert 'id' in data
        assert 'join_code' in data
        assert len(data['join_code']) == 6

        # Cleanup
        Classroom.objects(id=data['id']).delete()

    def test_create_classroom_missing_name(self, authenticated_client):
        """Creating a classroom without name should fail."""
        client, user = authenticated_client

        response = client.post('/api/classrooms/', json={
            'term': 'Fall 2026'
        })

        assert response.status_code == 400

    def test_join_classroom_invalid_code(self, student_client):
        """Joining with invalid code should return error."""
        client, student = student_client

        response = client.post('/api/classrooms/join', json={
            'code': 'INVALID'
        })

        assert response.status_code == 404


class TestClassroomJoinFlow:
    """Test the classroom join flow."""

    def test_student_can_join_classroom(self, authenticated_client, student_client):
        """Student should be able to join a class with valid code."""
        instructor_client, instructor = authenticated_client
        student_client_obj, student = student_client

        # Instructor creates class
        create_response = instructor_client.post('/api/classrooms/', json={
            'name': 'Test Join Class',
            'term': 'Fall 2026'
        })
        assert create_response.status_code == 200
        class_data = create_response.get_json()
        join_code = class_data['join_code']
        class_id = class_data['id']

        # Student joins class
        join_response = student_client_obj.post('/api/classrooms/join', json={
            'code': join_code
        })
        assert join_response.status_code == 200

        # Verify student is in roster
        classroom = Classroom.objects(id=class_id).first()
        assert student in classroom.students

        # Cleanup
        classroom.delete()
