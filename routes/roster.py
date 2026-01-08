from flask import Blueprint, jsonify, session, request
from models import User, Classroom, AttendanceSession, AttendanceRecord
import datetime
import secrets
import string

roster_bp = Blueprint('roster', __name__)

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.objects(id=user_id).first()

@roster_bp.route('/<classroom_id>/students', methods=['GET'])
def get_roster(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    # Permission: only instructor
    if user != classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    roster = [{
        'id': str(s.id),
        'name': s.name,
        'email': s.email,
        'picture': s.picture,
        'major': s.major,
        'grad_year': s.grad_year,
        'student_id': s.student_id
    } for s in classroom.students]
    
    # Add instructor to roster view if needed? Usually just students.
    return jsonify(roster)

@roster_bp.route('/<classroom_id>/attendance/sessions', methods=['GET'])
def list_attendance_sessions(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor and user not in classroom.students:
        return jsonify({'error': 'Permission denied'}), 403
    
    sessions = AttendanceSession.objects(classroom=classroom).order_by('-date')
    
    return jsonify([{
        'id': str(s.id),
        'date': s.date.isoformat() + 'Z',
        'is_open': s.is_open,
        'code': s.code if user == classroom.instructor else None,
        'has_checked_in': any(r.student == user for r in s.records) if user != classroom.instructor else False
    } for s in sessions])

@roster_bp.route('/<classroom_id>/attendance/sessions', methods=['POST'])
def create_attendance_session(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Generate 4-digit numeric code
    code = ''.join(secrets.choice(string.digits) for _ in range(4))
    
    session_obj = AttendanceSession(
        classroom=classroom,
        code=code,
        date=datetime.datetime.utcnow()
    )
    session_obj.save()
    
    return jsonify({
        'id': str(session_obj.id),
        'code': session_obj.code,
        'date': session_obj.date.isoformat() + 'Z'
    })

@roster_bp.route('/attendance/checkin', methods=['POST'])
def checkin():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    session_id = data.get('session_id')
    code = data.get('code')
    
    attendance_session = AttendanceSession.objects(id=session_id).first()
    if not attendance_session or not attendance_session.is_open:
        return jsonify({'error': 'Session is closed or not found'}), 404
    
    if attendance_session.code != code:
        return jsonify({'error': 'Invalid code'}), 400
    
    # Check if student is in the class
    if user not in attendance_session.classroom.students:
        return jsonify({'error': 'Not enrolled in this class'}), 403
    
    # Check if already checked in
    existing = next((r for r in attendance_session.records if r.student == user), None)
    if existing:
        return jsonify({'error': 'Already checked in'}), 400
    
    record = AttendanceRecord(student=user, status='present')
    attendance_session.records.append(record)
    attendance_session.save()
    
    return jsonify({'ok': True, 'message': 'Checked in successfully'})

@roster_bp.route('/attendance/session/<session_id>', methods=['GET'])
def get_session_details(session_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    session_obj = AttendanceSession.objects(id=session_id).first()
    if not session_obj:
        return jsonify({'error': 'Session not found'}), 404
    
    classroom = session_obj.classroom
    if user != classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Get all records with student details
    records = []
    for r in session_obj.records:
        records.append({
            'student_id': str(r.student.id),
            'name': r.student.name,
            'email': r.student.email,
            'picture': r.student.picture,
            'timestamp': r.timestamp.isoformat() + 'Z',
            'status': r.status
        })
        
    return jsonify({
        'id': str(session_obj.id),
        'date': session_obj.date.isoformat() + 'Z',
        'code': session_obj.code,
        'is_open': session_obj.is_open,
        'records': records
    })

@roster_bp.route('/attendance/session/<session_id>', methods=['PATCH'])
def update_session(session_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    session_obj = AttendanceSession.objects(id=session_id).first()
    if not session_obj:
        return jsonify({'error': 'Session not found'}), 404
    
    if user != session_obj.classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.json
    if 'is_open' in data:
        session_obj.is_open = data['is_open']
    
    session_obj.save()
    return jsonify({'ok': True, 'is_open': session_obj.is_open})


@roster_bp.route('/<classroom_id>/students/<student_id>', methods=['DELETE'])
def remove_student(classroom_id, student_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    student = User.objects(id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    if student in classroom.students:
        classroom.students.remove(student)
        classroom.save()
        
    return jsonify({'ok': True})


@roster_bp.route('/<classroom_id>/students', methods=['POST'])
def manual_add_student(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.json
    email = data.get('email')
    name = data.get('name')
    major = data.get('major')
    grad_year = data.get('grad_year')
    student_id_str = data.get('student_id')
    
    if not email or not name:
        return jsonify({'error': 'Email and Name are required'}), 400
        
    # Check if user exists
    student = User.objects(email=email).first()
    if not student:
        # Create new user
        # Note: google_id is unique, so we need a placeholder or allow it to be null/sparse
        # In models.py User.google_id is required=True. 
        # For manual students, they might not have a google_id yet.
        # We might need to adjust the model or generate a placeholder.
        # Using a placeholder "manual_" + random string
        import uuid
        student = User(
            email=email,
            name=name,
            google_id=f"manual_{uuid.uuid4()}", 
            major=major,
            grad_year=int(grad_year) if grad_year else None,
            student_id=student_id_str,
            picture="https://ui-avatars.com/api/?name=" + name.replace(" ", "+") # Placeholder avatar
        )
        student.save()
    
    # Add to classroom if not already in
    if student not in classroom.students:
        classroom.students.append(student)
        classroom.save()
        
    return jsonify({'ok': True, 'student': {
        'id': str(student.id),
        'name': student.name,
        'email': student.email
    }})


@roster_bp.route('/attendance/manual_checkin', methods=['POST'])
def manual_checkin():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    session_id = data.get('session_id')
    student_id = data.get('student_id')
    status = data.get('status', 'present')
    
    session_obj = AttendanceSession.objects(id=session_id).first()
    if not session_obj:
        return jsonify({'error': 'Session not found'}), 404
    
    # Only instructor
    if user != session_obj.classroom.instructor:
        return jsonify({'error': 'Permission denied'}), 403
        
    student = User.objects(id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
        
    # Check if already has a record
    existing_record = next((r for r in session_obj.records if r.student == student), None)
    if existing_record:
        existing_record.status = status
        existing_record.timestamp = datetime.datetime.utcnow()
    else:
        record = AttendanceRecord(student=student, status=status)
        session_obj.records.append(record)
        
    session_obj.save()
    
    return jsonify({'ok': True})
