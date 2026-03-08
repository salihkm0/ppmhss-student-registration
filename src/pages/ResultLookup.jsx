import React, { useState } from "react";
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
  Chip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as AccountBalanceIcon,
  WhatsApp as WhatsAppIcon,
  Close as CloseIcon,
  Score as ScoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MilitaryTech as MedalIcon,
  Class as ClassIcon,
  ArrowBack as ArrowBackIcon,
  School as TrainingIcon,
  EmojiEvents as EmojiEventsIcon,
  SentimentVeryDissatisfied as SadIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResultLookup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchType, setSearchType] = useState("code");
  const [registrationCode, setRegistrationCode] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [result, setResult] = useState(null);
  const [multipleResults, setMultipleResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappDialog, setWhatsappDialog] = useState(false);

  const handleSearch = async () => {
    if (searchType === "code" && !registrationCode.trim()) {
      toast.error("Please enter a registration code");
      return;
    }

    if (searchType === "phone" && !phoneNo.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMultipleResults([]);

    try {
      if (searchType === "code") {
        const response = await axios.get(
          `https://apinmea.oxiumev.com/api/results/code/${registrationCode.trim().toUpperCase()}`,
        );

        if (response.data.success) {
          setResult(response.data.data);
          toast.success("Result found!");
        }
      } else {
        const response = await axios.get(
          `https://apinmea.oxiumev.com/api/results/phone/${phoneNo.trim()}`,
        );

        if (response.data.success) {
          setMultipleResults(response.data.data.results);
          toast.success(`${response.data.data.count} result(s) found!`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error.response?.data?.error || "Invalid search. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTabChange = (event, newValue) => {
    setSearchType(newValue);
    setRegistrationCode("");
    setPhoneNo("");
    setResult(null);
    setMultipleResults([]);
    setError("");
  };

  const getMedalIcon = (rank) => {
    if (rank === 1)
      return (
        <MedalIcon sx={{ color: "#FFD700", fontSize: isMobile ? 20 : 24 }} />
      );
    if (rank === 2)
      return (
        <MedalIcon sx={{ color: "#C0C0C0", fontSize: isMobile ? 20 : 24 }} />
      );
    if (rank === 3)
      return (
        <MedalIcon sx={{ color: "#CD7F32", fontSize: isMobile ? 20 : 24 }} />
      );
    return null;
  };

  const getScholarshipText = (scholarship) => {
    switch (scholarship) {
      case "Gold":
        return "Gold Scholarship";
      case "Silver":
        return "Silver Scholarship";
      case "Bronze":
        return "Bronze Scholarship";
      default:
        return "Not Eligible";
    }
  };

  const getScholarshipColor = (scholarship) => {
    switch (scholarship) {
      case "Gold":
        return "warning";
      case "Silver":
        return "default";
      case "Bronze":
        return "secondary";
      default:
        return "default";
    }
  };

  const openWhatsApp = (number) => {
    const message =
      "Hello, I need assistance with the NMEA TENDER SCHOLAR 26 results.";
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const getScholarshipValue = (result) => {
    return result?.scholarship || result?.scholarshipType || "";
  };

  const isStudentSelected = (student) => {
    const marks = student?.examMarks || 0;
    return marks >= 15;
  };

  // FIXED: Use the API response directly for IAS eligibility
  const isIASEligible = (student) => {
    // If the API already provides iasCoaching field, use it
    if (student?.iasCoaching !== undefined) {
      return (
        student.iasCoaching === true ||
        student.iasCoaching === "Eligible" ||
        student.iasCoaching === "ELIGIBLE"
      );
    }
    // Fallback to calculation if API doesn't provide it
    const marks = student?.examMarks || student?.marks || 0;
    const rank = student?.rank || 0;
    return rank <= 100 && marks >= 15;
  };

  // Helper to normalize scholarship value from API
  const getNormalizedScholarship = (student) => {
    if (!student) return "";
    if (
      student.scholarship &&
      student.scholarship !== "Not Eligible" &&
      student.scholarship !== "Not Eligible"
    ) {
      return student.scholarship;
    }
    if (student.scholarshipType && student.scholarshipType !== "Not Eligible") {
      return student.scholarshipType;
    }
    return "";
  };

  // Helper to check if student has scholarship
  const hasScholarship = (student) => {
    const scholarship = getNormalizedScholarship(student);
    return (
      scholarship === "Gold" ||
      scholarship === "Silver" ||
      scholarship === "Bronze"
    );
  };

  // Render results
  return (
    <Container
      maxWidth="md"
      sx={{
        py: isMobile ? 2 : 3,
        px: isMobile ? 1.5 : 2,
      }}
    >
      {/* WhatsApp Support Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => setWhatsappDialog(true)}
          startIcon={<WhatsAppIcon />}
          sx={{
            borderRadius: 50,
            boxShadow: 2,
            minWidth: isMobile ? "auto" : 180,
            px: isMobile ? 2 : 3,
            py: isMobile ? 1 : 1.5,
          }}
        >
          {isMobile ? "Support" : "WhatsApp Support"}
        </Button>
      </Box>

      {/* WhatsApp Dialog */}
      <Dialog
        open={whatsappDialog}
        onClose={() => setWhatsappDialog(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: isMobile ? 2 : 3,
            py: isMobile ? 1.5 : 2,
          }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            WhatsApp Support
          </Typography>
          <IconButton onClick={() => setWhatsappDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Contact our support team on WhatsApp for assistance:
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={() => openWhatsApp("919947073499")}
              fullWidth
              size={isMobile ? "medium" : "large"}
            >
              99470 73499
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={() => openWhatsApp("918547645640")}
              fullWidth
              size={isMobile ? "medium" : "large"}
            >
              85476 45640
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button
            onClick={() => setWhatsappDialog(false)}
            variant="contained"
            fullWidth={isMobile}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Back Button */}
      <Button
        variant="outlined"
        onClick={() => navigate("/")}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: isMobile ? 2 : 3 }}
        size={isMobile ? "small" : "medium"}
      >
        Back to Registration
      </Button>

      {/* Header */}
      <Card sx={{ mb: isMobile ? 2 : 3, borderRadius: 2 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              NMEA TENDER SCHOLAR 26
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exam Results Portal
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5 }}
            >
              PPMHSS Kottukkara, Kondotty, Malappuram
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Search Card */}
      <Card sx={{ borderRadius: 2, mb: isMobile ? 2 : 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Check Exam Results
          </Typography>

          {searchType === "code" ? (
            <TextField
              fullWidth
              label="Registration Code"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your registration code"
              size={isMobile ? "small" : "medium"}
              margin="normal"
            />
          ) : (
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your 10-digit phone number"
              size={isMobile ? "small" : "medium"}
              margin="normal"
              inputProps={{ maxLength: 10 }}
            />
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            disabled={loading}
            sx={{ mt: 2 }}
            size={isMobile ? "medium" : "large"}
          >
            {loading ? <CircularProgress size={24} /> : "Search Results"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Single Result */}
      {result && (
        <Card sx={{ borderRadius: 2, mb: 2 }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Result Details
            </Typography>

            {/* Selection Status - UPDATED MESSAGES */}
            {isStudentSelected(result.result) ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Congratulations!
                </Typography>
                <Typography variant="body2">
                  You have been selected for the one-day{" "}
                  <strong>Butterfly Workshop 2026.</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                  Further details will be shared through the WhatsApp group.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 , color: "red"}}>
                  Sorry!
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  You have not been selected.
                </Typography>
              </Alert>
            )}

            {/* Student Info */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Candidate Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {result.result.student?.name || result.student?.name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Registration Code
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  fontFamily="monospace"
                >
                  {result.result.registrationCode}
                </Typography>
              </Grid>
            </Grid>
            {/* Additional Info */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  School
                </Typography>
                <Typography variant="body2">
                  {result.student?.schoolName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Class
                </Typography>
                <Typography variant="body2">
                  Class {result.student?.studyingClass || "7"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Selection Status
                </Typography>
                <Chip
                  label={
                    isStudentSelected(result.result)
                      ? "SELECTED"
                      : "NOT SELECTED"
                  }
                  color={
                    isStudentSelected(result.result) ? "success" : "default"
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Multiple Results */}
      {multipleResults.length > 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Multiple Registrations Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {multipleResults.length} registration(s) found
            </Typography>

            {isMobile ? (
              // Mobile Card View
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {multipleResults.map((result, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ p: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {result.name?.charAt(0) || "?"}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {result.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Class {result.class || "7"}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Reg. Code
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {result.registrationCode || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            Marks
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {result.marks || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            Rank
                          </Typography>
                          <Typography variant="body2">
                            {result.rank || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 1 }} />

                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Chip
                            label={
                              hasScholarship(result)
                                ? getNormalizedScholarship(result)
                                : "No"
                            }
                            size="small"
                            color={
                              hasScholarship(result)
                                ? getScholarshipColor(
                                    getNormalizedScholarship(result),
                                  )
                                : "default"
                            }
                            variant={
                              hasScholarship(result) ? "filled" : "outlined"
                            }
                            sx={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Chip
                            label={result.isSelected ? "SELECTED" : "NOT"}
                            color={result.isSelected ? "success" : "default"}
                            size="small"
                            sx={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Chip
                            label={isIASEligible(result) ? "IAS" : "No"}
                            color={
                              isIASEligible(result) ? "success" : "default"
                            }
                            size="small"
                            variant={
                              isIASEligible(result) ? "filled" : "outlined"
                            }
                            sx={{ width: "100%" }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop Table View
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Student</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Code</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Marks</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Rank</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Scholarship</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Selection</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>IAS</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {multipleResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {result.name?.charAt(0) || "?"}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {result.name || "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Class {result.class || "7"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {result.registrationCode || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={500}>
                            {result.marks || 0}/{result.totalMarks || 50}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            {getMedalIcon(result.rank)}
                            <Typography variant="body2">
                              {result.rank || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {hasScholarship(result) ? (
                            <Chip
                              label={getNormalizedScholarship(result)}
                              color={getScholarshipColor(
                                getNormalizedScholarship(result),
                              )}
                              size="small"
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={result.isSelected ? "YES" : "NO"}
                            color={result.isSelected ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isIASEligible(result) ? "YES" : "NO"}
                            color={
                              isIASEligible(result) ? "success" : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card sx={{ mt: isMobile ? 2 : 3, borderRadius: 2 }}>
        <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Developed by <strong>Muhammed Salih KM</strong> | 81570 24638
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              © {new Date().getFullYear()} PPMHSS Kottukkara
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResultLookup;