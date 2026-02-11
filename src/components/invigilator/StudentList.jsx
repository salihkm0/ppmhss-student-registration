import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Room as RoomIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const StudentList = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    // Get room from URL params
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setSelectedRoom(roomParam);
      setRoomFilter(roomParam);
    }
    fetchStudents();
  }, [dashboardData, searchParams]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('invigilatorToken');
      let url = "http://localhost:5010/api/invigilator/dashboard";

      const response = await axios.get(url, {
        headers: { "x-auth-token": token },
      });

      if (response.data.success) {
        const allStudents = response.data.dashboard.assignedRooms.flatMap(room => 
          room.students.map(student => ({ ...student, roomNo: room.roomNo }))
        );
        
        // Apply filters
        let filtered = allStudents;
        if (roomFilter) {
          filtered = filtered.filter(student => student.roomNo === parseInt(roomFilter));
        }
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(student => 
            student.name.toLowerCase().includes(searchLower) ||
            student.registrationCode.toLowerCase().includes(searchLower) ||
            student.phoneNo.includes(search)
          );
        }
        
        setStudents(filtered);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterMarks = (student) => {
    navigate(`/invigilator/marks?room=${student.roomNo}&student=${student._id}`);
  };

  const getMarksStatus = (marks) => {
    if (marks > 0) {
      return <Chip label={`${marks}/100`} color="success" size="small" />;
    }
    return <Chip label="Pending" color="warning" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading students...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Students List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage students in your assigned rooms
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AssignmentIcon />}
          onClick={() => navigate('/invigilator/marks')}
        >
          Enter Marks
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, registration code, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Room</InputLabel>
              <Select
                value={roomFilter}
                label="Filter by Room"
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <MenuItem value="">All Rooms</MenuItem>
                {dashboardData?.assignedRooms?.map(room => (
                  <MenuItem key={room.roomNo} value={room.roomNo}>
                    Room {room.roomNo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={fetchStudents}
              startIcon={<FilterIcon />}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Student</TableCell>
              <TableCell>Room & Seat</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Academic Info</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2563eb' }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.registrationCode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`Room ${student.roomNo}`}
                      size="small"
                      icon={<RoomIcon />}
                    />
                    <Chip
                      label={`Seat ${student.seatNo}`}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{student.phoneNo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aadhaar: {student.aadhaarNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{student.schoolName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Class {student.studyingClass} • {student.medium}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getMarksStatus(student.examMarks)}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AssignmentIcon />}
                    onClick={() => handleEnterMarks(student)}
                  >
                    Enter Marks
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {students.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {roomFilter ? `No students in Room ${roomFilter}` : 'Try changing your search filters'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StudentList;