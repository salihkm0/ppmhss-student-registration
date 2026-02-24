import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  People as PeopleIcon,
  Room as RoomIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  CloudDownload as ExportIcon,
  Refresh as RefreshIcon,
  EmojiEvents as MedalIcon,
  Today as TodayIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const DashboardHome = ({ stats }) => {
  const [timeRange, setTimeRange] = useState('week'); // 'week' or 'month'
  
  const totalStudents = stats?.stats?.totalStudents || 0;
  const todaysRegistrations = stats?.stats?.todaysRegistrations || 0;
  const totalInvigilators = stats?.stats?.totalInvigilators || 0;
  const recentStudents = stats?.recent || [];
  const topPerformers = stats?.topPerformers || [];
  const genderStats = stats?.stats?.gender || [];
  const classStats = stats?.stats?.class || [];
  const mediumStats = stats?.stats?.medium || [];
  const resultStats = stats?.stats?.results || [];
  const trends = stats?.trends || { last7Days: [], registrationTrend: [], last30Days: [], registrationTrend30: [], hourlyDistribution: [] };
  
  const totalPeople = totalStudents + totalInvigilators;

  // Colors for charts
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

  const StatCard = ({ title, value, icon, color = "#2563eb", subtitle, trend }) => (
    <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color, mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip 
                size="small" 
                label={trend} 
                color="success" 
                sx={{ mt: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}15`, color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<ExportIcon />}>
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<PeopleIcon />}
            color="#2563eb"
            subtitle="All registered students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Registrations"
            value={todaysRegistrations}
            icon={<TodayIcon />}
            color="#f59e0b"
            subtitle="New registrations today"
            trend={todaysRegistrations > 0 ? `+${todaysRegistrations} today` : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invigilators"
            value={totalInvigilators}
            icon={<PersonIcon />}
            color="#8b5cf6"
            subtitle="Exam staff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Results Published"
            value={resultStats.find(r => r._id === 'published')?.count || 0}
            icon={<AssessmentIcon />}
            color="#10b981"
            subtitle="Students with results"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Registration Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Registration Trend
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  variant={timeRange === 'week' ? 'contained' : 'outlined'}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button 
                  size="small" 
                  variant={timeRange === 'month' ? 'contained' : 'outlined'}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={timeRange === 'week' 
                  ? trends.last7Days.map((day, index) => ({ name: day, registrations: trends.registrationTrend[index] }))
                  : trends.last30Days.map((day, index) => ({ name: day, registrations: trends.registrationTrend30[index] }))
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="registrations" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gender Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
              <Typography variant="caption" display="block" color="text.secondary">
                {totalStudents} total students
              </Typography>
            </Typography>
            {genderStats.map((stat, index) => {
              const percentage = totalStudents > 0 ? Math.round((stat.count / totalStudents) * 100) : 0;
              return (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{stat._id}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {stat.count} ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </Box>
              );
            })}
            {genderStats.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No gender data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Class Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Class Distribution
              <Typography variant="caption" display="block" color="text.secondary">
                Students by class
              </Typography>
            </Typography>
            {classStats.map((stat, index) => {
              const percentage = totalStudents > 0 ? Math.round((stat.count / totalStudents) * 100) : 0;
              return (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Class {stat._id}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {stat.count} ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </Box>
              );
            })}
            {classStats.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No class data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Medium Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medium of Instruction
              <Typography variant="caption" display="block" color="text.secondary">
                Students by medium
              </Typography>
            </Typography>
            {mediumStats.map((stat, index) => {
              const percentage = totalStudents > 0 ? Math.round((stat.count / totalStudents) * 100) : 0;
              return (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{stat._id}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {stat.count} ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </Box>
              );
            })}
            {mediumStats.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No medium data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Hourly Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Registration (Today)
              <Typography variant="caption" display="block" color="text.secondary">
                Registrations by hour
              </Typography>
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.hourlyDistribution.slice(6, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Registrations and Top Performers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Registrations
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Reg. Code</TableCell>
                    <TableCell>Room/Seat</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentStudents.slice(0, 7).map((student, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#2563eb', fontSize: '0.875rem' }}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{student.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={student.registrationCode} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {student.roomNo ? `R-${student.roomNo}, S-${student.seatNo}` : 'Not assigned'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(student.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {recentStudents.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent registrations
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Performers
              <Typography variant="caption" display="block" color="text.secondary">
                Highest marks in exam
              </Typography>
            </Typography>
            {topPerformers.map((student, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  py: 1.5,
                  borderBottom: index < topPerformers.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 2, 
                    bgcolor: index === 0 ? '#f59e0b' : index === 1 ? '#10b981' : index === 2 ? '#2563eb' : '#8b5cf6'
                  }}
                >
                  {student.rank || index + 1}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {student.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.registrationCode} • Marks: {student.examMarks}
                  </Typography>
                </Box>
                {student.scholarship && (
                  <Chip 
                    label="Scholar" 
                    size="small" 
                    color="success"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            ))}
            {topPerformers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No results published yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="#2563eb" fontWeight={600}>
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="#10b981" fontWeight={600}>
                    {stats?.stats?.rooms?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Rooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="#f59e0b" fontWeight={600}>
                    {resultStats.find(r => r._id === 'passed')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students Passed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="#8b5cf6" fontWeight={600}>
                    {Math.round((resultStats.find(r => r._id === 'passed')?.count || 0) / (totalStudents || 1) * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pass Percentage
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;