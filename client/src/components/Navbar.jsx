import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/apiClient';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'white', color: 'text.primary' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Rooster
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user.role}</Typography>
            </Box>
            <Avatar 
              src={user.picture} 
              sx={{ width: 32, height: 32, cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            />
            <Button color="inherit" onClick={handleLogout}>Sign Out</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
