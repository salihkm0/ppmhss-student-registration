import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  MilitaryTech as MedalIcon,
} from "@mui/icons-material";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const ResultPublishingSite = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [topPerformers, setTopPerformers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const [searchRegCode, setSearchRegCode] = useState("");
  const [searchDob, setSearchDob] = useState("");
  
  const [result, setResult] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [whatsappDialog, setWhatsappDialog] = useState(false);

  const [classTab, setClassTab] = useState("10"); // "10" or "12"

  useEffect(() => {
    fetchTopPerformers();
  }, [classTab]);

  const fetchTopPerformers = async () => {
    setLoadingTop(true);
    try {
      const response = await axiosInstance.get(`/results/top?limit=3&studyingClass=${classTab}`);
      if (response.data.success) {
        setTopPerformers(response.data.data.results);
      }
    } catch (error) {
      console.error("Failed to fetch top performers", error);
    } finally {
      setLoadingTop(false);
    }
  };

  const handleSearch = async () => {
    if (!searchRegCode.trim() || !searchDob.trim()) {
      toast.error("Please enter both Registration Code and Date of Birth");
      return;
    }

    setLoadingSearch(true);
    setSearchError("");
    setResult(null);

    try {
      const response = await axiosInstance.post("/results/check-dob", {
        registrationCode: searchRegCode.trim(),
        dob: searchDob,
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Result found!");
      }
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error.response?.data?.error || "Invalid search or result not found.";
      setSearchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingSearch(false);
    }
  };

  const openWhatsApp = (number) => {
    const message = "Hello, I need assistance with the NMEA TENDER SCHOLAR 26 results.";
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return theme.palette.primary.main;
  };

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1.5 : 2 }}>
      {/* WhatsApp Support Button */}
      <Box sx={{ position: "fixed", bottom: isMobile ? 16 : 24, right: isMobile ? 16 : 24, zIndex: 1000 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => setWhatsappDialog(true)}
          startIcon={<WhatsAppIcon />}
          sx={{ borderRadius: 50, boxShadow: 2 }}
        >
          {isMobile ? "Support" : "WhatsApp Support"}
        </Button>
      </Box>

      {/* WhatsApp Dialog */}
      <Dialog open={whatsappDialog} onClose={() => setWhatsappDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          WhatsApp Support
          <IconButton onClick={() => setWhatsappDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Contact our support team on WhatsApp for assistance:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} onClick={() => openWhatsApp("919349781941")} fullWidth>Muhammed Iqbal</Button>
            <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} onClick={() => openWhatsApp("919961976080")} fullWidth>Abdusamad. K</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhatsappDialog(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 700, color: "primary.main" }}>
          NMEA TENDER SCHOLAR 26
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Exam Results Published
        </Typography>
      </Box>

      {/* Top Performers Section */}
      <Card sx={{ mb: 4, borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Top Performers</Typography>
        </Box>
        <Tabs 
          value={classTab} 
          onChange={(e, v) => setClassTab(v)} 
          centered 
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Class 10" value="10" />
          <Tab label="Class 12" value="12" />
        </Tabs>

        <CardContent>
          {loadingTop ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : topPerformers.length === 0 ? (
            <Typography variant="body1" textAlign="center" color="text.secondary">
              Results are not yet published for this class.
            </Typography>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {topPerformers.map((student, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      borderRadius: 3,
                      borderTop: `4px solid ${getMedalColor(student.rank)}`
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -15, 
                      bgcolor: 'background.paper', 
                      borderRadius: '50%', 
                      p: 0.5,
                      boxShadow: 1
                    }}>
                      <MedalIcon sx={{ fontSize: 32, color: getMedalColor(student.rank) }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Reg: {student.registrationCode}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {student.marks} / {student.totalMarks || 50}
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                        Rank {student.rank}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Result Check Section */}
      <Card sx={{ borderRadius: 2, mb: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Check Your Result
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Registration Code"
                value={searchRegCode}
                onChange={(e) => setSearchRegCode(e.target.value.toUpperCase())}
                placeholder="e.g. PPM10001"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={searchDob}
                onChange={(e) => setSearchDob(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSearch}
                disabled={loadingSearch}
                sx={{ height: '56px' }}
                startIcon={!loadingSearch && <SearchIcon />}
              >
                {loadingSearch ? <CircularProgress size={24} color="inherit" /> : "Check"}
              </Button>
            </Grid>
          </Grid>

          {searchError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {searchError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Result Display */}
      {result && (
        <Card sx={{ borderRadius: 2, mb: 4, boxShadow: 3, border: `2px solid ${theme.palette.primary.light}` }}>
          <CardContent sx={{ p: isMobile ? 2 : 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                Result Details
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {result.student?.name}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Registration Code</Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                    {result.result.registrationCode}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Class</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Class {result.student?.studyingClass}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50', border: `1px solid ${theme.palette.primary.light}` }}>
                  <Typography variant="caption" color="primary.main" fontWeight={600}>Marks Obtained</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {result.result.examMarks} <Typography component="span" variant="h6" color="text.secondary">/ {result.result.totalMarks || 50}</Typography>
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: result.result.rank > 0 && result.result.rank <= 3 ? '#FFFBF0' : 'grey.50', border: result.result.rank > 0 && result.result.rank <= 3 ? '1px solid #FFE4A0' : '' }}>
                  <Typography variant="caption" color="text.secondary">Rank</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" fontWeight={700} color={result.result.rank > 0 && result.result.rank <= 3 ? '#D4AF37' : 'text.primary'}>
                      {result.result.rank > 0 ? result.result.rank : "N/A"}
                    </Typography>
                    {result.result.rank > 0 && result.result.rank <= 3 && (
                       <MedalIcon sx={{ fontSize: 32, color: getMedalColor(result.result.rank) }} />
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Developed by <strong>Muhammed Salih KM</strong> | 81570 24638
        </Typography>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} PPMHSS Kottukkara
        </Typography>
      </Box>
    </Container>
  );
};

export default ResultPublishingSite;
