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
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// const ResultLookup = () => {
//   const navigate = useNavigate();
//   const [searchType, setSearchType] = useState("code");
//   const [registrationCode, setRegistrationCode] = useState("");
//   const [phoneNo, setPhoneNo] = useState("");
//   const [result, setResult] = useState(null);
//   const [multipleResults, setMultipleResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [whatsappDialog, setWhatsappDialog] = useState(false);

//   const handleSearch = async () => {
//     if (searchType === "code" && !registrationCode.trim()) {
//       toast.error("Please enter a registration code");
//       return;
//     }

//     if (searchType === "phone" && !phoneNo.trim()) {
//       toast.error("Please enter a phone number");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setResult(null);
//     setMultipleResults([]);

//     try {
//       if (searchType === "code") {
//         const response = await axios.get(
//           `https://apinmea.oxiumev.com/api/results/code/${registrationCode.trim().toUpperCase()}`
//         );

//         if (response.data.success) {
//           setResult(response.data.data);
//           toast.success("Result found!");
//         }
//       } else {
//         const response = await axios.get(
//           `https://apinmea.oxiumev.com/api/results/phone/${phoneNo.trim()}`
//         );

//         if (response.data.success) {
//           setMultipleResults(response.data.data.results);
//           toast.success(`${response.data.data.count} result(s) found!`);
//         }
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       const errorMessage =
//         error.response?.data?.error || "Invalid search. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setSearchType(newValue);
//     setRegistrationCode("");
//     setPhoneNo("");
//     setResult(null);
//     setMultipleResults([]);
//     setError("");
//   };

//   const getResultColor = (result) => {
//     if (result === "Passed" || result === true) return "success";
//     if (result === "Failed" || result === false) return "error";
//     return "default";
//   };

//   const getMedalIcon = (rank) => {
//     if (rank === 1) return <MedalIcon sx={{ color: "#FFD700" }} />; // Gold
//     if (rank === 2) return <MedalIcon sx={{ color: "#C0C0C0" }} />; // Silver
//     if (rank === 3) return <MedalIcon sx={{ color: "#CD7F32" }} />; // Bronze
//     return null;
//   };

//   const getScholarshipText = (scholarship) => {
//     switch (scholarship) {
//       case "Gold":
//         return "Gold Scholarship (1st Rank)";
//       case "Silver":
//         return "Silver Scholarship (2nd Rank)";
//       case "Bronze":
//         return "Bronze Scholarship (3rd Rank)";
//       default:
//         return "Not Eligible";
//     }
//   };

//   const getScholarshipColor = (scholarship) => {
//     switch (scholarship) {
//       case "Gold":
//         return "warning";
//       case "Silver":
//         return "default";
//       case "Bronze":
//         return "secondary";
//       default:
//         return "default";
//     }
//   };

//   const openWhatsApp = (number) => {
//     const message = 'Hello, I need assistance with the NMEA TENDER SCHOLAR 26 results.';
//     const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
//     window.open(url, '_blank');
//   };

//   return (
//     <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
//       {/* WhatsApp Support Button */}
//       <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
//         <Button
//           variant="contained"
//           color="success"
//           onClick={() => setWhatsappDialog(true)}
//           startIcon={<WhatsAppIcon />}
//           sx={{
//             borderRadius: 50,
//             boxShadow: 3,
//           }}
//         >
//           WhatsApp Support
//         </Button>
//       </Box>

//       {/* WhatsApp Dialog */}
//       <Dialog 
//         open={whatsappDialog} 
//         onClose={() => setWhatsappDialog(false)}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography variant="h6">WhatsApp Support</Typography>
//           <IconButton onClick={() => setWhatsappDialog(false)} size="small">
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Contact our support team on WhatsApp for assistance:
//           </Typography>
          
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <Button
//               variant="outlined"
//               color="success"
//               startIcon={<WhatsAppIcon />}
//               onClick={() => openWhatsApp('919947073499')}
//               fullWidth
//             >
//               99470 73499
//             </Button>
            
