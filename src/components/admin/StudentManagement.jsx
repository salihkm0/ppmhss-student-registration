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
  Card,
  CardContent,
  Divider,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Switch,
  FormControlLabel,
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
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [rooms, setRooms] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [softDeleteDialogOpen, setSoftDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchRoomDistribution();
  }, [page, rowsPerPage, classFilter, roomFilter, search, showDeleted]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(classFilter && { class: classFilter }),
        ...(roomFilter && { room: roomFilter }),
        ...(showDeleted && { showDeleted: true }),
      };

      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/students",
        {
          headers: { "x-auth-token": token },
          params,
        },
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

  const fetchRoomDistribution = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/students/room-distribution",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        const roomNumbers = response.data.data.distribution
          .map((room) => room.roomNo)
          .sort((a, b) => a - b);
        setRooms(roomNumbers);
      }
    } catch (error) {
      console.error("Error fetching room distribution:", error);
    }
  };

  const fetchDeletedStudents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/students/deleted",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setDeletedStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching deleted students:", error);
      toast.error("Failed to load deleted students");
    }
  };

  const handleSoftDelete = async (studentId, studentName) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setDeleteReason("");
    setSoftDeleteDialogOpen(true);
  };

  const confirmSoftDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `https://apinmea.oxiumev.com/api/admin/students/soft-delete/${studentToDelete.id}`,
        {
          headers: { "x-auth-token": token },
          data: { reason: deleteReason },
        },
      );

      if (response.data.success) {
        toast.success("Student soft deleted successfully");
        setSoftDeleteDialogOpen(false);
        fetchStudents();
        fetchDeletedStudents();
        if (dialogOpen) setDialogOpen(false);
        if (editDialogOpen) setEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error soft deleting student:", error);
      toast.error(error.response?.data?.error || "Failed to delete student");
    }
  };

  const handleRestoreStudent = async (studentId) => {
    if (
      !window.confirm(
        "Are you sure you want to restore this student? The student will be visible in regular views again.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/admin/students/restore/${studentId}`,
        {},
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Student restored successfully");
        fetchStudents();
        fetchDeletedStudents();
      }
    } catch (error) {
      console.error("Error restoring student:", error);
      toast.error(error.response?.data?.error || "Failed to restore student");
    }
  };

  const handleHardDelete = async (studentId, studentName) => {
    if (
      !window.confirm(
        `⚠️ WARNING: Are you sure you want to permanently delete ${studentName}?\n\nThis action cannot be undone and will permanently remove all student data from the database.`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `https://apinmea.oxiumev.com/api/admin/students/hard-delete/${studentId}`,
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Student permanently deleted");
        fetchDeletedStudents();
      }
    } catch (error) {
      console.error("Error hard deleting student:", error);
      toast.error(error.response?.data?.error || "Failed to delete student");
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = showDeleted ? { showDeleted: true } : {};
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/export",
        {
          headers: { "x-auth-token": token },
          params,
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = showDeleted
        ? `students_with_deleted_${format(new Date(), "yyyy-MM-dd")}.csv`
        : `students_${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.setAttribute("download", filename);
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

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    // Initialize form with ONLY the fields present in schema
    setEditFormData({
      name: student.name || "",
      fatherName: student.fatherName || "",
      aadhaarNo: student.aadhaarNo || "",
      phoneNo: student.phoneNo || "",
      gender: student.gender || "",
      schoolName: student.schoolName || "",
      studyingClass: student.studyingClass || "",
      medium: student.medium || "",
      subDistrict: student.subDistrict || "",
      address: {
        houseName: student.address?.houseName || "",
        place: student.address?.place || "",
        postOffice: student.address?.postOffice || "",
        village: student.address?.village || "",
        pinCode: student.address?.pinCode || "",
        localBodyName: student.address?.localBodyName || "",
        localBodyType: student.address?.localBodyType || "",
      },
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested fields (address)
      const [parent, child] = name.split(".");
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateEditForm = () => {
    // Required fields validation (exactly as per schema)
    const requiredFields = [
      "name",
      "fatherName",
      "aadhaarNo",
      "phoneNo",
      "gender",
      "schoolName",
      "studyingClass",
      "medium",
      "subDistrict",
    ];

    for (const field of requiredFields) {
      if (!editFormData[field] || editFormData[field].trim() === "") {
        toast.error(
          `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`,
        );
        return false;
      }
    }

    // Address required fields
    const addressRequiredFields = [
      "houseName",
      "place",
      "postOffice",
      "village",
      "pinCode",
      "localBodyName",
      "localBodyType",
    ];

    if (editFormData.address) {
      for (const field of addressRequiredFields) {
        if (
          !editFormData.address[field] ||
          editFormData.address[field].trim() === ""
        ) {
          toast.error(
            `Address ${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`,
          );
          return false;
        }
      }
    }

    // Aadhaar validation (12 digits)
    if (!/^\d{12}$/.test(editFormData.aadhaarNo)) {
      toast.error("Aadhaar number must be exactly 12 digits");
      return false;
    }

    // Phone validation (10 digits)
    if (!/^\d{10}$/.test(editFormData.phoneNo)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    // PIN code validation (6 digits)
    if (
      editFormData.address?.pinCode &&
      !/^\d{6}$/.test(editFormData.address.pinCode)
    ) {
      toast.error("PIN code must be exactly 6 digits");
      return false;
    }

    // SubDistrict validation
    const validSubDistricts = [
      "kondotty",
      "manjeri",
      "kizhisseri",
      "vengara",
      "areekode",
      "malappuram",
      "",
    ];
    if (!validSubDistricts.includes(editFormData.subDistrict)) {
      toast.error("Please select a valid sub-district");
      return false;
    }

    return true;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem("adminToken");

      // Prepare update data - ONLY fields present in schema
      const updateData = {};

      // Basic fields that can be edited
      const basicFields = [
        "name",
        "fatherName",
        "aadhaarNo",
        "phoneNo",
        "gender",
        "schoolName",
        "studyingClass",
        "medium",
        "subDistrict",
      ];

      basicFields.forEach((field) => {
        if (editFormData[field] !== selectedStudent[field]) {
          updateData[field] = editFormData[field];
        }
      });

      // IMPORTANT FIX: Always send the complete address object if any address field changed
      // or if address fields are required by validation
      const addressChanged = false;
      const currentAddress = editFormData.address || {};
      const originalAddress = selectedStudent.address || {};

      // Check if any address field changed
      const addressFields = [
        "houseName",
        "place",
        "postOffice",
        "village",
        "pinCode",
        "localBodyName",
        "localBodyType",
      ];

      let hasAddressChanges = false;
      const addressUpdate = {};

      addressFields.forEach((field) => {
        if (currentAddress[field] !== originalAddress[field]) {
          addressUpdate[field] = currentAddress[field];
          hasAddressChanges = true;
        }
      });

      // If any address field changed, send the COMPLETE address object
      // to satisfy backend validation that requires all fields
      if (hasAddressChanges) {
        // Send the complete address object with all current values
        updateData.address = {
          houseName: currentAddress.houseName || "",
          place: currentAddress.place || "",
          postOffice: currentAddress.postOffice || "",
          village: currentAddress.village || "",
          pinCode: currentAddress.pinCode || "",
          localBodyName: currentAddress.localBodyName || "",
          localBodyType: currentAddress.localBodyType || "",
        };
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        toast.error("No changes to update");
        setEditLoading(false);
        return;
      }

      console.log("Sending update data:", JSON.stringify(updateData, null, 2)); // For debugging

      const response = await axios.put(
        `https://apinmea.oxiumev.com/api/admin/students/${selectedStudent._id}`,
        updateData,
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Student updated successfully");
        setEditDialogOpen(false);
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating student:", error);
      console.error("Error response:", error.response?.data); // Log full error
      toast.error(error.response?.data?.error || "Failed to update student");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDownloadHallTicket = (registrationCode) => {
    window.open(
      `https://apinmea.oxiumev.com/api/students/${registrationCode}/hallticket/download`,
      "_blank",
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy hh:mm a");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Registered":
        return "primary";
      case "Exam Completed":
        return "warning";
      case "Result Published":
        return "success";
      default:
        return "default";
    }
  };

  const getResultColor = (resultStatus) => {
    switch (resultStatus) {
      case "Passed":
        return "success";
      case "Failed":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Male":
        return <MaleIcon fontSize="small" />;
      case "Female":
        return <FemaleIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Student Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Tabs for Active/Deleted Students */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={`Active Students (${students.length})`}
            onClick={() => setShowDeleted(false)}
          />
          <Tab
            label="Deleted Students"
            onClick={() => {
              setShowDeleted(true);
              fetchDeletedStudents();
            }}
          />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, registration code, phone, or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
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
                {["7", "8", "9", "10", "11", "12"].map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    Class {cls}
                  </MenuItem>
                ))}
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
                disabled={rooms.length === 0}
              >
                <MenuItem value="">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room} value={room}>
                    Room {room}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch("");
                setClassFilter("");
                setRoomFilter("");
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : showDeleted ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fff3e0" }}>
                <TableCell>Student</TableCell>
                <TableCell>Deleted Info</TableCell>
                <TableCell>Original Details</TableCell>
                {/* <TableCell align="center">Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {deletedStudents.map((student) => (
                <TableRow key={student._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#ff9800" }}>
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
                    <Typography variant="body2" color="error">
                      Deleted on: {formatDate(student.deletedAt)}
                    </Typography>
                    {student.deleteReason && (
                      <Typography variant="caption" color="text.secondary">
                        Reason: {student.deleteReason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.registrationCode}
                      size="small"
                      sx={{ mb: 1, fontFamily: "monospace" }}
                    />
                    <Typography variant="body2">
                      Class {student.studyingClass}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Room {student.roomNo}, Seat {student.seatNo}
                    </Typography>
                  </TableCell>
                  {/* <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Restore Student">
                        <IconButton
                          size="small"
                          onClick={() => handleRestoreStudent(student._id)}
                          color="success"
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Permanently Delete">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleHardDelete(student._id, student.name)
                          }
                          color="error"
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell> */}
                </TableRow>
              ))}
              {deletedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No deleted students found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "#2563eb" }}>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {student.phoneNo}
                        </Typography>
                      </Box>
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
                      <Typography variant="body2">
                        {student.schoolName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Medium: {student.medium}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.registrationCode}
                        size="small"
                        sx={{ mb: 1, fontFamily: "monospace" }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
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
                      <Chip
                        label={student.status}
                        size="small"
                        color={getStatusColor(student.status)}
                        sx={{ mt: 1 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(student)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Student">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(student)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Hall Ticket">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDownloadHallTicket(student.registrationCode)
                            }
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Soft Delete">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleSoftDelete(student._id, student.name)
                            }
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No students found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
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
        </>
      )}

      {/* Student Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  {selectedStudent.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedStudent.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedStudent.registrationCode}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Full Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Gender
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getGenderIcon(selectedStudent.gender)}
                            <Typography variant="body1">
                              {selectedStudent.gender}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Father's Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.fatherName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Aadhaar Number
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body1" fontFamily="monospace">
                              {selectedStudent.aadhaarNo}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                copyToClipboard(selectedStudent.aadhaarNo)
                              }
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Phone Number
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                              {selectedStudent.phoneNo}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                copyToClipboard(selectedStudent.phoneNo)
                              }
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.address?.houseName},{" "}
                            {selectedStudent.address?.place}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedStudent.address?.postOffice},{" "}
                            {selectedStudent.address?.village},{" "}
                            {selectedStudent.address?.pinCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedStudent.address?.localBodyName} (
                            {selectedStudent.address?.localBodyType})
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Academic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Academic Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            School Name
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <SchoolIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                              {selectedStudent.schoolName}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Class
                          </Typography>
                          <Typography variant="body1">
                            Class {selectedStudent.studyingClass}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Medium
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.medium}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Sub District
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {selectedStudent.subDistrict || "Not specified"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Exam Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Exam Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Room Number
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <RoomIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                              {selectedStudent.roomNo}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Seat Number
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.seatNo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Application No
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {selectedStudent.applicationNo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={selectedStudent.status}
                            color={getStatusColor(selectedStudent.status)}
                            size="small"
                          />
                        </Grid>
                        {selectedStudent.examMarks > 0 && (
                          <>
                            <Grid item xs={12} md={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Exam Marks
                              </Typography>
                              <Typography variant="body1">
                                {selectedStudent.examMarks} /{" "}
                                {selectedStudent.totalMarks}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Result Status
                              </Typography>
                              <Chip
                                label={selectedStudent.resultStatus}
                                color={getResultColor(
                                  selectedStudent.resultStatus,
                                )}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Rank
                              </Typography>
                              <Typography variant="body1">
                                {selectedStudent.rank > 0
                                  ? `#${selectedStudent.rank}`
                                  : "Not Ranked"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Scholarship
                              </Typography>
                              <Chip
                                label={
                                  selectedStudent.scholarship ||
                                  "No Scholarship"
                                }
                                color={
                                  selectedStudent.scholarship
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                IAS Coaching
                              </Typography>
                              <Chip
                                label={
                                  selectedStudent.iasCoaching ? "Yes" : "No"
                                }
                                color={
                                  selectedStudent.iasCoaching
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            </Grid>
                          </>
                        )}
                        {selectedStudent.remarks && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Remarks
                            </Typography>
                            <Typography variant="body2">
                              {selectedStudent.remarks}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Registration Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Registration Details
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Registration Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedStudent.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Last Updated
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedStudent.updatedAt)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setDialogOpen(false);
                  handleEditClick(selectedStudent);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownloadHallTicket(selectedStudent.registrationCode)
                }
              >
                Download Hall Ticket
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  handleSoftDelete(selectedStudent._id, selectedStudent.name)
                }
              >
                Delete
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  {selectedStudent.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Edit Student: {selectedStudent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Reg: {selectedStudent.registrationCode} | Room{" "}
                    {selectedStudent.roomNo}, Seat {selectedStudent.seatNo}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Note:</strong> Only basic details can be edited. Room
                number, seat number, registration code, application number, exam
                marks, result status, rank, scholarship and IAS coaching are
                system-generated and cannot be modified.
              </Alert>

              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              name="gender"
                              value={editFormData.gender}
                              onChange={handleEditFormChange}
                              label="Gender"
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Father's Name"
                            name="fatherName"
                            value={editFormData.fatherName}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Aadhaar Number"
                            name="aadhaarNo"
                            value={editFormData.aadhaarNo}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                            inputProps={{ maxLength: 12 }}
                            helperText="12 digits only"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            name="phoneNo"
                            value={editFormData.phoneNo}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                            inputProps={{ maxLength: 10 }}
                            helperText="10 digits only"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="House Name"
                            name="address.houseName"
                            value={editFormData.address?.houseName || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Place"
                            name="address.place"
                            value={editFormData.address?.place || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Post Office"
                            name="address.postOffice"
                            value={editFormData.address?.postOffice || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Village"
                            name="address.village"
                            value={editFormData.address?.village || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="PIN Code"
                            name="address.pinCode"
                            value={editFormData.address?.pinCode || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                            inputProps={{ maxLength: 6 }}
                            helperText="6 digits only"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Local Body Type</InputLabel>
                            <Select
                              name="address.localBodyType"
                              value={editFormData.address?.localBodyType || ""}
                              onChange={handleEditFormChange}
                              label="Local Body Type"
                            >
                              <MenuItem value="Municipality">
                                Municipality
                              </MenuItem>
                              <MenuItem value="Corporation">
                                Corporation
                              </MenuItem>
                              <MenuItem value="Panchayat">Panchayat</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Local Body Name"
                            name="address.localBodyName"
                            value={editFormData.address?.localBodyName || ""}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Academic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Academic Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="School Name"
                            name="schoolName"
                            value={editFormData.schoolName}
                            onChange={handleEditFormChange}
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Class</InputLabel>
                            <Select
                              name="studyingClass"
                              value={editFormData.studyingClass}
                              onChange={handleEditFormChange}
                              label="Class"
                            >
                              {["7"].map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                  Class {cls}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Medium</InputLabel>
                            <Select
                              name="medium"
                              value={editFormData.medium}
                              onChange={handleEditFormChange}
                              label="Medium"
                            >
                              <MenuItem value="English">English</MenuItem>
                              <MenuItem value="Malayalam">Malayalam</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Sub District</InputLabel>
                            <Select
                              name="subDistrict"
                              value={editFormData.subDistrict}
                              onChange={handleEditFormChange}
                              label="Sub District"
                            >
                              <MenuItem value="kondotty">Kondotty</MenuItem>
                              <MenuItem value="manjeri">Manjeri</MenuItem>
                              <MenuItem value="kizhisseri">Kizhisseri</MenuItem>
                              <MenuItem value="vengara">Vengara</MenuItem>
                              <MenuItem value="areekode">Areekode</MenuItem>
                              <MenuItem value="malappuram">Malappuram</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* System Information (Read Only) */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    System Information (Read Only)
                  </Typography>
                  <Card variant="outlined" sx={{ bgcolor: "#f5f5f5" }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Registration Code
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {selectedStudent.registrationCode}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Application No
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {selectedStudent.applicationNo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Room / Seat
                          </Typography>
                          <Typography variant="body2">
                            Room {selectedStudent.roomNo} | Seat{" "}
                            {selectedStudent.seatNo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Registration Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(selectedStudent.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={selectedStudent.status}
                            size="small"
                            color={
                              selectedStudent.status === "Registered"
                                ? "primary"
                                : "default"
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleEditSubmit}
                disabled={editLoading}
                startIcon={editLoading ? <CircularProgress size={20} /> : null}
              >
                {editLoading ? "Updating..." : "Update Student"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Soft Delete Confirmation Dialog */}
      <Dialog
        open={softDeleteDialogOpen}
        onClose={() => setSoftDeleteDialogOpen(false)}
      >
        <DialogTitle>Soft Delete Student</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to soft delete{" "}
            <strong>{studentToDelete?.name}</strong>. This will hide the student
            from regular views but keep the data for recovery.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for deletion (optional)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Enter reason for deleting this student..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSoftDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmSoftDelete}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;
