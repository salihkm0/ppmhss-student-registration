import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentLookup = () => {
  const [registrationCode, setRegistrationCode] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!registrationCode.trim()) {
      toast.error('Please enter a registration code');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);

    try {
      const response = await axios.post('https://ppmhss-student-registration-backend.onrender.com/api/students/verify', {
        registrationCode: registrationCode.trim()
      });
      
      if (response.data.success) {
        setStudent(response.data.data);
        toast.success('Registration found!');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid registration code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Check Registration Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your registration code to view your application details
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Registration Code"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your registration code (e.g., REG123456)"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSearch}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search Registration'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {student && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Registration Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Candidate Name
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {student.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'action.active' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Registration Code
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" fontFamily="monospace">
                        {student.registrationCode}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Application Number
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {student.applicationNo}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      color={
                        student.status === 'Approved' ? 'success.main' :
                        student.status === 'Rejected' ? 'error.main' : 'warning.main'
                      }
                    >
                      {student.status}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        School & Class
                      </Typography>
                      <Typography variant="body1">
                        {student.schoolName} (Class {student.studyingClass})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">
                        {student.phoneNo}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="textSecondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(student.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Don't have a registration code?{' '}
            <Button 
              variant="text" 
              size="small" 
              href="/"
              color="primary"
            >
              Register now
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentLookup;