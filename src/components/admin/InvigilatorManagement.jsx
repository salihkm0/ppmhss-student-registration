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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  CardHeader,
  Tabs,
  Tab,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Zoom,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel as RadioFormControlLabel,
  Autocomplete,
  Badge,
  Stack,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  Phone as PhoneIcon,
  AssignmentInd as InvigilatorIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  Restore as RestoreIcon,
  DeleteSweep as DeleteSweepIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  GroupAdd as GroupAddIcon,
  MeetingRoom as MeetingRoomIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = "https://apinmea.oxiumev.com/api";

const InvigilatorManagement = () => {
  const navigate = useNavigate();
  const [invigilators, setInvigilators] = useState([]);
  const [duties, setDuties] = useState([]);
  const [deletedInvigilators, setDeletedInvigilators] = useState([]);
  const [roomStatus, setRoomStatus] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    deleted: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('en-IN').split('/').reverse().join('-')
  );
  const [selectedRoomViewDate, setSelectedRoomViewDate] = useState(
    new Date().toLocaleDateString('en-IN').split('/').reverse().join('-')
  );
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [singleDutyDialogOpen, setSingleDutyDialogOpen] = useState(false);
  const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bulkDutyDialogOpen, setBulkDutyDialogOpen] = useState(false);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [roomStatusDialogOpen, setRoomStatusDialogOpen] = useState(false);
  
  const [selectedInvigilator, setSelectedInvigilator] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    shortName: '',
    name: '',
    mobileNo: '',
    isActive: true
  });
  
  const [bulkData, setBulkData] = useState('');
  
  // Single Duty Assignment Form
  const [singleDutyForm, setSingleDutyForm] = useState({
    invigilatorId: '',
    examDate: new Date().toISOString().split('T')[0],
    dutyFrom: '09:00',
    dutyTo: '13:00',
    roomNo: '',
    shortName: ''
  });

  // Edit Duty Form
  const [editDutyForm, setEditDutyForm] = useState({
    dutyId: '',
    invigilatorId: '',
    invigilatorName: '',
    examDate: '',
    dutyFrom: '',
    dutyTo: '',
    roomNo: ''
  });

  // Bulk Duty Assignment Form
  const [bulkDutyForm, setBulkDutyForm] = useState({
    examDate: new Date().toISOString().split('T')[0],
    dutyFrom: '09:00',
    dutyTo: '13:00',
    selectedInvigilators: [],
    rooms: {},
    assignmentType: 'same'
  });

  // Bulk Duty Assignment Steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Date & Time', 'Select Invigilators', 'Assign Rooms', 'Review & Confirm'];

  // Room assignment form
  const [roomForm, setRoomForm] = useState({
    invigilatorId: '',
    shortName: '',
    roomNo: '',
    dutyFrom: '09:00',
    dutyTo: '13:00',
    examDate: new Date().toISOString().split('T')[0]
  });

  // Get token with proper error handling
  const getToken = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      setAuthError(true);
      toast.error('Please login again');
      navigate('/admin/login');
      return null;
    }
    return token;
  };

  // Create axios instance with auth header
  const apiClient = axios.create({
    baseURL: API_URL,
  });

  // Add request interceptor to add token
  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers['x-auth-token'] = token;
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for auth errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.data?.error === 'No token, authorization denied') {
        setAuthError(true);
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchInvigilators();
      fetchStats();
      fetchRoomStatus();
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDutiesByDate();
      fetchAvailableRoomsForDate();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedRoomViewDate) {
      fetchAvailableRoomsForDate();
    }
  }, [selectedRoomViewDate]);

  const fetchInvigilators = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exam-invigilator');
      if (response.data.success) {
        setInvigilators(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching invigilators:", error);
      if (!authError) {
        toast.error("Failed to load invigilators");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/exam-invigilator/stats/summary');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRoomStatus = async () => {
    try {
      const response = await apiClient.get('/rooms/status');
      if (response.data.success) {
        setRoomStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching room status:", error);
    }
  };

  const fetchAvailableRoomsForDate = async () => {
    try {
      setRoomsLoading(true);
      const response = await apiClient.get(`/rooms/available-for-duty?date=${selectedRoomViewDate}`);
      if (response.data.success) {
        setAvailableRooms(response.data.data.available);
        setAssignedRooms(response.data.data.assigned);
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchDeletedInvigilators = async () => {
    try {
      const response = await apiClient.get('/exam-invigilator/deleted/all');
      if (response.data.success) {
        setDeletedInvigilators(response.data.data);
        setDeletedDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching deleted invigilators:", error);
      toast.error("Failed to load deleted invigilators");
    }
  };

  const fetchDutiesByDate = async () => {
    try {
      setDutiesLoading(true);
      const response = await apiClient.get(`/exam-invigilator/duties/by-date/${selectedDate}`);
      if (response.data.success) {
        setDuties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching duties:", error);
    } finally {
      setDutiesLoading(false);
    }
  };

  // Create Invigilator
  const handleCreateInvigilator = async () => {
    if (!formData.shortName || !formData.name || !formData.mobileNo) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.mobileNo.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    try {
      const response = await apiClient.post('/exam-invigilator', formData);
      if (response.data.success) {
        toast.success("Invigilator created successfully");
        setDialogOpen(false);
        setFormData({ shortName: '', name: '', mobileNo: '', isActive: true });
        fetchInvigilators();
        fetchStats();
      }
    } catch (error) {
      console.error("Error creating invigilator:", error);
      toast.error(error.response?.data?.error || "Failed to create invigilator");
    }
  };

  // Update Invigilator
  const handleUpdateInvigilator = async () => {
    try {
      const response = await apiClient.put(`/exam-invigilator/${selectedInvigilator._id}`, formData);
      if (response.data.success) {
        toast.success("Invigilator updated successfully");
        setEditDialogOpen(false);
        fetchInvigilators();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating invigilator:", error);
      toast.error(error.response?.data?.error || "Failed to update invigilator");
    }
  };

  // Toggle Status
  const handleToggleStatus = async (invigilatorId) => {
    try {
      const response = await apiClient.patch(`/exam-invigilator/${invigilatorId}/toggle-status`, {});
      if (response.data.success) {
        toast.success(response.data.message);
        fetchInvigilators();
        fetchStats();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle status");
    }
  };

  // Delete Invigilator
  const handleDeleteInvigilator = async (invigilatorId) => {
    if (!window.confirm("Are you sure you want to delete this invigilator?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/exam-invigilator/${invigilatorId}`);
      if (response.data.success) {
        toast.success("Invigilator deleted successfully");
        fetchInvigilators();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting invigilator:", error);
      toast.error("Failed to delete invigilator");
    }
  };

  // Restore Invigilator
  const handleRestoreInvigilator = async (invigilatorId) => {
    try {
      const response = await apiClient.post(`/exam-invigilator/${invigilatorId}/restore`, {});
      if (response.data.success) {
        toast.success("Invigilator restored successfully");
        fetchDeletedInvigilators();
        fetchInvigilators();
        fetchStats();
      }
    } catch (error) {
      console.error("Error restoring invigilator:", error);
      toast.error("Failed to restore invigilator");
    }
  };

  // Single Room Assignment
  const handleOpenRoomForm = (invigilator = null) => {
    if (invigilator) {
      setRoomForm({
        ...roomForm,
        invigilatorId: invigilator._id,
        shortName: invigilator.shortName,
        examDate: selectedDate
      });
      setSelectedInvigilator(invigilator);
    }
    setRoomDialogOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!roomForm.invigilatorId || !roomForm.examDate || !roomForm.dutyFrom || 
        !roomForm.dutyTo || !roomForm.roomNo) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const dutyPayload = {
        examDate: roomForm.examDate,
        duties: [{
          invigilatorId: roomForm.invigilatorId,
          roomNo: parseInt(roomForm.roomNo),
          dutyFrom: roomForm.dutyFrom,
          dutyTo: roomForm.dutyTo
        }]
      };

      const response = await apiClient.post('/exam-invigilator/duties/bulk', dutyPayload);
      if (response.data.success) {
        toast.success("Room assigned successfully");
        setRoomDialogOpen(false);
        setRoomForm({
          invigilatorId: '',
          shortName: '',
          roomNo: '',
          dutyFrom: '09:00',
          dutyTo: '13:00',
          examDate: new Date().toISOString().split('T')[0]
        });
        fetchDutiesByDate();
        fetchAvailableRoomsForDate();
      }
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error(error.response?.data?.error || "Failed to assign room");
    }
  };

  // Edit Room Assignment
  const handleOpenEditRoomForm = (duty) => {
    setSelectedDuty(duty);
    setEditDutyForm({
      dutyId: duty._id,
      invigilatorId: duty.invigilatorId._id,
      invigilatorName: duty.invigilatorId.name,
      examDate: new Date(duty.examDate).toISOString().split('T')[0],
      dutyFrom: duty.dutyFrom,
      dutyTo: duty.dutyTo,
      roomNo: duty.roomNo
    });
    setEditRoomDialogOpen(true);
  };

  const handleUpdateRoomAssignment = async () => {
    try {
      // First delete the old duty
      await apiClient.delete(`/exam-invigilator/duties/${editDutyForm.dutyId}`);
      
      // Then create new one
      const dutyPayload = {
        examDate: editDutyForm.examDate,
        duties: [{
          invigilatorId: editDutyForm.invigilatorId,
          roomNo: parseInt(editDutyForm.roomNo),
          dutyFrom: editDutyForm.dutyFrom,
          dutyTo: editDutyForm.dutyTo
        }]
      };

      const response = await apiClient.post('/exam-invigilator/duties/bulk', dutyPayload);
      if (response.data.success) {
        toast.success("Room assignment updated successfully");
        setEditRoomDialogOpen(false);
        fetchDutiesByDate();
        fetchAvailableRoomsForDate();
      }
    } catch (error) {
      console.error("Error updating room assignment:", error);
      toast.error(error.response?.data?.error || "Failed to update room assignment");
    }
  };

  // Delete Room Assignment
  const handleDeleteRoomAssignment = async (dutyId) => {
    if (!window.confirm("Are you sure you want to remove this room assignment?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/exam-invigilator/duties/${dutyId}`);
      if (response.data.success) {
        toast.success("Room assignment removed successfully");
        fetchDutiesByDate();
        fetchAvailableRoomsForDate();
      }
    } catch (error) {
      console.error("Error removing room assignment:", error);
      toast.error("Failed to remove room assignment");
    }
  };

  // View Room Details
  const handleViewRoomDetails = (room) => {
    setSelectedRoom(room);
    setRoomStatusDialogOpen(true);
  };

  // Bulk Duty Assignment - Step Navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBulkDutyForm({
      examDate: new Date().toISOString().split('T')[0],
      dutyFrom: '09:00',
      dutyTo: '13:00',
      selectedInvigilators: [],
      rooms: {},
      assignmentType: 'same'
    });
  };

  // Handle bulk duty submission
  const handleBulkDutySubmit = async () => {
    try {
      if (bulkDutyForm.assignmentType === 'same' && !bulkDutyForm.rooms.same) {
        toast.error("Please assign a room number");
        return;
      }

      if (bulkDutyForm.assignmentType === 'different') {
        const missingRooms = bulkDutyForm.selectedInvigilators.filter(
          id => !bulkDutyForm.rooms[id]
        );
        if (missingRooms.length > 0) {
          toast.error("Please assign rooms to all selected invigilators");
          return;
        }
      }

      const duties = bulkDutyForm.selectedInvigilators.map(invId => {
        return {
          invigilatorId: invId,
          roomNo: parseInt(bulkDutyForm.assignmentType === 'same' 
            ? bulkDutyForm.rooms.same 
            : bulkDutyForm.rooms[invId]),
          dutyFrom: bulkDutyForm.dutyFrom,
          dutyTo: bulkDutyForm.dutyTo
        };
      });

      const dutyPayload = {
        examDate: bulkDutyForm.examDate,
        duties: duties
      };

      const response = await apiClient.post('/exam-invigilator/duties/bulk', dutyPayload);
      if (response.data.success) {
        toast.success(`Successfully assigned ${response.data.results.successful.length} duties`);
        if (response.data.results.failed.length > 0) {
          toast.error(`${response.data.results.failed.length} duties failed`);
        }
        setBulkDutyDialogOpen(false);
        handleReset();
        fetchDutiesByDate();
        fetchAvailableRoomsForDate();
      }
    } catch (error) {
      console.error("Error assigning bulk duties:", error);
      toast.error(error.response?.data?.error || "Failed to assign duties");
    }
  };

  // Handle select all invigilators
  const handleSelectAllInvigilators = (event) => {
    if (event.target.checked) {
      const allIds = invigilators.map(inv => inv._id);
      setBulkDutyForm({ ...bulkDutyForm, selectedInvigilators: allIds });
    } else {
      setBulkDutyForm({ ...bulkDutyForm, selectedInvigilators: [] });
    }
  };

  // Handle individual invigilator selection
  const handleInvigilatorSelect = (invId) => {
    const currentIndex = bulkDutyForm.selectedInvigilators.indexOf(invId);
    const newSelected = [...bulkDutyForm.selectedInvigilators];

    if (currentIndex === -1) {
      newSelected.push(invId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setBulkDutyForm({ ...bulkDutyForm, selectedInvigilators: newSelected });
  };

  // Mark Attendance
  const handleMarkAttendance = async (dutyId, status) => {
    try {
      const response = await apiClient.put(`/exam-invigilator/duties/${dutyId}/attendance`, { status });
      if (response.data.success) {
        toast.success(`Attendance marked as ${status}`);
        fetchDutiesByDate();
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Delete all duties in this batch?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/exam-invigilator/duties/batch/${batchId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedBatch(null);
        fetchDutiesByDate();
        fetchAvailableRoomsForDate();
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  const handlePrintAttendanceSheet = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  if (!token) {
    toast.error('No authentication token found. Please login again.');
    navigate('/admin/login');
    return;
  }

  // Format the date correctly (ensure it's in DD-MM-YYYY format)
  let formattedDate = selectedDate;
  
  // If selectedDate is in YYYY-MM-DD format, convert to DD-MM-YYYY
  if (selectedDate.includes('-')) {
    const parts = selectedDate.split('-');
    if (parts[0].length === 4) {
      // It's YYYY-MM-DD
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Show loading toast
  toast.loading('Opening attendance sheet...', { id: 'pdf-loading' });

  // Method 1: Open with token in URL (simplest)
  const url = `${API_URL}/exam-invigilator/invigilator-attendance/${formattedDate}/pdf?preview=true&print=true&token=${encodeURIComponent(token)}`;
  
  // Open in new tab
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow) {
    // Popup blocker might be blocking
    toast.error('Please allow popups for this site', { id: 'pdf-loading' });
  } else {
    toast.success('Attendance sheet opened in new tab', { id: 'pdf-loading' });
  }
};

  // Bulk Create Invigilators
  const handleBulkCreate = async () => {
    try {
      const invigilators = bulkData.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [shortName, name, mobileNo] = line.split(',').map(s => s.trim());
          return { shortName, name, mobileNo };
        });

      if (invigilators.length === 0) {
        toast.error("No valid data to import");
        return;
      }

      const response = await apiClient.post('/exam-invigilator/bulk', { invigilators });
      if (response.data.success) {
        toast.success(response.data.message);
        setBulkDialogOpen(false);
        setBulkData('');
        fetchInvigilators();
        fetchStats();
        
        const { successful, failed } = response.data.results;
        if (failed.length > 0) {
          toast.error(`${failed.length} records failed to import`);
        }
      }
    } catch (error) {
      console.error("Error bulk creating invigilators:", error);
      toast.error(error.response?.data?.error || "Failed to bulk create invigilators");
    }
  };

  const handleOpenEditDialog = (invigilator) => {
    setSelectedInvigilator(invigilator);
    setFormData({
      shortName: invigilator.shortName,
      name: invigilator.name,
      mobileNo: invigilator.mobileNo,
      isActive: invigilator.isActive
    });
    setEditDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const filteredInvigilators = invigilators.filter(inv => 
    inv.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.mobileNo?.includes(searchTerm)
  );

  // Get available rooms for select dropdown
  const getAvailableRoomOptions = () => {
    return availableRooms.map(room => ({
      value: room.roomNo,
      label: `Room ${room.roomNo} (${room.studentCount} students)`
    }));
  };

  // Get room options for edit form
  const getRoomOptionsForEdit = () => {
    const currentRoom = editDutyForm.roomNo;
    const options = availableRooms.map(room => ({
      value: room.roomNo,
      label: `Room ${room.roomNo} (${room.studentCount} students)`
    }));
    
    // Add current room if it's not in available rooms
    if (currentRoom && !availableRooms.some(r => r.roomNo === currentRoom)) {
      options.push({
        value: currentRoom,
        label: `Room ${currentRoom} (Current)`
      });
    }
    
    return options;
  };

  // Render step content for bulk duty assignment
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Exam Date"
                value={bulkDutyForm.examDate}
                onChange={(e) => setBulkDutyForm({ ...bulkDutyForm, examDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty From"
                value={bulkDutyForm.dutyFrom}
                onChange={(e) => setBulkDutyForm({ ...bulkDutyForm, dutyFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty To"
                value={bulkDutyForm.dutyTo}
                onChange={(e) => setBulkDutyForm({ ...bulkDutyForm, dutyTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={bulkDutyForm.selectedInvigilators.length === invigilators.length}
                  indeterminate={bulkDutyForm.selectedInvigilators.length > 0 && bulkDutyForm.selectedInvigilators.length < invigilators.length}
                  onChange={handleSelectAllInvigilators}
                />
              }
              label="Select All"
            />
            <Paper sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
              <List>
                {invigilators.map((inv) => (
                  <ListItem key={inv._id} dense button onClick={() => handleInvigilatorSelect(inv._id)}>
                    <Checkbox
                      edge="start"
                      checked={bulkDutyForm.selectedInvigilators.indexOf(inv._id) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={inv.shortName} size="small" color="primary" variant="outlined" />
                          <Typography>{inv.name}</Typography>
                        </Box>
                      }
                      secondary={inv.mobileNo}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                value={bulkDutyForm.assignmentType}
                onChange={(e) => setBulkDutyForm({ ...bulkDutyForm, assignmentType: e.target.value })}
              >
                <RadioFormControlLabel value="same" control={<Radio />} label="Same room for all" />
                <RadioFormControlLabel value="different" control={<Radio />} label="Different rooms per invigilator" />
              </RadioGroup>
            </FormControl>

            {bulkDutyForm.assignmentType === 'same' ? (
              <FormControl fullWidth>
                <InputLabel>Select Room</InputLabel>
                <Select
                  value={bulkDutyForm.rooms.same || ''}
                  onChange={(e) => setBulkDutyForm({ 
                    ...bulkDutyForm, 
                    rooms: { ...bulkDutyForm.rooms, same: e.target.value }
                  })}
                  label="Select Room"
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.roomNo} value={room.roomNo}>
                      Room {room.roomNo} ({room.studentCount} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Assign rooms to each invigilator:</Typography>
                <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {bulkDutyForm.selectedInvigilators.map((invId) => {
                      const inv = invigilators.find(i => i._id === invId);
                      return (
                        <ListItem key={invId}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={inv?.shortName} size="small" color="primary" variant="outlined" />
                                <Typography>{inv?.name}</Typography>
                              </Box>
                            }
                          />
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              size="small"
                              value={bulkDutyForm.rooms[invId] || ''}
                              onChange={(e) => setBulkDutyForm({
                                ...bulkDutyForm,
                                rooms: { ...bulkDutyForm.rooms, [invId]: e.target.value }
                              })}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>Select Room</MenuItem>
                              {availableRooms.map((room) => (
                                <MenuItem key={room.roomNo} value={room.roomNo}>
                                  Room {room.roomNo}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review the duty assignments before confirming
            </Alert>
            <Typography variant="subtitle2">Exam Date: {bulkDutyForm.examDate}</Typography>
            <Typography variant="subtitle2">Duty Time: {bulkDutyForm.dutyFrom} - {bulkDutyForm.dutyTo}</Typography>
            <Typography variant="subtitle2">Selected Invigilators: {bulkDutyForm.selectedInvigilators.length}</Typography>
            <Paper sx={{ maxHeight: 200, overflow: 'auto', mt: 2 }}>
              <List dense>
                {bulkDutyForm.selectedInvigilators.map((invId) => {
                  const inv = invigilators.find(i => i._id === invId);
                  const roomNo = bulkDutyForm.assignmentType === 'same' 
                    ? bulkDutyForm.rooms.same 
                    : bulkDutyForm.rooms[invId];
                  return (
                    <ListItem key={invId}>
                      <ListItemText
                        primary={`${inv?.shortName} - ${inv?.name}`}
                        secondary={`Room: ${roomNo || 'Not assigned'}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  if (authError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Card sx={{ maxWidth: 400, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your session has expired. Please login again.
          </Typography>
          <Button variant="contained" onClick={handleLogout}>
            Go to Login
          </Button>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Invigilator Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage invigilators and room assignments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchInvigilators();
              fetchStats();
              fetchDutiesByDate();
              fetchRoomStatus();
              fetchAvailableRoomsForDate();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteSweepIcon />}
            onClick={fetchDeletedInvigilators}
            color="warning"
          >
            Deleted ({stats.deleted})
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Invigilator
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Invigilators
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Inactive
              </Typography>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rooms (1-20)
              </Typography>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {roomStatus.filter(r => r.hasStudents).length}/{roomStatus.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Invigilators" />
          <Tab label="Room Assignments" />
          <Tab label="Attendance Sheet" />
          <Tab label="Room Status" />
        </Tabs>
      </Paper>

      {/* Tab 1: Invigilators List */}
      {tabValue === 0 && (
        <>
          {/* Search and Bulk Upload */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by short name, name, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setBulkDialogOpen(true)}
                >
                  Bulk Upload
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<GroupAddIcon />}
                  onClick={() => setBulkDutyDialogOpen(true)}
                >
                  Bulk Assign
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Invigilators Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Short Name</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvigilators.map((inv) => {
                  // Check if this invigilator has a duty today
                  const hasDutyToday = duties.some(d => 
                    d.invigilatorId?._id === inv._id
                  );
                  
                  return (
                    <TableRow key={inv._id} hover>
                      <TableCell>
                        <Chip 
                          label={inv.shortName} 
                          color="primary" 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: inv.isActive ? '#2563eb' : '#9ca3af', width: 32, height: 32 }}>
                            <InvigilatorIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">{inv.name}</Typography>
                          {hasDutyToday && (
                            <Chip 
                              label="Assigned Today" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{inv.mobileNo}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inv.isActive ? 'Active' : 'Inactive'}
                          color={inv.isActive ? 'success' : 'default'}
                          size="small"
                          icon={inv.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenEditDialog(inv)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assign Room">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenRoomForm(inv)}
                              color="primary"
                            >
                              <RoomIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={inv.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleToggleStatus(inv._id)}
                              color={inv.isActive ? 'warning' : 'success'}
                            >
                              {inv.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteInvigilator(inv._id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInvigilators.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No invigilators found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Floating Action Button for Quick Room Assignment */}
          <Zoom in={true}>
            <Fab
              color="primary"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={() => handleOpenRoomForm()}
            >
              <RoomIcon />
            </Fab>
          </Zoom>
        </>
      )}

      {/* Tab 2: Room Assignments */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Room Assignments</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          </Box>

          {selectedBatch && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => handleDeleteBatch(selectedBatch)}>
                  Clear Batch
                </Button>
              }
            >
              Last batch ID: {selectedBatch}
            </Alert>
          )}

          {dutiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : duties.length === 0 ? (
            <Alert severity="info">No room assignments for this date</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Room No</TableCell>
                    <TableCell>Invigilator</TableCell>
                    <TableCell>Short Name</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Duty Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {duties.map((duty) => (
                    <TableRow key={duty._id} hover>
                      <TableCell>
                        <Chip 
                          label={`Room ${duty.roomNo}`} 
                          size="medium"
                          icon={<RoomIcon />}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{duty.invigilatorId?.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={duty.invigilatorId?.shortName} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{duty.invigilatorId?.mobileNo}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {duty.dutyFrom} - {duty.dutyTo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={duty.status}
                          color={duty.status === 'Present' ? 'success' : duty.status === 'Absent' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit Assignment">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenEditRoomForm(duty)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Present">
                            <IconButton 
                              size="small" 
                              onClick={() => handleMarkAttendance(duty._id, 'Present')}
                              color="success"
                              disabled={duty.status === 'Present'}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Absent">
                            <IconButton 
                              size="small" 
                              onClick={() => handleMarkAttendance(duty._id, 'Absent')}
                              color="error"
                              disabled={duty.status === 'Absent'}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteRoomAssignment(duty._id)}
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
          )}
        </Paper>
      )}

      {/* Tab 3: Attendance Sheet */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Attendance Sheet</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrintAttendanceSheet}
              >
                Print Sheet
              </Button>
            </Box>
          </Box>

          {dutiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : duties.length === 0 ? (
            <Alert severity="info">No attendance records for this date</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell>Room No</TableCell>
                    <TableCell>Short Name</TableCell>
                    <TableCell>Name of Teacher</TableCell>
                    <TableCell>Mobile No</TableCell>
                    <TableCell>Duty From</TableCell>
                    <TableCell>Time To</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {duties.map((duty, index) => (
                    <TableRow key={duty._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Chip label={`Room ${duty.roomNo}`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={duty.invigilatorId?.shortName} size="small" />
                      </TableCell>
                      <TableCell>{duty.invigilatorId?.name}</TableCell>
                      <TableCell>{duty.invigilatorId?.mobileNo}</TableCell>
                      <TableCell>{duty.dutyFrom}</TableCell>
                      <TableCell>{duty.dutyTo}</TableCell>
                      <TableCell>
                        <Chip
                          label={duty.status}
                          color={duty.status === 'Present' ? 'success' : duty.status === 'Absent' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 4: Room Status */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Room Status Overview</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedRoomViewDate}
                onChange={(e) => setSelectedRoomViewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Available Rooms */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Available Rooms" 
                  subheader={`${availableRooms.length} rooms available`}
                  avatar={<RoomIcon color="success" />}
                />
                <CardContent>
                  {roomsLoading ? (
                    <CircularProgress />
                  ) : availableRooms.length === 0 ? (
                    <Alert severity="info">No available rooms for this date</Alert>
                  ) : (
                    <List>
                      {availableRooms.map((room) => (
                        <ListItem key={room.roomNo}>
                          <ListItemText
                            primary={`Room ${room.roomNo}`}
                            secondary={`${room.studentCount} students`}
                          />
                          <Chip label="Available" color="success" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Assigned Rooms */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Assigned Rooms" 
                  subheader={`${assignedRooms.length} rooms assigned`}
                  avatar={<RoomIcon color="primary" />}
                />
                <CardContent>
                  {roomsLoading ? (
                    <CircularProgress />
                  ) : assignedRooms.length === 0 ? (
                    <Alert severity="info">No rooms assigned for this date</Alert>
                  ) : (
                    <List>
                      {assignedRooms.map((room) => (
                        <ListItem key={room.roomNo}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">Room {room.roomNo}</Typography>
                                <Chip 
                                  label={room.invigilator.shortName} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="caption" display="block">
                                  {room.invigilator.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {room.dutyFrom} - {room.dutyTo}
                                </Typography>
                              </>
                            }
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label="Assigned" color="primary" size="small" />
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const duty = duties.find(d => d._id === room.dutyId);
                                if (duty) handleOpenEditRoomForm(duty);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* All Rooms Status */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="All Rooms Status" />
                <CardContent>
                  <Grid container spacing={2}>
                    {roomStatus.map((room) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={room.roomNo}>
                        <Card variant="outlined" sx={{ 
                          bgcolor: room.assignedInvigilator ? '#e8f5e9' : room.hasStudents ? '#fff3e0' : '#f5f5f5'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6">Room {room.roomNo}</Typography>
                              <IconButton size="small" onClick={() => handleViewRoomDetails(room)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Students: {room.occupiedSeats}/20
                            </Typography>
                            {room.assignedInvigilator ? (
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={`Inv: ${room.assignedInvigilator.shortName}`}
                                  size="small"
                                  color="success"
                                />
                              </Box>
                            ) : room.hasStudents ? (
                              <Chip label="Available" size="small" color="warning" sx={{ mt: 1 }} />
                            ) : (
                              <Chip label="No Students" size="small" sx={{ mt: 1 }} />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Create Invigilator Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">Add New Invigilator</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Name *"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                required
                helperText="Max 10 characters, uppercase"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number *"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                inputProps={{ maxLength: 10 }}
                required
                helperText="10 digit mobile number"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateInvigilator}>
            Create Invigilator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Invigilator Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">Edit Invigilator</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Name"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateInvigilator}>
            Update Invigilator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single Room Assignment Dialog */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon color="primary" />
            <Typography variant="h6">
              Assign Room to {selectedInvigilator?.shortName || 'Invigilator'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Room</InputLabel>
                <Select
                  value={roomForm.roomNo}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNo: e.target.value })}
                  label="Select Room"
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.roomNo} value={room.roomNo}>
                      Room {room.roomNo} ({room.studentCount} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Exam Date"
                value={roomForm.examDate}
                onChange={(e) => setRoomForm({ ...roomForm, examDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty From"
                value={roomForm.dutyFrom}
                onChange={(e) => setRoomForm({ ...roomForm, dutyFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty To"
                value={roomForm.dutyTo}
                onChange={(e) => setRoomForm({ ...roomForm, dutyTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRoom}>
            Assign Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Assignment Dialog */}
      <Dialog open={editRoomDialogOpen} onClose={() => setEditRoomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">Edit Room Assignment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Editing assignment for {editDutyForm.invigilatorName}
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Room</InputLabel>
                <Select
                  value={editDutyForm.roomNo}
                  onChange={(e) => setEditDutyForm({ ...editDutyForm, roomNo: e.target.value })}
                  label="Select Room"
                >
                  {getRoomOptionsForEdit().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Exam Date"
                value={editDutyForm.examDate}
                onChange={(e) => setEditDutyForm({ ...editDutyForm, examDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty From"
                value={editDutyForm.dutyFrom}
                onChange={(e) => setEditDutyForm({ ...editDutyForm, dutyFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Duty To"
                value={editDutyForm.dutyTo}
                onChange={(e) => setEditDutyForm({ ...editDutyForm, dutyTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRoomDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRoomAssignment}>
            Update Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Duty Assignment Dialog */}
      <Dialog open={bulkDutyDialogOpen} onClose={() => setBulkDutyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupAddIcon color="primary" />
            <Typography variant="h6">Bulk Room Assignment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {getStepContent(index)}
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={
                          (index === 0 && (!bulkDutyForm.examDate || !bulkDutyForm.dutyFrom || !bulkDutyForm.dutyTo)) ||
                          (index === 1 && bulkDutyForm.selectedInvigilators.length === 0) ||
                          (index === 2 && bulkDutyForm.assignmentType === 'same' && !bulkDutyForm.rooms.same) ||
                          (index === 2 && bulkDutyForm.assignmentType === 'different' && 
                            bulkDutyForm.selectedInvigilators.some(id => !bulkDutyForm.rooms[id]))
                        }
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>All steps completed - ready to submit</Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
              <Button 
                variant="contained" 
                onClick={handleBulkDutySubmit} 
                sx={{ mt: 1, mr: 1 }}
              >
                Submit Assignments
              </Button>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDutyDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Invigilators</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter one invigilator per line in format: <strong>shortName, name, mobileNo</strong>
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder="AKJ, Ashok Kumar Jha, 9876543210\nBSP, Bindu S Pillai, 9876543211\nCMR, Chandran M R, 9876543212"
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkCreate}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Room Status Details Dialog */}
      <Dialog open={roomStatusDialogOpen} onClose={() => setRoomStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MeetingRoomIcon color="primary" />
            <Typography variant="h6">Room {selectedRoom?.roomNo} Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRoom && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Seats
                    </Typography>
                    <Typography variant="h4">20</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Occupied
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {selectedRoom.occupiedSeats}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Available
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {selectedRoom.availableSeats}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedRoom.isFull ? 'Full' : selectedRoom.hasStudents ? 'Active' : 'Empty'}
                      color={selectedRoom.isFull ? 'error' : selectedRoom.hasStudents ? 'success' : 'default'}
                    />
                  </CardContent>
                </Card>
              </Grid>
              {selectedRoom.assignedInvigilator && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Assigned Invigilator:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={selectedRoom.assignedInvigilator.shortName}
                        size="small"
                        color="primary"
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedRoom.assignedInvigilator.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duty: {selectedRoom.assignedInvigilator.dutyFrom} - {selectedRoom.assignedInvigilator.dutyTo}
                      </Typography>
                    </Box>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomStatusDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Deleted Invigilators Dialog */}
      <Dialog open={deletedDialogOpen} onClose={() => setDeletedDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Deleted Invigilators</DialogTitle>
        <DialogContent>
          {deletedInvigilators.length === 0 ? (
            <Alert severity="info">No deleted invigilators found</Alert>
          ) : (
            <List>
              {deletedInvigilators.map((inv) => (
                <React.Fragment key={inv._id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{inv.shortName}</Typography>
                          <Chip label={inv.name} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            Mobile: {inv.mobileNo}
                          </Typography>
                          <Typography variant="caption" color="error">
                            Deleted: {new Date(inv.deletedAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRestoreInvigilator(inv._id)}
                      >
                        Restore
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletedDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvigilatorManagement;