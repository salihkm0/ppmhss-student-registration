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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  EmojiEvents as MedalIcon,
  TrendingUp as TrendingUpIcon,
  MilitaryTech as ScholarshipIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as PremiumIcon,
  Numbers as NumbersIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Celebration as CelebrationIcon,
  SentimentVeryDissatisfied as SadIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ResultsManagement = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRanks, setGeneratingRanks] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    selectedStudents: 0,
    notSelectedStudents: 0,
    iasEligible: 0,
    selectionPercentage: 0
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // New state for mark management
  const [tabValue, setTabValue] = useState(0);
  const [studentsByStatus, setStudentsByStatus] = useState([]);
  const [roomSummary, setRoomSummary] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMarksDialog, setEditMarksDialog] = useState(false);
  const [editMarksValue, setEditMarksValue] = useState("");
  const [historyDialog, setHistoryDialog] = useState(false);
  const [studentHistory, setStudentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [roomFilter, setRoomFilter] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [finalizingId, setFinalizingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchTopPerformers();
    fetchResultStats();
    fetchRooms();
  }, [refreshTrigger]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchStudentsByStatus();
      fetchRoomSummary();
    }
  }, [tabValue, statusFilter, roomFilter, refreshTrigger]);

  const fetchTopPerformers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/results/top-performers",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setTopPerformers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching top performers:", error);
      toast.error("Failed to load top performers");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/results/top",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        const apiStats = response.data.data.statistics || {};
        
        // Map API response to component state
        setStats({
          totalStudents: apiStats.totalStudents || 0,
          selectedStudents: apiStats.selectedStudents || apiStats.passedStudents || 0,
          notSelectedStudents: apiStats.notSelectedStudents || apiStats.failedStudents || 0,
          iasEligible: apiStats.iasEligible || 0,
          selectionPercentage: apiStats.selectionPercentage || apiStats.passPercentage || 0
        });
      }
    } catch (error) {
      console.error("Error fetching result stats:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/rooms/available",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        const allRooms = response.data.data.allRooms || [];
        setRooms(allRooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchStudentsByStatus = async () => {
    setLoadingStatus(true);
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (roomFilter) params.append("roomNo", roomFilter);

      const response = await axios.get(
        `https://apinmea.oxiumev.com/api/admin/marks/students?${params.toString()}`,
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setStudentsByStatus(response.data.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students by status:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchRoomSummary = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/marks/room-summary",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setRoomSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching room summary:", error);
    }
  };

  const fetchStudentHistory = async (studentId) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `https://apinmea.oxiumev.com/api/admin/marks/students/${studentId}/history`,
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setStudentHistory(response.data.data);
        setHistoryDialog(true);
      }
    } catch (error) {
      console.error("Error fetching student history:", error);
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEditMarks = (student) => {
    setSelectedStudent(student);
    setEditMarksValue(student.examMarks?.toString() || "");
    setEditMarksDialog(true);
  };

  const handleSaveEditedMarks = async () => {
    if (!selectedStudent) return;

    const marks = parseInt(editMarksValue);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      toast.error("Please enter valid marks between 0-100");
      return;
    }

    setSavingMarks(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `https://apinmea.oxiumev.com/api/admin/marks/students/${selectedStudent._id}`,
        { marks },
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Marks updated successfully");
        setEditMarksDialog(false);
        // Trigger refresh of all data
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating marks:", error);
      toast.error(error.response?.data?.error || "Failed to update marks");
    } finally {
      setSavingMarks(false);
    }
  };

  const handleFinalizeMarks = async (studentId) => {
    setFinalizingId(studentId);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/admin/marks/students/${studentId}/finalize`,
        {},
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Marks finalized successfully");
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error finalizing marks:", error);
      toast.error(error.response?.data?.error || "Failed to finalize marks");
    } finally {
      setFinalizingId(null);
    }
  };

  const handleGenerateRanks = async () => {
    // First check if there are any draft marks
    try {
      const token = localStorage.getItem("adminToken");
      const draftCheck = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/marks/students?status=draft",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (
        draftCheck.data.success &&
        draftCheck.data.data.students?.length > 0
      ) {
        toast.error(
          `Cannot generate ranks: ${draftCheck.data.data.students.length} students still have draft marks. Please ensure all marks are submitted first.`,
        );
        return;
      }
    } catch (error) {
      console.error("Error checking draft marks:", error);
    }

    if (
      !window.confirm(
        "Are you sure you want to generate ranks? This will:\n\n• Assign ranks to all students with submitted marks\n• Use name-based tie-breaking for same marks\n• Award scholarships to top 3\n• Mark IAS coaching eligibility for top 100 with 15+ marks\n• Update result statuses\n\nRoom and seat numbers will NOT be changed.",
      )
    ) {
      return;
    }

    setGeneratingRanks(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "https://apinmea.oxiumev.com/api/admin/results/update-ranks",
        {},
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setGenerationResult(response.data);
        toast.success(response.data.message);
        setRefreshTrigger(prev => prev + 1);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating ranks:", error);
      toast.error(error.response?.data?.error || "Failed to generate ranks");
    } finally {
      setGeneratingRanks(false);
    }
  };

  // Helper function to check if student is selected (marks >= 15)
  const isStudentSelected = (student) => {
    return (student.examMarks || 0) >= 15;
  };

  // Helper function to check IAS eligibility (rank <= 100 AND marks >= 15)
  const isIASEligible = (student) => {
    return (student.rank || 999) <= 100 && (student.examMarks || 0) >= 15;
  };

  const getMedalIcon = (rank) => {
    if (rank === 1)
      return <MedalIcon sx={{ color: "#FFD700", fontSize: 24 }} />;
    if (rank === 2)
      return <MedalIcon sx={{ color: "#C0C0C0", fontSize: 24 }} />;
    if (rank === 3)
      return <MedalIcon sx={{ color: "#CD7F32", fontSize: 24 }} />;
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "#e0e0e0",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {rank}
        </Typography>
      </Box>
    );
  };

  const getScholarshipChip = (scholarship) => {
    switch (scholarship) {
      case "Gold":
        return (
          <Chip
            label="Gold Scholarship"
            color="warning"
            size="small"
            icon={<ScholarshipIcon />}
          />
        );
      case "Silver":
        return (
          <Chip
            label="Silver Scholarship"
            size="small"
            icon={<ScholarshipIcon />}
            sx={{ bgcolor: "#C0C0C0", color: "#000" }}
          />
        );
      case "Bronze":
        return (
          <Chip
            label="Bronze Scholarship"
            color="secondary"
            size="small"
            icon={<ScholarshipIcon />}
          />
        );
      default:
        return <Chip label="No Scholarship" size="small" variant="outlined" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return (
          <Chip
            label="Pending"
            color="warning"
            size="small"
            icon={<WarningIcon />}
          />
        );
      case "draft":
        return (
          <Chip label="Draft" color="info" size="small" icon={<EditIcon />} />
        );
      case "submitted":
        return (
          <Chip
            label="Submitted"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
          />
        );
      case "final":
        return (
          <Chip
            label="Final"
            color="secondary"
            size="small"
            icon={<LockIcon />}
          />
        );
      default:
        return <Chip label={status || "Unknown"} size="small" />;
    }
  };

  const getSelectionChip = (student) => {
    return (student.examMarks || 0) >= 15 ? (
      <Chip
        label="SELECTED"
        color="success"
        size="small"
        icon={<CelebrationIcon />}
      />
    ) : (
      <Chip label="NOT SELECTED" size="small" icon={<SadIcon />} />
    );
  };

  const getIASChip = (student) => {
    const eligible = (student.rank || 999) <= 100 && (student.examMarks || 0) >= 15;
    return eligible ? (
      <Chip
        label="ELIGIBLE"
        color="success"
        size="small"
        icon={<CheckCircleIcon />}
      />
    ) : (
      <Chip label="NOT ELIGIBLE" size="small" icon={<CancelIcon />} />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Results Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage marks, generate ranks, and view results
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={
            generatingRanks ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={handleGenerateRanks}
          disabled={generatingRanks}
          color="primary"
          size="large"
        >
          {generatingRanks ? "Generating Ranks..." : "Generate Ranks"}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <NumbersIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Students
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Selected (15+ Marks)
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats?.selectedStudents || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Eligible for Butterfly Workshop
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PremiumIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  IAS Eligible
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {stats?.iasEligible || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Top 100 with 15+ marks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Not Selected
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {stats?.notSelectedStudents || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Below 15 marks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label="Top Performers"
            icon={<MedalIcon />}
            iconPosition="start"
          />
          <Tab
            label="Mark Management"
            icon={<EditIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        /* Top Performers Table */
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="h6" fontWeight={600}>
              Top 20 Performers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sorted by rank (based on exam marks with name-based tie-breaking)
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell width="80">Rank</TableCell>
                  <TableCell>Student Details</TableCell>
                  <TableCell width="120">Marks</TableCell>
                  <TableCell width="150">Percentage</TableCell>
                  <TableCell width="150">Scholarship</TableCell>
                  <TableCell width="150">Selection</TableCell>
                  <TableCell width="150">IAS Coaching</TableCell>
                  <TableCell width="120">Room/Seat</TableCell>
                  <TableCell width="100">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No top performers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topPerformers.slice(0, 20).map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getMedalIcon(student.rank)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar sx={{ bgcolor: "#2563eb" }}>
                            {student.name?.charAt(0) || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {student.name || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {student.registrationCode || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.schoolName || "N/A"} • Class {student.studyingClass || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.examMarks || 0}/{student.totalMarks || 50}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={((student.examMarks || 0) / (student.totalMarks || 50)) * 100}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" fontWeight={600} width={40}>
                            {(
                              ((student.examMarks || 0) / (student.totalMarks || 50)) *
                              100
                            ).toFixed(1)}
                            %
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getScholarshipChip(student.scholarship)}
                      </TableCell>
                      <TableCell>{getSelectionChip(student)}</TableCell>
                      <TableCell>{getIASChip(student)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          Room {student.roomNo || "N/A"} • Seat {student.seatNo || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(student.markEntryStatus)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        /* Mark Management View */
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="final">Final</MenuItem>
                    <MenuItem value="">All</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Room Filter</InputLabel>
                  <Select
                    value={roomFilter}
                    label="Room Filter"
                    onChange={(e) => setRoomFilter(e.target.value)}
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
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  fullWidth
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Students Table */}
          <Paper>
            <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
              <Typography variant="h6" fontWeight={600}>
                Students by Mark Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and edit marks before rank generation
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Room</TableCell>
                    <TableCell>Seat</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Registration</TableCell>
                    <TableCell>Current Marks</TableCell>
                    <TableCell>Selection</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Edited</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingStatus ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : studentsByStatus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No students found with the selected filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentsByStatus.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Chip label={student.roomNo || "N/A"} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={student.seatNo || "N/A"} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{ bgcolor: "#2563eb", width: 32, height: 32 }}
                            >
                              {student.name?.charAt(0) || "?"}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {student.name || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {student.registrationCode || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {student.examMarks || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>{getSelectionChip(student)}</TableCell>
                        <TableCell>
                          {getStatusChip(student.markEntryStatus)}
                        </TableCell>
                        <TableCell>
                          {student.lastEditedAt ? (
                            <Typography variant="caption">
                              {new Date(student.lastEditedAt).toLocaleString()}
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Never
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit Marks">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditMarks(student)}
                                disabled={student.markEntryStatus === "final"}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View History">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => fetchStudentHistory(student._id)}
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {student.markEntryStatus === "submitted" && (
                              <Tooltip title="Finalize Marks">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() =>
                                    handleFinalizeMarks(student._id)
                                  }
                                  disabled={finalizingId === student._id}
                                >
                                  {finalizingId === student._id ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <LockIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Scholarship Winners */}
      {topPerformers.filter((s) => s.scholarship && s.scholarship !== "Not Eligible" && s.scholarship !== "").length > 0 &&
        tabValue === 0 && (
          <Paper sx={{ mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
              <Typography variant="h6" fontWeight={600}>
                Scholarship Winners
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top 3 performers receiving scholarships
              </Typography>
            </Box>
            <Grid container spacing={3} sx={{ p: 3 }}>
              {topPerformers
                .filter((s) => s.scholarship && s.scholarship !== "Not Eligible" && s.scholarship !== "")
                .sort((a, b) => {
                  // Sort by scholarship type (Gold, Silver, Bronze)
                  const scholarshipOrder = { Gold: 1, Silver: 2, Bronze: 3 };
                  return (
                    scholarshipOrder[a.scholarship] -
                    scholarshipOrder[b.scholarship]
                  );
                })
                .slice(0, 3) // Ensure only top 3
                .map((student) => (
                  <Grid item xs={12} md={4} key={student._id}>
                    <Card
                      sx={{
                        textAlign: "center",
                        border: `2px solid ${
                          student.scholarship === "Gold"
                            ? "#FFD700"
                            : student.scholarship === "Silver"
                              ? "#C0C0C0"
                              : "#CD7F32"
                        }`,
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 2,
                            fontSize: "2rem",
                            bgcolor:
                              student.scholarship === "Gold"
                                ? "#FFD700"
                                : student.scholarship === "Silver"
                                  ? "#C0C0C0"
                                  : "#CD7F32",
                          }}
                        >
                          {student.name?.charAt(0) || "?"}
                        </Avatar>
                        <Chip
                          label={`${student.scholarship} Medal`}
                          color={
                            student.scholarship === "Gold"
                              ? "warning"
                              : student.scholarship === "Silver"
                                ? "default"
                                : "secondary"
                          }
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="h6" fontWeight={600}>
                          {student.name || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.registrationCode || "N/A"}
                        </Typography>
                        <Box sx={{ my: 3 }}>
                          <Typography
                            variant="h4"
                            fontWeight={600}
                            sx={{ mb: 1 }}
                          >
                            {student.examMarks || 0} / {student.totalMarks || 50}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.schoolName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Class {student.studyingClass || "N/A"}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Room {student.roomNo || "N/A"} • Seat {student.seatNo || "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        )}

      {/* Edit Marks Dialog */}
      <Dialog
        open={editMarksDialog}
        onClose={() => setEditMarksDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon color="primary" />
            Edit Marks - {selectedStudent?.name || "Student"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Current Status: {selectedStudent?.markEntryStatus || "Unknown"}
          </Alert>
          <TextField
            fullWidth
            label="Enter Marks (0-100)"
            type="number"
            value={editMarksValue}
            onChange={(e) => setEditMarksValue(e.target.value)}
            inputProps={{ min: 0, max: 100 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMarksDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEditedMarks}
            disabled={savingMarks}
            startIcon={
              savingMarks ? <CircularProgress size={20} /> : <SaveIcon />
            }
          >
            {savingMarks ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon color="info" />
            Mark Edit History
          </Box>
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {studentHistory?.student?.name || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registration: {studentHistory?.student?.registrationCode || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Marks: {studentHistory?.student?.currentMarks || 0} |
                  Status: {studentHistory?.student?.currentStatus || "N/A"}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {!studentHistory?.history || studentHistory.history.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No history available
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date/Time</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Previous</TableCell>
                        <TableCell>Edited By</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentHistory.history.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {entry.editedAt ? new Date(entry.editedAt).toLocaleString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.action || "N/A"}
                              size="small"
                              color={
                                entry.action === "entered"
                                  ? "default"
                                  : entry.action === "updated"
                                    ? "info"
                                    : entry.action === "submitted"
                                      ? "success"
                                      : "secondary"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {entry.marks || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>{entry.previousMarks || "-"}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {entry.editedBy || "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {entry.editedByModel || "N/A"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.status || "N/A"}
                              size="small"
                              color={
                                entry.status === "draft"
                                  ? "info"
                                  : entry.status === "submitted"
                                    ? "success"
                                    : entry.status === "final"
                                      ? "secondary"
                                      : "default"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Rank Generation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon color="success" />
            Ranks Generated Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          {generationResult && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                {generationResult.message}
              </Typography>
            </Alert>
          )}
          <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Summary:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>Top 3 students awarded scholarships</li>
              <li>Top 100 students with 15+ marks eligible for IAS coaching</li>
              <li>Students with 15+ marks selected for Butterfly Workshop</li>
              <li>Name-based tie-breaking applied for same marks</li>
              <li>Room and seat numbers preserved</li>
              <li>Result statuses updated</li>
            </Box>
          </Box>
          {generationResult?.data?.updatedCount && (
            <Typography variant="body2" color="text.secondary">
              Updated <strong>{generationResult.data.updatedCount}</strong>{" "}
              student records
            </Typography>
          )}
          {generationResult?.data?.iasDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                IAS Coaching Cutoff: <strong>{generationResult.data.iasDetails.iasCoachingCutoff || 0}</strong> marks
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultsManagement;