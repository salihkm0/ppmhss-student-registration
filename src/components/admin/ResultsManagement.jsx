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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  EmojiEvents as MedalIcon,
  TrendingUp as TrendingUpIcon,
  MilitaryTech as ScholarshipIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as PremiumIcon,
  Numbers as NumbersIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ResultsManagement = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRanks, setGeneratingRanks] = useState(false);
  const [stats, setStats] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  useEffect(() => {
    fetchTopPerformers();
    fetchResultStats();
  }, []);

  const fetchTopPerformers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/admin/results/top-performers",
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setTopPerformers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching top performers:", error);
      toast.error("Failed to load top performers");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        "https://apinmea.oxiumev.com/api/results/top",
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setStats(response.data.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching result stats:", error);
    }
  };

  const handleGenerateRanks = async () => {
    if (!window.confirm("Are you sure you want to generate ranks? This will:\n\n• Assign ranks to all students\n• Award scholarships to top 3\n• Mark IAS coaching eligibility for top 100\n• Update result statuses\n\nRoom and seat numbers will NOT be changed.")) {
      return;
    }

    setGeneratingRanks(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        "https://apinmea.oxiumev.com/api/admin/results/update-ranks",
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.success) {
        setGenerationResult(response.data);
        toast.success(response.data.message);
        fetchTopPerformers();
        fetchResultStats();
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating ranks:", error);
      toast.error("Failed to generate ranks");
    } finally {
      setGeneratingRanks(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <MedalIcon sx={{ color: "#FFD700", fontSize: 24 }} />;
    if (rank === 2) return <MedalIcon sx={{ color: "#C0C0C0", fontSize: 24 }} />;
    if (rank === 3) return <MedalIcon sx={{ color: "#CD7F32", fontSize: 24 }} />;
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: '#e0e0e0'
      }}>
        <Typography variant="body2" fontWeight={600}>
          {rank}
        </Typography>
      </Box>
    );
  };

  const getScholarshipChip = (scholarship) => {
    switch (scholarship) {
      case 'Gold':
        return <Chip label="Gold Scholarship" color="warning" size="small" icon={<ScholarshipIcon />} />;
      case 'Silver':
        return <Chip label="Silver Scholarship" size="small" icon={<ScholarshipIcon />} />;
      case 'Bronze':
        return <Chip label="Bronze Scholarship" color="secondary" size="small" icon={<ScholarshipIcon />} />;
      default:
        return <Chip label="No Scholarship" size="small" variant="outlined" />;
    }
  };

  const getIASChip = (iasCoaching) => {
    return iasCoaching ? (
      <Chip label="Eligible" color="success" size="small" icon={<CheckCircleIcon />} />
    ) : (
      <Chip label="Not Eligible" size="small" icon={<CancelIcon />} />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Results Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate ranks, scholarships, and view top performers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={generatingRanks ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={handleGenerateRanks}
          disabled={generatingRanks}
          color="primary"
          size="large"
        >
          {generatingRanks ? 'Generating Ranks...' : 'Generate Ranks'}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NumbersIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Students
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Passed Students
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats?.passedStudents || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats?.passPercentage?.toFixed(1) || 0}% pass rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PremiumIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  IAS Eligible
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {stats?.iasEligible || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Top 100 students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Failed Students
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {stats?.failedStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Card */}
      {/* <Card sx={{ mb: 4, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Rank Generation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generate ranks based on exam marks. This will:
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <li>Assign ranks to all students with marks</li>
                <li>Award Gold, Silver, Bronze scholarships to top 3</li>
                <li>Mark IAS coaching eligibility for top 100 students</li>
                <li>Update result status (Passed/Failed) based on 40% threshold</li>
                <li><strong>Room and seat numbers will NOT be affected</strong></li>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={generatingRanks ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={handleGenerateRanks}
              disabled={generatingRanks}
              sx={{ minWidth: 200 }}
            >
              {generatingRanks ? 'Processing...' : 'Generate Ranks'}
            </Button>
          </Box>
        </CardContent>
      </Card> */}

      {/* Top Performers Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600}>
            Top 20 Performers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sorted by rank (based on exam marks)
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell width="80">Rank</TableCell>
                <TableCell>Student Details</TableCell>
                <TableCell width="120">Marks</TableCell>
                <TableCell width="150">Percentage</TableCell>
                <TableCell width="150">Scholarship</TableCell>
                <TableCell width="150">IAS Coaching</TableCell>
                <TableCell width="120">Room/Seat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPerformers.slice(0, 20).map((student) => (
                <TableRow key={student._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getMedalIcon(student.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#2563eb' }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {student.registrationCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.schoolName} • Class {student.studyingClass}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {student.examMarks}/{student.totalMarks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(student.examMarks / student.totalMarks) * 100}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2" fontWeight={600} width={40}>
                        {((student.examMarks / student.totalMarks) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getScholarshipChip(student.scholarship)}
                  </TableCell>
                  <TableCell>
                    {getIASChip(student.iasCoaching)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Room {student.roomNo} • Seat {student.seatNo}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Scholarship Winners */}
      {topPerformers.filter(s => s.scholarship).length > 0 && (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight={600}>
              Scholarship Winners
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top 3 performers receiving scholarships
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {topPerformers.filter(s => s.scholarship).slice(0, 3).map((student, index) => (
              <Grid item xs={12} md={4} key={student._id}>
                <Card sx={{ 
                  textAlign: 'center', 
                  border: `2px solid ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}`,
                  height: '100%'
                }}>
                  <CardContent>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2, 
                      fontSize: '2rem',
                      bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                    }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <Chip
                      label={`${student.scholarship} Medal`}
                      color={index === 0 ? 'warning' : 'default'}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" fontWeight={600}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.registrationCode}
                    </Typography>
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                        {student.examMarks}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.schoolName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Class {student.studyingClass}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Room {student.roomNo} • Seat {student.seatNo}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Rank Generation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Ranks Generated Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          {generationResult && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                {generationResult.message}
              </Typography>
            </Alert>
          )}
          <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Summary:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>Top 3 students awarded scholarships</li>
              <li>Top 100 students eligible for IAS coaching</li>
              <li>All students ranked based on marks</li>
              <li>Room and seat numbers preserved</li>
              <li>Result statuses updated</li>
            </Box>
          </Box>
          {generationResult?.data?.updatedCount && (
            <Typography variant="body2" color="text.secondary">
              Updated <strong>{generationResult.data.updatedCount}</strong> student records
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};




export default ResultsManagement;