import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Avatar, 
  Chip, TextField, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, Drawer, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Snackbar, Grid, LinearProgress, Tooltip
} from '@mui/material';
import { 
  getClassroom, getRoster, getAttendanceSessions, createAttendanceSession, 
  checkinAttendance, getAssignments, getAttendanceSessionDetails, updateAttendanceSession, deleteClassroom,
  removeStudentFromClass, getClassroomStatistics, addStudentToClass, manualAttendanceCheckin,
  createAssignment, getGrades, updateGrade,
  importRosterCSV, exportRosterCSV, exportAttendanceCSV, exportGradesCSV,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement
} from '../api/apiClient';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import AddTaskIcon from '@mui/icons-material/AddTask';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CampaignIcon from '@mui/icons-material/Campaign';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClassDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [classroom, setClassroom] = useState(null);
  const [roster, setRoster] = useState([]);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  
  const [checkinCode, setCheckinCode] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Grading Drawer State
  const [gradingDrawerOpen, setGradingDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]); // Merged list of students and their grades

  // Delete Class confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Remove Student confirmation state
  const [removeStudentDialog, setRemoveStudentDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Add Student state
  const [addStudentDialog, setAddStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', major: '', grad_year: '', student_id: '' });

  // Create Assignment State
  const [createAssignmentDialog, setCreateAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', description: '', points_possible: '', due_date: null 
  });

  // Announcement State
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [deleteAnnouncementDialog, setDeleteAnnouncementDialog] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const cls = await getClassroom(id);
    if (cls.error) {
      return;
    }
    setClassroom(cls);

    const promises = [
      getAttendanceSessions(id),
      getAssignments(id),
      getAnnouncements(id)
    ];
    
    if (cls.is_instructor) {
      promises.push(getRoster(id));
      promises.push(getClassroomStatistics(id));
    }
    
    const results = await Promise.all(promises);
    const att = results[0];
    const asg = results[1];
    const ann = results[2];
    
    setAttendanceSessions(att);
    setAssignments(asg);
    setAnnouncements(Array.isArray(ann) ? ann : []);
    
    if (cls.is_instructor) {
      const ros = results[3];
      const s = results[4];
      setRoster(Array.isArray(ros) ? ros : []);
      if (s && !s.error) setStats(s);
    } else {
      setRoster([]);
      setStats(null);
    }
  };

  if (!classroom) return null;

  // Announcement handlers
  const handleOpenAnnouncementDialog = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({ title: announcement.title, content: announcement.content });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', content: '' });
    }
    setAnnouncementDialog(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      setSnackbar({ open: true, message: 'Title and content are required', severity: 'error' });
      return;
    }

    let res;
    if (editingAnnouncement) {
      res = await updateAnnouncement(editingAnnouncement.id, announcementForm);
    } else {
      res = await createAnnouncement(id, announcementForm);
    }

    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: editingAnnouncement ? 'Announcement updated' : 'Announcement posted', severity: 'success' });
      setAnnouncementDialog(false);
      setAnnouncementForm({ title: '', content: '' });
      setEditingAnnouncement(null);
      fetchData();
    }
  };

  const handleDeleteAnnouncementClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteAnnouncementDialog(true);
  };

  const handleDeleteAnnouncementConfirm = async () => {
    if (!announcementToDelete) return;
    const res = await deleteAnnouncement(announcementToDelete.id);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Announcement deleted', severity: 'success' });
      fetchData();
    }
    setDeleteAnnouncementDialog(false);
    setAnnouncementToDelete(null);
  };

  const handleCreateAssignment = async () => {
    const payload = {
      ...newAssignment,
      points_possible: Number(newAssignment.points_possible),
      due_date: newAssignment.due_date ? newAssignment.due_date.toISOString() : null
    };
    const res = await createAssignment(id, payload);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Assignment created', severity: 'success' });
      setCreateAssignmentDialog(false);
      setNewAssignment({ title: '', description: '', points_possible: '', due_date: null });
      fetchData();
    }
  };

  const handleOpenGrading = async (assignment) => {
    if (!classroom.is_instructor) return;
    setSelectedAssignment(assignment);
    
    // Fetch existing grades
    const grades = await getGrades(assignment.id);
    
    // Merge roster with grades to ensure all students are listed
    const merged = roster.map(student => {
      const grade = grades.find(g => g.student_id === student.id);
      return {
        ...student,
        score: grade ? grade.score : '',
        feedback: grade ? grade.feedback : ''
      };
    });
    
    setStudentGrades(merged);
    setGradingDrawerOpen(true);
  };

  const handleUpdateGrade = async (studentId, field, value) => {
    const updated = studentGrades.map(s => {
      if (s.id === studentId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setStudentGrades(updated);
  };

  const handleSaveGrade = async (student) => {
    const res = await updateGrade(selectedAssignment.id, {
      student_id: student.id,
      score: student.score,
      feedback: student.feedback
    });
    if (res.ok) {
        setSnackbar({ open: true, message: 'Grade saved', severity: 'success' });
    } else {
        setSnackbar({ open: true, message: 'Failed to save grade', severity: 'error' });
    }
  };

  const handleCreateSession = async () => {
    await createAttendanceSession(id);
    fetchData();
    setSnackbar({ open: true, message: 'New attendance session started', severity: 'success' });
  };

  const handleCheckin = async (sessionId) => {
    const res = await checkinAttendance(sessionId, checkinCode);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Checked in successfully!', severity: 'success' });
      setCheckinCode('');
      fetchData();
    }
  };

  const handleSessionClick = async (session) => {
    if (!classroom.is_instructor) return;
    const details = await getAttendanceSessionDetails(session.id);
    setSelectedSession(details);
    setDrawerOpen(true);
  };

  const handleToggleSession = async () => {
    if (!selectedSession) return;
    const newStatus = !selectedSession.is_open;
    await updateAttendanceSession(selectedSession.id, { is_open: newStatus });
    
    // Update local state
    setSelectedSession({ ...selectedSession, is_open: newStatus });
    fetchData(); // Refresh main list
    setSnackbar({ 
      open: true, 
      message: `Session ${newStatus ? 're-opened' : 'closed'}`, 
      severity: 'info' 
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setDeleteConfirmName('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmName !== classroom.name) {
      setDeleteError('Class name does not match. Please type the exact class name.');
      return;
    }
    
    const res = await deleteClassroom(id);
    if (res.error) {
      setDeleteError(res.error);
    } else {
      setDeleteDialogOpen(false);
      navigate('/');
    }
  };

  const handleRemoveStudentClick = (student) => {
    setStudentToRemove(student);
    setRemoveStudentDialog(true);
  };

  const handleRemoveStudentConfirm = async () => {
    if (!studentToRemove) return;
    
    const res = await removeStudentFromClass(id, studentToRemove.id);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Student removed from class', severity: 'success' });
      fetchData();
    }
    setRemoveStudentDialog(false);
    setStudentToRemove(null);
  };

  const handleAddStudent = async () => {
    const res = await addStudentToClass(id, newStudent);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Student added successfully', severity: 'success' });
      setAddStudentDialog(false);
      setNewStudent({ name: '', email: '', major: '', grad_year: '', student_id: '' });
      fetchData();
    }
  };

  const handleManualCheckin = async (studentId) => {
    if (!selectedSession) return;
    const res = await manualAttendanceCheckin(selectedSession.id, studentId, 'present');
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Marked present', severity: 'success' });
      // Refresh session details
      const details = await getAttendanceSessionDetails(selectedSession.id);
      setSelectedSession(details);
      // Refresh main data to update stats if needed
      fetchData(); 
    }
  };

  const handleImportRoster = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await importRosterCSV(id, formData);
    if (res.error) {
      setSnackbar({ open: true, message: res.error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: `Successfully added ${res.added} students`, severity: 'success' });
      fetchData();
    }
    // Reset input
    event.target.value = null;
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* ... Header ... */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary">{classroom.term} | {classroom.section}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{classroom.name}</Typography>
          {classroom.is_instructor && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete Class
            </Button>
          )}
        </Box>
        {classroom.is_instructor && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
              Join Code: <strong>{classroom.join_code}</strong>
            </Typography>
            <IconButton size="small" onClick={() => navigator.clipboard.writeText(classroom.join_code)}>
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Home" />
          {classroom.is_instructor && <Tab label="Roster" />}
          <Tab label="Attendance" />
          <Tab label="Grades" />
          {classroom.is_instructor && <Tab label="Statistics" />}
        </Tabs>

        {/* Home Tab - Announcements */}
        <CustomTabPanel value={tab} index={0}>
          <Grid container spacing={3}>
            {/* Left side - Announcements */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CampaignIcon color="primary" />
                  <Typography variant="h6">Announcements</Typography>
                </Box>
                {classroom.is_instructor && (
                  <Button 
                    variant="contained" 
                    startIcon={<CampaignIcon />}
                    onClick={() => handleOpenAnnouncementDialog()}
                  >
                    New Announcement
                  </Button>
                )}
              </Box>

              {announcements.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <CampaignIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No announcements yet
                  </Typography>
                  {classroom.is_instructor && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Post your first announcement to share updates with the class
                    </Typography>
                  )}
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                  {announcements.map((announcement) => (
                    <Paper key={announcement.id} variant="outlined" sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={announcement.author.picture} 
                            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                          >
                            {announcement.author.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{announcement.author.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(announcement.created_at).toLocaleDateString()} at{' '}
                              {new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {announcement.updated_at && ' (edited)'}
                            </Typography>
                          </Box>
                        </Box>
                        {classroom.is_instructor && (
                          <Box>
                            <IconButton size="small" onClick={() => handleOpenAnnouncementDialog(announcement)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteAnnouncementClick(announcement)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="h6" gutterBottom>{announcement.title}</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Right side - Class Info */}
            <Grid item xs={12} md={4}>
              {/* Header to match announcements header height */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, height: 36.5 }}>
                <Typography variant="h6">Class Information</Typography>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Instructor:</strong> {classroom.instructor.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {classroom.instructor.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Term:</strong> {classroom.term}
                </Typography>
                {classroom.section && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Section:</strong> {classroom.section}
                  </Typography>
                )}
                {classroom.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">{classroom.description}</Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {classroom.is_instructor && (
          <CustomTabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Class Roster</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => exportRosterCSV(id)}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FileUploadIcon />} 
                  component="label"
                >
                  Import CSV
                  <input type="file" hidden accept=".csv" onChange={handleImportRoster} />
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAddIcon />} 
                  onClick={() => setAddStudentDialog(true)}
                >
                  Add Student
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Major</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roster.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={student.picture} sx={{ width: 32, height: 32 }} />
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.major}</TableCell>
                      <TableCell>{student.grad_year}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleRemoveStudentClick(student)}
                          title="Remove from class"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>
        )}

        <CustomTabPanel value={tab} index={classroom.is_instructor ? 2 : 1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Attendance</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {classroom.is_instructor && (
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => exportAttendanceCSV(id)}
                >
                  Export CSV
                </Button>
              )}
              {classroom.is_instructor && (
                <Button variant="contained" onClick={handleCreateSession}>Start New Session</Button>
              )}
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceSessions.map((s) => (
                  <TableRow 
                    key={s.id} 
                    hover={classroom.is_instructor}
                    onClick={() => handleSessionClick(s)}
                    sx={{ cursor: classroom.is_instructor ? 'pointer' : 'default' }}
                  >
                    <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={s.is_open ? 'Open' : 'Closed'} color={s.is_open ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {classroom.is_instructor ? (
                        <Typography variant="body2">Code: <strong>{s.code}</strong></Typography>
                      ) : s.has_checked_in ? (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Checked In" 
                          color="success" 
                          variant="outlined" 
                          size="small" 
                        />
                      ) : s.is_open ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField 
                            size="small" 
                            placeholder="Code" 
                            sx={{ width: 100 }}
                            value={checkinCode}
                            onChange={(e) => setCheckinCode(e.target.value)}
                          />
                          <Button variant="outlined" size="small" onClick={() => handleCheckin(s.id)}>Check-in</Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={classroom.is_instructor ? 3 : 2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Assignments & Grades</Typography>
            {classroom.is_instructor && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => exportGradesCSV(id)}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<AddTaskIcon />}
                  onClick={() => setCreateAssignmentDialog(true)}
                >
                  New Assignment
                </Button>
              </Box>
            )}
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Score</TableCell>
                  {!classroom.is_instructor && <TableCell>Feedback</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow 
                    key={a.id}
                    hover={classroom.is_instructor}
                    onClick={() => classroom.is_instructor && handleOpenGrading(a)}
                    sx={{ cursor: classroom.is_instructor ? 'pointer' : 'default' }}
                  >
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{a.points_possible}</TableCell>
                    <TableCell>
                      {classroom.is_instructor ? (
                        <Button startIcon={<EditIcon />} size="small">Grade</Button>
                      ) : (
                        a.score !== undefined && a.score !== null ? 
                        <strong>{a.score} / {a.points_possible}</strong> : 
                        <Typography variant="body2" color="text.secondary">Not Graded</Typography>
                      )}
                    </TableCell>
                    {!classroom.is_instructor && (
                      <TableCell>
                        {a.feedback ? (
                          <Tooltip title={a.feedback}>
                            <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'help' }}>
                              {a.feedback}
                            </Typography>
                          </Tooltip>
                        ) : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {classroom.is_instructor && stats && (
          <CustomTabPanel value={tab} index={4}>
            {/* Key Metrics */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Key Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Total Students</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats.total_students}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Attendance Rate</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{stats.attendance_rate}%</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendance_rate} 
                    sx={{ mt: 2, height: 6, borderRadius: 3 }} 
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Average Grade</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{stats.average_grade}%</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    color="secondary"
                    value={stats.average_grade} 
                    sx={{ mt: 2, height: 6, borderRadius: 3 }} 
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Demographics */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Student Demographics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>By Major</Typography>
                  {Object.entries(stats.major_distribution).length > 0 ? (
                    <Table size="small">
                      <TableBody>
                        {Object.entries(stats.major_distribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([major, count]) => (
                          <TableRow key={major}>
                            <TableCell sx={{ border: 0, py: 1, pl: 0 }}>{major}</TableCell>
                            <TableCell align="right" sx={{ border: 0, py: 1, pr: 0, fontWeight: 600 }}>{count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No data</Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>By Graduation Year</Typography>
                  {Object.entries(stats.year_distribution).length > 0 ? (
                    <Table size="small">
                      <TableBody>
                        {Object.entries(stats.year_distribution)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([year, count]) => (
                          <TableRow key={year}>
                            <TableCell sx={{ border: 0, py: 1, pl: 0 }}>{year}</TableCell>
                            <TableCell align="right" sx={{ border: 0, py: 1, pr: 0, fontWeight: 600 }}>{count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No data</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CustomTabPanel>
        )}

      </Paper>

      {/* Attendance Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          {selectedSession && (
            <>
              <Typography variant="h6" gutterBottom>Session Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {new Date(selectedSession.date).toLocaleString()}
              </Typography>
              <Typography variant="h4" color="primary" sx={{ my: 2, textAlign: 'center', fontWeight: 'bold' }}>
                {selectedSession.code}
              </Typography>
              
              <Button 
                variant={selectedSession.is_open ? "outlined" : "contained"} 
                color={selectedSession.is_open ? "error" : "success"}
                fullWidth 
                onClick={handleToggleSession}
                sx={{ mb: 3 }}
              >
                {selectedSession.is_open ? 'End Session' : 'Re-open Session'}
              </Button>

              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                Attendance List
              </Typography>
              
              <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                {roster.map(student => {
                  const record = selectedSession.records.find(r => r.student_id === student.id);
                  const isPresent = record?.status === 'present';
                  
                  return (
                    <ListItem 
                      key={student.id}
                      secondaryAction={
                        !isPresent && (
                          <IconButton edge="end" color="success" onClick={() => handleManualCheckin(student.id)} title="Mark Present">
                            <CheckIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={student.picture} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={student.name}
                        secondary={
                          isPresent 
                            ? `Checked in: ${new Date(record.timestamp).toLocaleTimeString()}`
                            : 'Absent'
                        }
                        secondaryTypographyProps={{ 
                          color: isPresent ? 'success.main' : 'error.main' 
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      {/* Grading Drawer */}
      <Drawer
        anchor="right"
        open={gradingDrawerOpen}
        onClose={() => setGradingDrawerOpen(false)}
      >
        <Box sx={{ width: 500, p: 3 }}>
          {selectedAssignment && (
            <>
              <Typography variant="overline" color="text.secondary">Grading</Typography>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>{selectedAssignment.title}</Typography>
              <Typography variant="body2" gutterBottom>
                Points Possible: {selectedAssignment.points_possible}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <List sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                {studentGrades.map((student) => (
                  <Paper key={student.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={student.picture} sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Score"
                        type="number"
                        size="small"
                        sx={{ width: 100 }}
                        value={student.score}
                        onChange={(e) => handleUpdateGrade(student.id, 'score', e.target.value)}
                      />
                      <TextField
                        label="Feedback"
                        size="small"
                        fullWidth
                        value={student.feedback}
                        onChange={(e) => handleUpdateGrade(student.id, 'feedback', e.target.value)}      
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => handleSaveGrade(student)}
                        >
                            Save
                        </Button>
                    </Box>
                  </Paper>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialog} onClose={() => setAddStudentDialog(false)}>
        <DialogTitle>Add Student Manually</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            type="email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Student ID"
            fullWidth
            value={newStudent.student_id}
            onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Major"
            fullWidth
            value={newStudent.major}
            onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Graduation Year"
            fullWidth
            type="number"
            value={newStudent.grad_year}
            onChange={(e) => setNewStudent({ ...newStudent, grad_year: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddStudentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">Add Student</Button>
        </DialogActions>
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog open={createAssignmentDialog} onClose={() => setCreateAssignmentDialog(false)}>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}        
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Points Possible"
            fullWidth
            type="number"
            value={newAssignment.points_possible}
            onChange={(e) => setNewAssignment({ ...newAssignment, points_possible: e.target.value })}    
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <DatePicker 
              label="Due Date"
              value={newAssignment.due_date}
              onChange={(date) => setNewAssignment({ ...newAssignment, due_date: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAssignment} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Class</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The class will be permanently removed after 30 days.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To confirm, please type the class name: <strong>{classroom.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Class Name"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteConfirm}
            disabled={deleteConfirmName !== classroom.name}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Student Confirmation Dialog */}
      <Dialog open={removeStudentDialog} onClose={() => setRemoveStudentDialog(false)}>
        <DialogTitle>Remove Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{studentToRemove?.name}</strong> from this class?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRemoveStudentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRemoveStudentConfirm}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={announcementForm.title}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={announcementForm.content}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAnnouncement} variant="contained">
            {editingAnnouncement ? 'Save Changes' : 'Post Announcement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Announcement Confirmation Dialog */}
      <Dialog open={deleteAnnouncementDialog} onClose={() => setDeleteAnnouncementDialog(false)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the announcement "<strong>{announcementToDelete?.title}</strong>"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteAnnouncementDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteAnnouncementConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
