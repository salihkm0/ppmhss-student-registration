import React, { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Room as RoomIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AssignedRooms = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!dashboardData?.assignedRooms) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading rooms...</Typography>
      </Box>
    );
  }

  const { assignedRooms } = dashboardData;

  const handleViewStudents = (room) => {
    setSelectedRoom(room);
    setDialogOpen(true);
  };

  const RoomCard = ({ room }) => {
    const progress = (room.marksEntered / room.totalStudents) * 100;

    return (
      <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Room {room.roomNo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {room.totalStudents} students
              </Typography>
            </Box>
            <Chip
              label={room.marksPending > 0 ? 'Pending' : 'Completed'}
              color={room.marksPending > 0 ? 'warning' : 'success'}
              size="small"
              icon={room.marksPending > 0 ? <WarningIcon /> : <CheckCircleIcon />}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Marks Progress
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {room.marksEntered}/{room.totalStudents}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progress === 100 ? '#10b981' : '#f59e0b',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Entered
                </Typography>
                <Typography variant="h6" color="#10b981" fontWeight={600}>
                  {room.marksEntered}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Pending
                </Typography>
                <Typography variant="h6" color="#ef4444" fontWeight={600}>
                  {room.marksPending}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PeopleIcon />}
              onClick={() => handleViewStudents(room)}
              fullWidth
            >
              View Students
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate(`/invigilator/marks?room=${room.roomNo}`)}
              fullWidth
            >
              Enter Marks
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Assigned Rooms
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage students and enter marks for your assigned rooms
      </Typography>

      {/* Room Cards */}
      <Grid container spacing={3}>
        {assignedRooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.roomNo}>
            <RoomCard room={room} />
          </Grid>
        ))}
      </Grid>

      {/* Room Students Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RoomIcon />
            <Typography variant="h6">Room {selectedRoom?.roomNo} - Students</Typography>
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
                  <TableCell>Marks</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRoom?.students?.map((student) => (
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
                      <Typography variant="body2" fontWeight={600}>
                        {student.examMarks || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {student.examMarks ? (
                        <Chip label="Entered" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
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
            onClick={() => {
              setDialogOpen(false);
              navigate(`/invigilator/marks?room=${selectedRoom?.roomNo}`);
            }}
          >
            Enter Marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignedRooms;