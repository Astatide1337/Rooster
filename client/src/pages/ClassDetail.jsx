import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Avatar, 
  Chip, TextField, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, Drawer, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Snackbar
} from '@mui/material';
import { 
  getClassroom, getRoster, getAttendanceSessions, createAttendanceSession, 
  checkinAttendance, getAssignments, getAttendanceSessionDetails, updateAttendanceSession, deleteClassroom,
  removeStudentFromClass
} from '../api/apiClient';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [cls, ros, att, asg] = await Promise.all([
      getClassroom(id),
      getRoster(id),
      getAttendanceSessions(id),
      getAssignments(id)
    ]);
    setClassroom(cls);
    setRoster(ros);
    setAttendanceSessions(att);
    setAssignments(asg);
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
            <Typography variant="h6" gutterBottom>Class Roster</Typography>
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
      </Paper>

      {/* Attendance Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
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
              
              <Typography variant="subtitle1" gutterBottom>
                Checked In ({selectedSession.records.length})
              </Typography>
              
              <List>
                {selectedSession.records.map((rec) => (
                  <ListItem key={rec.student_id}>
                    <ListItemAvatar>
                      <Avatar src={rec.picture} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={rec.name}
                      secondary={new Date(rec.timestamp).toLocaleTimeString()}
                    />
                  </ListItem>
                ))}
                {selectedSession.records.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No students have checked in yet.
                  </Typography>
                )}
              </List>
            </>
          )}
        </Box>
      </Drawer>

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