//             <Button
//               variant="outlined"
//               color="success"
//               startIcon={<WhatsAppIcon />}
//               onClick={() => openWhatsApp('918547645640')}
//               fullWidth
//             >
//               85476 45640
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setWhatsappDialog(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Back Button */}
//       <Button
//         variant="outlined"
//         onClick={() => navigate('/')}
//         startIcon={<ArrowBackIcon />}
//         sx={{ mb: 3 }}
//         size="small"
//       >
//         Back to Registration
//       </Button>

//       {/* Header with Logos */}
//       <Card sx={{ mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
//         <CardContent sx={{ p: 2 }}>
//           <Box sx={{ 
//             display: 'flex', 
//             flexDirection: { xs: 'column', sm: 'row' }, 
//             alignItems: 'center', 
//             justifyContent: 'space-between',
//             gap: 2 
//           }}>
//             {/* Left: School Logo */}
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               flex: 1 
//             }}>
//               <Box
//                 component="img"
//                 src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946977/school-logo_uugskb.jpg"
//                 alt="School Logo"
//                 sx={{
//                   width: 80,
//                   height: 80,
//                   objectFit: 'contain',
//                   mb: 1
//                 }}
//               />
//               <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
//                 School Logo
//               </Typography>
//             </Box>

//             {/* Center: Title */}
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               flex: 2 
//             }}>
//               <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
//                 NMEA TENDER SCHOLAR 26
//               </Typography>
//               <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
//                 Exam Results Portal
//               </Typography>
//               <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                 PPMHSS Kottukkara, Kondotty, Malappuram
//               </Typography>
//             </Box>

//             {/* Right: 50th Anniversary Logo */}
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               flex: 1 
//             }}>
//               <Box
//                 component="img"
//                 src="https://res.cloudinary.com/dmjqgjcut/image/upload/v1769946976/50th_t44gva.jpg"
//                 alt="50th Anniversary Logo"
//                 sx={{
//                   width: 80,
//                   height: 80,
//                   objectFit: 'contain',
//                   mb: 1
//                 }}
//               />
//               <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
//                 50th Anniversary
//               </Typography>
//             </Box>
//           </Box>
//         </CardContent>
//       </Card>

//       {/* Main Content */}
//       <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider', mb: 3 }}>
//         <CardContent sx={{ p: 2 }}>
//           <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
//             <ScoreIcon /> Check Exam Results
//           </Typography>
          
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Enter your registration code or phone number to view your exam results
//           </Typography>

//           {/* Search Tabs */}
//           <Box sx={{ mb: 3 }}>
//             <Tabs
//               value={searchType}
//               onChange={handleTabChange}
//               sx={{ mb: 3 }}
//               variant="fullWidth"
//             >
//               <Tab
//                 label="By Registration Code"
//                 value="code"
//                 icon={<AssignmentIcon fontSize="small" />}
//                 iconPosition="start"
//                 sx={{ minHeight: 48 }}
//               />
//               <Tab
//                 label="By Phone Number"
//                 value="phone"
//                 icon={<PhoneIcon fontSize="small" />}
//                 iconPosition="start"
//                 sx={{ minHeight: 48 }}
//               />
//             </Tabs>

//             {searchType === "code" ? (
//               <TextField
//                 fullWidth
//                 label="Registration Code"
//                 value={registrationCode}
//                 onChange={(e) => setRegistrationCode(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter your registration code (e.g., PPM1001)"
//                 size="small"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <AssignmentIcon fontSize="small" />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             ) : (
//               <TextField
//                 fullWidth
//                 label="Phone Number"
//                 value={phoneNo}
//                 onChange={(e) => setPhoneNo(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter your 10-digit phone number"
//                 size="small"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <PhoneIcon fontSize="small" />
//                     </InputAdornment>
//                   ),
//                   inputProps: { maxLength: 10 },
//                 }}
//               />
//             )}

//             <Button
//               variant="contained"
//               fullWidth
//               onClick={handleSearch}
//               disabled={loading}
//               sx={{ mt: 2 }}
//               size="small"
//             >
//               {loading ? <CircularProgress size={20} /> : "Search Results"}
//             </Button>
//           </Box>

