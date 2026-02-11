import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Room as RoomIcon,
  EventSeat as SeatIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const HallTicketPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentDetails();
  }, [code]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5010/api/students/${code}`
      );

      if (response.data.success) {
        setStudent(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setError("Student not found or invalid registration code");
      toast.error("Failed to load hall ticket");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.open(
      `http://localhost:5010/api/students/${code}/hallticket/download`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Hall Ticket...
        </Typography>
      </Container>
    );
  }

  if (error || !student) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Student not found"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/lookup')}
        >
          Back to Student Lookup
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Hall Ticket
          </Typography>
          <Typography variant="body1" color="text.secondary">
            NMEA TENDER SCHOLAR 26 - Examination Hall Ticket
          </Typography>
        </Box>

        {/* Student Information */}
        <Card sx={{ mb: 3, border: '2px solid #2563eb' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {student.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Son/Daughter of {student.fatherName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Registration Code
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {student.registrationCode}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RoomIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Exam Room
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="primary">
                      Room {student.roomNo}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SeatIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Seat Number
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="primary">
                      {student.seatNo}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Gender & Medium
                    </Typography>
                    <Typography variant="body1">
                      {student.gender} | {student.medium}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {student.phoneNo}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Exam Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Examination Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Exam Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  NMEA TENDER SCHOLAR 26
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Exam Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  01-03-2026
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Exam Time
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  10:00 AM - 11:30 AM
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Exam Center
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  PPMHSS Kottukkara, Kondotty
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Important Instructions */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            Important Instructions:
          </Typography>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Bring this hall ticket and original Aadhaar card</li>
            <li>Report to the exam center 30 minutes before exam time</li>
            <li>No electronic devices allowed in the exam hall</li>
            <li>Follow all COVID-19 safety protocols</li>
            <li>Hall ticket is mandatory for entry</li>
          </ul>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="large"
          >
            Print Hall Ticket
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="large"
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/lookup')}
            size="large"
          >
            Back to Search
          </Button>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="body2" color="text.secondary">
          For any queries, contact: +91 9947073499, +91 8547645640
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          © {new Date().getFullYear()} PPMHSS Kottukkara - All rights reserved
        </Typography>
      </Box>
    </Container>
  );
};

export default HallTicketPage;