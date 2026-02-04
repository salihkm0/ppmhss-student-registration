import React from "react";
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
} from "@mui/icons-material";

const DashboardHome = ({ stats }) => {
  const totalStudents = stats?.stats?.totalStudents || 0;
  const totalInvigilators = stats?.stats?.totalInvigilators || 0;
  const totalRooms = stats?.stats?.rooms?.length || 0;
  const recentStudents = stats?.recent || [];
  const genderStats = stats?.stats?.gender || [];
  
  // Calculate total people (students + invigilators) for gender distribution
  const totalPeople = genderStats.reduce((sum, gender) => sum + gender.count, 0) || 1;

  const StatCard = ({ title, value, icon, color = "#2563eb", subtitle }) => (
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
          <Button variant="outlined" startIcon={<RefreshIcon />}>
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
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rooms"
            value={totalRooms}
            icon={<RoomIcon />}
            color="#10b981"
            subtitle={`${totalStudents} students assigned`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Registrations"
            value={recentStudents.filter(s => 
              new Date(s.createdAt).toDateString() === new Date().toDateString()
            ).length}
            icon={<TrendingUpIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invigilators"
            value={totalInvigilators}
            icon={<CheckCircleIcon />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Gender Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Registrations
            </Typography>
            {recentStudents.slice(0, 5).map((student, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#2563eb' }}>
                  {student.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {student.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.registrationCode} • Room {student.roomNo}, Seat {student.seatNo}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(student.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
            {recentStudents.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent registrations
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
              <Typography variant="caption" display="block" color="text.secondary">
                {totalPeople} total (Students + Invigilators)
              </Typography>
            </Typography>
            {genderStats.map((stat, index) => {
              const percentage = Math.round((stat.count / totalPeople) * 100);
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
                        backgroundColor: index === 0 ? '#2563eb' : '#2563eb'
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
            
            {/* Summary Box */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Students:</Typography>
                <Typography variant="body2" fontWeight={500}>{totalStudents}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Invigilators:</Typography>
                <Typography variant="body2" fontWeight={500}>{totalInvigilators}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Total People:</Typography>
                <Typography variant="body2" fontWeight={500}>{totalPeople}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              Manage Students
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RoomIcon />}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              Room Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MedalIcon />}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              Generate Ranks
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BarChartIcon />}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              View Reports
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardHome;