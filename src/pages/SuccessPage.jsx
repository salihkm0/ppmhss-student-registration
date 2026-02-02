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
  Chip,
  Divider,
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
  Room as RoomIcon,
  EventSeat as SeatIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('registrationData');
    if (!data) {
      navigate('/');
      return;
    }
    setRegistrationData(JSON.parse(data));
    
    // Clear registration data after displaying
    const timer = setTimeout(() => {
      localStorage.removeItem('registrationData');
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleCopy = (text) => {
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
    const message = `My Student Registration Details:\n
📝 Application No: ${registrationData.applicationNo}
🔑 Registration Code: ${registrationData.registrationCode}
👤 Name: ${registrationData.name}
🚪 Room No: ${registrationData.roomNo}
💺 Seat No: ${registrationData.seatNo}
🏫 Class: ${registrationData.studyingClass}
📞 Phone: ${registrationData.phoneNo}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleDownloadHallTicket = () => {
    window.open(
      `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationData.registrationCode}/hallticket/download`,
      '_blank'
    );
  };

  const handlePreviewHallTicket = () => {
    window.open(
      `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationData.registrationCode}/hallticket/preview`,
      '_blank'
    );
  };

  if (!registrationData) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
            ✅ Your seat has been allocated. Please note your Room No for the examination.
          </Typography>
        </Alert>

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
                    {registrationData.name}
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
                          {registrationData.applicationNo}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.applicationNo)}
                          color="primary"
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
                          {registrationData.registrationCode}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.registrationCode)}
                          color="primary"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="textSecondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(registrationData.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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

        {/* Important Instructions */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important Instructions:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Save your Registration Code: <strong>{registrationData.registrationCode}</strong></li>
              <li>You must report to <strong>Room {registrationData.roomNo}</strong> at <strong>Seat {registrationData.seatNo}</strong></li>
              <li>Bring original Aadhaar card and this hall ticket</li>
              <li>Report 30 minutes before exam time (09:30 AM)</li>
            </ul>
          </Typography>
        </Alert>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Need help?</strong> Contact school office or visit the registration portal.
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