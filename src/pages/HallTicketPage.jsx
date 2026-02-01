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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const HallTicketPage = () => {
  const [searchType, setSearchType] = useState('code'); // 'code' or 'phone'
  const [registrationCode, setRegistrationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleSearchTypeChange = (event, newType) => {
    if (newType !== null) {
      setSearchType(newType);
      setStudent(null);
      setRegistrations([]);
      setError('');
    }
  };

  const handleSearch = async () => {
    if (searchType === 'code') {
      await searchByCode();
    } else {
      await searchByPhone();
    }
  };

  const searchByCode = async () => {
    if (!registrationCode.trim()) {
      toast.error('Please enter a registration code');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setRegistrations([]);

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
      const errorMessage = error.response?.data?.error || 'Invalid registration code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchByPhone = async () => {
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setRegistrations([]);

    try {
      const response = await axios.post('https://ppmhss-student-registration-backend.onrender.com/api/students/hallticket/by-phone', {
        phoneNo: phoneNumber.trim()
      });
      
      if (response.data.success) {
        setRegistrations(response.data.data);
        if (response.data.data.length === 1) {
          setOpenDialog(true);
        } else {
          toast.success(`${response.data.count} registrations found!`);
        }
      }
    } catch (error) {
      console.error('Phone search error:', error);
      const errorMessage = error.response?.data?.error || 'No registrations found';
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

  const openHallTicket = (code, type = 'preview') => {
    const baseUrl = 'https://ppmhss-student-registration-backend.onrender.com';
    const url = `${baseUrl}/api/students/${code}/hallticket/${type}`;
    window.open(url, '_blank');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = () => {
    if (registrations.length === 1) {
      openHallTicket(registrations[0].registrationCode, 'preview');
    }
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Download Hall Ticket
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get your exam admit card for NMEA TENDER SCHOLAR 26
          </Typography>
        </Box>

        {/* Search Type Toggle */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={handleSearchTypeChange}
            aria-label="search type"
          >
            <ToggleButton value="code" aria-label="by registration code">
              By Registration Code
            </ToggleButton>
            <ToggleButton value="phone" aria-label="by phone number">
              By Phone Number
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Search Input */}
        <Box sx={{ mb: 4 }}>
          {searchType === 'code' ? (
            <TextField
              fullWidth
              label="Registration Code"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your registration code (e.g., PPM1001)"
              InputProps={{
                startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          ) : (
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your 10-digit phone number"
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          )}
          
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSearch}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Single Student Result */}
        {student && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Student Found
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Class
                      </Typography>
                      <Typography variant="body1">
                        Class {student.studyingClass} - {student.medium}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<VisibilityIcon />}
                      onClick={() => openHallTicket(student.registrationCode, 'preview')}
                    >
                      Preview Hall Ticket
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DownloadIcon />}
                      onClick={() => openHallTicket(student.registrationCode, 'download')}
                    >
                      Download & Print
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Multiple Registrations Result */}
        {registrations.length > 1 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Multiple Registrations Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a registration to download hall ticket:
              </Typography>
              
              <List>
                {registrations.map((reg, index) => (
                  <ListItem key={index} divider={index < registrations.length - 1}>
                    <ListItemText
                      primary={reg.name}
                      secondary={
                        <>
                          Application No: {reg.applicationNo} | Class: {reg.class}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="preview"
                        onClick={() => openHallTicket(reg.registrationCode, 'preview')}
                        sx={{ mr: 1 }}
                        title="Preview"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="download"
                        onClick={() => openHallTicket(reg.registrationCode, 'download')}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Don't have a registration?{' '}
            <Button 
              variant="text" 
              size="small" 
              href="/"
              color="primary"
            >
              Register now
            </Button>
            {' '}or{' '}
            <Button 
              variant="text" 
              size="small" 
              href="/lookup"
              color="primary"
            >
              Check registration status
            </Button>
          </Typography>
        </Box>
      </Paper>

      {/* Dialog for single registration */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Registration Found</DialogTitle>
        <DialogContent>
          <Typography>
            Found one registration for {phoneNumber}. Do you want to view the hall ticket?
          </Typography>
          {registrations[0] && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {registrations[0].name}
              </Typography>
              <Typography variant="body2">
                <strong>Registration Code:</strong> {registrations[0].registrationCode}
              </Typography>
              <Typography variant="body2">
                <strong>Class:</strong> {registrations[0].class}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogConfirm} variant="contained" color="primary">
            View Hall Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HallTicketPage;