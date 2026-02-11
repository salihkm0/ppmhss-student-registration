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
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  CircularProgress,
  InputAdornment,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationOnIcon,
  Class as ClassIcon,
  Language as LanguageIcon,
  LocalPostOffice as PostOfficeIcon,
  Pin as PinIcon,
  Apartment as ApartmentIcon,
  AccountBalance as AccountBalanceIcon,
  WhatsApp as WhatsAppIcon,
  Badge as BadgeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  HomeWork as HomeWorkIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextApplicationNo, setNextApplicationNo] = useState('');
  const [nextRegistrationCode, setNextRegistrationCode] = useState('');
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const navigate = useNavigate();
  
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
      subDistrict: '', // Added subDistrict field
      studyingClass: '', // Fixed to Class 7 only
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
    { title: 'Personal', icon: <PersonIcon /> },
    { title: 'Academic', icon: <SchoolIcon /> },
    { title: 'Contact', icon: <PhoneIcon /> },
  ];

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
      fields = ['schoolName', 'subDistrict', 'studyingClass', 'medium']; // Added subDistrict to validation
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
        
        localStorage.setItem('registrationData', JSON.stringify({
          applicationNo,
          registrationCode,
          name,
          timestamp: new Date().toISOString()
        }));
        
        toast.success('Registration successful!');
        
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
      
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        fetchNextApplicationNo();
      }
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (number) => {
    const message = 'Hello, I need assistance with the NMEA TENDER SCHOLAR 26 registration.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const renderStepContent = (step) => {
    const gender = watch('gender');
    
    switch (step) {
      case 0:
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Personal Details
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
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.gender}>
                  <TextField
                    select
                    label="Gender *"
                    {...register('gender', { required: 'Gender is required' })}
                    variant="outlined"
                    size="small"
                    SelectProps={{
                      native: false,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            maxHeight: 200
                          }
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
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
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
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
                        <BadgeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 12 },
                  }}
                  placeholder="12-digit Aadhaar number"
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Academic Details
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
                        <SchoolIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              {/* SubDistrict Field Added Here */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.subDistrict}>
                  <TextField
                    select
                    label="Sub-District *"
                    {...register('subDistrict', { required: 'Sub-district is required' })}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="kondotty">Kondotty</MenuItem>
                    <MenuItem value="manjeri">Manjeri</MenuItem>
                    <MenuItem value="kizhisseri">Kizhisseri</MenuItem>
                    <MenuItem value="vengara">Vengara</MenuItem>
                    <MenuItem value="areekode">Areekode</MenuItem>
                  </TextField>
                  {errors.subDistrict && <FormHelperText>{errors.subDistrict.message}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.studyingClass}>
                  <TextField
                    select
                    label="Class Studying *"
                    {...register('studyingClass', { required: 'Class is required' })}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ClassIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    value="7"
                    // disabled
                  >
                    <MenuItem value="7">Class 7</MenuItem>
                  </TextField>
                  {errors.studyingClass && <FormHelperText>{errors.studyingClass.message}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.medium}>
                  <TextField
                    select
                    label="Medium of Instruction *"
                    {...register('medium', { required: 'Medium is required' })}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageIcon fontSize="small" />
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
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Contact Information
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
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 10 },
                  }}
                  placeholder="10-digit phone number"
                  variant="outlined"
                  size="small"
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
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
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
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
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
                        <PostOfficeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
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
                        <PinIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    inputProps: { maxLength: 6 },
                  }}
                  placeholder="6-digit PIN code"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.address?.localBodyType}>
                  <TextField
                    select
                    label="Type of Local Body *"
                    {...register('address.localBodyType', { required: 'Local body type is required' })}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ApartmentIcon fontSize="small" />
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
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Village *"
                  {...register('address.village', { required: 'Village name is required' })}
                  error={!!errors.address?.village}
                  helperText={errors.address?.village?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeWorkIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
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

      {/* WhatsApp Dialog */}
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
              onClick={() => openWhatsApp('919947073499')}
              fullWidth
            >
              99470 73499
            </Button>
            
            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={() => openWhatsApp('918547645640')}
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

      {/* Header Section with Logos */}
<Card sx={{ mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
  <CardContent sx={{ p: 2 }}>
    {/* Mobile Layout - Logos on top */}
    <Box sx={{ 
      display: { xs: 'flex', sm: 'none' }, 
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      mb: 3 
    }}>
      {/* Logos Row for Mobile */}
      {/* <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 300
      }}>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flex: 1
        }}>
          <Box
            component="img"
            src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946977/school-logo_uugskb.jpg"
            alt="School Logo"
            sx={{
              width: 70,
              height: 70,
              objectFit: 'contain'
            }}
          />
        </Box>


        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flex: 1
        }}>
          <Box
            component="img"
            src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946976/50th_t44gva.jpg"
            alt="50th Anniversary Logo"
            sx={{
              width: 70,
              height: 70,
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>

      {/* Title for Mobile */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          NMEA TENDER SCHOLAR 26
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
          Student Registration Form
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PPMHSS Kottukkara, Kondotty, Malappuram
        </Typography>
      </Box>
    </Box> 

    {/* Desktop Layout - Logos on sides */}
    <Box sx={{ 
      display: { xs: 'none', sm: 'flex' }, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: 2 
    }}>
      {/* Left: School Logo */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flex: 1 
      }}>
        <Box
          component="img"
          src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946977/school-logo_uugskb.jpg"
          alt="School Logo"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'contain'
          }}
        />
      </Box>

      {/* Center: Title */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flex: 2 
      }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          NMEA TENDER SCHOLAR 26
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
          Student Registration Form
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PPMHSS Kottukkara, Kondotty, Malappuram
        </Typography>
      </Box>

      {/* Right: 50th Anniversary Logo */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flex: 1 
      }}>
        <Box
          component="img"
          src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946976/50th_t44gva.jpg"
          alt="50th Anniversary Logo"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'contain'
          }}
        />
      </Box>
    </Box>
  </CardContent>
</Card>

      {/* Main Form */}
      <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Step Indicator */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      bgcolor: index <= activeStep ? 'primary.main' : 'action.disabledBackground',
                      color: index <= activeStep ? 'white' : 'action.disabled',
                      fontSize: '0.875rem',
                    }}
                  >
                    {index < activeStep ? (
                      <CheckCircleIcon fontSize="small" />
                    ) : (
                      React.cloneElement(step.icon, { fontSize: 'small' })
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: index === activeStep ? 600 : 400,
                      color: index === activeStep ? 'text.primary' : 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                height: 2,
                bgcolor: 'divider',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                  bgcolor: 'primary.main',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </Box>

          {/* Form Content */}
          <Box sx={{ mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ minWidth: 100 }}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                size="small"
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                size="small"
                sx={{ minWidth: 100 }}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/lookup')}
          startIcon={<AssignmentIcon />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Check Registration Status
        </Button>
      </Box>

      {/* Contact Information */}
      <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <AccountBalanceIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  PPMHSS Kottukkara
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Kottukkara, Kondotty
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PhoneIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Contact
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +91 9947073499, +91 8547645640
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <EmailIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Email
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ppmhss@gmail.com
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Developed by <strong>Muhammed Salih KM</strong> | 81570 24638
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              © {new Date().getFullYear()} PPMHSS Kottukkara
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RegistrationForm;