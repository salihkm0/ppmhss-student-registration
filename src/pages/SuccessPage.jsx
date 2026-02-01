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
    const message = `My Student Registration Details:\nApplication No: ${registrationData.applicationNo}\nRegistration Code: ${registrationData.registrationCode}\nName: ${registrationData.name}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (!registrationData) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            Registration Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your registration has been completed successfully.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Your registration details have been saved. Please save the information below for future reference.
        </Alert>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Registration Details
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Candidate Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {registrationData.name}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Application Number
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {registrationData.applicationNo}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.applicationNo)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Registration Code
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {registrationData.registrationCode}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(registrationData.registrationCode)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
            fullWidth
            size="large"
          >
            Share via WhatsApp
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            fullWidth
            size="large"
          >
            Back to Home
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Important:</strong> Please save your Registration Code. You'll need it for future references.
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