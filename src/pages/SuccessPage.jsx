import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Snackbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  WhatsApp as WhatsAppIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  School as SchoolIconFooter,
  Phone as PhoneIconFooter,
  Email as EmailIconFooter,
  Download as DownloadIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import axios from 'axios';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const [showRegNumberWarning, setShowRegNumberWarning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = localStorage.getItem('registrationData');
        if (!data) {
          navigate('/');
          return;
        }
        
        const parsedData = JSON.parse(data);
        setRegistrationData(parsedData);
        setShowRegNumberWarning(true);

        // Fetch student details from API
        await fetchStudentDetails(parsedData.registrationCode);

        // Clear registration data after displaying (optional)
        const timer = setTimeout(() => {
          localStorage.removeItem('registrationData');
        }, 5 * 60 * 1000); // 5 minutes
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Error loading registration data:', err);
        setError('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchStudentDetails = async (registrationCode) => {
    try {
      setLoadingDetails(true);
      const response = await axios.get(
        `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationCode}`
      );
      
      if (response.data.success) {
        setStudentDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setOpenSnackbar(true);
        toast.success('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleWhatsApp = () => {
    if (!registrationData) return;
    
    const hallTicketLink = `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationData.registrationCode}/hallticket/download`;
    
    let message = `📋 *NMEA TENDER SCHOLAR 26 - Registration Details*\n\n`;
    message += `👤 *Name:* ${registrationData.name}\n`;
    message += `📝 *Application No:* ${registrationData.applicationNo}\n`;
    message += `🔑 *Registration Code:* ${registrationData.registrationCode}\n`;
    
    if (studentDetails) {
      if (studentDetails.fatherName) {
        message += `👨 *Father's Name:* ${studentDetails.fatherName}\n`;
      }
      if (studentDetails.studyingClass) {
        message += `🏫 *Class:* ${studentDetails.studyingClass}\n`;
      }
      if (studentDetails.phoneNo) {
        message += `📱 *Phone:* ${studentDetails.phoneNo}\n`;
      }
      if (studentDetails.roomNo) {
        message += `🚪 *Room No:* ${studentDetails.roomNo}\n`;
      }
    }
    
    message += `\n📥 *Hall Ticket:* ${hallTicketLink}\n\n`;
    message += `_This is an automated message from PPMHSS Kottukkara_`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleDownloadHallTicket = () => {
    if (!registrationData) return;
    
    window.open(
      `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationData.registrationCode}/hallticket/download`,
      '_blank'
    );
  };

  const openWhatsAppSupport = (number) => {
    const message = 'Hello, I need assistance with my NMEA TENDER SCHOLAR 26 registration.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  // Error state
  if (error || !registrationData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error.main">
            Registration Data Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error || 'Unable to load registration details. Please go back and try again.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Registration
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* WhatsApp Support Button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => setWhatsappDialog(true)}
          startIcon={<WhatsAppIcon />}
          sx={{
            borderRadius: 50,
            boxShadow: 3,
          }}
        >
          WhatsApp Support
        </Button>
      </Box>

      {/* WhatsApp Support Dialog */}
      <Dialog 
        open={whatsappDialog} 
        onClose={() => setWhatsappDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">WhatsApp Support</Typography>
          <IconButton onClick={() => setWhatsappDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Contact our support team on WhatsApp for assistance:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={() => openWhatsAppSupport('919947073499')}
              fullWidth
            >
              99470 73499
            </Button>
            
            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={() => openWhatsAppSupport('918547645640')}
              fullWidth
            >
              85476 45640
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhatsappDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            Registration Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your registration has been completed successfully. Please save your registration details.
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ✅ Your registration is complete. Hall ticket will be available for download once room allocation is done.
          </Typography>
        </Alert>

        {/* Registration Number Warning - Red Alert */}
        {showRegNumberWarning && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: '#ffebee',
              color: '#c62828',
              border: '1px solid #ffcdd2',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Registration number must be written down. (രെജിസ്ട്രേഷൻ നമ്പർ നിർബന്ധമായും എഴുതി വെക്കേണ്ടതാണ്)
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Registration Details
                  </Typography>
                </Box>
                
                {/* Student Name */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Candidate Name
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {registrationData.name || 'N/A'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Registration Codes */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Application Number
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 'bold', 
                          fontFamily: 'monospace',
                          backgroundColor: '#f5f5f5',
                          padding: '8px 12px',
                          borderRadius: 1,
                          flex: 1
                        }}>
                          {registrationData.applicationNo || 'N/A'}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.applicationNo)}
                          color="primary"
                          disabled={!registrationData.applicationNo}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Registration Code
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 'bold', 
                          fontFamily: 'monospace',
                          backgroundColor: '#f5f5f5',
                          padding: '8px 12px',
                          borderRadius: 1,
                          flex: 1
                        }}>
                          {registrationData.registrationCode || 'N/A'}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.registrationCode)}
                          color="primary"
                          disabled={!registrationData.registrationCode}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Student Details from API */}
                {loadingDetails ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : studentDetails && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {studentDetails.fatherName && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Father's Name
                          </Typography>
                          <Typography variant="body1">
                            {studentDetails.fatherName}
                          </Typography>
                        </Grid>
                      )}
                      
                      {studentDetails.studyingClass && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Class
                          </Typography>
                          <Typography variant="body1">
                            Class {studentDetails.studyingClass}
                          </Typography>
                        </Grid>
                      )}
                      
                      {studentDetails.phoneNo && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Phone Number
                          </Typography>
                          <Typography variant="body1">
                            {studentDetails.phoneNo}
                          </Typography>
                        </Grid>
                      )}
                      
                      {studentDetails.roomNo && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Room Number
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {studentDetails.roomNo}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}

                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="textSecondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {registrationData.timestamp ? 
                      new Date(registrationData.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom align="center">
            Hall Ticket & Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadHallTicket}
                fullWidth
                size="large"
                disabled={!registrationData.registrationCode}
              >
                Download Hall Ticket
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="info"
                startIcon={<WhatsAppIcon />}
                onClick={handleWhatsApp}
                fullWidth
                size="large"
                disabled={!registrationData}
              >
                Share via WhatsApp
              </Button>
            </Grid>
          </Grid>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Important Instructions - UPDATED */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important Instructions:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Save your Registration Code: <strong>{registrationData.registrationCode || 'N/A'}</strong></li>
              <li>Use your registration code to check your status anytime</li>
              <li>Your room and seat are allocated</li>
              <li>Bring original Aadhaar card and hall ticket to exam</li>
              <li>Report 30 minutes before exam time</li>
              <li>Hall ticket link is included in WhatsApp share</li>
            </ul>
          </Typography>
        </Alert>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Need help?</strong> Use the WhatsApp Support button or contact school office.
          </Typography>
        </Box>
      </Paper>

      {/* Footer for Success Page */}
      <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <SchoolIconFooter sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" color="primary">
                PPMHSS Kottukkara
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Kottukkara, Kondotty, Malappuram - 673638
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <PhoneIconFooter sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" color="primary">
                Contact
              </Typography>
              <Typography variant="caption" color="text.secondary">
                +91 483 2711374, +91 483 2714174
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <EmailIconFooter sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" color="primary">
                Email
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ppmhss@gmail.com
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Developed by <strong>Muhammed Salih KM</strong> | +91 81570 24638
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default SuccessPage;