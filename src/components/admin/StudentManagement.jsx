import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Room as RoomIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, classFilter, roomFilter, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(classFilter && { class: classFilter }),
        ...(roomFilter && { room: roomFilter }),
      };

      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/students",
        {
          headers: { "x-auth-token": token },
          params,
        }
      );

      if (response.data.success) {
        setStudents(response.data.data);
        setTotalStudents(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (studentId, studentName) => {
  if (!window.confirm(`Are you sure you want to soft delete ${studentName}? This will hide the student from regular views but keep the data for recovery.`)) {
    return;
  }

  const reason = prompt('Please enter a reason for deletion:');
  if (reason === null) return; // User cancelled

  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(
      `https://apinmea.oxiumev.com/api/admin/students/soft-delete/${studentId}`,
      {
        headers: { "x-auth-token": token },
        data: { reason }
      }
    );

    if (response.data.success) {
      toast.success('Student soft deleted successfully');
      fetchTopPerformers();
      fetchResultStats();
    }
  } catch (error) {
    console.error('Error soft deleting student:', error);
    toast.error(error.response?.data?.error || 'Failed to delete student');
  }
};

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/export",
        {
          headers: { "x-auth-token": token },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `students_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDownloadHallTicket = (registrationCode) => {
    window.open(
      `https://apinmea.oxiumev.com/api/students/${registrationCode}/hallticket/download`,
      "_blank"
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Student Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Data
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, registration code, phone, or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                label="Class"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                <MenuItem value="7">Class 7</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Room</InputLabel>
              <Select
                value={roomFilter}
                label="Room"
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <MenuItem value="">All Rooms</MenuItem>
                {[...Array(20).keys()].map(i => (
                  <MenuItem key={i} value={i + 1}>Room {i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Student</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Academic Info</TableCell>
              <TableCell>Registration</TableCell>
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
                        {student.fatherName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {student.phoneNo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aadhaar: {student.aadhaarNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`Class ${student.studyingClass}`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">{student.schoolName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Medium: {student.medium}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.registrationCode}
                    size="small"
                    sx={{ mb: 1, fontFamily: 'monospace' }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`Room ${student.roomNo}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Seat ${student.seatNo}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(student)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Hall Ticket">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadHallTicket(student.registrationCode)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleSoftDelete(student._id , student.name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalStudents}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Student Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md">
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={2}>
              {/* Add student details here */}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;