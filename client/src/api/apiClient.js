export async function getUser() {
  const res = await fetch('/api/user', { credentials: 'include' })
  if (res.status === 200) {
    const j = await res.json()
    return { ok: true, user: j.user }
  }
  return { ok: false }
}

export async function updateUser(data) {
  const res = await fetch('/api/user/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.ok
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' })
}

// Classrooms
export async function getClassrooms() {
  const res = await fetch('/api/classrooms/', { credentials: 'include' })
  return res.json()
}

export async function createClassroom(data) {
  const res = await fetch('/api/classrooms/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.json()
}

export async function joinClassroom(code) {
  const res = await fetch('/api/classrooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include'
  })
  return res.json()
}

export async function getClassroom(id) {
  const res = await fetch(`/api/classrooms/${id}`, { credentials: 'include' })
  return res.json()
}

export async function deleteClassroom(id) {
  const res = await fetch(`/api/classrooms/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  return res.json()
}

export async function getClassroomStatistics(id) {
  const res = await fetch(`/api/classrooms/${id}/statistics`, { credentials: 'include' })
  return res.json()
}

// Roster & Attendance
export async function getRoster(classId) {
  const res = await fetch(`/api/roster/${classId}/students`, { credentials: 'include' })
  return res.json()
}

export async function removeStudentFromClass(classId, studentId) {
  const res = await fetch(`/api/roster/${classId}/students/${studentId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  return res.json()
}

export async function addStudentToClass(classId, data) {
  const res = await fetch(`/api/roster/${classId}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.json()
}

export async function getAttendanceSessions(classId) {
  const res = await fetch(`/api/roster/${classId}/attendance/sessions`, { credentials: 'include' })
  return res.json()
}

export async function createAttendanceSession(classId) {
  const res = await fetch(`/api/roster/${classId}/attendance/sessions`, {
    method: 'POST',
    credentials: 'include'
  })
  return res.json()
}

export async function checkinAttendance(sessionId, code) {
  const res = await fetch('/api/roster/attendance/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, code }),
    credentials: 'include'
  })
  return res.json()
}

export async function manualAttendanceCheckin(sessionId, studentId, status = 'present') {
  const res = await fetch('/api/roster/attendance/manual_checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, student_id: studentId, status }),
    credentials: 'include'
  })
  return res.json()
}

export async function getAttendanceSessionDetails(sessionId) {
  const res = await fetch(`/api/roster/attendance/session/${sessionId}`, { credentials: 'include' })
  return res.json()
}

export async function updateAttendanceSession(sessionId, data) {
  const res = await fetch(`/api/roster/attendance/session/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.json()
}

// Grades
export async function getAssignments(classId) {
  const res = await fetch(`/api/grades/${classId}/assignments`, { credentials: 'include' })
  return res.json()
}

export async function createAssignment(classId, data) {
  const res = await fetch(`/api/grades/${classId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.json()
}

export async function getGrades(assignmentId) {
  const res = await fetch(`/api/grades/assignment/${assignmentId}/grades`, { credentials: 'include' })
  return res.json()
}

export async function updateGrade(assignmentId, data) {
  const res = await fetch(`/api/grades/assignment/${assignmentId}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
  return res.json()
}
