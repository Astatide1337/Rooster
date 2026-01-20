# Rooster Testing Guide

This document outlines the testing strategy for the Rooster application, including automated tests and manual verification procedures.

---

## Running Automated Tests

### Backend Tests (pytest)

```bash
cd server

# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_classrooms.py

# Run specific test
pytest tests/test_health.py::TestHealthEndpoints::test_health_endpoint_returns_200
```

### Test Structure

```
server/tests/
├── __init__.py
├── conftest.py          # Fixtures for app, client, auth
├── test_health.py       # Health check endpoints
├── test_api.py          # User API endpoints
├── test_classrooms.py   # Classroom CRUD and join flow
└── test_grades.py       # Assignments and grading
```

---

## Manual Testing Checklist

### Authentication Flow

- [ ] Navigate to landing page
- [ ] Click "Sign In"
- [ ] Complete Google OAuth
- [ ] Verify redirect to profile setup (first login)
- [ ] Complete profile setup
- [ ] Verify redirect to dashboard
- [ ] Sign out
- [ ] Sign back in (should skip profile setup)

### Instructor Workflow

#### Class Management
- [ ] Create a new class with name and term
- [ ] Verify join code is generated
- [ ] Copy join code to clipboard
- [ ] View class in dashboard
- [ ] Navigate to class detail
- [ ] Delete a class

#### Roster Management
- [ ] Add a student manually (name, email)
- [ ] Import students via CSV
- [ ] Export roster to CSV
- [ ] Remove a student from roster
- [ ] Verify student count updates

#### Attendance
- [ ] Start a new attendance session
- [ ] Verify 4-digit code is displayed
- [ ] Manually mark a student present
- [ ] Close the attendance session
- [ ] View attendance history
- [ ] Export attendance to CSV

#### Gradebook
- [ ] Create a new assignment
- [ ] Set title, points, and due date
- [ ] Open grading view
- [ ] Enter score for a student
- [ ] Enter feedback for a student
- [ ] Verify grade is saved
- [ ] Export grades to CSV

#### Announcements
- [ ] Create a new announcement
- [ ] Edit an announcement
- [ ] Delete an announcement
- [ ] Verify timestamps display correctly

### Student Workflow

- [ ] Join a class with join code
- [ ] View class in dashboard
- [ ] Navigate to class detail
- [ ] Check in to attendance session with code
- [ ] View grades for assignments
- [ ] View announcements

### UI/UX Testing

- [ ] Toggle dark/light theme
- [ ] Open command palette (Ctrl+K / Cmd+K)
- [ ] Navigate using command palette
- [ ] Test responsive layout (mobile viewport)
- [ ] Verify skeleton loading states appear
- [ ] Verify toast notifications for actions

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive layout adjustments work correctly

---

## API Testing with curl

### Health Check
```bash
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

### User Info (requires session cookie)
```bash
curl -b cookies.txt http://localhost:5000/api/user
```

### List Classrooms
```bash
curl -b cookies.txt http://localhost:5000/api/classrooms/
```

---

## Load Testing

For production readiness, run load tests using tools like Locust or k6.

### Key Scenarios to Test

1. **Concurrent Logins**: 50+ users authenticating simultaneously
2. **Roster Import**: Large CSV files (500+ students)
3. **Attendance Check-in**: Class of 100+ students checking in at once
4. **Grade Entry**: Instructor saving multiple grades rapidly

### Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Concurrent Users | 100+ |
| Error Rate | < 1% |
| Uptime | 99.9% |

---

## Test Data

### Sample CSV for Roster Import

Located at: `server/roster_sample.csv`

```csv
name,email,student_id,major,grad_year
John Doe,john.doe@example.com,STU001,Computer Science,2026
Jane Smith,jane.smith@example.com,STU002,Mathematics,2025
```

### Test User Roles

| Role | Email | Purpose |
|------|-------|---------|
| Instructor | instructor@test.com | Full access testing |
| Student | student@test.com | Limited access testing |

---

## Known Issues / Edge Cases

Document any discovered issues here during testing:

1. ...
2. ...
3. ...
