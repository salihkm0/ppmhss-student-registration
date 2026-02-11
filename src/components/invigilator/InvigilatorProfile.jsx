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
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Room as RoomIcon,
  AssignmentInd as InvigilatorIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

// const InvigilatorProfile = ({ invigilatorData }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (invigilatorData) {
//       setFormData({
//         name: invigilatorData.name || '',
//         email: invigilatorData.email || '',
//         phone: invigilatorData.phone || '',
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//       });
//     }
//   }, [invigilatorData]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError('');
//     setSuccess('');
//   };

//   const handleUpdateProfile = async () => {
//     if (!formData.name || !formData.email || !formData.phone) {
//       setError('Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('invigilatorToken');
//       const updateData = {
//         name: formData.name,
//         phone: formData.phone,
//       };

//       // Only include password fields if they're being changed
//       if (formData.currentPassword && formData.newPassword) {
//         if (formData.newPassword.length < 6) {
//           throw new Error('New password must be at least 6 characters');
//         }
//         if (formData.newPassword !== formData.confirmPassword) {
//           throw new Error('New passwords do not match');
//         }
//         updateData.currentPassword = formData.currentPassword;
//         updateData.newPassword = formData.newPassword;
//       }

//       const response = await axios.put(
//         "http://localhost:5010/api/invigilator/profile",
//         updateData,
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         // Update localStorage
//         const updatedInvigilator = {
//           ...invigilatorData,
//           name: formData.name,
//           phone: formData.phone,
//         };
//         localStorage.setItem('invigilatorData', JSON.stringify(updatedInvigilator));
        
//         setSuccess('Profile updated successfully');
//         toast.success('Profile updated successfully');
        
//         // Clear password fields
//         setFormData({
//           ...formData,
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: '',
//         });
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box>
//       <Typography variant="h4" fontWeight={600} gutterBottom>
//         My Profile
//       </Typography>
//       <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
//         Update your profile information and password
//       </Typography>

//       <Grid container spacing={3}>
//         {/* Profile Overview */}
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Avatar
//                 sx={{
//                   width: 120,
//                   height: 120,
//                   mx: 'auto',
//                   mb: 3,
//                   bgcolor: '#2563eb',
//                   fontSize: 48,
//                 }}
//               >
//                 {invigilatorData?.name?.charAt(0) || 'I'}
//               </Avatar>
//               <Typography variant="h5" fontWeight={600}>
//                 {invigilatorData?.name || 'Invigilator'}
//               </Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 {invigilatorData?.email || 'No email'}
//               </Typography>
//               <Chip
//                 label="Invigilator"
//                 color="primary"
//                 icon={<InvigilatorIcon />}
//                 sx={{ mb: 2 }}
//               />
//               <Divider sx={{ my: 2 }} />
//               <Typography variant="body2" color="text.secondary">
//                 Last Login: {invigilatorData?.lastLogin ? 
//                   new Date(invigilatorData.lastLogin).toLocaleString() : 
//                   'Not available'}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Update Form */}
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ p: 3 }}>
//             {error && (
//               <Alert severity="error" sx={{ mb: 3 }}>
//                 {error}
//               </Alert>
//             )}
//             {success && (
//               <Alert severity="success" sx={{ mb: 3 }}>
//                 {success}
//               </Alert>
//             )}

//             <Typography variant="h6" gutterBottom>
//               Personal Information
//             </Typography>
//             <Grid container spacing={2} sx={{ mb: 4 }}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Full Name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   InputProps={{
//                     startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Email Address"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   disabled
//                   InputProps={{
//                     startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Phone Number"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   InputProps={{
//                     startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
//                   }}
//                 />
//               </Grid>
//             </Grid>

//             <Typography variant="h6" gutterBottom>
//               Change Password
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Current Password"
//                   name="currentPassword"
//                   type="password"
//                   value={formData.currentPassword}
//                   onChange={handleChange}
//                   InputProps={{
//                     startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
//                   }}
//                   placeholder="Enter current password to change"
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="New Password"
//                   name="newPassword"
//                   type="password"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   placeholder="Min. 6 characters"
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Confirm New Password"
//                   name="confirmPassword"
//                   type="password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="Confirm new password"
//                 />
//               </Grid>
//             </Grid>

//             <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
//               <Button
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 onClick={handleUpdateProfile}
//                 disabled={loading}
//                 size="large"
//               >
//                 {loading ? 'Updating...' : 'Update Profile'}
//               </Button>
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

const InvigilatorProfile = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Invigilator Profile Page
      </Typography>
      <Typography variant="body1">
        This is a placeholder for the Invigilator Profile component.
      </Typography>
    </Box>
  );
}

export default InvigilatorProfile;