import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [adminData, setAdminData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: true,
    maxStudentsPerRoom: 20,
    resultPublishDate: '2026-03-01',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
    setAdminData(admin);
    setFormData({
      username: admin.username || '',
      email: admin.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, []);

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdateProfile = async () => {
    if (!formData.username || !formData.email) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      // Only include password fields if they're being changed
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        "https://apinmea.oxiumev.com/api/admin/profile",
        updateData,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        // Update localStorage
        const updatedAdmin = {
          ...adminData,
          username: formData.username,
          email: formData.email,
        };
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
        setAdminData(updatedAdmin);
        
        setSuccess('Profile updated successfully');
        toast.success('Profile updated successfully');
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, you would save these to your backend
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Admin Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your profile and system settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Profile Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleProfileChange}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>
              Change Password
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleProfileChange}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  placeholder="Enter current password to change"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleProfileChange}
                  placeholder="Min. 6 characters"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleProfileChange}
                  placeholder="Confirm new password"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={handleSettingsChange}
                      name="notifications"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotificationsIcon sx={{ mr: 1 }} />
                      Enable Notifications
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={handleSettingsChange}
                      name="autoBackup"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1 }} />
                      Auto Backup Data
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Students per Room</InputLabel>
                  <Select
                    value={settings.maxStudentsPerRoom}
                    onChange={handleSettingsChange}
                    label="Students per Room"
                    name="maxStudentsPerRoom"
                  >
                    <MenuItem value={20}>20 Students</MenuItem>
                    <MenuItem value={25}>25 Students</MenuItem>
                    <MenuItem value={30}>30 Students</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Result Publish Date"
                  type="date"
                  name="resultPublishDate"
                  value={settings.resultPublishDate}
                  onChange={handleSettingsChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Admin Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: '#2563eb' }}>
                    <AdminIcon fontSize="large" />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">
                    Admin Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role: {adminData?.role || 'Admin'} | Last Login: {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip
                    label="Super Admin"
                    color="primary"
                    variant="outlined"
                    icon={<AdminIcon />}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;