//           {error && (
//             <Alert severity="error" sx={{ mb: 3 }}>
//               {error}
//             </Alert>
//           )}

//           {/* Single Result Display */}
//           {result && (
//             <Box>
//               <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
//                 Result Details
//               </Typography>

//               {/* Student Info Card */}
//               <Card variant="outlined" sx={{ mb: 2 }}>
//                 <CardContent sx={{ p: 2 }}>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                         <PersonIcon fontSize="small" color="action" />
//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             Candidate Name
//                           </Typography>
//                           <Typography variant="body1" fontWeight={500}>
//                             {result.result.student?.name || result.student?.name || "N/A"}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </Grid>
                    
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                         <AssignmentIcon fontSize="small" color="action" />
//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             Registration Code
//                           </Typography>
//                           <Typography variant="body1" fontWeight={500} fontFamily="monospace">
//                             {result.result.registrationCode}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </CardContent>
//               </Card>

//               {/* Performance Metrics */}
//               <Grid container spacing={2} sx={{ mb: 3 }}>
//                 <Grid item xs={12} sm={4}>
//                   <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       Marks Obtained
//                     </Typography>
//                     <Typography variant="h5" color="primary" fontWeight={600}>
//                       {result.result.examMarks || 0}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       out of {result.result.totalMarks || 100}
//                     </Typography>
//                   </Card>
//                 </Grid>
                
//                 <Grid item xs={12} sm={4}>
//                   <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       Percentage
//                     </Typography>
//                     <Typography variant="h5" color="secondary" fontWeight={600}>
//                       {result.result.percentage?.toFixed(2) || 0}%
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       Score
//                     </Typography>
//                   </Card>
//                 </Grid>
                
//                 <Grid item xs={12} sm={4}>
//                   <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       Rank
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
//                       {getMedalIcon(result.result.rank)}
//                       <Typography variant="h5" fontWeight={600}>
//                         {result.result.rank || "N/A"}
//                       </Typography>
//                     </Box>
//                     <Typography variant="caption" color="text.secondary">
//                       Position
//                     </Typography>
//                   </Card>
//                 </Grid>
//               </Grid>

