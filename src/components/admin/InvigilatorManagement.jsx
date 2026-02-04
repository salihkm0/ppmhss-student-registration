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
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const InvigilatorManagement = () => {
  const [invigilators, setInvigilators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedInvigilator, setSelectedInvigilator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [assignData, setAssignData] = useState({
    rooms: [],
  });

  useEffect(() => {
    fetchInvigilators();
  }, []);

  const fetchInvigilators = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/invigilators",
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setInvigilators(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching invigilators:", error);
      toast.error("Failed to load invigilators");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvigilator = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        "https://apinmea.oxiumev.com/api/admin/invigilators",
        formData,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success("Invigilator created successfully");
        setDialogOpen(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchInvigilators();
      }
    } catch (error) {
      console.error("Error creating invigilator:", error);
      toast.error(error.response?.data?.error || "Failed to create invigilator");
    }
  };

  const handleUpdateInvigilator = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `https://apinmea.oxiumev.com/api/admin/invigilators/${selectedInvigilator._id}`,
        formData,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success("Invigilator updated successfully");
        setEditDialogOpen(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchInvigilators();
      }
    } catch (error) {
      console.error("Error updating invigilator:", error);
      toast.error("Failed to update invigilator");
    }
  };

  const handleDeleteInvigilator = async (invigilatorId) => {
    if (!window.confirm("Are you sure you want to delete this invigilator?")) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `https://apinmea.oxiumev.com/api/admin/invigilators/${invigilatorId}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success("Invigilator deleted successfully");
        fetchInvigilators();
      }
    } catch (error) {
      console.error("Error deleting invigilator:", error);
      toast.error("Failed to delete invigilator");
    }
  };

  const handleAssignRooms = async () => {
    if (!assignData.rooms.length) {
      toast.error("Please select at least one room");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `https://apinmea.oxiumev.com/api/admin/invigilators/${selectedInvigilator._id}/assign-rooms`,
        assignData,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        toast.success("Rooms assigned successfully");
        setAssignDialogOpen(false);
        setAssignData({ rooms: [] });
        fetchInvigilators();
      }
    } catch (error) {
      console.error("Error assigning rooms:", error);
      toast.error("Failed to assign rooms");
    }
  };

  const handleOpenEditDialog = (invigilator) => {
    setSelectedInvigilator(invigilator);
    setFormData({
      name: invigilator.name,
      email: invigilator.email,
      phone: invigilator.phone,
      password: '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenAssignDialog = (invigilator) => {
    setSelectedInvigilator(invigilator);
    setAssignData({
      rooms: invigilator.assignedRooms.map(room => room.roomNo),
    });
    setAssignDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading invigilators...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Invigilator Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage invigilators and assign rooms
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Invigilator
        </Button>
      </Box>

      {/* Invigilators Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Invigilator</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Assigned Rooms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invigilators.map((invigilator) => (
              <TableRow key={invigilator._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2563eb' }}>
                      <InvigilatorIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {invigilator.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {invigilator._id.slice(-6)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{invigilator.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{invigilator.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {invigilator.assignedRooms.map((room, index) => (
                      <Chip
                        key={index}
                        label={`Room ${room.roomNo}`}
                        size="small"
                        icon={<RoomIcon />}
                      />
                    ))}
                    {invigilator.assignedRooms.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No rooms assigned
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {invigilator.isActive ? (
                    <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />
                  ) : (
                    <Chip label="Inactive" color="error" size="small" icon={<CancelIcon />} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(invigilator)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign Rooms">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAssignDialog(invigilator)}
                      >
                        <RoomIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteInvigilator(invigilator._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Invigilator Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Invigilator</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateInvigilator}>
            Create Invigilator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Invigilator Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Invigilator</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Leave password blank if you don't want to change it
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateInvigilator}>
            Update Invigilator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Rooms Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Rooms to {selectedInvigilator?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Rooms</InputLabel>
            <Select
              multiple
              value={assignData.rooms}
              onChange={(e) => setAssignData({ ...assignData, rooms: e.target.value })}
              label="Select Rooms"
              renderValue={(selected) => selected.map(room => `Room ${room}`).join(', ')}
            >
              {[...Array(20).keys()].map(i => (
                <MenuItem key={i + 1} value={i + 1}>
                  Room {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRooms}>
            Assign Rooms
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvigilatorManagement;