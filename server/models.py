from mongoengine import (
    Document, StringField, EmailField, ReferenceField, ListField,
    DateTimeField, BooleanField, IntField, FloatField, EmbeddedDocument,
    EmbeddedDocumentField, CASCADE, PULL
)
import datetime


class User(Document):
    email = EmailField(required=True, unique=True)
    google_id = StringField(required=True, unique=True)
    name = StringField(required=True)
    picture = StringField()

    # Profile fields (can be filled later)
    # Primary role, though system allows flexibility
    role = StringField(choices=('student', 'instructor',
                       'admin'))
    student_id = StringField()
    major = StringField()
    grad_year = IntField()

    meta = {'collection': 'users'}


class Classroom(Document):
    name = StringField(required=True)
    term = StringField(required=True)
    section = StringField()
    description = StringField()

    instructor = ReferenceField(
        User, required=True, reverse_delete_rule=CASCADE)
    students = ListField(ReferenceField(User, reverse_delete_rule=PULL))

    join_code = StringField(unique=True)
    is_archived = BooleanField(default=False)
    status = StringField(choices=('active', 'inactive'), default='active')
    deleted_at = DateTimeField()  # When status changed to inactive

    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {'collection': 'classrooms'}


class Assignment(Document):
    classroom = ReferenceField(Classroom, required=True)
    title = StringField(required=True)
    description = StringField()
    points_possible = FloatField(required=True)
    due_date = DateTimeField()

    meta = {'collection': 'assignments'}


class Grade(Document):
    assignment = ReferenceField(Assignment, required=True)
    student = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    score = FloatField()
    feedback = StringField()

    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'grades',
        'indexes': [
            {'fields': ('assignment', 'student'), 'unique': True}
        ]
    }


class AttendanceRecord(EmbeddedDocument):
    student = ReferenceField(User, required=True)
    status = StringField(
        choices=('present', 'late', 'absent', 'excused'), default='absent')
    timestamp = DateTimeField(default=datetime.datetime.utcnow)


class AttendanceSession(Document):
    classroom = ReferenceField(Classroom, required=True)
    date = DateTimeField(required=True, default=datetime.datetime.utcnow)
    code = StringField()  # Code for students to check in
    is_open = BooleanField(default=True)

    records = ListField(EmbeddedDocumentField(AttendanceRecord))

    meta = {'collection': 'attendance_sessions'}


class Announcement(Document):
    classroom = ReferenceField(Classroom, required=True)
    author = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    title = StringField(required=True)
    content = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField()

    meta = {'collection': 'announcements'}
