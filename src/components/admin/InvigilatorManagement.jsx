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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  CardHeader,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AssignmentInd as InvigilatorIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RemoveCircle as RemoveCircleIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

// const InvigilatorManagement = () => {
//   const [invigilators, setInvigilators] = useState([]);
//   const [availableRooms, setAvailableRooms] = useState({ available: [], assigned: [] });
//   const [loading, setLoading] = useState(true);
//   const [roomsLoading, setRoomsLoading] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
//   const [roomManagerOpen, setRoomManagerOpen] = useState(false);
//   const [selectedInvigilator, setSelectedInvigilator] = useState(null);
//   const [tabValue, setTabValue] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     isActive: true
//   });
  
//   const [assignData, setAssignData] = useState({
//     rooms: [],
//   });

//   useEffect(() => {
//     fetchInvigilators();
//     fetchAvailableRooms();
//   }, []);

//   const fetchInvigilators = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.get(
//         "http://localhost:5010/api/admin/invigilators",
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         setInvigilators(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching invigilators:", error);
//       toast.error("Failed to load invigilators");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAvailableRooms = async () => {
//     try {
//       setRoomsLoading(true);
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.get(
//         "http://localhost:5010/api/admin/rooms/available",
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         setAvailableRooms(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching available rooms:", error);
//     } finally {
//       setRoomsLoading(false);
//     }
//   };

//   const handleCreateInvigilator = async () => {
//     if (!formData.name || !formData.email || !formData.phone || !formData.password) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.post(
//         "http://localhost:5010/api/admin/invigilators",
//         formData,
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success("Invigilator created successfully");
//         setDialogOpen(false);
//         setFormData({ name: '', email: '', phone: '', password: '', isActive: true });
//         fetchInvigilators();
//         fetchAvailableRooms();
//       }
//     } catch (error) {
//       console.error("Error creating invigilator:", error);
//       toast.error(error.response?.data?.error || "Failed to create invigilator");
//     }
//   };

//   const handleUpdateInvigilator = async () => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.put(
//         `http://localhost:5010/api/admin/invigilators/${selectedInvigilator._id}`,
//         formData,
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success("Invigilator updated successfully");
//         setEditDialogOpen(false);
//         setFormData({ name: '', email: '', phone: '', password: '', isActive: true });
//         fetchInvigilators();
//       }
//     } catch (error) {
//       console.error("Error updating invigilator:", error);
//       toast.error(error.response?.data?.error || "Failed to update invigilator");
//     }
//   };

//   const handleDeleteInvigilator = async (invigilatorId) => {
//     if (!window.confirm("Are you sure you want to delete this invigilator?")) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.delete(
//         `http://localhost:5010/api/admin/invigilators/${invigilatorId}`,
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success("Invigilator deleted successfully");
//         fetchInvigilators();
//         fetchAvailableRooms();
//       }
//     } catch (error) {
//       console.error("Error deleting invigilator:", error);
//       toast.error("Failed to delete invigilator");
//     }
//   };

//   const handleAssignRooms = async () => {
//     if (!assignData.rooms.length) {
//       toast.error("Please select at least one room");
//       return;
//     }

//     try {
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.post(
//         `http://localhost:5010/api/admin/invigilators/${selectedInvigilator._id}/assign-rooms`,
//         assignData,
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success("Rooms assigned successfully");
//         setAssignDialogOpen(false);
//         setAssignData({ rooms: [] });
//         fetchInvigilators();
//         fetchAvailableRooms();
//       }
//     } catch (error) {
//       console.error("Error assigning rooms:", error);
//       toast.error(error.response?.data?.error || "Failed to assign rooms");
//     }
//   };

//   const handleUnassignRoom = async (invigilatorId, roomNo) => {
//     if (!window.confirm(`Remove Room ${roomNo} from this invigilator?`)) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('adminToken');
//       const response = await axios.post(
//         `http://localhost:5010/api/admin/invigilators/${invigilatorId}/remove-room`,
//         { roomNo },
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success(`Room ${roomNo} removed successfully`);
//         fetchInvigilators();
//         fetchAvailableRooms();
//       }
//     } catch (error) {
//       console.error("Error removing room:", error);
//       toast.error("Failed to remove room");
//     }
//   };

//   const handleOpenEditDialog = (invigilator) => {
//     setSelectedInvigilator(invigilator);
//     setFormData({
//       name: invigilator.name,
//       email: invigilator.email,
//       phone: invigilator.phone,
//       password: '',
//       isActive: invigilator.isActive
//     });
//     setEditDialogOpen(true);
//   };

//   const handleOpenAssignDialog = (invigilator) => {
//     setSelectedInvigilator(invigilator);
//     setAssignData({
//       rooms: invigilator.assignedRooms.map(room => room.roomNo),
//     });
//     setAssignDialogOpen(true);
//   };

//   const handleOpenRoomManager = (invigilator) => {
//     setSelectedInvigilator(invigilator);
//     setRoomManagerOpen(true);
//   };

//   const filteredInvigilators = invigilators.filter(invigilator => 
//     invigilator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     invigilator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     invigilator.phone.includes(searchTerm)
//   );

//   const getRoomStudentCount = (roomNo) => {
//     const room = [...availableRooms.available, ...availableRooms.assigned]
//       .find(r => r.roomNo == roomNo);
//     return room ? room.studentCount : 0;
//   };

//   const getRoomAssignmentInfo = (roomNo) => {
//     const assignedRoom = availableRooms.assigned.find(r => r.roomNo == roomNo);
//     return assignedRoom ? assignedRoom.assignedTo : null;
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       {/* Header Section */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//         <Box>
//           <Typography variant="h4" fontWeight={600}>
//             Invigilator Management
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Manage invigilators and assign rooms dynamically
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Button
//             variant="outlined"
//             startIcon={<RefreshIcon />}
//             onClick={() => {
//               fetchInvigilators();
//               fetchAvailableRooms();
//               toast.success("Refreshed data");
//             }}
//           >
//             Refresh
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<PersonAddIcon />}
//             onClick={() => setDialogOpen(true)}
//           >
//             Add Invigilator
//           </Button>
//         </Box>
//       </Box>

//       {/* Stats Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Total Invigilators
//               </Typography>
//               <Typography variant="h4" fontWeight={600}>
//                 {invigilators.length}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Active Invigilators
//               </Typography>
//               <Typography variant="h4" fontWeight={600} color="success.main">
//                 {invigilators.filter(i => i.isActive).length}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Assigned Rooms
//               </Typography>
//               <Typography variant="h4" fontWeight={600} color="primary.main">
//                 {availableRooms.assigned.length}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Available Rooms
//               </Typography>
//               <Typography variant="h4" fontWeight={600} color="warning.main">
//                 {availableRooms.available.length}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Search Bar */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <SearchIcon color="action" />
//           <TextField
//             fullWidth
//             placeholder="Search invigilators by name, email, or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             variant="outlined"
//             size="small"
//           />
//         </Box>
//       </Paper>

//       {/* Tabs for Room Management */}
//       <Paper sx={{ mb: 3 }}>
//         <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
//           <Tab label="All Invigilators" />
//           <Tab label="Room Assignments" />
//           <Tab label="Available Rooms" />
//         </Tabs>
//       </Paper>

//       {tabValue === 0 && (
//         /* Invigilators Table */
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ bgcolor: '#f5f5f5' }}>
//                 <TableCell>Invigilator</TableCell>
//                 <TableCell>Contact</TableCell>
//                 <TableCell>Assigned Rooms</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell align="center">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredInvigilators.map((invigilator) => (
//                 <TableRow key={invigilator._id} hover>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                       <Avatar sx={{ bgcolor: invigilator.isActive ? '#2563eb' : '#9ca3af' }}>
//                         <InvigilatorIcon />
//                       </Avatar>
//                       <Box>
//                         <Typography variant="body1" fontWeight={500}>
//                           {invigilator.name}
//                           {!invigilator.isActive && (
//                             <Chip label="Inactive" size="small" sx={{ ml: 1 }} color="default" />
//                           )}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           ID: {invigilator._id.slice(-8)}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <EmailIcon fontSize="small" color="action" />
//                         <Typography variant="body2">{invigilator.email}</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <PhoneIcon fontSize="small" color="action" />
//                         <Typography variant="body2">{invigilator.phone}</Typography>
//                       </Box>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
//                       {invigilator.assignedRooms.map((room, index) => (
//                         <Tooltip key={index} title={`${getRoomStudentCount(room.roomNo)} students`}>
//                           <Chip
//                             label={`Room ${room.roomNo}`}
//                             size="small"
//                             icon={<RoomIcon />}
//                             onDelete={() => handleUnassignRoom(invigilator._id, room.roomNo)}
//                             deleteIcon={<RemoveCircleIcon />}
//                             color="primary"
//                             variant="outlined"
//                           />
//                         </Tooltip>
//                       ))}
//                       {invigilator.assignedRooms.length === 0 && (
//                         <Typography variant="caption" color="text.secondary">
//                           No rooms assigned
//                         </Typography>
//                       )}
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     {invigilator.isActive ? (
//                       <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />
//                     ) : (
//                       <Chip label="Inactive" color="error" size="small" icon={<CancelIcon />} />
//                     )}
//                   </TableCell>
//                   <TableCell align="center">
//                     <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
//                       <Tooltip title="Edit">
//                         <IconButton
//                           size="small"
//                           onClick={() => handleOpenEditDialog(invigilator)}
//                         >
//                           <EditIcon />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="Manage Rooms">
//                         <IconButton
//                           size="small"
//                           onClick={() => handleOpenAssignDialog(invigilator)}
//                           color="primary"
//                         >
//                           <RoomIcon />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="Delete">
//                         <IconButton
//                           size="small"
//                           onClick={() => handleDeleteInvigilator(invigilator._id)}
//                           color="error"
//                         >
//                           <DeleteIcon />
//                         </IconButton>
//                       </Tooltip>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       {tabValue === 1 && (
//         /* Room Assignments View */
//         <Grid container spacing={3}>
//           {invigilators.map((invigilator) => (
//             invigilator.assignedRooms.length > 0 && (
//               <Grid item xs={12} md={6} key={invigilator._id}>
//                 <Card>
//                   <CardHeader
//                     avatar={
//                       <Avatar sx={{ bgcolor: '#2563eb' }}>
//                         <InvigilatorIcon />
//                       </Avatar>
//                     }
//                     title={invigilator.name}
//                     subheader={`${invigilator.email} • ${invigilator.phone}`}
//                     action={
//                       <IconButton onClick={() => handleOpenAssignDialog(invigilator)}>
//                         <EditIcon />
//                       </IconButton>
//                     }
//                   />
//                   <CardContent>
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                       Assigned Rooms ({invigilator.assignedRooms.length})
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                       {invigilator.assignedRooms.map((room, index) => (
//                         <Card key={index} variant="outlined" sx={{ minWidth: 120 }}>
//                           <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                               <Box>
//                                 <Typography variant="h6" fontWeight={600}>
//                                   Room {room.roomNo}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   {getRoomStudentCount(room.roomNo)} students
//                                 </Typography>
//                               </Box>
//                               <IconButton 
//                                 size="small" 
//                                 color="error"
//                                 onClick={() => handleUnassignRoom(invigilator._id, room.roomNo)}
//                               >
//                                 <RemoveCircleIcon fontSize="small" />
//                               </IconButton>
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             )
//           ))}
//         </Grid>
//       )}

//       {tabValue === 2 && (
//         /* Available Rooms View */
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardHeader
//                 title="Available Rooms"
//                 subheader={`${availableRooms.available.length} rooms available`}
//                 action={
//                   <IconButton onClick={fetchAvailableRooms} disabled={roomsLoading}>
//                     <RefreshIcon />
//                   </IconButton>
//                 }
//               />
//               <CardContent>
//                 {roomsLoading ? (
//                   <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//                     <CircularProgress />
//                   </Box>
//                 ) : availableRooms.available.length === 0 ? (
//                   <Alert severity="info">No available rooms</Alert>
//                 ) : (
//                   <List>
//                     {availableRooms.available.map((room) => (
//                       <ListItem key={room.roomNo}>
//                         <ListItemText
//                           primary={`Room ${room.roomNo}`}
//                           secondary={`${room.studentCount} students`}
//                         />
//                         <Chip label="Available" color="success" size="small" />
//                       </ListItem>
//                     ))}
//                   </List>
//                 )}
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardHeader
//                 title="Assigned Rooms"
//                 subheader={`${availableRooms.assigned.length} rooms assigned`}
//               />
//               <CardContent>
//                 {availableRooms.assigned.length === 0 ? (
//                   <Alert severity="info">No rooms assigned yet</Alert>
//                 ) : (
//                   <List>
//                     {availableRooms.assigned.map((room) => (
//                       <React.Fragment key={room.roomNo}>
//                         <ListItem>
//                           <ListItemText
//                             primary={`Room ${room.roomNo}`}
//                             secondary={`${room.studentCount} students • Assigned to ${room.assignedTo.name}`}
//                           />
//                           <Chip label="Assigned" color="primary" size="small" />
//                         </ListItem>
//                         <Divider component="li" />
//                       </React.Fragment>
//                     ))}
//                   </List>
//                 )}
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       )}

//       {/* Create Invigilator Dialog */}
//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Add New Invigilator</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Full Name *"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Email Address *"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Phone Number *"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 inputProps={{ maxLength: 10 }}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Password *"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                   />
//                 }
//                 label="Active Account"
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleCreateInvigilator}>
//             Create Invigilator
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Edit Invigilator Dialog */}
//       <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Edit Invigilator</DialogTitle>
//         <DialogContent>
//           <Alert severity="info" sx={{ mb: 2 }}>
//             Leave password blank if you don't want to change it
//           </Alert>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Full Name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Email Address"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Phone Number"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="New Password"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 placeholder="Leave blank to keep current"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                   />
//                 }
//                 label="Active Account"
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleUpdateInvigilator}>
//             Update Invigilator
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Assign Rooms Dialog */}
//       <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Assign Rooms to {selectedInvigilator?.name}</DialogTitle>
//         <DialogContent>
//           <Alert severity="info" sx={{ mb: 2 }}>
//             Selecting rooms will replace all current assignments
//           </Alert>
          
//           <FormControl fullWidth>
//             <InputLabel>Select Rooms</InputLabel>
//             <Select
//               multiple
//               value={assignData.rooms}
//               onChange={(e) => setAssignData({ ...assignData, rooms: e.target.value })}
//               label="Select Rooms"
//               renderValue={(selected) => {
//                 if (selected.length === 0) return 'No rooms selected';
//                 return selected.map(roomNo => {
//                   const assignedTo = getRoomAssignmentInfo(roomNo);
//                   const studentCount = getRoomStudentCount(roomNo);
//                   return `Room ${roomNo} (${studentCount} students${assignedTo ? ', currently assigned' : ''})`;
//                 }).join(', ');
//               }}
//             >
//               {availableRooms.allRooms?.map(roomNo => {
//                 const assignedTo = getRoomAssignmentInfo(roomNo);
//                 const studentCount = getRoomStudentCount(roomNo);
//                 const isCurrentlyAssigned = assignedTo && assignedTo.id !== selectedInvigilator?._id;
                
//                 return (
//                   <MenuItem 
//                     key={roomNo} 
//                     value={roomNo}
//                     disabled={isCurrentlyAssigned}
//                     sx={{
//                       opacity: isCurrentlyAssigned ? 0.5 : 1,
//                       justifyContent: 'space-between'
//                     }}
//                   >
//                     <Box>
//                       <Typography>Room {roomNo}</Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {studentCount} students
//                         {assignedTo && ` • Currently assigned to ${assignedTo.name}`}
//                       </Typography>
//                     </Box>
//                     {isCurrentlyAssigned && (
//                       <Chip label="Assigned" size="small" color="primary" />
//                     )}
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//           </FormControl>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleAssignRooms}>
//             Update Room Assignments
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

const InvigilatorManagement = () => {
  return (
    <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Invigilator Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section is under construction.
          </Typography>
        </Box>
  )
}

export default InvigilatorManagement;