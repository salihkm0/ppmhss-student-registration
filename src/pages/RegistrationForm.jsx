import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  TextField,
  MenuItem,
  Grid,
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIconFooter,
  Email as EmailIconFooter,
  School as SchoolIconFooter,
} from '@mui/icons-material';

const steps = ['Personal Details', 'Academic Details', 'Contact Information'];

const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextApplicationNo, setNextApplicationNo] = useState('');
  const [nextRegistrationCode, setNextRegistrationCode] = useState('');
  const [loadingCodes, setLoadingCodes] = useState(true);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      gender: '',
      fatherName: '',
      aadhaarNo: '',
      schoolName: '',
      studyingClass: '',
      medium: '',
      phoneNo: '',
      address: {
        houseName: '',
        place: '',
        postOffice: '',
        pinCode: '',
        localBodyType: '',
        localBodyName: '',
        village: '',
      },
    },
  });

  // Fetch next application number and registration code
  const fetchNextApplicationNo = async () => {
    try {
      setLoadingCodes(true);
      const [appNoResponse, regCodeResponse] = await Promise.all([
        axios.get('http://localhost:5010/api/students/next-application-no'),
        axios.get('http://localhost:5010/api/students/next-registration-code')
      ]);
      
      if (appNoResponse.data.success) {
        setNextApplicationNo(appNoResponse.data.data.nextApplicationNo);
      }
      
      if (regCodeResponse.data.success) {
        setNextRegistrationCode(regCodeResponse.data.data.nextRegistrationCode);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
      // Generate fallback codes
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      setNextApplicationNo(`APP${year}${month}XXXX`);
      setNextRegistrationCode('PPM1000');
    } finally {
      setLoadingCodes(false);
    }
  };

  useEffect(() => {
    fetchNextApplicationNo();
  }, []);

  const handleNext = async () => {
    let fields = [];
    let isValid = false;
    
    if (activeStep === 0) {
      fields = ['name', 'gender', 'fatherName', 'aadhaarNo'];
    } else if (activeStep === 1) {
      fields = ['schoolName', 'studyingClass', 'medium'];
    } else {
      fields = ['phoneNo', 'address.houseName', 'address.place', 'address.postOffice', 'address.pinCode', 'address.localBodyType', 'address.localBodyName', 'address.village'];
    }
    
    try {
      isValid = await trigger(fields, { shouldFocus: true });
    } catch (error) {
      console.error('Validation error:', error);
    }
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRefreshCodes = () => {
    fetchNextApplicationNo();
    toast.success('Codes refreshed!');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Submitting data:', data);
      const response = await axios.post('http://localhost:5010/api/students/register', data);
      
      if (response.data.success) {
        const { applicationNo, registrationCode, name } = response.data.data;
        
        // Store in localStorage for success page
        localStorage.setItem('registrationData', JSON.stringify({
          applicationNo,
          registrationCode,
          name,
          timestamp: new Date().toISOString()
        }));
        
        toast.success('Registration successful!');
        
        // Refresh codes for next registration
        setTimeout(() => {
          fetchNextApplicationNo();
        }, 1000);
        
        navigate('/success');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors?.[0]?.msg) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      toast.error(errorMessage);
      
      // If it's a duplicate error, refresh the application number
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        fetchNextApplicationNo();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name of Candidate *"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters'
                  }
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Gender *"
                {...register('gender', { required: 'Gender is required' })}
                error={!!errors.gender}
                helperText={errors.gender?.message}
                variant="outlined"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Father's Name *"
                {...register('fatherName', { 
                  required: "Father's name is required",
                  minLength: {
                    value: 3,
                    message: "Father's name must be at least 3 characters"
                  }
                })}
                error={!!errors.fatherName}
                helperText={errors.fatherName?.message}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Aadhaar Number *"
                {...register('aadhaarNo', {
                  required: 'Aadhaar number is required',
                  pattern: {
                    value: /^\d{12}$/,
                    message: 'Must be exactly 12 digits'
                  }
                })}
                error={!!errors.aadhaarNo}
                helperText={errors.aadhaarNo?.message}
                InputProps={{
                  startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                placeholder="12-digit Aadhaar number"
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name of School *"
                {...register('schoolName', { required: 'School name is required' })}
                error={!!errors.schoolName}
                helperText={errors.schoolName?.message}
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Class Studying *"
                {...register('studyingClass', { required: 'Class is required' })}
                error={!!errors.studyingClass}
                helperText={errors.studyingClass?.message}
                variant="outlined"
              >
                <MenuItem value="7">Class 7</MenuItem>
                <MenuItem value="8">Class 8</MenuItem>
                <MenuItem value="9">Class 9</MenuItem>
                <MenuItem value="10">Class 10</MenuItem>
                <MenuItem value="11">Class 11</MenuItem>
                <MenuItem value="12">Class 12</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Medium of Instruction *"
                {...register('medium', { required: 'Medium is required' })}
                error={!!errors.medium}
                helperText={errors.medium?.message}
                variant="outlined"
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Malayalam">Malayalam</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number (WhatsApp) *"
                {...register('phoneNo', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Must be exactly 10 digits'
                  }
                })}
                error={!!errors.phoneNo}
                helperText={errors.phoneNo?.message}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                placeholder="10-digit phone number"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="House Name *"
                {...register('address.houseName', { required: 'House name is required' })}
                error={!!errors.address?.houseName}
                helperText={errors.address?.houseName?.message}
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Place *"
                {...register('address.place', { required: 'Place is required' })}
                error={!!errors.address?.place}
                helperText={errors.address?.place?.message}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Post Office *"
                {...register('address.postOffice', { required: 'Post office is required' })}
                error={!!errors.address?.postOffice}
                helperText={errors.address?.postOffice?.message}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PIN Code *"
                {...register('address.pinCode', {
                  required: 'PIN code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Must be exactly 6 digits'
                  }
                })}
                error={!!errors.address?.pinCode}
                helperText={errors.address?.pinCode?.message}
                placeholder="6-digit PIN code"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Type of Local Body *"
                {...register('address.localBodyType', { required: 'Local body type is required' })}
                error={!!errors.address?.localBodyType}
                helperText={errors.address?.localBodyType?.message}
                variant="outlined"
              >
                <MenuItem value="Municipality">Municipality</MenuItem>
                <MenuItem value="Corporation">Corporation</MenuItem>
                <MenuItem value="Panchayat">Panchayat</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name of Local Body *"
                {...register('address.localBodyName', { required: 'Local body name is required' })}
                error={!!errors.address?.localBodyName}
                helperText={errors.address?.localBodyName?.message}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Village *"
                {...register('address.village', { required: 'Village is required' })}
                error={!!errors.address?.village}
                helperText={errors.address?.village?.message}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Student Registration Form
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details below to register for the program
          </Typography>
        </Box>

        {/* Next Application Number and Registration Code Preview - SIMPLIFIED */}
        <Box sx={{ mb: 4 }}>
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            icon={<InfoIcon />}
            action={
              <Tooltip title="Refresh codes">
                <IconButton 
                  size="small" 
                  onClick={handleRefreshCodes}
                  disabled={loadingCodes}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                <Typography variant="body2">
                  Next Application No:
                </Typography>
                <Chip 
                  label={loadingCodes ? 'Loading...' : nextApplicationNo}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  Next Registration Code:
                </Typography>
                <Chip 
                  label={loadingCodes ? 'Loading...' : nextRegistrationCode}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>
          </Alert>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
              size="large"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 150, px: 4 }}
                size="large"
              >
                {loading ? 'Registering...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ minWidth: 100 }}
                size="large"
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Already registered?{' '}
            <Button 
              variant="text" 
              size="small" 
              onClick={() => navigate('/lookup')}
              color="primary"
              sx={{ fontWeight: 'bold' }}
            >
              Check your registration status
            </Button>
          </Typography>
        </Box>
      </Paper>

      {/* Footer Section */}
      <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <SchoolIconFooter sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                PPMHSS Kottukkara
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kottukkara, Kondotty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Malappuram - 673638
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <PhoneIconFooter sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Contact Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +91 483 2711374
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +91 483 2714174
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <EmailIconFooter sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ppmhss@gmail.com
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  For technical support:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +91 81570 24638
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Developed by <strong>Muhammed Salih KM</strong> | +91 81570 24638
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            © {new Date().getFullYear()} PPMHSS Kottukkara. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationForm;