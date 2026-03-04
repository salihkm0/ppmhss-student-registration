import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const PendingSubmissions = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [roomStats, setRoomStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/invigilator/pending-submissions",
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setPendingStudents(response.data.data.students);
        setRoomStats(response.data.data.roomStats);
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      toast.error("Failed to load pending submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (studentId) => {
    setSubmitting(prev => ({ ...prev, [studentId]: true }));
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/students/${studentId}/submit`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success("Marks submitted successfully");
        // Remove from list
        setPendingStudents(prev => prev.filter(s => s._id !== studentId));
        
        // Update room stats
        const student = pendingStudents.find(s => s._id === studentId);
        if (student) {
          setRoomStats(prev => ({
            ...prev,
            [student.roomNo]: (prev[student.roomNo] || 1) - 1
          }));
        }
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast.error(error.response?.data?.error || "Failed to submit marks");
    } finally {
      setSubmitting(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleSubmitRoom = async (roomNo) => {
    const roomStudents = pendingStudents.filter(s => s.roomNo === roomNo);
    
    if (roomStudents.length === 0) return;

    setSubmitting(prev => ({ ...prev, [`room-${roomNo}`]: true }));
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/rooms/${roomNo}/submit-all`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Remove room students from list
        setPendingStudents(prev => prev.filter(s => s.roomNo !== roomNo));
        setRoomStats(prev => {
          const newStats = { ...prev };
          delete newStats[roomNo];
          return newStats;
        });
      }
    } catch (error) {
      console.error("Error submitting room:", error);
      toast.error(error.response?.data?.error || "Failed to submit room marks");
    } finally {
      setSubmitting(prev => ({ ...prev, [`room-${roomNo}`]: false }));
    }
  };

  const handleView = (studentId) => {
    navigate(`/invigilator/history/${studentId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (pendingStudents.length === 0) {
    return (
      <Alert severity="success">
        No pending submissions! All draft marks have been submitted.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Pending Submissions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Review and submit draft marks. Once submitted, marks cannot be edited by invigilators.
      </Typography>

      {/* Room Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(roomStats).map(([roomNo, count]) => (
          <Grid item xs={12} sm={6} md={4} key={roomNo}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Room {roomNo}
                  </Typography>
                  <Chip
                    label={`${count} pending`}
                    color="warning"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {count} student{count > 1 ? 's' : ''} ready for submission
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<SendIcon />}
                  onClick={() => handleSubmitRoom(parseInt(roomNo))}
                  disabled={submitting[`room-${roomNo}`]}
                  sx={{ mt: 2 }}
                >
                  {submitting[`room-${roomNo}`] ? 'Submitting...' : `Submit Room ${roomNo}`}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Room</TableCell>
              <TableCell>Seat</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Registration Code</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Last Edited</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingStudents.map((student) => (
              <TableRow key={student._id} hover>
                <TableCell>
                  <Chip label={student.roomNo} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={student.seatNo} size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2563eb' }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {student.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {student.registrationCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {student.examMarks}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {new Date(student.lastEditedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Submit">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleSubmit(student._id)}
                        disabled={submitting[student._id]}
                      >
                        {submitting[student._id] ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SendIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleView(student._id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingSubmissions;