from flask import Blueprint, jsonify, session, request
from models import User, Classroom, Assignment, Grade
import datetime

grades_bp = Blueprint('grades', __name__)

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.objects(id=user_id).first()

@grades_bp.route('/<classroom_id>/assignments', methods=['GET'])
def list_assignments(classroom_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    classroom = Classroom.objects(id=classroom_id).first()
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
    
    if user != classroom.instructor and user not in classroom.students:
        return jsonify({'error': 'Permission denied'}), 403
    
    assignments = Assignment.objects(classroom=classroom)
    
    return jsonify([{
        'id': str(a.id),
        'title': a.title,
        'points_possible': a.points_possible,
        'due_date': a.due_date.isoformat() if a.due_date else None
    } for a in assignments])

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
    points = data.get('points_possible')
    due_date_str = data.get('due_date')
    
    due_date = None
    if due_date_str:
        due_date = datetime.datetime.fromisoformat(due_date_str)
        
    assignment = Assignment(
        classroom=classroom,
        title=title,
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
        grades = Grade.objects(assignment=assignment)
        return jsonify([{
            'student_id': str(g.student.id),
            'student_name': g.student.name,
            'score': g.score,
            'feedback': g.feedback
        } for g in grades])
    elif user in classroom.students:
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
