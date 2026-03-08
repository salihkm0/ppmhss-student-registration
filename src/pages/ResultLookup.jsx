import React, { useState } from "react";
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
  Chip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as AccountBalanceIcon,
  WhatsApp as WhatsAppIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Score as ScoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MilitaryTech as MedalIcon,
  TrendingUp as TrendingUpIcon,
  HomeWork as HomeWorkIcon,
  Class as ClassIcon,
  LocationOn as LocationOnIcon,
  ArrowBack as ArrowBackIcon,
  School as TrainingIcon,
  WorkspacePremium as PremiumIcon,
  EmojiEvents as EmojiEventsIcon,
  SentimentVeryDissatisfied as SadIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResultLookup = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("code");
  const [registrationCode, setRegistrationCode] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [result, setResult] = useState(null);
  const [multipleResults, setMultipleResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappDialog, setWhatsappDialog] = useState(false);

  const handleSearch = async () => {
    if (searchType === "code" && !registrationCode.trim()) {
      toast.error("Please enter a registration code");
      return;
    }

    if (searchType === "phone" && !phoneNo.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMultipleResults([]);

    try {
      if (searchType === "code") {
        const response = await axios.get(
          `https://apinmea.oxiumev.com/api/results/code/${registrationCode.trim().toUpperCase()}`
        );

        if (response.data.success) {
          setResult(response.data.data);
          toast.success("Result found!");
        }
      } else {
        const response = await axios.get(
          `https://apinmea.oxiumev.com/api/results/phone/${phoneNo.trim()}`
        );

        if (response.data.success) {
          setMultipleResults(response.data.data.results);
          toast.success(`${response.data.data.count} result(s) found!`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error.response?.data?.error || "Invalid search. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTabChange = (event, newValue) => {
    setSearchType(newValue);
    setRegistrationCode("");
    setPhoneNo("");
    setResult(null);
    setMultipleResults([]);
    setError("");
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <MedalIcon sx={{ color: "#FFD700" }} />; // Gold
    if (rank === 2) return <MedalIcon sx={{ color: "#C0C0C0" }} />; // Silver
    if (rank === 3) return <MedalIcon sx={{ color: "#CD7F32" }} />; // Bronze
    return null;
  };

  const getScholarshipText = (scholarship) => {
    switch (scholarship) {
      case "Gold":
        return "Gold Scholarship (1st Rank)";
      case "Silver":
        return "Silver Scholarship (2nd Rank)";
      case "Bronze":
        return "Bronze Scholarship (3rd Rank)";
      default:
        return "Not Eligible";
    }
  };

  const getScholarshipColor = (scholarship) => {
    switch (scholarship) {
      case "Gold":
        return "warning";
      case "Silver":
        return "default";
      case "Bronze":
        return "secondary";
      default:
        return "default";
    }
  };

  const openWhatsApp = (number) => {
    const message = 'Hello, I need assistance with the NMEA TENDER SCHOLAR 26 results.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Helper function to get scholarship value (handles both scholarship and scholarshipType)
  const getScholarshipValue = (result) => {
    return result?.scholarship || result?.scholarshipType || '';
  };

  // UPDATED: Check if student is selected based on marks >= 15
  const isStudentSelected = (student) => {
    const marks = student?.examMarks || 0;
    return marks >= 15;
  };

  // UPDATED: Check if student is eligible for IAS Coaching (rank <= 100 AND marks >= 15)
  const isIASEligible = (student) => {
    const marks = student?.examMarks || 0;
    const rank = student?.rank || 0;
    return (rank <= 100) && (marks >= 15);
  };

  // Get qualification message based on marks
  const getQualificationMessage = (marks) => {
    if (marks >= 15) {
      return "Qualified (15+ marks)";
    } else {
      return "Not Qualified (Below 15 marks)";
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

      {/* Back Button */}
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
        size="small"
      >
        Back to Registration
      </Button>

      {/* Header with Logos */}
      <Card sx={{ mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
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
                  objectFit: 'contain',
                  mb: 1
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                School Logo
              </Typography>
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
                Exam Results Portal
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
                  objectFit: 'contain',
                  mb: 1
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                50th Anniversary
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScoreIcon /> Check Exam Results
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your registration code or phone number to view your exam results
          </Typography>

          {/* Search Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={searchType}
              onChange={handleTabChange}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab
                label="By Registration Code"
                value="code"
                icon={<AssignmentIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                label="By Phone Number"
                value="phone"
                icon={<PhoneIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            </Tabs>

            {searchType === "code" ? (
              <TextField
                fullWidth
                label="Registration Code"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your registration code (e.g., PPM1001)"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your 10-digit phone number"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  inputProps: { maxLength: 10 },
                }}
              />
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
              sx={{ mt: 2 }}
              size="small"
            >
              {loading ? <CircularProgress size={20} /> : "Search Results"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Single Result Display */}
          {result && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Result Details
              </Typography>

              {/* Selection Status Message */}
              {isStudentSelected(result.result) ? (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3, 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(145deg, #f3e5f5 0%, #e1f5fe 100%)',
                    border: '2px solid #4caf50'
                  }}
                >
                  <CelebrationIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    Congratulations! 🎉
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                    You have been selected for the one-day <strong>Butterfly Workshop 2026.</strong>
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Further details will be shared through the WhatsApp group.
                  </Typography>
                  
                  <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> We will add you to the official WhatsApp group soon. 
                      Please keep your phone number active.
                    </Typography>
                  </Alert>
                </Card>
              ) : (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3, 
                    p: 3, 
                    textAlign: 'center',
                    background: '#f5f5f5',
                    border: '2px solid #f44336'
                  }}
                >
                  <SadIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    Sorry! 😔
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                    You have not been selected for the Butterfly Workshop 2026.
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    We encourage you to participate in future events and keep improving.
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> Minimum 15 marks required for selection.
                    </Typography>
                  </Alert>
                </Card>
              )}

              {/* Student Info Card */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Candidate Name
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {result.result.student?.name || result.student?.name || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AssignmentIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Registration Code
                          </Typography>
                          <Typography variant="body1" fontWeight={500} fontFamily="monospace">
                            {result.result.registrationCode}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              

              {/* Marks and Rank Card */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rank
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {getMedalIcon(result.result.rank)}
                      <Typography variant="h4" fontWeight={600}>
                        {result.result.rank || "N/A"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Overall Position
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Scholarship
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <EmojiEventsIcon color={getScholarshipColor(getScholarshipValue(result.result))} />
                      <Typography variant="h6" fontWeight={600}>
                        {getScholarshipValue(result.result) || "Not Eligible"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {getScholarshipText(getScholarshipValue(result.result))}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              

              {/* Additional Information */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Additional Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            School
                          </Typography>
                          <Typography variant="body2">
                            {result.student?.schoolName || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ClassIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Class
                          </Typography>
                          <Typography variant="body2">
                            Class {result.student?.studyingClass || "7"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrainingIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            IAS Coaching Eligibility
                          </Typography>
                          <Chip
                            label={isIASEligible(result.result) ? "ELIGIBLE" : "NOT ELIGIBLE"}
                            color={isIASEligible(result.result) ? "success" : "default"}
                            size="small"
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {isIASEligible(result.result) 
                              ? "Top 100 rank with 15+ marks" 
                              : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <HomeWorkIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Selection Status
                          </Typography>
                          <Chip
                            label={isStudentSelected(result.result) ? "SELECTED" : "NOT SELECTED"}
                            color={isStudentSelected(result.result) ? "success" : "default"}
                            size="small"
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {isStudentSelected(result.result) 
                              ? "Eligible for Butterfly Workshop" 
                              : "Requires 15+ marks"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Note */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> 
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    <li>Minimum 15 marks required for Butterfly Workshop selection</li>
                    <li>Top 3 students receive Gold/Silver/Bronze scholarships</li>
                    <li>Top 100 students with 15+ marks are eligible for IAS coaching</li>
                  </ul>
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Multiple Results Display */}
          {multipleResults.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Multiple Registrations Found
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {multipleResults.length} registration(s) found for this phone number
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Student</strong></TableCell>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell align="center"><strong>Marks</strong></TableCell>
                      <TableCell align="center"><strong>Rank</strong></TableCell>
                      <TableCell align="center"><strong>Scholarship</strong></TableCell>
                      <TableCell align="center"><strong>Selection</strong></TableCell>
                      <TableCell align="center"><strong>IAS</strong></TableCell>
                      {/* <TableCell align="center"><strong>Action</strong></TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {multipleResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                              {result.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {result.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Class {result.class}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {result.registrationCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={500}>
                            {result.marks || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            /{result.totalMarks || 50}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            {getMedalIcon(result.rank)}
                            <Typography variant="body2">
                              {result.rank}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {result.scholarship || result.scholarshipType ? (
                            <Chip
                              label={result.scholarship || result.scholarshipType}
                              color={getScholarshipColor(result.scholarship || result.scholarshipType)}
                              size="small"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not Eligible
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={result.isSelected ? "SELECTED" : "NOT SELECTED"}
                            color={result.isSelected ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={result.iasCoaching ? "ELIGIBLE" : "NOT ELIGIBLE"}
                            color={result.iasCoaching ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        {/* <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                              setSearchType("code");
                              setRegistrationCode(result.registrationCode);
                              setTimeout(() => handleSearch(), 100);
                            }}
                          >
                            View
                          </Button>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

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

export default ResultLookup;