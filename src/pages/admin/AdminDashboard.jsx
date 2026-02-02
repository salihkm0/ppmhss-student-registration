import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Fade,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as OtherIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Numbers as NumbersIcon,
  Room as RoomIcon,
  EventSeat as SeatIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DateRange as DateIcon,
  LocationOn as LocationIcon,
  ChevronRight as ChevronRightIcon,
  CloudDownload as CloudDownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Language as LanguageIcon,
  Map as MapIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [classFilter, setClassFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [roomChartData, setRoomChartData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [downloadingRoom, setDownloadingRoom] = useState(null);

  // Simple, professional color scheme
  const COLORS = ["#667eea", "#4caf50", "#ff9800", "#9c27b0", "#2196f3", "#f44336"];

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
  }, [page, rowsPerPage, classFilter, roomFilter, search]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://ppmhss-student-registration-backend.onrender.com/api/admin/dashboard/stats",
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        setStats(response.data);

        if (response.data.stats.class) {
          const chartData = response.data.stats.class.map((item) => ({
            name: `Class ${item._id}`,
            students: item.count,
          }));
          setChartData(chartData);
        }

        if (response.data.stats.rooms) {
          const roomData = response.data.stats.rooms.map((item) => ({
            name: `Room ${item._id}`,
            students: item.count,
            capacity: 20,
          }));
          setRoomChartData(roomData);
        }

        setTotalStudents(response.data.stats.total || 0);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const calculateQuickStats = () => {
    if (!stats || !stats.recent) return { todayRegistrations: 0, avgRegistrations: 0, completionRate: 92 };

    const todayRegistrations = stats.recent.filter(
      (s) => new Date(s.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return {
      todayRegistrations,
      avgRegistrations: Math.round(todayRegistrations),
      completionRate: Math.min(100, Math.round((totalStudents / 500) * 100)) // Assuming 500 max capacity
    };
  };

  const quickStats = calculateQuickStats();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let searchQuery = "";
      if (search) {
        switch (searchType) {
          case "phone":
            searchQuery = search;
            break;
          case "registration":
            searchQuery = search;
            break;
          case "room":
            searchQuery = search;
            break;
          default:
            searchQuery = search;
        }
      }

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(classFilter && { class: classFilter }),
        ...(roomFilter && { room: roomFilter }),
      };

      const response = await axios.get(
        "https://ppmhss-student-registration-backend.onrender.com/api/admin/students",
        {
          headers: { "x-auth-token": token },
          params,
        },
      );

      if (response.data.success) {
        setStudents(response.data.data);
        if (response.data.pagination) {
          setTotalStudents(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
    toast.success("Logged out successfully");
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        'https://ppmhss-student-registration-backend.onrender.com/api/admin/export',
        {
          headers: { 'x-auth-token': token },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearch("");
    setPage(0);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `https://ppmhss-student-registration-backend.onrender.com/api/admin/students/${studentId}`,
        {
          headers: { "x-auth-token": token },
        },
      );

      if (response.data.success) {
        toast.success("Student deleted successfully");
        fetchStudents();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleDownloadHallTicket = (registrationCode) => {
    window.open(
      `https://ppmhss-student-registration-backend.onrender.com/api/students/${registrationCode}/hallticket/download`,
      "_blank",
    );
  };

  const handleDownloadAttendanceSheet = async (roomNo) => {
    try {
      setDownloadingRoom(roomNo);

      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Please login again');
        handleLogout();
        return;
      }

      const response = await axios.get(
        `https://ppmhss-student-registration-backend.onrender.com/api/admin/room-attendance/${roomNo}/pdf`,
        {
          headers: {
            'x-auth-token': token,
            'Accept': 'text/html'
          },
          responseType: 'text'
        }
      );

      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(response.data);
        newWindow.document.close();

        setTimeout(() => {
          newWindow.print();
        }, 1000);

        toast.success(`Attendance sheet for Room ${roomNo} opened for printing`);
      } else {
        toast.error('Please allow popups to view the attendance sheet');
      }

    } catch (error) {
      console.error('Error downloading attendance sheet:', error);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to generate attendance sheet');
        const token = localStorage.getItem('adminToken');
        const url = `https://ppmhss-student-registration-backend.onrender.com/api/admin/room-attendance/${roomNo}/pdf`;
        window.open(url, '_blank');
      }
    } finally {
      setDownloadingRoom(null);
    }
  };

  // 21-Slip Exam Sheet Function
  const handleDownloadExamSlips21 = async (roomNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = `https://ppmhss-student-registration-backend.onrender.com/api/admin/simple-exam-slips/${roomNo}?preview=false&print=true`;
      
      window.open(url, '_blank');
      toast.success(`Exam slips for Room ${roomNo} opened for printing`);
      
    } catch (error) {
      console.error('Error downloading exam slips:', error);
      toast.error('Failed to generate exam slips');
    }
  };

  const handleDownloadAllExamSlips21 = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = `https://ppmhss-student-registration-backend.onrender.com/api/admin/simple-exam-slips?all=true&preview=false&print=true`;
      
      window.open(url, '_blank');
      toast.success(`All exam slips opened for printing`);
      
    } catch (error) {
      console.error('Error downloading all exam slips:', error);
      toast.error('Failed to generate exam slips');
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Male":
        return <MaleIcon fontSize="small" />;
      case "Female":
        return <FemaleIcon fontSize="small" />;
      default:
        return <OtherIcon fontSize="small" />;
    }
  };

  // Clean, professional Stat Card Component
  const StatCard = ({
    title,
    value,
    icon,
    color = "#667eea",
    subtitle,
    onClick
  }) => (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
          borderColor: onClick ? color : '#e0e0e0',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                mb: 1,
                display: 'block'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: color,
                lineHeight: 1
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mt: 1
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
              borderRadius: 2,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Clean Room Card Component
  const RoomCard = ({ room, index }) => {
    const filledPercentage = (room.count / 20) * 100;

    return (
      <Fade in={true} timeout={300 + (index * 100)}>
        <Card
          sx={{
            height: '100%',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Room {room._id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: 20 seats
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: alpha('#667eea', 0.1),
                  color: '#667eea',
                  width: 40,
                  height: 40,
                }}
              >
                <RoomIcon />
              </Avatar>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Occupancy
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {room.count} / 20
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={filledPercentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: filledPercentage >= 90 ? '#f44336' :
                      filledPercentage >= 75 ? '#ff9800' :
                        '#4caf50',
                    borderRadius: 3,
                  }
                }}
              />
            </Box>

            <Grid container spacing={1} sx={{ mb: 2.5 }}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: '#f9f9f9',
                    borderRadius: 1.5,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Available
                  </Typography>
                  <Typography variant="h6" color="#4caf50" fontWeight={600}>
                    {20 - room.count}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: '#f9f9f9',
                    borderRadius: 1.5,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Occupied
                  </Typography>
                  <Typography variant="h6" color="#2196f3" fontWeight={600}>
                    {room.count}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Stack spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  setRoomFilter(room._id.toString());
                  setActiveTab(1);
                }}
                fullWidth
                sx={{
                  bgcolor: '#667eea',
                  color: 'white',
                  borderRadius: 1.5,
                  py: 0.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#5a6fd8',
                  }
                }}
              >
                View Students
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PdfIcon />}
                onClick={() => handleDownloadAttendanceSheet(room._id)}
                disabled={downloadingRoom === room._id}
                fullWidth
                sx={{
                  borderColor: '#ddd',
                  color: 'text.primary',
                  borderRadius: 1.5,
                  py: 0.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#667eea',
                    color: '#667eea',
                    bgcolor: alpha('#667eea', 0.04),
                  }
                }}
              >
                {downloadingRoom === room._id ? 'Downloading...' : 'Attendance Sheet'}
              </Button>
              
              {/* 21-Slip Exam Sheet Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<BadgeIcon />}
                onClick={() => handleDownloadExamSlips21(room._id)}
                fullWidth
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  borderRadius: 1.5,
                  py: 0.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#388e3c',
                    color: '#388e3c',
                    bgcolor: alpha('#4caf50', 0.04),
                  }
                }}
              >
                21-Slip Exam Sheet
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  if (loading && !stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f5f7fa',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '3px solid #e0e0e0',
              borderTopColor: '#667eea',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 3,
            }}
          />
          <Typography variant="h6" fontWeight={600}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f5f7fa',
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Paper
          sx={{
            mb: 4,
            borderRadius: 2,
            background: 'white',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: '#667eea',
                    }}
                  >
                    <DashboardIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Admin Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Manage student registrations and analytics
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={() => { fetchDashboardData(); fetchStudents(); }}
                      sx={{
                        color: '#667eea',
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Data">
                    <IconButton
                      onClick={handleExport}
                      sx={{
                        color: '#4caf50',
                      }}
                    >
                      <CloudDownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      color: '#f44336',
                      borderColor: '#f44336',
                      borderRadius: 1.5,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#d32f2f',
                        bgcolor: alpha('#f44336', 0.04),
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ px: 3, borderTop: '1px solid #e0e0e0' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  background: '#667eea',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minHeight: 60,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: '#667eea',
                  },
                }
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DashboardIcon />
                    Overview
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon />
                    Students
                    <Chip
                      label={totalStudents}
                      size="small"
                      sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600, ml: 1 }}
                    />
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoomIcon />
                    Rooms
                    <Chip
                      label={stats?.stats.rooms?.length || 0}
                      size="small"
                      sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600, ml: 1 }}
                    />
                  </Box>
                }
              />
            </Tabs>
          </Box>
        </Paper>

        {activeTab === 0 && (
          <>
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Students"
                  value={totalStudents}
                  icon={<PeopleIcon />}
                  color="#667eea"
                  subtitle="All registrations"
                  onClick={() => setActiveTab(1)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Rooms"
                  value={stats?.stats.rooms?.length || 0}
                  icon={<RoomIcon />}
                  color="#4caf50"
                  subtitle="Occupied rooms"
                  onClick={() => setActiveTab(2)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Today's Registrations"
                  value={quickStats.todayRegistrations}
                  icon={<TrendingUpIcon />}
                  color="#ff9800"
                  subtitle="Registered today"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Completion Rate"
                  value={`${quickStats.completionRate}%`}
                  icon={<CheckCircleIcon />}
                  color="#9c27b0"
                  subtitle="Registration progress"
                />
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={8}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Registration Analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily registration trends
                      </Typography>
                    </Box>
                    <Chip
                      label="Last 7 Days"
                      size="small"
                      icon={<DateIcon />}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stroke="#667eea"
                          fillOpacity={1}
                          fill="url(#colorStudents)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Gender Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Student gender distribution
                    </Typography>
                  </Box>
                  <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stats?.stats.gender && stats.stats.gender.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.stats.gender}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="_id" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value} students`, 'Count']}
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{
                              borderRadius: 6,
                              border: '1px solid #e0e0e0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              background: 'white',
                            }}
                          />
                          <Bar
                            dataKey="count"
                            name="Students"
                            fill="#667eea"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        <PeopleIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                        <Typography>No gender data available</Typography>
                      </Box>
                    )}
                  </Box>
                  {/* Add summary below the chart */}
                  {stats?.stats.gender && stats.stats.gender.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                      <Grid container spacing={1}>
                        {stats.stats.gender.map((item, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                {item._id}:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.count}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {stats.stats.gender.reduce((sum, item) => sum + item.count, 0)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Activity */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Recent Registrations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest student registrations
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => setActiveTab(1)}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  View All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {stats?.recent?.slice(0, 4).map((student, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha('#667eea', 0.1),
                              color: '#667eea',
                              fontWeight: 600,
                            }}
                          >
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.registrationCode}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={`Room ${student.roomNo}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: alpha('#4caf50', 0.1),
                              color: '#4caf50',
                              fontWeight: 600
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        )}

        {activeTab === 1 && (
          <>
            {/* Students Table Section */}
            <Paper
              sx={{
                mb: 4,
                borderRadius: 2,
                background: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Student Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and filter student registrations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title="Export All Data">
                      <Button
                        variant="contained"
                        startIcon={<CloudDownloadIcon />}
                        onClick={handleExport}
                        sx={{
                          bgcolor: '#4caf50',
                          color: 'white',
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: '#388e3c',
                          }
                        }}
                      >
                        Export Data
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Search & Filters */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Search Type</InputLabel>
                        <Select
                          value={searchType}
                          label="Search Type"
                          onChange={handleSearchTypeChange}
                        >
                          <MenuItem value="all">All Fields</MenuItem>
                          <MenuItem value="phone">Phone Number</MenuItem>
                          <MenuItem value="registration">Registration Code</MenuItem>
                          <MenuItem value="room">Room Number</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={
                          searchType === "phone"
                            ? "Search by phone number..."
                            : searchType === "registration"
                            ? "Search by registration code..."
                            : searchType === "room"
                            ? "Search by room number..."
                            : "Search by name, code, phone, or village..."
                        }
                        value={search}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={classFilter}
                          label="Class"
                          onChange={(e) => setClassFilter(e.target.value)}
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {["7", "8", "9", "10", "11", "12"].map((grade) => (
                            <MenuItem key={grade} value={grade}>
                              Class {grade}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Room</InputLabel>
                        <Select
                          value={roomFilter}
                          label="Room"
                          onChange={(e) => setRoomFilter(e.target.value)}
                        >
                          <MenuItem value="">All Rooms</MenuItem>
                          {stats?.stats.rooms?.map((room) => (
                            <MenuItem key={room._id} value={room._id}>
                              Room {room._id}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      bgcolor: '#f9f9f9',
                      '& th': {
                        fontWeight: 600,
                        color: 'text.primary',
                        borderBottom: '2px solid #e0e0e0',
                        py: 2,
                      }
                    }}>
                      <TableCell>Student</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Academic Info</TableCell>
                      <TableCell>Registration</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student._id}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: '#f9f9f9',
                          },
                          '& td': {
                            py: 2,
                            borderBottom: '1px solid #e0e0e0',
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha('#667eea', 0.1),
                                color: '#667eea',
                                fontWeight: 600,
                              }}
                            >
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {student.fatherName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={student.gender}
                                  size="small"
                                  icon={getGenderIcon(student.gender)}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha('#4caf50', 0.1),
                                    color: '#4caf50',
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {student.phoneNo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Aadhaar: {student.aadhaarNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={`Class ${student.studyingClass}`}
                              size="small"
                              sx={{
                                width: 'fit-content',
                                bgcolor: alpha('#ff9800', 0.1),
                                color: '#ff9800',
                                fontWeight: 600,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {student.schoolName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Medium: {student.medium}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={student.registrationCode}
                              size="small"
                              sx={{
                                width: 'fit-content',
                                fontFamily: 'monospace',
                                bgcolor: alpha('#667eea', 0.1),
                                color: '#667eea',
                                fontWeight: 600,
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(student.createdAt).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={`Room ${student.roomNo}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: alpha('#9c27b0', 0.1),
                                  color: '#9c27b0',
                                  fontWeight: 600,
                                }}
                              />
                              <Chip
                                label={`Seat ${student.seatNo}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: alpha('#4caf50', 0.1),
                                  color: '#4caf50',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(student)}
                                sx={{
                                  color: '#2196f3',
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Hall Ticket">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadHallTicket(student.registrationCode)}
                                sx={{
                                  color: '#4caf50',
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteStudent(student._id)}
                                sx={{
                                  color: '#f44336',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {students.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SearchIcon
                    sx={{
                      fontSize: 60,
                      color: 'text.secondary',
                      opacity: 0.3,
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No students found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search filters
                  </Typography>
                </Box>
              )}

              <TablePagination
                component="div"
                count={totalStudents}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: '1px solid #e0e0e0',
                  px: 3,
                }}
              />
            </Paper>
          </>
        )}

        {activeTab === 2 && (
          <>
            {/* Room Management */}
            <Paper
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                background: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Room Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor and manage room allocations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${totalStudents} Students`}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    icon={<RoomIcon />}
                    label={`${stats?.stats.rooms?.length || 0} Rooms`}
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handleDownloadAllExamSlips21}
                    sx={{
                      bgcolor: '#4caf50',
                      color: 'white',
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        bgcolor: '#388e3c',
                      }
                    }}
                  >
                    Print All Exam Slips
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {stats?.stats.rooms?.map((room, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
                    <RoomCard room={room} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        )}

        {/* Student Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#667eea' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Student Details</Typography>
                <Typography variant="caption" color="text.secondary">
                  Complete registration information
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedStudent && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Registration Code
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#667eea' }}>
                        {selectedStudent.registrationCode}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Application Number
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                        {selectedStudent.applicationNo}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Student Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedStudent.name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Father's Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.fatherName}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Aadhaar Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedStudent.aadhaarNo}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedStudent.phoneNo}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    School Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.schoolName}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Class & Medium
                  </Typography>
                  <Typography variant="body1">
                    Class {selectedStudent.studyingClass} - {selectedStudent.medium}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Gender
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.gender}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Room & Seat
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Room {selectedStudent.roomNo}, Seat {selectedStudent.seatNo}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    Address Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    House Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.houseName || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Place
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.place || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Post Office
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.postOffice || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    PIN Code
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.pinCode || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Local Body
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.localBodyName || 'N/A'} ({selectedStudent.address?.localBodyType || 'N/A'})
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text-secondary" gutterBottom>
                    Village
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.address?.village || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Registration Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedStudent.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined">
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                handleDownloadHallTicket(selectedStudent.registrationCode);
              }}
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a6fd8' }
              }}
              startIcon={<DownloadIcon />}
            >
              Download Hall Ticket
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                setTimeout(() => handleDeleteStudent(selectedStudent._id), 300);
              }}
              sx={{
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' }
              }}
              startIcon={<DeleteIcon />}
            >
              Delete Student
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default AdminDashboard;