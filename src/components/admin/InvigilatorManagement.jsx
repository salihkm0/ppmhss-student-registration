import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  LinearProgress,
  Pagination,
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
  Close as CloseIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
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
  const [roomStudents, setRoomStudents] = useState(null);
  const [selectedRoomForView, setSelectedRoomForView] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    deleted: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [roomStudentsLoading, setRoomStudentsLoading] = useState(false);
  const [availableRoomsLoading, setAvailableRoomsLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  
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
  const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bulkDutyDialogOpen, setBulkDutyDialogOpen] = useState(false);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [roomStatusDialogOpen, setRoomStatusDialogOpen] = useState(false);
  const [roomStudentsDialogOpen, setRoomStudentsDialogOpen] = useState(false);
  
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
      fetchAvailableRoomsForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedRoomViewDate) {
      fetchAvailableRoomsForDate(selectedRoomViewDate);
    }
  }, [selectedRoomViewDate]);

  // Search functionality for rooms
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (!roomSearchTerm.trim()) {
        setFilteredRooms(roomStatus);
      } else {
        const filtered = roomStatus.filter(room =>
          room.roomNo.toString().includes(roomSearchTerm.toLowerCase())
        );
        setFilteredRooms(filtered);
      }
      setPage(1);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [roomSearchTerm, roomStatus]);

  // Fetch invigilators from /exam-invigilator (CRUD operations)
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

  // Fetch room status from admin/rooms/stats endpoint
  const fetchRoomStatus = async () => {
    try {
      const response = await apiClient.get('/admin/rooms/stats');
      if (response.data.success) {
        // Filter out rooms with 0 students
        const activeRooms = response.data.data.filter(room => room.studentCount > 0);
        setRoomStatus(activeRooms);
        setFilteredRooms(activeRooms);
      }
    } catch (error) {
      console.error("Error fetching room status:", error);
    }
  };

  // Fetch available rooms for duty assignment
  const fetchAvailableRoomsForDate = async (date) => {
    try {
      setAvailableRoomsLoading(true);
      const response = await apiClient.get(`/rooms/available-for-duty?date=${date}`);
      if (response.data.success) {
        setAvailableRooms(response.data.data.available);
        setAssignedRooms(response.data.data.assigned);
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    } finally {
      setAvailableRoomsLoading(false);
    }
  };

  // Fetch room students for viewing
  const fetchRoomStudents = async (roomNo) => {
    setRoomStudentsLoading(true);
    setSelectedRoomForView(roomNo);
    try {
      const response = await apiClient.get(`/students/rooms/${roomNo}`, {
        params: { excludeDeleted: true }
      });
      if (response.data.success) {
        setRoomStudents(response.data.data);
        setRoomStudentsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching room students:", error);
      toast.error("Failed to load room students");
    } finally {
      setRoomStudentsLoading(false);
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

  // Fetch duties from /invigilator-duties (separate endpoint)
  const fetchDutiesByDate = async () => {
    try {
      setDutiesLoading(true);
      const response = await apiClient.get(`/invigilator-duties/duties/by-date/${selectedDate}`);
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

  // Single Room Assignment - Open modal for specific room
  const handleOpenRoomFormForRoom = (room, invigilator = null) => {
    // Refresh available rooms for the selected date
    fetchAvailableRoomsForDate(selectedDate).then(() => {
      setRoomForm({
        invigilatorId: invigilator?._id || '',
        shortName: invigilator?.shortName || '',
        roomNo: room.roomNo.toString(),
        dutyFrom: '09:00',
        dutyTo: '13:00',
        examDate: selectedDate
      });
      setSelectedInvigilator(invigilator);
      setRoomDialogOpen(true);
    });
  };

  // Open room assignment modal from invigilator list
  const handleOpenRoomForm = (invigilator = null) => {
    // Refresh available rooms for the selected date
    fetchAvailableRoomsForDate(selectedDate).then(() => {
      if (invigilator) {
        setRoomForm({
          ...roomForm,
          invigilatorId: invigilator._id,
          shortName: invigilator.shortName,
          examDate: selectedDate,
          roomNo: '' // Reset room selection
        });
        setSelectedInvigilator(invigilator);
      }
      setRoomDialogOpen(true);
    });
  };

  // Assign room using /invigilator-duties/duties/bulk
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

      const response = await apiClient.post('/invigilator-duties/duties/bulk', dutyPayload);
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
        fetchAvailableRoomsForDate(selectedDate);
        fetchRoomStatus(); // Refresh room status
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
    // Refresh available rooms for edit
    fetchAvailableRoomsForDate(new Date(duty.examDate).toISOString().split('T')[0]).then(() => {
      setEditRoomDialogOpen(true);
    });
  };

  // Update room assignment
  const handleUpdateRoomAssignment = async () => {
    try {
      // First delete the old duty
      await apiClient.delete(`/invigilator-duties/duties/${editDutyForm.dutyId}`);
      
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

      const response = await apiClient.post('/invigilator-duties/duties/bulk', dutyPayload);
      if (response.data.success) {
        toast.success("Room assignment updated successfully");
        setEditRoomDialogOpen(false);
        fetchDutiesByDate();
        fetchAvailableRoomsForDate(editDutyForm.examDate);
        fetchRoomStatus(); // Refresh room status
      }
    } catch (error) {
      console.error("Error updating room assignment:", error);
      toast.error(error.response?.data?.error || "Failed to update room assignment");
    }
  };

  // Delete room assignment
  const handleDeleteRoomAssignment = async (dutyId) => {
    if (!window.confirm("Are you sure you want to remove this room assignment?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/invigilator-duties/duties/${dutyId}`);
      if (response.data.success) {
        toast.success("Room assignment removed successfully");
        fetchDutiesByDate();
        fetchAvailableRoomsForDate(selectedDate);
        fetchRoomStatus(); // Refresh room status
      }
    } catch (error) {
      console.error("Error removing room assignment:", error);
      toast.error("Failed to remove room assignment");
    }
  };

  // View Room Details
  const handleViewRoomDetails = (room) => {
    // Find if room has assigned invigilator from duties
    const roomDuty = duties.find(d => d.roomNo === room.roomNo);
    const roomWithDetails = {
      ...room,
      assignedInvigilator: roomDuty ? {
        shortName: roomDuty.invigilatorId?.shortName,
        name: roomDuty.invigilatorId?.name,
        dutyFrom: roomDuty.dutyFrom,
        dutyTo: roomDuty.dutyTo
      } : null
    };
    setSelectedRoom(roomWithDetails);
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

  // Open bulk duty dialog with fresh room data
  const handleOpenBulkDutyDialog = () => {
    // Reset form and fetch available rooms for the current date
    handleReset();
    fetchAvailableRoomsForDate(bulkDutyForm.examDate).then(() => {
      setBulkDutyDialogOpen(true);
    });
  };

  // Handle date change in bulk form
  const handleBulkDateChange = (date) => {
    setBulkDutyForm({ ...bulkDutyForm, examDate: date, rooms: {} });
    // Fetch available rooms for the new date
    fetchAvailableRoomsForDate(date);
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

      const response = await apiClient.post('/invigilator-duties/duties/bulk', dutyPayload);
      if (response.data.success) {
        toast.success(`Successfully assigned ${response.data.results.successful.length} duties`);
        if (response.data.results.failed.length > 0) {
          toast.error(`${response.data.results.failed.length} duties failed`);
        }
        setBulkDutyDialogOpen(false);
        handleReset();
        fetchDutiesByDate();
        fetchAvailableRoomsForDate(bulkDutyForm.examDate);
        fetchRoomStatus(); // Refresh room status
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
      const response = await apiClient.put(`/invigilator-duties/duties/${dutyId}/attendance`, { status });
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
      const response = await apiClient.delete(`/invigilator-duties/duties/batch/${batchId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedBatch(null);
        fetchDutiesByDate();
        fetchAvailableRoomsForDate(selectedDate);
        fetchRoomStatus(); // Refresh room status
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  // Handle Print Attendance Sheet
  const handlePrintAttendanceSheet = (date = selectedDate) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      toast.error('No authentication token found. Please login again.');
      navigate('/admin/login');
      return;
    }

    // Format the date correctly (ensure it's in DD-MM-YYYY format)
    let formattedDate = date;
    
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts[0].length === 4) {
        // It's YYYY-MM-DD
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    toast.loading('Opening attendance sheet...', { id: 'pdf-loading' });

    const url = `${API_URL}/invigilator-duties/invigilator-attendance/${formattedDate}/pdf?preview=true&print=true&token=${encodeURIComponent(token)}`;
    
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      toast.error('Please allow popups for this site', { id: 'pdf-loading' });
    } else {
      toast.success('Attendance sheet opened in new tab', { id: 'pdf-loading' });
    }
  };

  // Handle Print Room Attendance Sheet
  const handlePrintRoomAttendanceSheet = (roomNo) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const url = `${API_URL}/admin/room-attendance/${roomNo}/pdf?preview=false&print=true&token=${token}`;
    window.open(url, '_blank');
  };

  // Handle Print Room Exam Slips
  const handlePrintRoomExamSlips = (roomNo) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const url = `${API_URL}/admin/simple-exam-slips/${roomNo}?preview=false&print=true&token=${token}`;
    window.open(url, '_blank');
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

  // Filter invigilators
  const filteredInvigilators = invigilators.filter(inv => 
    inv.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.mobileNo?.includes(searchTerm)
  );

  // Get available rooms for select dropdown
  const getAvailableRoomOptions = () => {
    return availableRooms.map(room => ({
      value: room.roomNo,
      label: `Room ${room.roomNo} (${room.studentCount} students) - Available`
    }));
  };

  // Get room options for edit form
  const getRoomOptionsForEdit = () => {
    const currentRoom = editDutyForm.roomNo;
    const options = availableRooms.map(room => ({
      value: room.roomNo,
      label: `Room ${room.roomNo} (${room.studentCount} students) - Available`
    }));
    
    // Add current room if it's not in available rooms
    if (currentRoom && !availableRooms.some(r => r.roomNo === currentRoom)) {
      options.push({
        value: currentRoom,
        label: `Room ${currentRoom} (Current Assignment)`
      });
    }
    
    return options;
  };

  // Paginated rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, page]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Summary statistics
  const totalStudents = useMemo(() => 
    roomStatus.reduce((sum, room) => sum + room.studentCount, 0), 
    [roomStatus]
  );

  const totalCapacity = useMemo(() => 
    roomStatus.reduce((sum, room) => sum + room.capacity, 0), 
    [roomStatus]
  );

  const occupancyRate = useMemo(() => 
    totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0, 
    [totalStudents, totalCapacity]
  );

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
                onChange={(e) => handleBulkDateChange(e.target.value)}
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
            {availableRoomsLoading && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Loading available rooms...
                  </Typography>
                </Box>
              </Grid>
            )}
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
            {availableRoomsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading available rooms for {bulkDutyForm.examDate}...
                </Typography>
              </Box>
            ) : availableRooms.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No available rooms for the selected date. All rooms are already assigned.
              </Alert>
            ) : (
              <>
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
                          Room {room.roomNo} ({room.studentCount} students) - Available
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
              </>
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

  // Room Card Component
  const RoomCard = ({ room, onViewClick, onAssignClick }) => {
    const filledPercentage = (room.studentCount / room.capacity) * 100;
    const hasInvigilator = assignedRooms.some(r => r.roomNo === room.roomNo);
    const assignedInv = assignedRooms.find(r => r.roomNo === room.roomNo);

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
            <Avatar sx={{ bgcolor: hasInvigilator ? '#10b98115' : '#2563eb15', color: hasInvigilator ? '#10b981' : '#2563eb' }}>
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

            {/* Assigned Invigilator */}
            {hasInvigilator && assignedInv && (
              <Box sx={{ mt: 2, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Assigned Invigilator
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={assignedInv.invigilator.shortName}
                    size="small"
                    color="success"
                  />
                  <Typography variant="caption">
                    {assignedInv.dutyFrom} - {assignedInv.dutyTo}
                  </Typography>
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
              disabled={roomStudentsLoading}
            >
              {roomStudentsLoading && selectedRoomForView === room.roomNo ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null}
              View Students
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIcon />}
              onClick={() => onAssignClick(room)}
              fullWidth
              color={hasInvigilator ? 'warning' : 'primary'}
            >
              {hasInvigilator ? 'Change Assignment' : 'Assign Invigilator'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
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
              fetchAvailableRoomsForDate(selectedDate);
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
                Active Rooms
              </Typography>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {roomStatus.length}
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
          {/* <Tab label="Room Status" /> */}
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
                  onClick={handleOpenBulkDutyDialog}
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
                onClick={() => handlePrintAttendanceSheet(selectedDate)}
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
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Room Status Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {roomStatus.length} active rooms • {totalStudents} students • {occupancyRate}% occupancy
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedRoomViewDate}
                onChange={(e) => {
                  setSelectedRoomViewDate(e.target.value);
                  fetchAvailableRoomsForDate(e.target.value);
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          </Box>

          {/* Search Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search rooms by number..."
                  value={roomSearchTerm}
                  onChange={(e) => setRoomSearchTerm(e.target.value)}
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
                    Showing {paginatedRooms.length} of {roomStatus.length} active rooms
                  </Typography>
                  <Button
                    startIcon={<FilterIcon />}
                    size="small"
                    onClick={() => {
                      fetchRoomStatus();
                      fetchAvailableRoomsForDate(selectedRoomViewDate);
                    }}
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
                      onAssignClick={(room) => handleOpenRoomFormForRoom(room)}
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
                {roomStatus.length === 0 ? 'No rooms have active students' : 'Try a different search term'}
              </Typography>
            </Paper>
          )}
        </Box>
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
              {roomForm.roomNo ? `Assign Room ${roomForm.roomNo}` : 'Assign Room to Invigilator'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {availableRoomsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {!roomForm.roomNo && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Invigilator</InputLabel>
                    <Select
                      value={roomForm.invigilatorId}
                      onChange={(e) => {
                        const inv = invigilators.find(i => i._id === e.target.value);
                        setRoomForm({ 
                          ...roomForm, 
                          invigilatorId: e.target.value,
                          shortName: inv?.shortName || ''
                        });
                      }}
                      label="Select Invigilator"
                    >
                      {invigilators.filter(inv => inv.isActive).map((inv) => (
                        <MenuItem key={inv._id} value={inv._id}>
                          {inv.shortName} - {inv.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
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
                        Room {room.roomNo} ({room.studentCount} students) - Available
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAssignRoom}
            disabled={!roomForm.invigilatorId || !roomForm.roomNo || availableRoomsLoading}
          >
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
          {availableRoomsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
          )}
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
                disabled={availableRoomsLoading}
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
                      {selectedRoom.studentCount}
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
                      label={selectedRoom.studentCount >= 20 ? 'Full' : selectedRoom.studentCount > 0 ? 'Active' : 'Empty'}
                      color={selectedRoom.studentCount >= 20 ? 'error' : selectedRoom.studentCount > 0 ? 'success' : 'default'}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Gender distribution */}
              {selectedRoom.genderCounts && selectedRoom.genderCounts.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Gender Distribution</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedRoom.genderCounts.map((gender) => (
                      <Chip
                        key={gender._id}
                        label={`${gender._id}: ${gender.count}`}
                        sx={{
                          bgcolor: gender._id === 'Female' ? '#fce4ec' : '#e3f2fd',
                          color: gender._id === 'Female' ? '#c2185b' : '#1976d2',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}

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

      {/* Room Students Dialog */}
      <Dialog 
        open={roomStudentsDialogOpen} 
        onClose={() => setRoomStudentsDialogOpen(false)} 
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
                  Room {selectedRoomForView}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {roomStudents?.studentCount || 0} active students • {roomStudents?.availableSeats || 0} seats available
                </Typography>
              </Box>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setRoomStudentsDialogOpen(false)}
              sx={{ border: '1px solid #e0e0e0' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Gender Stats */}
          {roomStudents?.genderCounts && roomStudents.genderCounts.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              mt: 2,
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 1
            }}>
              {roomStudents.genderCounts.map((gender) => (
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
                {roomStudents?.students?.map((student) => (
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
                          onClick={() => window.open(`${API_URL}/students/${student.registrationCode}/hallticket/download`, '_blank')}
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
          <Button onClick={() => setRoomStudentsDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePrintRoomAttendanceSheet(selectedRoomForView)}
            startIcon={<PrintIcon />}
          >
            Attendance Sheet
          </Button>
          <Button
            variant="outlined"
            onClick={() => handlePrintRoomExamSlips(selectedRoomForView)}
            startIcon={<PdfIcon />}
          >
            Exam Slips
          </Button>
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