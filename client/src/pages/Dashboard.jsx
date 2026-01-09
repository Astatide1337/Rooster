import { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, CardActionArea, 
  Button, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClassrooms, createClassroom, joinClassroom } from '../api/apiClient';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';

export default function Dashboard({ user }) {
  const [classes, setClasses] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', term: '', section: '' });
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const data = await getClassrooms();
    if (Array.isArray(data)) {
      setClasses(data);
    } else {
      console.error("Failed to fetch classes:", data);
      setClasses([]);
    }
  };

  const handleCreate = async () => {
    await createClassroom(newClass);
    setOpenCreate(false);
    fetchClasses();
  };

  const handleJoin = async () => {
    const res = await joinClassroom(joinCode);
    if (res.error) {
      alert(res.error);
    } else {
      setOpenJoin(false);
      fetchClasses();
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Classes</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<LoginIcon />}
            onClick={() => setOpenJoin(true)}
          >
            Join Class
          </Button>
          {user.role === 'instructor' && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
            >
              Create Class
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {classes.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls.id}>
            <Card elevation={2}>
              <CardActionArea onClick={() => navigate(`/class/${cls.id}`)}>
                <CardContent sx={{ height: 140 }}>
                  <Typography variant="overline" color="text.secondary">{cls.term}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{cls.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Section: {cls.section} | Instructor: {cls.instructor_name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Class Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            variant="outlined"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Term (e.g., Spring 2026)"
            fullWidth
            variant="outlined"
            value={newClass.term}
            onChange={(e) => setNewClass({ ...newClass, term: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Section"
            fullWidth
            variant="outlined"
            value={newClass.section}
            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)}>
        <DialogTitle>Join Class</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Enter the 6-character code provided by your instructor.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Join Code"
            fullWidth
            variant="outlined"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
          <Button onClick={handleJoin} variant="contained">Join</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