//               {/* Status and Eligibility */}
//               <Grid container spacing={2} sx={{ mb: 3 }}>
//                 <Grid item xs={12} md={6}>
//                   <Card variant="outlined" sx={{ p: 2 }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       Result Status
//                     </Typography>
//                     <Chip
//                       label={result.result.isQualified ? "QUALIFIED" : "NOT QUALIFIED"}
//                       color={getResultColor(result.result.isQualified)}
//                       icon={result.result.isQualified ? <CheckCircleIcon /> : <CancelIcon />}
//                       size="medium"
//                       sx={{ fontWeight: 600 }}
//                     />
//                   </Card>
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <Card variant="outlined" sx={{ p: 2 }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       Scholarship Status
//                     </Typography>
//                     <Chip
//                       label={getScholarshipText(result.result.scholarshipType)}
//                       color={getScholarshipColor(result.result.scholarshipType)}
//                       size="medium"
//                       sx={{ fontWeight: 600 }}
//                     />
//                   </Card>
//                 </Grid>
//               </Grid>

//               {/* Additional Information */}
//               <Card variant="outlined" sx={{ mb: 3 }}>
//                 <CardContent sx={{ p: 2 }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
//                     Additional Information
//                   </Typography>
                  
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                         <SchoolIcon fontSize="small" color="action" />
//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             School
//                           </Typography>
//                           <Typography variant="body2">
//                             {result.student?.schoolName || "N/A"}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </Grid>
                    
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                         <ClassIcon fontSize="small" color="action" />
//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             Class
//                           </Typography>
//                           <Typography variant="body2">
//                             Class {result.student?.studyingClass || "7"}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </Grid>
                    
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                         <TrainingIcon fontSize="small" color="action" />
//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             IAS Coaching Eligibility
//                           </Typography>
//                           <Chip
//                             label={result.result.iasCoaching ? "ELIGIBLE" : "NOT ELIGIBLE"}
//                             color={result.result.iasCoaching ? "success" : "default"}
//                             size="small"
//                           />
//                         </Box>
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </CardContent>
//               </Card>

//               {/* Note */}
//               <Alert severity="info">
//                 <Typography variant="body2">
//                   <strong>Note:</strong> Top 3 students receive scholarships. Top 100 students are eligible for IAS coaching.
//                 </Typography>
//               </Alert>
//             </Box>
//           )}

//           {/* Multiple Results Display */}
//           {multipleResults.length > 0 && (
//             <Box>
//               <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
//                 Multiple Registrations Found
//               </Typography>
              
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//                 {multipleResults.length} registration(s) found for this phone number
//               </Typography>

//               <TableContainer component={Paper} variant="outlined">
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: 'action.hover' }}>
//                       <TableCell><strong>Student</strong></TableCell>
//                       <TableCell><strong>Code</strong></TableCell>
//                       <TableCell align="right"><strong>Marks</strong></TableCell>
//                       <TableCell align="center"><strong>Rank</strong></TableCell>
//                       <TableCell align="center"><strong>Status</strong></TableCell>
//                       <TableCell align="center"><strong>Action</strong></TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {multipleResults.map((result, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                             <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
//                               {result.name.charAt(0)}
//                             </Avatar>
//                             <Box>
//                               <Typography variant="body2" fontWeight={500}>
//                                 {result.name}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 Class {result.class}
//                               </Typography>
//                             </Box>
//                           </Box>
//                         </TableCell>
//                         <TableCell>
//                           <Typography variant="body2" fontFamily="monospace">
//                             {result.registrationCode}
//                           </Typography>
//                         </TableCell>
//                         <TableCell align="right">
//                           <Typography variant="body2" fontWeight={500}>
//                             {result.marks}/{result.totalMarks}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {result.percentage}%
//                           </Typography>
//                         </TableCell>
//                         <TableCell align="center">
//                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
//                             {getMedalIcon(result.rank)}
//                             <Typography variant="body2">
//                               {result.rank}
//                             </Typography>
//                           </Box>
//                         </TableCell>
//                         <TableCell align="center">
//                           <Chip
//                             label={result.result}
//                             color={getResultColor(result.result)}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell align="center">
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             startIcon={<DownloadIcon />}
//                             onClick={() => {
//                               setSearchType("code");
//                               setRegistrationCode(result.registrationCode);
//                               handleSearch();
//                             }}
//                           >
//                             View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </Box>
//           )}
//         </CardContent>
//       </Card>

//       {/* Contact Information */}
//       <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
//         <CardContent sx={{ p: 2 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={4}>
//               <Box sx={{ textAlign: 'center' }}>
//                 <AccountBalanceIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
//                 <Typography variant="body2" fontWeight={500} gutterBottom>
//                   PPMHSS Kottukkara
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   Kottukkara, Kondotty
//                 </Typography>
//               </Box>
//             </Grid>
            
//             <Grid item xs={12} sm={4}>
//               <Box sx={{ textAlign: 'center' }}>
//                 <PhoneIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
//                 <Typography variant="body2" fontWeight={500} gutterBottom>
//                   Contact
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   +91 9947073499, +91 8547645640
//                 </Typography>
//               </Box>
//             </Grid>
            
//             <Grid item xs={12} sm={4}>
//               <Box sx={{ textAlign: 'center' }}>
//                 <EmailIcon sx={{ fontSize: 24, mb: 1, color: 'text.secondary' }} />
//                 <Typography variant="body2" fontWeight={500} gutterBottom>
//                   Email
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   ppmhss@gmail.com
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>
          
//           <Divider sx={{ my: 2 }} />
          
//           <Box sx={{ textAlign: 'center' }}>
//             <Typography variant="caption" color="text.secondary">
//               Developed by <strong>Muhammed Salih KM</strong> | 81570 24638
//             </Typography>
//             <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
//               © {new Date().getFullYear()} PPMHSS Kottukkara
//             </Typography>
//           </Box>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// };

const ResultLookup = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Results Page Coming Soon!
      </Typography>
      <Typography variant="body1" align="center">
        We are working hard to bring you the results page. Please check back later.
      </Typography>
    </Container>
  );
}

export default ResultLookup;