from flask import Blueprint, jsonify, session, request
from models import User, Classroom
from mongoengine import Q
import secrets
import string
import datetime

classrooms_bp = Blueprint('classrooms', __name__)

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.objects(id=user_id).first()

@classrooms_bp.route('/', methods=['GET'])
def list_classrooms():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Classes where user is instructor OR student, only active ones
    classes = Classroom.objects((Q(instructor=user) | Q(students=user)) & Q(status='active'))
    
    return jsonify([{
        'id': str(c.id),
        'name': c.name,
        'term': c.term,
        'section': c.section,
        'instructor_name': c.instructor.name,
        'is_instructor': c.instructor == user,
        'join_code': c.join_code if c.instructor == user else None
    } for c in classes])

@classrooms_bp.route('/', methods=['POST'])
def create_classroom():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    name = data.get('name')
    term = data.get('term')
    section = data.get('section')
    
    if not name or not term:
        return jsonify({'error': 'Name and Term are required'}), 400
    
    # Generate unique join code
    join_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    while Classroom.objects(join_code=join_code).first():
        join_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    
    classroom = Classroom(
        name=name,
        term=term,
        section=section,
        instructor=user,
        join_code=join_code
    )
    classroom.save()
    
    return jsonify({
        'id': str(classroom.id),
        'name': classroom.name,
        'join_code': classroom.join_code
    })

@classrooms_bp.route('/join', methods=['POST'])
def join_classroom():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    code = data.get('code')
    
    if not code:
        return jsonify({'error': 'Join code is required'}), 400
    
    classroom = Classroom.objects(join_code=code.upper()).first()
    if not classroom:
        return jsonify({'error': 'Invalid join code'}), 404
    
    if user == classroom.instructor:
        return jsonify({'error': 'You are the instructor of this class'}), 400
    
    if user in classroom.students:
        return jsonify({'error': 'Already enrolled in this class'}), 400
    
    classroom.students.append(user)
    classroom.save()
    
    return jsonify({
        'id': str(classroom.id),
        'name': classroom.name,
        'message': 'Successfully joined the class'
    })

@classrooms_bp.route('/<classroom_id>', methods=['GET'])
def get_classroom(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    # Check permission
    if user != classroom.instructor and user not in classroom.students:
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify({
        'id': str(classroom.id),
        'name': classroom.name,
        'term': classroom.term,
        'section': classroom.section,
        'description': classroom.description,
        'instructor': {
            'name': classroom.instructor.name,
            'email': classroom.instructor.email
        },
        'is_instructor': classroom.instructor == user,
        'join_code': classroom.join_code if classroom.instructor == user else None
    })

@classrooms_bp.route('/<classroom_id>', methods=['DELETE'])
def delete_classroom(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Optional: Delete related assignments, grades, attendance?
    # For now, just deleting the class which will orphan them or cascade if configured
    classroom.delete()
    
    return jsonify({'ok': True, 'message': 'Classroom deleted'})

@classrooms_bp.route('/<classroom_id>', methods=['DELETE'])
def delete_classroom(classroom_id):
    """Soft delete a classroom - only instructor can do this."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    # Only instructor can delete
    if classroom.instructor != user:
        return jsonify({'error': 'Only the instructor can delete this class'}), 403
    
    # Soft delete: set status to inactive
    classroom.status = 'inactive'
    classroom.deleted_at = datetime.datetime.utcnow()
    classroom.save()
    
    return jsonify({'ok': True, 'message': 'Class has been deleted'})
