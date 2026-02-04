import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  Room as RoomIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as MedalIcon,
} from "@mui/icons-material";

const InvigilatorHome = ({ dashboardData }) => {
  if (!dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  const { invigilator, stats, assignedRooms } = dashboardData;

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
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#2563eb', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'white', color: '#2563eb' }}>
              {invigilator.name.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight={600}>
              Welcome, {invigilator.name}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Exam Invigilator - PPMHSS Kottukkara
            </Typography>
          </Grid>
          <Grid item>
            <Chip
              label="Active"
              color="success"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned Rooms"
            value={stats.totalAssignedRooms}
            icon={<RoomIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Marks Entered"
            value={stats.totalMarksEntered}
            icon={<CheckCircleIcon />}
            color="#f59e0b"
            subtitle={`of ${stats.totalStudents}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Marks Pending"
            value={stats.totalMarksPending}
            icon={<WarningIcon />}
            color="#ef4444"
            subtitle="to be entered"
          />
        </Grid>
      </Grid>

      {/* Pending Marks Alert */}
      {stats.totalMarksPending > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" href="/invigilator/marks">
              Enter Marks Now
            </Button>
          }
        >
          You have {stats.totalMarksPending} marks pending to enter. Please complete them before the deadline.
        </Alert>
      )}

      {/* Assigned Rooms */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600}>
            Your Assigned Rooms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on a room to view students or enter marks
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          {assignedRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.roomNo}>
              <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { borderColor: '#2563eb' } }}>
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
                      value={(room.marksEntered / room.totalStudents) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: room.marksEntered === room.totalStudents ? '#10b981' : '#f59e0b',
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

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<PeopleIcon />}
                      href={`/invigilator/students?room=${room.roomNo}`}
                    >
                      View Students
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<AssignmentIcon />}
                      href={`/invigilator/marks?room=${room.roomNo}`}
                    >
                      Enter Marks
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <List>
          <ListItem 
            button 
            component="a" 
            href="/invigilator/marks"
            sx={{ borderRadius: 1, mb: 1 }}
          >
            <ListItemIcon>
              <AssignmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Enter Marks"
              secondary="Enter marks for students in assigned rooms"
            />
          </ListItem>
          <ListItem 
            button 
            component="a" 
            href="/invigilator/students"
            sx={{ borderRadius: 1, mb: 1 }}
          >
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="View Students"
              secondary="View all students in your assigned rooms"
            />
          </ListItem>
          <ListItem 
            button 
            component="a" 
            href="/invigilator/profile"
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <MedalIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Update Profile"
              secondary="Update your profile information and password"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default InvigilatorHome;