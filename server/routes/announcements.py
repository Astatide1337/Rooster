from flask import Blueprint, jsonify, session, request
from models import User, Classroom, Announcement
import datetime

announcements_bp = Blueprint('announcements', __name__)

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.objects(id=user_id).first()


@announcements_bp.route('/<classroom_id>/announcements', methods=['GET'])
def list_announcements(classroom_id):
    """List all announcements for a classroom (newest first)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    # Must be instructor or student
    if user != classroom.instructor and user not in classroom.students:
        return jsonify({'error': 'Permission denied'}), 403
    
    announcements = Announcement.objects(classroom=classroom).order_by('-created_at')
    
    return jsonify([{
        'id': str(a.id),
        'title': a.title,
        'content': a.content,
        'author': {
            'id': str(a.author.id),
            'name': a.author.name,
            'picture': a.author.picture
        },
        'created_at': a.created_at.isoformat() + 'Z',
        'updated_at': a.updated_at.isoformat() + 'Z' if a.updated_at else None
    } for a in announcements])


@announcements_bp.route('/<classroom_id>/announcements', methods=['POST'])
def create_announcement(classroom_id):
    """Create a new announcement (instructor only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor:
        return jsonify({'error': 'Only instructor can create announcements'}), 403
    
    data = request.json
    title = data.get('title')
    content = data.get('content')
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
    
    announcement = Announcement(
        classroom=classroom,
        author=user,
        title=title,
        content=content
    )
    announcement.save()
    
    return jsonify({
        'id': str(announcement.id),
        'title': announcement.title,
        'content': announcement.content,
        'created_at': announcement.created_at.isoformat() + 'Z'
    })


@announcements_bp.route('/announcement/<announcement_id>', methods=['PUT'])
def update_announcement(announcement_id):
    """Update an announcement (instructor only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    announcement = Announcement.objects(id=announcement_id).first()
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404
    
    if user != announcement.classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.json
    if 'title' in data:
        announcement.title = data['title']
    if 'content' in data:
        announcement.content = data['content']
    
    announcement.updated_at = datetime.datetime.utcnow()
    announcement.save()
    
    return jsonify({'ok': True})


@announcements_bp.route('/announcement/<announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    """Delete an announcement (instructor only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    announcement = Announcement.objects(id=announcement_id).first()
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404
    
    if user != announcement.classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    announcement.delete()
    
    return jsonify({'ok': True})
