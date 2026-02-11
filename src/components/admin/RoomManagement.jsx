import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
} from "@mui/material";
import {
  Room as RoomIcon,
  People as PeopleIcon,
  PictureAsPdf as PdfIcon,
  Badge as BadgeIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const RoomManagement = ({ stats }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  const itemsPerPage = 12;

  // Fetch rooms from backend directly (not from stats)
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `http://localhost:5010/api/admin/rooms/stats`,
        {
          headers: { "x-auth-token": token },
        }
      );
      
      if (response.data.success) {
        const roomStats = response.data.data;
        // Filter out rooms with 0 students (including those with only deleted students)
        const activeRooms = roomStats.filter(room => room.studentCount > 0);
        setRooms(activeRooms);
        setFilteredRooms(activeRooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Search functionality
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredRooms(rooms);
      } else {
        const filtered = rooms.filter(room =>
          room.roomNo.toString().includes(searchTerm.toLowerCase())
        );
        setFilteredRooms(filtered);
      }
      setPage(1);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, rooms]);

  // Fetch room students - excluding deleted students
  const fetchRoomStudents = useCallback(async (roomNo) => {
    setDialogLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `http://localhost:5010/api/students/rooms/${roomNo}`,
        {
          headers: { "x-auth-token": token },
          params: { excludeDeleted: true } // Add this parameter
        }
      );

      if (response.data.success) {
        setRoomData(response.data.data);
        setSelectedRoom(roomNo);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching room students:", error);
      toast.error("Failed to load room students");
    } finally {
      setDialogLoading(false);
    }
  }, []);

  // Paginated rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, page]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Download functions
  const downloadPDF = (url) => {
    window.open(url, '_blank');
  };

  const handleDownloadAttendanceSheet = (roomNo) => {
    const token = localStorage.getItem('adminToken');
    const url = `http://localhost:5010/api/admin/room-attendance/${roomNo}/pdf?preview=false&print=true&token=${token}`;
    downloadPDF(url);
  };

  const handleDownloadExamSlips = (roomNo) => {
    const token = localStorage.getItem('adminToken');
    const url = `http://localhost:5010/api/admin/simple-exam-slips/${roomNo}?preview=false&print=true&token=${token}`;
    downloadPDF(url);
  };

  // Room Card Component
  const RoomCard = React.memo(({ room, onViewClick }) => {
    const filledPercentage = (room.studentCount / room.capacity) * 100;

    return (
      <Card sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Room {room.roomNo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: {room.capacity} seats
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
                {room.studentCount} / {room.capacity}
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

          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Available
                  </Typography>
                  <Typography variant="h6" color="#10b981" fontWeight={600}>
                    {room.availableSeats}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Occupied
                  </Typography>
                  <Typography variant="h6" color="#2563eb" fontWeight={600}>
                    {room.studentCount}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Gender distribution */}
            {room.genderCounts && room.genderCounts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Gender Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {room.genderCounts.map((gender) => (
                    <Chip
                      key={gender._id}
                      size="small"
                      label={`${gender._id}: ${gender.count}`}
                      sx={{
                        bgcolor: gender._id === 'Female' ? '#fce4ec' : '#e3f2fd',
                        color: gender._id === 'Female' ? '#c2185b' : '#1976d2',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onViewClick(room.roomNo)}
              fullWidth
              disabled={dialogLoading}
            >
              {dialogLoading && selectedRoom === room.roomNo ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null}
              View Students
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PdfIcon />}
              onClick={() => handleDownloadAttendanceSheet(room.roomNo)}
              fullWidth
            >
              Attendance Sheet
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BadgeIcon />}
              onClick={() => handleDownloadExamSlips(room.roomNo)}
              fullWidth
            >
              Exam Slip
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  });

  // Summary statistics
  const totalStudents = useMemo(() => 
    rooms.reduce((sum, room) => sum + room.studentCount, 0), 
    [rooms]
  );

  const totalCapacity = useMemo(() => 
    rooms.reduce((sum, room) => sum + room.capacity, 0), 
    [rooms]
  );

  const occupancyRate = useMemo(() => 
    totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0, 
    [totalStudents, totalCapacity]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading rooms...</Typography>
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
            {rooms.length} rooms • {totalStudents} active students • {occupancyRate}% occupancy
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search rooms by number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRooms.length} of {rooms.length} active rooms
              </Typography>
              <Button
                startIcon={<FilterIcon />}
                size="small"
                onClick={fetchRooms}
                variant="outlined"
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Room Cards Grid */}
      {paginatedRooms.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room.roomNo}>
                <RoomCard 
                  room={room} 
                  onViewClick={fetchRoomStudents}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No active rooms found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {rooms.length === 0 ? 'No rooms have active students' : 'Try a different search term'}
          </Typography>
        </Paper>
      )}

      {/* Room Students Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RoomIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Room {selectedRoom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {roomData?.studentCount || 0} active students • {roomData?.availableSeats || 0} seats available
                </Typography>
              </Box>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setDialogOpen(false)}
              sx={{ border: '1px solid #e0e0e0' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Gender Stats */}
          {roomData?.genderCounts && roomData.genderCounts.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              mt: 2,
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 1
            }}>
              {roomData.genderCounts.map((gender) => (
                <Box 
                  key={gender._id}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1 
                  }}
                >
                  {gender._id === 'Male' ? (
                    <MaleIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                  ) : (
                    <FemaleIcon sx={{ color: '#c2185b', fontSize: 20 }} />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {gender._id}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {gender.count}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Seat</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell><strong>Reg. Code</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomData?.students?.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Chip 
                        label={student.seatNo} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            fontSize: 14,
                            bgcolor: student.gender === 'Female' ? '#fce4ec' : '#e3f2fd'
                          }}
                        >
                          {student.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {student.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={student.gender === 'Female' ? <FemaleIcon /> : <MaleIcon />}
                        label={student.gender}
                        color={student.gender === 'Female' ? 'secondary' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {student.registrationCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Download Hall Ticket">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`http://localhost:5010/api/students/${student.registrationCode}/hallticket/download`, '_blank')}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDownloadAttendanceSheet(selectedRoom)}
            startIcon={<PdfIcon />}
          >
            Attendance Sheet
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleDownloadExamSlips(selectedRoom)}
            startIcon={<BadgeIcon />}
          >
            Exam Slips
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(RoomManagement);