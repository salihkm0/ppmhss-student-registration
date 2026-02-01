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
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  InputAdornment,
  FormControl,
  FormHelperText,
  alpha,
  useTheme,
  useMediaQuery,
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
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as TransgenderIcon,
  Class as ClassIcon,
  Language as LanguageIcon,
  LocalPostOffice as PostOfficeIcon,
  Pin as PinIcon,
  Apartment as ApartmentIcon,
  AccountBalance as AccountBalanceIcon,
  WhatsApp as WhatsAppIcon,
  Badge as BadgeIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  HomeWork as HomeWorkIcon, // Alternative for Village
  Public as PublicIcon, // Another alternative
} from '@mui/icons-material';

const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextApplicationNo, setNextApplicationNo] = useState('');
  const [nextRegistrationCode, setNextRegistrationCode] = useState('');
  const [loadingCodes, setLoadingCodes] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    reset,
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

  const steps = [
    { title: 'Personal Info', icon: <PersonIcon /> },
    { title: 'Academic Info', icon: <SchoolIcon /> },
    { title: 'Contact Info', icon: <PhoneIcon /> },
  ];

  // Fetch next application number and registration code
  const fetchNextApplicationNo = async () => {
    try {
      setLoadingCodes(true);
      const [appNoResponse, regCodeResponse] = await Promise.all([
        axios.get('http://13.127.187.19:5010/api/students/next-application-no'),
        axios.get('http://13.127.187.19:5010/api/students/next-registration-code')
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
      const response = await axios.post('http://13.127.187.19:5010/api/students/register', data);
      
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
          reset();
          setActiveStep(0);
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
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Personal Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <TextField
                    select
                    label="Gender *"
                    {...register('gender', { required: 'Gender is required' })}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    SelectProps={{
                      IconComponent: () => null,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {watch('gender') === 'Male' ? (
                            <MaleIcon color="action" />
                          ) : watch('gender') === 'Female' ? (
                            <FemaleIcon color="action" />
                          ) : watch('gender') === 'Other' ? (
                            <TransgenderIcon color="action" />
                          ) : (
                            <PersonIcon color="action" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Male" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaleIcon fontSize="small" /> Male
                    </MenuItem>
                    <MenuItem value="Female" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FemaleIcon fontSize="small" /> Female
                    </MenuItem>
                    <MenuItem value="Other" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TransgenderIcon fontSize="small" /> Other
                    </MenuItem>
                  </TextField>
                  {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12}>
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 12 },
                  }}
                  placeholder="Enter 12-digit Aadhaar number"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon /> Academic Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name of School *"
                  {...register('schoolName', { required: 'School name is required' })}
                  error={!!errors.schoolName}
                  helperText={errors.schoolName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.studyingClass}>
                  <TextField
                    select
                    label="Class Studying *"
                    {...register('studyingClass', { required: 'Class is required' })}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ClassIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="7">Class 7</MenuItem>
                    <MenuItem value="8">Class 8</MenuItem>
                    <MenuItem value="9">Class 9</MenuItem>
                    <MenuItem value="10">Class 10</MenuItem>
                    <MenuItem value="11">Class 11</MenuItem>
                    <MenuItem value="12">Class 12</MenuItem>
                  </TextField>
                  {errors.studyingClass && <FormHelperText>{errors.studyingClass.message}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.medium}>
                  <TextField
                    select
                    label="Medium of Instruction *"
                    {...register('medium', { required: 'Medium is required' })}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Malayalam">Malayalam</MenuItem>
                  </TextField>
                  {errors.medium && <FormHelperText>{errors.medium.message}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon /> Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsAppIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 10 },
                  }}
                  placeholder="Enter 10-digit phone number"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="House Name *"
                  {...register('address.houseName', { required: 'House name is required' })}
                  error={!!errors.address?.houseName}
                  helperText={errors.address?.houseName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Place *"
                  {...register('address.place', { required: 'Place is required' })}
                  error={!!errors.address?.place}
                  helperText={errors.address?.place?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Post Office *"
                  {...register('address.postOffice', { required: 'Post office is required' })}
                  error={!!errors.address?.postOffice}
                  helperText={errors.address?.postOffice?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PostOfficeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 6 },
                  }}
                  placeholder="6-digit PIN code"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.address?.localBodyType}>
                  <TextField
                    select
                    label="Type of Local Body *"
                    {...register('address.localBodyType', { required: 'Local body type is required' })}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ApartmentIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Municipality">Municipality</MenuItem>
                    <MenuItem value="Corporation">Corporation</MenuItem>
                    <MenuItem value="Panchayat">Panchayat</MenuItem>
                  </TextField>
                  {errors.address?.localBodyType && (
                    <FormHelperText>{errors.address.localBodyType.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name of Local Body *"
                  {...register('address.localBodyName', { required: 'Local body name is required' })}
                  error={!!errors.address?.localBodyName}
                  helperText={errors.address?.localBodyName?.message}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Village *"
                  {...register('address.village', { required: 'Village is required' })}
                  error={!!errors.address?.village}
                  helperText={errors.address?.village?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeWorkIcon color="action" /> {/* Replaced Village with HomeWork */}
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      {/* Header Section */}
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            NMEA TENDER SCHOLAR 26
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
            Student Registration Form
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Fill in the details below to register for the scholarship program
          </Typography>
        </CardContent>
      </Card>

      {/* Application Codes Preview */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <AssignmentIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Next Application No
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {loadingCodes ? (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  ) : (
                    nextApplicationNo
                  )}
                </Typography>
              </Box>
            </Box>
            
            <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <BadgeIcon color="secondary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Next Registration Code
                </Typography>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {loadingCodes ? (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  ) : (
                    nextRegistrationCode
                  )}
                </Typography>
              </Box>
            </Box>
            
            <Tooltip title="Refresh codes">
              <IconButton 
                onClick={handleRefreshCodes}
                disabled={loadingCodes}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Step Indicator */}
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              {steps.map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      bgcolor: index === activeStep
                        ? 'primary.main'
                        : index < activeStep
                        ? 'success.main'
                        : alpha(theme.palette.primary.main, 0.1),
                      color: index === activeStep
                        ? 'white'
                        : index < activeStep
                        ? 'white'
                        : 'text.secondary',
                      border: index === activeStep ? `3px solid ${theme.palette.primary.main}` : 'none',
                      boxShadow: index === activeStep ? 3 : 0,
                    }}
                  >
                    {index < activeStep ? (
                      <CheckCircleIcon />
                    ) : (
                      React.cloneElement(step.icon, { fontSize: 'medium' })
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: index === activeStep ? 'bold' : 'normal',
                      color: index === activeStep ? 'primary.main' : 'text.secondary',
                      textAlign: 'center',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              ))}
            </Box>
            {/* Progress Line */}
            <Box
              sx={{
                position: 'absolute',
                top: 25,
                left: '10%',
                right: '10%',
                height: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                zIndex: 0,
              }}
            >
              <Box
                sx={{
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </Box>

          {/* Current Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: 2,
            flexDirection: isMobile ? 'column-reverse' : 'row'
          }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBackIcon />}
              fullWidth={isMobile}
              size={isMobile ? "medium" : "large"}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                fullWidth={isMobile}
                size={isMobile ? "medium" : "large"}
                sx={{ 
                  minWidth: isMobile ? '100%' : 200,
                  py: 1.5,
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' }
                }}
              >
                {loading ? 'Registering...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                fullWidth={isMobile}
                size={isMobile ? "medium" : "large"}
                sx={{ py: 1.5 }}
              >
                Next Step
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={() => navigate('/lookup')}
          startIcon={<AssignmentIcon />}
          size={isMobile ? "small" : "medium"}
          sx={{ fontWeight: 'bold' }}
        >
          Check Registration Status
        </Button>
      </Box>

      {/* Footer Information */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
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
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <PhoneIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +91 483 2711374
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +91 483 2714174
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                Email & Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ppmhss@gmail.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tech: +91 81570 24638
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
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