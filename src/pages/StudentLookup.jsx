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
} from "@mui/material";
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Room as RoomIcon,
  EventSeat as SeatIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  AccountBalance as AccountBalanceIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const StudentLookup = () => {
  const [registrationCode, setRegistrationCode] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!registrationCode.trim()) {
      toast.error("Please enter a registration code");
      return;
    }

    setLoading(true);
    setError("");
    setStudent(null);

    try {
      const response = await axios.get(
        `https://apinmea.oxiumev.com/api/students/${registrationCode.trim().toUpperCase()}`,
      );

      if (response.data.success) {
        setStudent(response.data.data);
        toast.success("Registration found!");
      }
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid registration code";
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

  const getRoomStatusColor = (roomNo, seatNo) => {
    if (roomNo && seatNo) {
      return "success";
    }
    return "default";
  };

  const handlePreviewHallTicket = () => {
    window.open(
      `https://apinmea.oxiumev.com/api/students/${student.registrationCode}/hallticket/preview`,
      "_blank",
    );
  };

  const handleDownloadHallTicket = () => {
    window.open(
      `https://apinmea.oxiumev.com/api/students/${student.registrationCode}/hallticket/download`,
      "_blank",
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 3 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <AssignmentIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Check Registration Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your registration number to view your application details and download hall ticket
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Registration No."
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your registration no. (e.g., PPM1001)"
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "action.active" }} />
              ),
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
            {loading ? <CircularProgress size={24} /> : "Search Registration"}
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: "action.active" }} />
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: "action.active" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Registration No.
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {student.registrationCode}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Application Number
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {student.applicationNo}
                    </Typography>
                  </Box>
                </Grid> */}
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="success.main"
                    >
                      Registered
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <RoomIcon sx={{ mr: 1, color: "action.active" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Room No
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {student.roomNo || "Not assigned yet"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <SeatIcon sx={{ mr: 1, color: "action.active" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Seat No
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {student.seatNo || "Not assigned yet"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid> */}
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: "action.active" }} />
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">{student.phoneNo}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Medium
                    </Typography>
                    <Typography variant="body1">{student.medium}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Exam Center
                    </Typography>
                    <Typography variant="body1">PPMHSS Kottukkara</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Exam Date & Time
                    </Typography>
                    <Typography variant="body1">01-03-2026 10:00 AM</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(student.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mt: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<VisibilityIcon />}
                      onClick={handlePreviewHallTicket}
                      size="large"
                      sx={{ display: 'none' }}
                    >
                      Preview Hall Ticket
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadHallTicket}
                      size="large"
                    >
                      Download Hall Ticket
                    </Button>
                  </Box>
                </Grid>
                
                {/* <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> 
                      {student.roomNo && student.seatNo 
                        ? ` Please note your Room No (${student.roomNo}) and Seat No (${student.seatNo}). You must report to Room ${student.roomNo} at seat ${student.seatNo} for the examination.`
                        : " Room and seat numbers will be assigned soon. Please check back later for hall ticket details."
                      }
                    </Typography>
                  </Alert>
                </Grid> */}
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Don't have a registration number?{" "}
            <Button variant="text" size="small" href="/" color="primary">
              Register now
            </Button>
          </Typography>
        </Box>
      </Paper>

      {/* Footer with Contact Information */}
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

export default StudentLookup;