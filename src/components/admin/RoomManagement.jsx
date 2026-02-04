import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";
import {
  Room as RoomIcon,
  People as PeopleIcon,
  PictureAsPdf as PdfIcon,
  Badge as BadgeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const RoomManagement = ({ stats }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomStudents, setRoomStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (stats?.stats?.rooms) {
      setRooms(stats.stats.rooms);
      setLoading(false);
    }
  }, [stats]);

  const fetchRoomStudents = async (roomNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `https://apinmea.oxiumev.com/api/students/rooms/${roomNo}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setRoomStudents(response.data.data.students);
        setSelectedRoom(roomNo);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching room students:", error);
      toast.error("Failed to load room students");
    }
  };

  // Simple download function similar to hall ticket download
  const downloadPDF = (url) => {
    window.open(url, '_blank');
  };

  // Get token and pass it in URL (if backend supports query token)
  const getPDFUrl = (baseUrl) => {
    const token = localStorage.getItem('adminToken');
    return `${baseUrl}?token=${token}`;
  };

  const handleDownloadAttendanceSheet = (roomNo) => {
    const token = localStorage.getItem('adminToken');
    // Method 1: Direct URL with token in query params
    const url = `https://apinmea.oxiumev.com/api/admin/room-attendance/${roomNo}/pdf?preview=false&print=true&token=${token}`;
    downloadPDF(url);
    
    // Alternative: Create a form with token
    // createFormAndSubmit(roomNo, 'attendance');
  };

  const handleDownloadExamSlips = (roomNo) => {
    const token = localStorage.getItem('adminToken');
    const url = `https://apinmea.oxiumev.com/api/admin/simple-exam-slips/${roomNo}?preview=false&print=true&token=${token}`;
    downloadPDF(url);
  };

  const handleDownloadAllExamSlips = () => {
    const token = localStorage.getItem('adminToken');
    const url = `https://apinmea.oxiumev.com/api/admin/simple-exam-slips?all=true&preview=false&print=true&token=${token}`;
    downloadPDF(url);
  };

  // Alternative method using form submission
  const createFormAndSubmit = (roomNo, type) => {
    const token = localStorage.getItem('adminToken');
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = type === 'attendance' 
      ? `https://apinmea.oxiumev.com/api/admin/room-attendance/${roomNo}/pdf`
      : `https://apinmea.oxiumev.com/api/admin/simple-exam-slips/${roomNo}`;
    form.target = '_blank';
    form.style.display = 'none';
    
    // Add query parameters
    const previewInput = document.createElement('input');
    previewInput.type = 'hidden';
    previewInput.name = 'preview';
    previewInput.value = 'false';
    form.appendChild(previewInput);
    
    const printInput = document.createElement('input');
    printInput.type = 'hidden';
    printInput.name = 'print';
    printInput.value = 'true';
    form.appendChild(printInput);
    
    // Add token
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'token';
    tokenInput.value = token;
    form.appendChild(tokenInput);
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const RoomCard = ({ room }) => {
    const filledPercentage = (room.count / 20) * 100;

    return (
      <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Room {room._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: 20 seats
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#2563eb15', color: '#2563eb' }}>
              <RoomIcon />
            </Avatar>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Occupancy
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {room.count} / 20
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={filledPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: filledPercentage >= 90 ? '#ef4444' : filledPercentage >= 75 ? '#f59e0b' : '#10b981',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Available
                </Typography>
                <Typography variant="h6" color="#10b981" fontWeight={600}>
                  {20 - room.count}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Occupied
                </Typography>
                <Typography variant="h6" color="#2563eb" fontWeight={600}>
                  {room.count}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => fetchRoomStudents(room._id)}
              fullWidth
            >
              View Students
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PdfIcon />}
              onClick={() => handleDownloadAttendanceSheet(room._id)}
              fullWidth
            >
              Attendance Sheet
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BadgeIcon />}
              onClick={() => handleDownloadExamSlips(room._id)}
              fullWidth
            >
              Exam Slip
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading rooms...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Room Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage room allocations and generate reports
          </Typography>
        </Box>
        {/* <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handleDownloadAllExamSlips}
        >
          Print All Exam Slips
        </Button> */}
      </Box>

      {/* Room Cards */}
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
            <RoomCard room={room} />
          </Grid>
        ))}
      </Grid>

      {/* Room Students Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RoomIcon />
            <Typography variant="h6">Room {selectedRoom} - Students List</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Seat No</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Registration Code</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomStudents.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Chip label={student.seatNo} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{student.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {student.registrationCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.phoneNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Download Hall Ticket">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`https://apinmea.oxiumev.com/api/students/${student.registrationCode}/hallticket/download`, '_blank')}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleDownloadAttendanceSheet(selectedRoom)}
          >
            Print Attendance Sheet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomManagement;