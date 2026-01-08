import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Avatar, 
  Chip, TextField, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, Drawer, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Snackbar, Grid, LinearProgress
} from '@mui/material';
import { 
  getClassroom, getRoster, getAttendanceSessions, createAttendanceSession, 
  checkinAttendance, getAssignments, getAttendanceSessionDetails, updateAttendanceSession, deleteClassroom,
  removeStudentFromClass, getClassroomStatistics, addStudentToClass, manualAttendanceCheckin
} from '../api/apiClient';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';

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
  
  const [checkinCode, setCheckinCode] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const promises = [
      getClassroom(id),
      getRoster(id),
      getAttendanceSessions(id),
      getAssignments(id)
    ];
    
    const [cls, ros, att, asg] = await Promise.all(promises);
    setClassroom(cls);
    setRoster(ros);
    setAttendanceSessions(att);
    setAssignments(asg);
    
    if (cls && cls.is_instructor) {
      const s = await getClassroomStatistics(id);
      if (!s.error) setStats(s);
    }
  };

  if (!classroom) return null;

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

  return (
    <Container sx={{ py: 4 }}>
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

        <CustomTabPanel value={tab} index={0}>
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Typography variant="body1">{classroom.description || 'Welcome to the class!'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Instructor: {classroom.instructor.name} ({classroom.instructor.email})
          </Typography>
        </CustomTabPanel>

        {classroom.is_instructor && (
          <CustomTabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Class Roster</Typography>
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />} 
                onClick={() => setAddStudentDialog(true)}
              >
                Add Student
              </Button>
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
            {classroom.is_instructor && (
              <Button variant="contained" onClick={handleCreateSession}>Start New Session</Button>
            )}
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
          <Typography variant="h6" gutterBottom>Assignments & Grades</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Points Possible</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{a.points_possible}</TableCell>
                    <TableCell>{classroom.is_instructor ? 'View All' : 'My Grade'}</TableCell>
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

      {/* Delete Class Confirmation Dialog */}
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
