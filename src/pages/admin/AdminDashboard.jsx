import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  AvatarGroup,
  LinearProgress,
} from '@mui/material';
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
  Sort as SortIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'phone', 'registration'
  const [classFilter, setClassFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [chartData, setChartData] = useState([]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
  }, [page, rowsPerPage, classFilter, search]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://ppmhss-student-registration-backend.onrender.com/api/admin/dashboard/stats', {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.success) {
        setStats(response.data);
        
        // Prepare chart data
        if (response.data.stats.class) {
          const chartData = response.data.stats.class.map(item => ({
            name: `Class ${item._id}`,
            students: item.count
          }));
          setChartData(chartData);
        }
        
        setTotalStudents(response.data.stats.total || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build search query based on search type
      let searchQuery = '';
      if (search) {
        switch(searchType) {
          case 'phone':
            searchQuery = search; // Phone number search
            break;
          case 'registration':
            searchQuery = search; // Registration code search
            break;
          default:
            searchQuery = search; // General search
        }
      }

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(classFilter && { class: classFilter })
      };

      const response = await axios.get('https://ppmhss-student-registration-backend.onrender.com/api/admin/students', {
        headers: { 'x-auth-token': token },
        params
      });
      
      if (response.data.success) {
        setStudents(response.data.data);
        if (response.data.pagination) {
          setTotalStudents(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
    toast.success('Logged out successfully');
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
    setSearch('');
    setPage(0);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`https://ppmhss-student-registration-backend.onrender.com/api/admin/students/${studentId}`, {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.success) {
        toast.success('Student deleted successfully');
        fetchStudents();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://ppmhss-student-registration-backend.onrender.com/api/admin/export', {
        headers: { 'x-auth-token': token },
        responseType: 'blob'
      });
      
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

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Male': return <MaleIcon fontSize="small" />;
      case 'Female': return <FemaleIcon fontSize="small" />;
      default: return <OtherIcon fontSize="small" />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      borderRadius: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: alpha(color, 0.1),
            color: color,
            width: 48,
            height: 48
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
      py: 3,
      px: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl" disableGutters>
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 56,
                  height: 56,
                  backdropFilter: 'blur(10px)'
                }}>
                  <DashboardIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Admin Dashboard
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage student registrations and view analytics
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    fetchDashboardData();
                    fetchStudents();
                  }}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: '#667eea',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: '#667eea',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Students"
              value={totalStudents}
              icon={<PeopleIcon />}
              color={theme.palette.primary.main}
              subtitle="All registered students"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Registrations"
              value={stats?.recent?.length || 0}
              icon={<TrendingUpIcon />}
              color={theme.palette.success.main}
              subtitle="Registered today"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Classes"
              value="6"
              icon={<SchoolIcon />}
              color={theme.palette.warning.main}
              subtitle="Class 7 to 12"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Export Data"
              value="CSV"
              icon={<FileDownloadIcon />}
              color={theme.palette.info.main}
              subtitle="Download all records"
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Gender Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2
                }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Gender Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered students by gender
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.stats.gender || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {(stats?.stats.gender || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Students']}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Class-wise Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  mr: 2
                }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Class-wise Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students distribution across classes
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={alpha(theme.palette.divider, 0.5)} 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: theme.shadows[3],
                        background: theme.palette.background.paper
                      }}
                      formatter={(value) => [value, 'Students']}
                    />
                    <Bar 
                      dataKey="students" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Registrations Trend */}
        {stats?.stats.daily && stats.stats.daily.length > 0 && (
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                mr: 2
              }}>
                <CalendarIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Registration Trend (Last 7 Days)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily registration count
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.stats.daily}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={alpha(theme.palette.divider, 0.5)} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: theme.shadows[3],
                      background: theme.palette.background.paper
                    }}
                    formatter={(value) => [value, 'Registrations']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    fill={alpha(theme.palette.primary.main, 0.3)}
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Students Table */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Registered Students
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and view all student registrations
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchDashboardData();
                  fetchStudents();
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Export Data
              </Button>
            </Box>
          </Box>

          {/* Advanced Search Filters */}
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.5)
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Search Type</InputLabel>
                  <Select
                    value={searchType}
                    label="Search Type"
                    onChange={handleSearchTypeChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All Fields</MenuItem>
                    <MenuItem value="phone">Phone Number</MenuItem>
                    <MenuItem value="registration">Registration Code</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={
                    searchType === 'phone' ? 'Search by phone number...' :
                    searchType === 'registration' ? 'Search by registration code...' :
                    'Search by name, code, phone, or village...'
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
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Class</InputLabel>
                  <Select
                    value={classFilter}
                    label="Filter by Class"
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {['7', '8', '9', '10', '11', '12'].map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        Class {grade}
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
                    setSearch('');
                    setClassFilter('');
                    setSearchType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NumbersIcon fontSize="small" />
                      Reg. Code
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon fontSize="small" />
                      App. No.
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" />
                      Class
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      Phone
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow 
                    key={student._id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={student.registrationCode}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {student.applicationNo}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.fatherName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Class ${student.studyingClass}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {student.phoneNo}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getGenderIcon(student.gender)}
                        label={student.gender}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          bgcolor: alpha(
                            student.gender === 'Male' ? theme.palette.info.main :
                            student.gender === 'Female' ? theme.palette.success.main :
                            theme.palette.warning.main,
                            0.1
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(student.createdAt).toLocaleDateString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(student.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(student)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.2)
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteStudent(student._id)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.2)
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {students.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
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
            sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 2 }}
          />
        </Paper>

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
          <DialogTitle sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Student Details</Typography>
              <Typography variant="caption" color="text.secondary">
                Complete registration information
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedStudent && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Registration Code
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace', color: theme.palette.primary.main }}>
                          {selectedStudent.registrationCode}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Application Number
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                          {selectedStudent.applicationNo}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Student Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedStudent.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Father's Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.fatherName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Aadhaar Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedStudent.aadhaarNo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedStudent.phoneNo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <SchoolIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    School
                  </Typography>
                  <Typography variant="body1">
                    {selectedStudent.schoolName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <SchoolIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Class & Medium
                  </Typography>
                  <Typography variant="body1">
                    Class {selectedStudent.studyingClass} - {selectedStudent.medium}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 2 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      <HomeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Address Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          House Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.houseName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Place
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.place}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Post Office
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.postOffice}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          PIN Code
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.pinCode}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Local Body
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.localBodyName} ({selectedStudent.address.localBodyType})
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Village
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.address.village}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Registration Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedStudent.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              variant="outlined"
            >
              Close
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                handleDeleteStudent(selectedStudent._id);
              }}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete Student
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;


