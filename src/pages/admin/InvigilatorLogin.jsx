import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentInd as InvigilatorIcon,
} from '@mui/icons-material';

const InvigilatorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://apinmea.oxiumev.com/api/invigilator/login', formData);
      
      if (response.data.success) {
        // Store invigilator token and data
        localStorage.setItem('invigilatorToken', response.data.token);
        localStorage.setItem('invigilatorData', JSON.stringify(response.data.invigilator));
        localStorage.setItem('invigilatorRole', 'invigilator');
        
        toast.success('Login successful!');
        navigate('/invigilator/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <InvigilatorIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Invigilator Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            PPMHSS Kottukkara - Exam Room Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mb: 3 }}
          >
            {loading ? 'Logging in...' : 'Login as Invigilator'}
          </Button>
        </form>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              fullWidth
              startIcon={<ArrowBackIcon />}
              disabled={loading}
            >
              Back to Home
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              component={Link}
              to="/admin/login"
              variant="outlined"
              fullWidth
              startIcon={<SchoolIcon />}
              disabled={loading}
            >
              Admin Login
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Note:</strong> Invigilators can only access assigned rooms.
          </Typography>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} PPMHSS Kottukkara | Invigilator Portal v1.0
        </Typography>
      </Box>
    </Container>
  );
};

export default InvigilatorLogin;