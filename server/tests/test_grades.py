"""
Tests for grades and assignment endpoints.
"""
from models import Classroom, Assignment, Grade


class TestAssignmentAPI:
    """Test assignment CRUD operations."""

    def test_list_assignments_unauthorized(self, client):
        """Listing assignments without auth should return 401."""
        response = client.get('/api/grades/someid/assignments')

        assert response.status_code == 401

    def test_create_assignment(self, authenticated_client):
        """Instructor should be able to create an assignment."""
        client, user = authenticated_client

        # Create a classroom first
        classroom = Classroom(
            name='Test Class',
            term='Fall 2026',
            instructor=user,
            join_code='TEST01'
        )
        classroom.save()

        # Create assignment
        response = client.post(f'/api/grades/{classroom.id}/assignments', json={
            'title': 'Homework 1',
            'description': 'First homework assignment',
            'points_possible': 100,
            'due_date': '2026-02-01T23:59:00Z'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Homework 1'

        # Cleanup
        Assignment.objects(classroom=classroom).delete()
        classroom.delete()

    def test_list_assignments(self, authenticated_client):
        """Should list all assignments for a class."""
        client, user = authenticated_client

        # Create classroom and assignment
        classroom = Classroom(
            name='Test Class',
            term='Fall 2026',
            instructor=user,
            join_code='TEST02'
        )
        classroom.save()

        assignment = Assignment(
            classroom=classroom,
            title='Test Assignment',
            points_possible=50
        )
        assignment.save()

        # List assignments
        response = client.get(f'/api/grades/{classroom.id}/assignments')

        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]['title'] == 'Test Assignment'
        assert data[0]['points_possible'] == 50

        # Cleanup
        assignment.delete()
        classroom.delete()


class TestGradeAPI:
    """Test grade operations."""

    def test_update_grade(self, authenticated_client, student_client):
        """Instructor should be able to update a student's grade."""
        instructor_client, instructor = authenticated_client
        _, student = student_client

        # Create classroom with student enrolled
        classroom = Classroom(
            name='Grade Test Class',
            term='Fall 2026',
            instructor=instructor,
            students=[student],
            join_code='GRADE1'
        )
        classroom.save()

        # Create assignment
        assignment = Assignment(
            classroom=classroom,
            title='Graded Assignment',
            points_possible=100
        )
        assignment.save()

        # Update grade
        response = instructor_client.post(
            f'/api/grades/assignment/{assignment.id}/grades',
            json={
                'student_id': str(student.id),
                'score': 85,
                'feedback': 'Good work!'
            }
        )

        assert response.status_code == 200

        # Verify grade was saved
        grade = Grade.objects(assignment=assignment, student=student).first()
        assert grade is not None
        assert grade.score == 85
        assert grade.feedback == 'Good work!'

        # Cleanup
        Grade.objects(assignment=assignment).delete()
        assignment.delete()
        classroom.delete()
