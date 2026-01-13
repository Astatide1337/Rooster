/**
 * Demo Data for Landing Page
 * 
 * This file contains realistic fake data used to render the actual
 * application components on the landing page for demonstration purposes.
 */

// Demo user (instructor view for maximum feature showcase)
export const demoUser = {
    id: 'demo-user-001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@university.edu',
    picture: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=6366f1&color=fff',
    role: 'instructor',
    major: null,
    grad_year: null,
    student_id: null,
}

// Demo students for roster
export const demoStudents = [
    {
        id: 'student-001',
        name: 'Alex Johnson',
        email: 'alex.johnson@student.edu',
        picture: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=22c55e&color=fff',
        major: 'Computer Science',
        grad_year: 2027,
        student_id: 'STU-2027-001',
    },
    {
        id: 'student-002',
        name: 'Maria Garcia',
        email: 'maria.garcia@student.edu',
        picture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=f59e0b&color=fff',
        major: 'Data Science',
        grad_year: 2026,
        student_id: 'STU-2026-042',
    },
    {
        id: 'student-003',
        name: 'James Wilson',
        email: 'james.wilson@student.edu',
        picture: 'https://ui-avatars.com/api/?name=James+Wilson&background=ef4444&color=fff',
        major: 'Computer Science',
        grad_year: 2027,
        student_id: 'STU-2027-089',
    },
    {
        id: 'student-004',
        name: 'Emily Davis',
        email: 'emily.davis@student.edu',
        picture: 'https://ui-avatars.com/api/?name=Emily+Davis&background=8b5cf6&color=fff',
        major: 'Mathematics',
        grad_year: 2026,
        student_id: 'STU-2026-156',
    },
    {
        id: 'student-005',
        name: 'Michael Brown',
        email: 'michael.brown@student.edu',
        picture: 'https://ui-avatars.com/api/?name=Michael+Brown&background=06b6d4&color=fff',
        major: 'Computer Science',
        grad_year: 2028,
        student_id: 'STU-2028-023',
    },
]

// Demo classes
export const demoClasses = [
    {
        id: 'class-001',
        name: 'Introduction to Computer Science',
        term: 'Spring 2026',
        section: '001',
        instructor_name: 'Dr. Sarah Chen',
        join_code: 'CS101A',
        is_instructor: true,
        student_count: 32,
    },
    {
        id: 'class-002',
        name: 'Data Structures & Algorithms',
        term: 'Spring 2026',
        section: '002',
        instructor_name: 'Dr. Sarah Chen',
        join_code: 'DSA202',
        is_instructor: true,
        student_count: 28,
    },
    {
        id: 'class-003',
        name: 'Machine Learning Fundamentals',
        term: 'Spring 2026',
        section: '001',
        instructor_name: 'Dr. Sarah Chen',
        join_code: 'ML301B',
        is_instructor: true,
        student_count: 24,
    },
]

// Demo announcements
export const demoAnnouncements = [
    {
        id: 'ann-001',
        title: 'Welcome to CS 101!',
        content: 'Welcome to Introduction to Computer Science! I\'m excited to have you in class this semester. Please review the syllabus and come prepared for our first lecture on Monday.',
        author: demoUser,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: 'ann-002',
        title: 'Office Hours Update',
        content: 'Office hours have been moved to Wednesdays 2-4 PM in Room 302. Please book a slot through the course portal if you need one-on-one assistance.',
        author: demoUser,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
]

// Demo assignments
export const demoAssignments = [
    {
        id: 'assign-001',
        title: 'Problem Set 1: Variables & Types',
        description: 'Introduction to Python variables, data types, and basic operations.',
        points_possible: 100,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    },
    {
        id: 'assign-002',
        title: 'Lab 1: Hello World',
        description: 'Set up your development environment and write your first program.',
        points_possible: 50,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    },
    {
        id: 'assign-003',
        title: 'Quiz 1: Fundamentals',
        description: 'Online quiz covering chapters 1-3.',
        points_possible: 25,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    },
]

// Demo grades (for showing in gradebook)
export const demoGrades = [
    { student: demoStudents[0], assignment: demoAssignments[0], score: 95, feedback: 'Excellent work!' },
    { student: demoStudents[1], assignment: demoAssignments[0], score: 88, feedback: 'Good job, minor issues with type casting.' },
    { student: demoStudents[2], assignment: demoAssignments[0], score: 92, feedback: 'Well done!' },
    { student: demoStudents[3], assignment: demoAssignments[0], score: 78, feedback: 'Review section 2.3 on operators.' },
    { student: demoStudents[4], assignment: demoAssignments[0], score: 100, feedback: 'Perfect!' },
    { student: demoStudents[0], assignment: demoAssignments[1], score: 50, feedback: 'Complete!' },
    { student: demoStudents[1], assignment: demoAssignments[1], score: 48, feedback: 'Minor formatting issues.' },
    { student: demoStudents[2], assignment: demoAssignments[1], score: 50, feedback: 'Great setup!' },
]

// Demo attendance sessions
export const demoAttendanceSessions = [
    {
        id: 'session-001',
        date: new Date(Date.now()).toISOString(), // Today
        code: '4921',
        is_open: true,
        present_count: 30,
        total_count: 32,
    },
    {
        id: 'session-002',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        code: '7834',
        is_open: false,
        present_count: 31,
        total_count: 32,
    },
    {
        id: 'session-003',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        code: '2156',
        is_open: false,
        present_count: 28,
        total_count: 32,
    },
]

// Demo statistics (for the Statistics tab)
export const demoStatistics = {
    total_students: 32,
    by_major: {
        'Computer Science': 18,
        'Data Science': 6,
        'Mathematics': 5,
        'Physics': 2,
        'Other': 1,
    },
    by_grad_year: {
        2026: 12,
        2027: 14,
        2028: 6,
    },
    attendance_rate: 94.5,
    average_grade: 87.2,
}

// Full demo classroom (detailed view for ClassDetail)
export const demoClassroom = {
    id: 'class-001',
    name: 'Introduction to Computer Science',
    term: 'Spring 2026',
    section: '001',
    description: 'A comprehensive introduction to computer science principles, programming fundamentals, and computational thinking.',
    instructor: demoUser,
    instructor_name: 'Dr. Sarah Chen',
    join_code: 'CS101A',
    is_instructor: true,
    students: demoStudents,
    student_count: 32,
}
