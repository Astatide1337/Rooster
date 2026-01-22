from flask import Blueprint, jsonify, session, request, Response
from models import User, Classroom, Assignment, Grade
from utils import get_safe_list, get_safe_reference
import datetime
import csv
import io

grades_bp = Blueprint('grades', __name__)


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


def is_enrolled(classroom, user):
    """Safely check if user is in classroom.students without crashing on zombie refs."""
    try:
        valid_students = get_safe_list(classroom, 'students')
        return user in valid_students
    except Exception:
        return False


@grades_bp.route('/<classroom_id>/assignments', methods=['GET'])
def list_assignments(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    if user != classroom.instructor and not is_enrolled(classroom, user):
        return jsonify({'error': 'Permission denied'}), 403

    assignments = Assignment.objects(classroom=classroom)

    results = []
    for a in assignments:
        data = {
            'id': str(a.id),
            'title': a.title,
            'description': a.description,
            'points_possible': a.points_possible,
            'due_date': a.due_date.isoformat() if a.due_date else None
        }

        # If student, include their grade
        if user != classroom.instructor:
            grade = Grade.objects(assignment=a, student=user).first()
            if grade:
                data['score'] = grade.score
                data['feedback'] = grade.feedback
            else:
                data['score'] = None
                data['feedback'] = None

        results.append(data)

    return jsonify(results)


@grades_bp.route('/<classroom_id>/assignments', methods=['POST'])
def create_assignment(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    title = data.get('title')
    description = data.get('description')
    points = data.get('points_possible')
    due_date_str = data.get('due_date')

    due_date = None
    if due_date_str:
        due_date = datetime.datetime.fromisoformat(
            due_date_str.replace('Z', '+00:00'))

    assignment = Assignment(
        classroom=classroom,
        title=title,
        description=description,
        points_possible=float(points),
        due_date=due_date
    )
    assignment.save()

    return jsonify({'id': str(assignment.id), 'title': assignment.title})


@grades_bp.route('/assignment/<assignment_id>/grades', methods=['GET'])
def get_grades(assignment_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    assignment = Assignment.objects(id=assignment_id).first()
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    classroom = assignment.classroom

    if user == classroom.instructor:
        # Get all grades for this assignment
        # Use no_dereference to avoid crashing on iteration if zombies exist
        grades = Grade.objects(assignment=assignment).no_dereference()
        results = []
        for g in grades:
            # Self-heal references if students were deleted
            student = get_safe_reference(g, 'student')
            if student:
                results.append({
                    'student_id': str(student.id),
                    'student_name': student.name,
                    'score': g.score,
                    'feedback': g.feedback
                })
        return jsonify(results)
    elif is_enrolled(classroom, user):
        # Get only own grade
        grade = Grade.objects(assignment=assignment, student=user).first()
        if not grade:
            return jsonify({'score': None})
        return jsonify({
            'score': grade.score,
            'feedback': grade.feedback
        })
    else:
        return jsonify({'error': 'Permission denied'}), 403


@grades_bp.route('/assignment/<assignment_id>/grades', methods=['POST'])
def update_grade(assignment_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    assignment = Assignment.objects(id=assignment_id).first()
    if not assignment or assignment.classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    student_id = data.get('student_id')
    score = data.get('score')
    feedback = data.get('feedback')

    student = User.objects(id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    grade = Grade.objects(assignment=assignment, student=student).first()
    if not grade:
        grade = Grade(assignment=assignment, student=student)

    grade.score = float(score) if score is not None else None
    grade.feedback = feedback
    grade.save()

    return jsonify({'ok': True})


@grades_bp.route('/<classroom_id>/grades/export', methods=['GET'])
def export_grades_csv(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom or classroom.instructor != user:
        return jsonify({'error': 'Permission denied'}), 403

    assignments = Assignment.objects(classroom=classroom)
    students = sorted(classroom.students, key=lambda x: x.name)

    # Pre-fetch all grades for these assignments to avoid N*M queries
    # A cleaner way is to just query all grades for this classroom's assignments
    all_grades = Grade.objects(assignment__in=assignments)

    # Build a map: (student_id, assignment_id) -> Grade
    grade_map = {}
    for g in all_grades:
        grade_map[(g.student.id, g.assignment.id)] = g

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    headers = ['Name', 'Email', 'Student ID']
    for a in assignments:
        headers.append(f"{a.title} (/{a.points_possible})")
    headers.append("Average %")
    writer.writerow(headers)

    for s in students:
        row = [
            sanitize_for_csv(s.name),
            sanitize_for_csv(s.email),
            sanitize_for_csv(s.student_id)
        ]
        total_percentage = 0
        count = 0

        for a in assignments:
            g = grade_map.get((s.id, a.id))
            if g and g.score is not None:
                row.append(g.score)
                if a.points_possible > 0:
                    total_percentage += (g.score / a.points_possible) * 100
                    count += 1
            else:
                row.append('')

        avg = 0
        if count > 0:
            avg = total_percentage / count
        row.append(f"{avg:.1f}%")

        writer.writerow(row)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=grades.csv"}
    )
