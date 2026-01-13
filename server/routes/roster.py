from flask import Blueprint, jsonify, session, request, Response
from models import User, Classroom, AttendanceSession, AttendanceRecord
import datetime
import secrets
import string
import csv
import io
import uuid

roster_bp = Blueprint('roster', __name__)

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.objects(id=user_id).first()

def sanitize_for_csv(value):
    """Prevent CSV injection (Formula Injection)."""
    if not value:
        return ""
    value = str(value)
    if value.startswith(('=', '+', '-', '@')):
        return f"'{value}"
    return value

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
    
    result = []
    for s in sessions:
        session_data = {
            'id': str(s.id),
            'date': s.date.isoformat() + 'Z',
            'is_open': s.is_open,
            'code': s.code if (user == classroom.instructor and s.is_open) else None,
            'has_checked_in': any(r.student == user for r in s.records) if user != classroom.instructor else False
        }
        
        # Add records for instructor (needed for attendance count display)
        if user == classroom.instructor:
            session_data['records'] = [{
                'student_id': str(r.student.id),
                'status': r.status
            } for r in s.records]
        
        result.append(session_data)
    
    return jsonify(result)

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

# --- Import/Export Endpoints ---

@roster_bp.route('/<classroom_id>/students/import', methods=['POST'])
def import_roster_csv(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        # Normalize headers to lowercase
        csv_input.fieldnames = [name.lower() for name in csv_input.fieldnames]
        
        added_count = 0
        for row in csv_input:
            email = row.get('email')
            name = row.get('name')
            
            if not email or not name:
                continue
                
            student = User.objects(email=email).first()
            if not student:
                student = User(
                    email=email,
                    name=name,
                    google_id=f"imported_{uuid.uuid4()}",
                    major=row.get('major'),
                    grad_year=int(row['grad_year']) if row.get('grad_year') and row['grad_year'].isdigit() else None,
                    student_id=row.get('student_id'),
                    picture="https://ui-avatars.com/api/?name=" + name.replace(" ", "+")
                )
                student.save()
            
            if student not in classroom.students:
                classroom.students.append(student)
                added_count += 1
        
        classroom.save()
        return jsonify({'ok': True, 'added': added_count})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@roster_bp.route('/<classroom_id>/students/export', methods=['GET'])
def export_roster_csv(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'Email', 'Student ID', 'Major', 'Grad Year'])
    
    for s in classroom.students:
        row = [
            sanitize_for_csv(s.name), 
            sanitize_for_csv(s.email), 
            sanitize_for_csv(s.student_id), 
            sanitize_for_csv(s.major), 
            sanitize_for_csv(s.grad_year)
        ]
        writer.writerow(row)
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=roster.csv"}
    )

@roster_bp.route('/<classroom_id>/attendance/export', methods=['GET'])
def export_attendance_csv(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403
    
    sessions = AttendanceSession.objects(classroom=classroom).order_by('date')
    students = sorted(classroom.students, key=lambda x: x.name)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header: Name, Email, [Date1, Date2, ...]
    headers = ['Name', 'Email', 'Student ID'] + [s.date.strftime('%Y-%m-%d') for s in sessions] + ['Attendance Rate']
    writer.writerow(headers)
    
    for s in students:
        row = [sanitize_for_csv(s.name), sanitize_for_csv(s.email), sanitize_for_csv(s.student_id)]
        present_count = 0
        for sess in sessions:
            # Check status in this session
            record = next((r for r in sess.records if r.student == s), None)
            status = record.status if record else 'absent'
            row.append(status)
            if status == 'present':
                present_count += 1
        
        rate = 0
        if len(sessions) > 0:
            rate = (present_count / len(sessions)) * 100
        row.append(f"{rate:.1f}%")
        
        writer.writerow(row)
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=attendance.csv"}
    )

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
        import uuid
        student = User(
            email=email,
            name=name,
            google_id=f"manual_{uuid.uuid4()}", 
            major=major,
            grad_year=int(grad_year) if grad_year else None,
            student_id=student_id_str,
            picture="https://ui-avatars.com/api/?name=" + name.replace(" ", "+")
        )
        student.save()
    else:
        # Update existing user's profile with provided data (if given)
        updated = False
        if major and student.major != major:
            student.major = major
            updated = True
        if grad_year and student.grad_year != int(grad_year):
            student.grad_year = int(grad_year)
            updated = True
        if student_id_str and student.student_id != student_id_str:
            student.student_id = student_id_str
            updated = True
        if updated:
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
