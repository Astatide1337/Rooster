from flask import Blueprint, jsonify, session, request
from models import User

api_bp = Blueprint('api', __name__)


@api_bp.route('/hello')
def hello():
    return jsonify({"message": "Hello from API"})


@api_bp.route('/user')
def user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None}), 401
    
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'user': None}), 404
        
    return jsonify({
        'user': {
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'picture': user.picture,
            'role': user.role,
            'major': user.major,
            'grad_year': user.grad_year,
            'student_id': user.student_id
        }
    })


@api_bp.route('/user/update', methods=['POST'])
def update_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    # Security: Whitelist allowed fields to prevent privilege escalation
    allowed_fields = ['major', 'grad_year', 'student_id']
    
    # Role can only be set during initial profile setup (when not already set)
    if 'role' in data and not user.role:
        if data['role'] in ['student', 'instructor']:
            user.role = data['role']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    user.save()
    return jsonify({'ok': True})


@api_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})
