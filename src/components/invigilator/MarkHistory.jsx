import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
} from "@mui/material";
import {
  History as HistoryIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const MarkHistory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [studentId]);

const fetchHistory = async () => {
  try {
    const token = localStorage.getItem('invigilatorToken');
    const response = await axios.get(
      `https://apinmea.oxiumev.com/api/invigilator/students/${studentId}/history`,
      {
        headers: { "x-auth-token": token },
      }
    );

    console.log("API Response:", JSON.stringify(response.data));

    if (response.data.success) {
      // The student data is directly in response.data.data
      const studentData = response.data.data;
      
      // Set student info
      setStudent({
        name: studentData.name,
        registrationCode: studentData.registrationCode,
        currentMarks: studentData.examMarks,
        currentStatus: studentData.markEntryStatus
      });
      
      // Set history
      setHistory(studentData.markHistory || []);
    } else {
      toast.error(response.data.error || "Failed to load history");
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    toast.error(error.response?.data?.error || "Failed to load mark history");
  } finally {
    setLoading(false);
  }
};

  const getActionIcon = (action) => {
    switch (action) {
      case 'entered':
        return <EditIcon fontSize="small" />;
      case 'updated':
        return <EditIcon fontSize="small" sx={{ color: 'warning.main' }} />;
      case 'submitted':
        return <SendIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'finalized':
        return <LockIcon fontSize="small" sx={{ color: 'error.main' }} />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'info';
      case 'submitted':
        return 'success';
      case 'final':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'entered':
        return 'default';
      case 'updated':
        return 'info';
      case 'submitted':
        return 'success';
      case 'finalized':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getEditorIcon = (model) => {
    return model === 'Admin' ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Alert severity="error">
        Student not found
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/invigilator/marks')}
        sx={{ mb: 3 }}
      >
        Back to Marks Entry
      </Button>

      {/* Student Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#2563eb', fontSize: '2rem' }}>
              {student.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registration: {student.registrationCode}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Chip
                label={`Current Marks: ${student.currentMarks}`}
                color="primary"
                sx={{ fontSize: '1.1rem', py: 2 }}
              />
              <Chip
                label={`Status: ${student.currentStatus}`}
                color={getStatusColor(student.currentStatus)}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* History Timeline using Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Mark Entry History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track all changes to marks
        </Typography>

        {history.length === 0 ? (
          <Alert severity="info">
            No history available for this student
          </Alert>
        ) : (
          <Stepper orientation="vertical" nonLinear activeStep={-1}>
            {history.map((entry, index) => (
              <Step key={index} active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 
                          entry.action === 'entered' ? 'grey.200' :
                          entry.action === 'updated' ? 'info.100' :
                          entry.action === 'submitted' ? 'success.100' :
                          'secondary.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 
                          entry.action === 'entered' ? 'grey.700' :
                          entry.action === 'updated' ? 'info.700' :
                          entry.action === 'submitted' ? 'success.700' :
                          'secondary.700',
                      }}
                    >
                      {getActionIcon(entry.action)}
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {entry.action === 'entered' && 'Initial Entry'}
                      {entry.action === 'updated' && 'Marks Updated'}
                      {entry.action === 'submitted' && 'Marks Submitted'}
                      {entry.action === 'finalized' && 'Marks Finalized'}
                    </Typography>
                    <Chip
                      size="small"
                      label={entry.status}
                      color={getStatusColor(entry.status)}
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2, pl: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(entry.editedAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                      <Typography variant="body2">
                        Marks: <strong>{entry.marks}</strong>
                        {entry.previousMarks && (
                          <span style={{ color: '#666', marginLeft: '8px' }}>
                            (from {entry.previousMarks})
                          </span>
                        )}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEditorIcon(entry.editedByModel)}
                      <Typography variant="body2">
                        Edited by: <strong>{entry.editedBy}</strong> ({entry.editedByModel})
                      </Typography>
                    </Box>

                    {entry.notes && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Note: {entry.notes}
                      </Typography>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      {/* Table View for Compact History */}
      {history.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            History Summary
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Previous</TableCell>
                  <TableCell>Edited By</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(entry.editedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.action}
                        size="small"
                        color={getActionColor(entry.action)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color={
                        entry.marks >= 40 ? 'success.main' : 'error.main'
                      }>
                        {entry.marks}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {entry.previousMarks ? (
                        <Typography color="text.secondary">
                          {entry.previousMarks}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEditorIcon(entry.editedByModel)}
                        <Typography variant="body2">{entry.editedBy}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.status}
                        size="small"
                        color={getStatusColor(entry.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Statistics */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Changes
                </Typography>
                <Typography variant="h6">{history.length}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  First Entry
                </Typography>
                <Typography variant="body2">
                  {formatDate(history[history.length - 1]?.editedAt)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Update
                </Typography>
                <Typography variant="body2">
                  {formatDate(history[0]?.editedAt)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Current Status
                </Typography>
                <Chip
                  label={student.currentStatus}
                  size="small"
                  color={getStatusColor(student.currentStatus)}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MarkHistory;