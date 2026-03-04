import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  CircularProgress,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Room as RoomIcon,
  EventSeat as SeatIcon,
  AutoFixHigh as AutoSaveIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  PersonOff as AbsentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EnterMarks = ({ dashboardData, onDataUpdate }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkMarks, setBulkMarks] = useState("");
  const [autoSave, setAutoSave] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitAllDialogOpen, setSubmitAllDialogOpen] = useState(false);
  const [submitMode, setSubmitMode] = useState('single');
  const [selectedStudentForSubmit, setSelectedStudentForSubmit] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [absentDialogOpen, setAbsentDialogOpen] = useState(false);
  const [selectedStudentForAbsent, setSelectedStudentForAbsent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudentForMenu, setSelectedStudentForMenu] = useState(null);

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudentForMenu(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudentForMenu(null);
  };

  // Initialize data
  useEffect(() => {
    if (dashboardData?.assignedRooms && !isInitialized) {
      setRooms(dashboardData.assignedRooms);
      if (dashboardData.assignedRooms.length > 0) {
        // Only set first room if no room is selected
        if (!selectedRoom) {
          const firstRoom = dashboardData.assignedRooms[0];
          setSelectedRoom(firstRoom.roomNo);
          initializeRoomData(firstRoom);
        }
        setIsInitialized(true);
      }
    }
  }, [dashboardData]);

  // When selectedRoom changes, find and load that room's data
  useEffect(() => {
    if (selectedRoom && rooms.length > 0) {
      const room = rooms.find(r => r.roomNo === selectedRoom);
      if (room) {
        initializeRoomData(room);
      }
    }
  }, [selectedRoom, rooms]);

  // Initialize room data
  const initializeRoomData = (room) => {
    if (!room) return;
    
    setStudents(room.students || []);
    
    // Initialize marks object with student IDs
    const initialMarks = {};
    (room.students || []).forEach(student => {
      initialMarks[student._id] = student.examMarks || '';
    });
    setMarks(initialMarks);
  };

  // Handle room selection
  const handleRoomSelect = (roomNo) => {
    setSelectedRoom(roomNo);
  };

  // Handle mark input change
  const handleMarkChange = (studentId, value) => {
    const numValue = parseInt(value);
    if ((!isNaN(numValue) && numValue >= 0 && numValue <= 100) || value === '') {
      const newMarks = { ...marks, [studentId]: value };
      setMarks(newMarks);
      
      // Auto-save if enabled
      if (autoSave && value !== '' && !isNaN(numValue)) {
        handleSaveSingleMark(studentId, value);
      }
    }
  };

  // Mark student as absent (score 0)
  const handleMarkAbsent = async () => {
    if (!selectedStudentForAbsent) return;

    const studentId = selectedStudentForAbsent._id;
    const mark = 0;

    setSavingStudentId(studentId);
    setAbsentDialogOpen(false);
    
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/students/${studentId}/marks`,
        { marks: mark },
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedStudents = students.map(student => 
          student._id === studentId 
            ? { 
                ...student, 
                examMarks: mark, 
                resultStatus: 'Failed',
                markEntryStatus: 'draft'
              }
            : student
        );
        setStudents(updatedStudents);
        
        // Update room data
        const updatedRooms = rooms.map(room => {
          if (room.roomNo === selectedRoom) {
            const updatedRoomStudents = (room.students || []).map(student => 
              student._id === studentId 
                ? { 
                    ...student, 
                    examMarks: mark, 
                    resultStatus: 'Failed',
                    markEntryStatus: 'draft'
                  }
                : student
            );
            return {
              ...room,
              students: updatedRoomStudents,
              marksEntered: updatedRoomStudents.filter(s => s.examMarks > 0).length,
              marksDraft: updatedRoomStudents.filter(s => s.markEntryStatus === 'draft').length,
              marksSubmitted: updatedRoomStudents.filter(s => s.markEntryStatus === 'submitted').length,
              marksFinal: updatedRoomStudents.filter(s => s.markEntryStatus === 'final').length,
              marksPending: updatedRoomStudents.filter(s => !s.examMarks).length
            };
          }
          return room;
        });
        setRooms(updatedRooms);
        
        // Update marks object
        setMarks(prev => ({ ...prev, [studentId]: mark }));
        
        if (onDataUpdate) {
          onDataUpdate();
        }
        
        toast.success(`${selectedStudentForAbsent.name} marked as absent`);
        handleMenuClose();
        setSelectedStudentForAbsent(null);
      }
    } catch (error) {
      console.error("Error marking absent:", error);
      toast.error(error.response?.data?.error || "Failed to mark absent");
    } finally {
      setSavingStudentId(null);
    }
  };

  // Save single mark
  const handleSaveSingleMark = async (studentId, markValue) => {
    if (markValue === '' || markValue === undefined || markValue === null) {
      return;
    }

    const student = students.find(s => s._id === studentId);
    
    // Check if student marks are already submitted or finalized
    if (student?.markEntryStatus === 'submitted' || student?.markEntryStatus === 'final') {
      toast.error("Marks are already submitted/finalized and cannot be edited");
      return;
    }

    const mark = parseInt(markValue);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      toast.error("Please enter valid marks between 0-100");
      return;
    }

    setSavingStudentId(studentId);
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/students/${studentId}/marks`,
        { marks: mark },
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        // Update local state immediately
        const updatedStudents = students.map(student => 
          student._id === studentId 
            ? { 
                ...student, 
                examMarks: mark, 
                resultStatus: mark >= 40 ? 'Passed' : 'Failed',
                markEntryStatus: 'draft'
              }
            : student
        );
        setStudents(updatedStudents);
        
        // Update room data in rooms array
        const updatedRooms = rooms.map(room => {
          if (room.roomNo === selectedRoom) {
            const updatedRoomStudents = (room.students || []).map(student => 
              student._id === studentId 
                ? { 
                    ...student, 
                    examMarks: mark, 
                    resultStatus: mark >= 40 ? 'Passed' : 'Failed',
                    markEntryStatus: 'draft'
                  }
                : student
            );
            return {
              ...room,
              students: updatedRoomStudents,
              marksEntered: updatedRoomStudents.filter(s => s.examMarks > 0).length,
              marksDraft: updatedRoomStudents.filter(s => s.markEntryStatus === 'draft').length,
              marksSubmitted: updatedRoomStudents.filter(s => s.markEntryStatus === 'submitted').length,
              marksFinal: updatedRoomStudents.filter(s => s.markEntryStatus === 'final').length,
              marksPending: updatedRoomStudents.filter(s => !s.examMarks).length
            };
          }
          return room;
        });
        setRooms(updatedRooms);
        
        // Update marks object
        setMarks(prev => ({ ...prev, [studentId]: mark }));
        
        // Update dashboard data if callback provided
        if (onDataUpdate) {
          onDataUpdate();
        }
        
        // Show success message (only if not auto-saving)
        if (!autoSave) {
          toast.success("Marks saved as draft");
        }
      }
    } catch (error) {
      console.error("Error saving mark:", error);
      toast.error(error.response?.data?.error || "Failed to save marks");
    } finally {
      setSavingStudentId(null);
    }
  };

  // Submit single mark
  const handleSubmitSingleMark = async () => {
    if (!selectedStudentForSubmit) return;
    
    const studentId = selectedStudentForSubmit._id;
    const student = students.find(s => s._id === studentId);
    
    if (!student.examMarks && student.examMarks !== 0) {
      toast.error("Please enter marks before submitting");
      setSubmitDialogOpen(false);
      return;
    }

    setSubmitting(true);
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
        // Update local state
        const updatedStudents = students.map(student => 
          student._id === studentId 
            ? { ...student, markEntryStatus: 'submitted', submittedAt: new Date() }
            : student
        );
        setStudents(updatedStudents);
        
        // Update room data
        const updatedRooms = rooms.map(room => {
          if (room.roomNo === selectedRoom) {
            const updatedRoomStudents = room.students.map(student => 
              student._id === studentId 
                ? { ...student, markEntryStatus: 'submitted', submittedAt: new Date() }
                : student
            );
            return {
              ...room,
              students: updatedRoomStudents,
              marksDraft: updatedRoomStudents.filter(s => s.markEntryStatus === 'draft').length,
              marksSubmitted: updatedRoomStudents.filter(s => s.markEntryStatus === 'submitted').length,
            };
          }
          return room;
        });
        setRooms(updatedRooms);
        
        if (onDataUpdate) {
          onDataUpdate();
        }
        
        toast.success("Marks submitted successfully");
        setSubmitDialogOpen(false);
        setSelectedStudentForSubmit(null);
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast.error(error.response?.data?.error || "Failed to submit marks");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit all marks for current room
  const handleSubmitAllMarks = async () => {
    const draftStudents = students.filter(s => s.markEntryStatus === 'draft');
    
    if (draftStudents.length === 0) {
      toast.info("No draft marks to submit in this room");
      setSubmitAllDialogOpen(false);
      return;
    }

    // Check if all students have marks entered (including 0 for absent)
    const studentsWithNoMarks = students.filter(s => !s.examMarks && s.examMarks !== 0);
    if (studentsWithNoMarks.length > 0) {
      toast.error(`Cannot submit: ${studentsWithNoMarks.length} students have no marks entered`);
      setSubmitAllDialogOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/rooms/${selectedRoom}/submit-all`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        // Refresh room data but maintain selected room
        await refreshRoomData();
        
        if (onDataUpdate) {
          onDataUpdate();
        }
        
        toast.success(response.data.message);
        setSubmitAllDialogOpen(false);
      }
    } catch (error) {
      console.error("Error submitting room marks:", error);
      toast.error(error.response?.data?.error || "Failed to submit room marks");
    } finally {
      setSubmitting(false);
    }
  };

  // Save all marks
  const handleSaveAllMarks = async () => {
    const marksToSave = Object.entries(marks)
      .filter(([studentId, mark]) => {
        const student = students.find(s => s._id === studentId);
        return mark !== '' && mark !== undefined && mark !== null && 
               parseInt(mark) !== student?.examMarks &&
               student?.markEntryStatus !== 'submitted' &&
               student?.markEntryStatus !== 'final';
      })
      .map(([studentId, mark]) => ({ 
        studentId, 
        marks: parseInt(mark) 
      }));

    if (marksToSave.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('invigilatorToken');
      
      // Save marks in parallel
      const savePromises = marksToSave.map(async ({ studentId, marks: markValue }) => {
        try {
          const response = await axios.post(
            `https://apinmea.oxiumev.com/api/invigilator/students/${studentId}/marks`,
            { marks: markValue },
            {
              headers: { "x-auth-token": token },
            }
          );
          return { studentId, success: true, data: response.data };
        } catch (error) {
          return { studentId, success: false, error };
        }
      });

      const results = await Promise.all(savePromises);
      const successfulSaves = results.filter(r => r.success);
      const failedSaves = results.filter(r => !r.success);

      if (successfulSaves.length > 0) {
        // Refresh room data but maintain selected room
        await refreshRoomData();
        
        if (onDataUpdate) {
          onDataUpdate();
        }

        toast.success(`Saved ${successfulSaves.length} marks${failedSaves.length > 0 ? `, ${failedSaves.length} failed` : ''}`);
      }

      if (failedSaves.length > 0) {
        console.error("Failed saves:", failedSaves);
      }

    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  // Bulk save marks
  const handleBulkSave = async () => {
    const lines = bulkMarks.split('\n').filter(line => line.trim());
    const marksData = [];

    for (const line of lines) {
      const [registrationCode, markStr] = line.split(',').map(item => item.trim());
      const mark = parseInt(markStr);
      
      if (registrationCode && !isNaN(mark) && mark >= 0 && mark <= 100) {
        marksData.push({ registrationCode, marks: mark });
      }
    }

    if (marksData.length === 0) {
      toast.error("No valid marks found in bulk data");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('invigilatorToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/invigilator/rooms/${selectedRoom}/bulk-marks`,
        { marksData },
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success(`Saved ${response.data.data.successful} marks. ${response.data.data.failed} failed.`);
        setBulkDialogOpen(false);
        setBulkMarks("");
        
        // Refresh data but maintain selected room
        await refreshRoomData();
      }
    } catch (error) {
      console.error("Error saving bulk marks:", error);
      toast.error("Failed to save bulk marks");
    } finally {
      setSaving(false);
    }
  };

  // Refresh room data
  const refreshRoomData = async () => {
    try {
      const token = localStorage.getItem('invigilatorToken');
      const dashboardResponse = await axios.get(
        "https://apinmea.oxiumev.com/api/invigilator/dashboard",
        {
          headers: { "x-auth-token": token },
        }
      );

      if (dashboardResponse.data.success) {
        const updatedRooms = dashboardResponse.data.dashboard.assignedRooms;
        setRooms(updatedRooms);
        
        // Find the currently selected room in the updated data
        const updatedRoom = updatedRooms.find(r => r.roomNo === selectedRoom);
        if (updatedRoom) {
          // If the selected room still exists, update its data
          setStudents(updatedRoom.students || []);
          
          // Update marks object
          const updatedMarks = {};
          (updatedRoom.students || []).forEach(student => {
            updatedMarks[student._id] = student.examMarks || '';
          });
          setMarks(updatedMarks);
        } else if (updatedRooms.length > 0) {
          // If selected room no longer exists, select the first room
          const firstRoom = updatedRooms[0];
          setSelectedRoom(firstRoom.roomNo);
          // Data will be loaded by the useEffect
        }
        
        // Update dashboard data if callback provided
        if (onDataUpdate) {
          onDataUpdate();
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await refreshRoomData();
    setLoading(false);
    toast.success("Data refreshed");
  };

  // View mark history
  const handleViewHistory = (studentId) => {
    navigate(`/invigilator/history/${studentId}`);
  };

  // Open submit dialog for single student
  const handleOpenSubmitDialog = (student) => {
    setSelectedStudentForSubmit(student);
    setSubmitDialogOpen(true);
    handleMenuClose();
  };

  // Open absent dialog
  const handleOpenAbsentDialog = (student) => {
    setSelectedStudentForAbsent(student);
    setAbsentDialogOpen(true);
    handleMenuClose();
  };

  // Calculate progress
  const calculateProgress = () => {
    const totalStudents = students.length;
    const enteredMarks = Object.values(marks).filter(mark => 
      mark !== '' && mark !== undefined && mark !== null
    ).length;
    return totalStudents > 0 ? (enteredMarks / totalStudents) * 100 : 0;
  };

  // Check if student is editable
  const isStudentEditable = (student) => {
    return student.markEntryStatus !== 'submitted' && student.markEntryStatus !== 'final';
  };

  if (rooms.length === 0) {
    return (
      <Alert severity="info">
        No rooms assigned to you. Please contact the admin to get room assignments.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Enter Marks
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter exam marks for students in your assigned rooms. Use 0 for absent students.
      </Typography>

      {/* Room Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Select Room
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {rooms.map((room) => (
            <Chip
              key={room.roomNo}
              label={`Room ${room.roomNo} (D:${room.marksDraft || 0} S:${room.marksSubmitted || 0} F:${room.marksFinal || 0} P:${room.marksPending})`}
              color={selectedRoom === room.roomNo ? "primary" : "default"}
              onClick={() => handleRoomSelect(room.roomNo)}
              icon={
                room.marksDraft > 0 ? <WarningIcon /> : 
                room.marksSubmitted === room.totalStudents ? <CheckCircleIcon /> : 
                room.marksFinal === room.totalStudents ? <LockIcon /> :
                <AssignmentIcon />
              }
            />
          ))}
        </Box>
      </Paper>

      {/* Progress and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Marks Entry Progress for Room {selectedRoom}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Object.values(marks).filter(mark => mark !== '' && mark !== undefined && mark !== null).length} / {students.length} marks entered
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SendIcon />}
                onClick={() => setSubmitAllDialogOpen(true)}
                disabled={submitting || !students.some(s => s.markEntryStatus === 'draft')}
                size="small"
              >
                Submit All
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Marks Entry Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Seat No</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Registration Code</TableCell>
              <TableCell>Current Marks</TableCell>
              <TableCell>Enter Marks (0-100)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const editable = isStudentEditable(student);
              
              return (
                <TableRow 
                  key={student._id} 
                  hover
                  sx={{
                    bgcolor: student.markEntryStatus === 'final' ? '#f5f5f5' : 'inherit',
                    opacity: student.markEntryStatus === 'final' ? 0.8 : 1
                  }}
                >
                  <TableCell>
                    <Chip label={student.seatNo} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#2563eb' }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.studyingClass}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {student.registrationCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {student.examMarks === 0 ? '0 (Absent)' : student.examMarks || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={marks[student._id] || ''}
                          onChange={(e) => handleMarkChange(student._id, e.target.value)}
                          onBlur={(e) => {
                            if (!autoSave && e.target.value && parseInt(e.target.value) !== student.examMarks) {
                              handleSaveSingleMark(student._id, e.target.value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !autoSave) {
                              if (e.target.value && parseInt(e.target.value) !== student.examMarks) {
                                handleSaveSingleMark(student._id, e.target.value);
                              }
                            }
                          }}
                          inputProps={{ 
                            min: 0, 
                            max: 100,
                            style: { textAlign: 'center' },
                            placeholder: "0-100"
                          }}
                          sx={{ width: 90 }}
                          disabled={savingStudentId === student._id}
                        />
                        {savingStudentId === student._id && (
                          <CircularProgress size={16} />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {student.markEntryStatus === 'final' ? 'Finalized - Not Editable' : 'Submitted - Not Editable'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.markEntryStatus === 'final' ? (
                      <Chip 
                        label="Final" 
                        color="secondary" 
                        size="small" 
                        icon={<LockIcon />}
                      />
                    ) : student.markEntryStatus === 'submitted' ? (
                      <Chip 
                        label="Submitted" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                      />
                    ) : student.markEntryStatus === 'draft' ? (
                      <Chip 
                        label="Draft" 
                        color="info" 
                        size="small" 
                        icon={<SaveIcon />}
                      />
                    ) : student.examMarks === 0 ? (
                      <Chip 
                        label="Absent" 
                        color="error" 
                        size="small" 
                        icon={<AbsentIcon />}
                      />
                    ) : student.examMarks ? (
                      <Chip label="Previously Entered" color="default" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {editable && (
                        <>
                          <Tooltip title="Save">
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (marks[student._id] && parseInt(marks[student._id]) !== student.examMarks) {
                                  handleSaveSingleMark(student._id, marks[student._id]);
                                }
                              }}
                              disabled={
                                !marks[student._id] || 
                                parseInt(marks[student._id]) === student.examMarks ||
                                savingStudentId === student._id
                              }
                              color="primary"
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Options">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, student)}
                              color="default"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="View History">
                        <IconButton
                          size="small"
                          onClick={() => handleViewHistory(student._id)}
                          color="info"
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Student Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => handleOpenSubmitDialog(selectedStudentForMenu)}
          disabled={!selectedStudentForMenu?.examMarks && selectedStudentForMenu?.examMarks !== 0}
        >
          <SendIcon fontSize="small" sx={{ mr: 1 }} />
          Submit Marks
        </MenuItem>
        <MenuItem 
          onClick={() => handleOpenAbsentDialog(selectedStudentForMenu)}
          disabled={selectedStudentForMenu?.examMarks === 0}
        >
          <AbsentIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Absent (0)
        </MenuItem>
      </Menu>

      {/* Mark Absent Dialog */}
      <Dialog open={absentDialogOpen} onClose={() => setAbsentDialogOpen(false)}>
        <DialogTitle>Mark as Absent</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to mark {selectedStudentForAbsent?.name} as absent?
          </Alert>
          <Typography variant="body2" gutterBottom>
            Registration: {selectedStudentForAbsent?.registrationCode}
          </Typography>
          <Typography variant="body2" gutterBottom>
            This will set their marks to 0 and mark them as failed.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can still edit these marks later if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbsentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleMarkAbsent}
            disabled={savingStudentId === selectedStudentForAbsent?._id}
          >
            {savingStudentId === selectedStudentForAbsent?._id ? 'Processing...' : 'Mark Absent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Single Student Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Marks</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Are you sure you want to submit marks for {selectedStudentForSubmit?.name}?
          </Alert>
          <Typography variant="body2" gutterBottom>
            Registration: {selectedStudentForSubmit?.registrationCode}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Marks: {selectedStudentForSubmit?.examMarks === 0 ? '0 (Absent)' : selectedStudentForSubmit?.examMarks}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Once submitted, you cannot edit these marks. Admin can still make changes before rank generation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitSingleMark}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit All Dialog */}
      <Dialog open={submitAllDialogOpen} onClose={() => setSubmitAllDialogOpen(false)}>
        <DialogTitle>Submit All Marks</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Are you sure you want to submit all marks for Room {selectedRoom}?
          </Alert>
          <Typography variant="body2" gutterBottom>
            This will:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Submit {students.filter(s => s.markEntryStatus === 'draft').length} draft marks</li>
            <li>Make marks non-editable by you</li>
            <li>Allow admin to review before rank generation</li>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Once submitted, you cannot edit these marks. Admin can still make changes before rank generation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitAllDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitAllMarks}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit All'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Entry Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Marks Entry</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter marks in CSV format: RegistrationCode,Marks (one per line)
            <br />
            Use 0 for absent students.
            <br />
            Example:<br />
            PPM1001,85<br />
            PPM1002,0<br />
            PPM1003,78
          </Alert>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={bulkMarks}
            onChange={(e) => setBulkMarks(e.target.value)}
            placeholder="PPM1001,85&#10;PPM1002,0&#10;PPM1003,78"
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkSave}
            disabled={saving || !bulkMarks.trim()}
          >
            {saving ? 'Saving...' : 'Save Bulk Marks'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnterMarks;