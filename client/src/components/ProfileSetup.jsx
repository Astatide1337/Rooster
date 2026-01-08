import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem, Container } from '@mui/material';
import { updateUser } from '../api/apiClient';

export default function ProfileSetup({ user, onComplete }) {
  const [role, setRole] = useState(user.role || 'student');
  const [major, setMajor] = useState(user.major || '');
  const [gradYear, setGradYear] = useState(user.grad_year || '');
  const [studentId, setStudentId] = useState(user.student_id || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { role };
    
    // Only include student-specific fields if role is student
    if (role === 'student') {
      data.major = major;
      data.grad_year = parseInt(gradYear);
      data.student_id = studentId;
    } else {
      // For instructors, just set a placeholder to mark profile as complete
      data.student_id = 'INSTRUCTOR';
    }
    
    const success = await updateUser(data);
    if (success) {
      onComplete();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Please provide a few more details to get started.
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="I am a..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              margin="normal"
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
            </TextField>
            
            {role === 'student' && (
              <>
                <TextField
                  fullWidth
                  label="Major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Graduation Year"
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 4 }}
            >
              Finish Setup
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
