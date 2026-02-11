import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
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
  Alert,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Room as RoomIcon,
  EventSeat as SeatIcon,
  AutoFixHigh as AutoSaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

// const EnterMarks = ({ dashboardData, onDataUpdate }) => {
//   const [rooms, setRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [marks, setMarks] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
//   const [bulkMarks, setBulkMarks] = useState("");
//   const [autoSave, setAutoSave] = useState(false);
//   const [savingStudentId, setSavingStudentId] = useState(null);

//   // Initialize data
//   useEffect(() => {
//     if (dashboardData?.assignedRooms) {
//       setRooms(dashboardData.assignedRooms);
//       if (dashboardData.assignedRooms.length > 0) {
//         const firstRoom = dashboardData.assignedRooms[0];
//         setSelectedRoom(firstRoom.roomNo);
//         initializeRoomData(firstRoom);
//       }
//     }
//   }, [dashboardData]);

//   // Initialize room data
//   const initializeRoomData = (room) => {
//     setStudents(room.students);
    
//     // Initialize marks object with student IDs
//     const initialMarks = {};
//     room.students.forEach(student => {
//       initialMarks[student._id] = student.examMarks || '';
//     });
//     setMarks(initialMarks);
//   };

//   // Handle room selection
//   const handleRoomSelect = (roomNo) => {
//     setSelectedRoom(roomNo);
//     const room = rooms.find(r => r.roomNo === roomNo);
//     if (room) {
//       initializeRoomData(room);
//     }
//   };

//   // Handle mark input change
//   const handleMarkChange = (studentId, value) => {
//     const numValue = parseInt(value);
//     if ((!isNaN(numValue) && numValue >= 0 && numValue <= 100) || value === '') {
//       const newMarks = { ...marks, [studentId]: value };
//       setMarks(newMarks);
      
//       // Auto-save if enabled
//       if (autoSave && value !== '' && !isNaN(numValue)) {
//         handleSaveSingleMark(studentId, value);
//       }
//     }
//   };

//   // Save single mark
//   const handleSaveSingleMark = async (studentId, markValue) => {
//     if (markValue === '' || markValue === undefined || markValue === null) {
//       return;
//     }

//     const mark = parseInt(markValue);
//     if (isNaN(mark) || mark < 0 || mark > 100) {
//       toast.error("Please enter valid marks between 0-100");
//       return;
//     }

//     setSavingStudentId(studentId);
//     try {
//       const token = localStorage.getItem('invigilatorToken');
//       const response = await axios.post(
//         `http://localhost:5010/api/invigilator/students/${studentId}/marks`,
//         { marks: mark },
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         // Update local state immediately
//         const updatedStudents = students.map(student => 
//           student._id === studentId 
//             ? { ...student, examMarks: mark, resultStatus: mark >= 40 ? 'Passed' : 'Failed' }
//             : student
//         );
//         setStudents(updatedStudents);
        
//         // Update room data
//         const updatedRooms = rooms.map(room => {
//           if (room.roomNo === selectedRoom) {
//             const updatedRoomStudents = room.students.map(student => 
//               student._id === studentId 
//                 ? { ...student, examMarks: mark, resultStatus: mark >= 40 ? 'Passed' : 'Failed' }
//                 : student
//             );
//             return {
//               ...room,
//               students: updatedRoomStudents,
//               marksEntered: updatedRoomStudents.filter(s => s.examMarks > 0).length,
//               marksPending: updatedRoomStudents.filter(s => !s.examMarks).length
//             };
//           }
//           return room;
//         });
//         setRooms(updatedRooms);
        
//         // Update dashboard data if callback provided
//         if (onDataUpdate) {
//           onDataUpdate();
//         }
        
//         // Show success message (only if not auto-saving)
//         if (!autoSave) {
//           toast.success("Marks saved successfully");
//         }
//       }
//     } catch (error) {
//       console.error("Error saving mark:", error);
//       toast.error(error.response?.data?.error || "Failed to save marks");
//     } finally {
//       setSavingStudentId(null);
//     }
//   };

//   // Save all marks
//   const handleSaveAllMarks = async () => {
//     const marksToSave = Object.entries(marks)
//       .filter(([studentId, mark]) => 
//         mark !== '' && mark !== undefined && mark !== null && 
//         mark !== students.find(s => s._id === studentId)?.examMarks
//       )
//       .map(([studentId, mark]) => ({ 
//         studentId, 
//         marks: parseInt(mark) 
//       }));

//     if (marksToSave.length === 0) {
//       toast.info("No changes to save");
//       return;
//     }

//     setSaving(true);
//     try {
//       const token = localStorage.getItem('invigilatorToken');
      
//       // Save marks in parallel
//       const savePromises = marksToSave.map(async ({ studentId, marks: markValue }) => {
//         try {
//           const response = await axios.post(
//             `http://localhost:5010/api/invigilator/students/${studentId}/marks`,
//             { marks: markValue },
//             {
//               headers: { "x-auth-token": token },
//             }
//           );
//           return { studentId, success: true, data: response.data };
//         } catch (error) {
//           return { studentId, success: false, error };
//         }
//       });

//       const results = await Promise.all(savePromises);
//       const successfulSaves = results.filter(r => r.success);
//       const failedSaves = results.filter(r => !r.success);

//       if (successfulSaves.length > 0) {
//         // Update local state for successful saves
//         const updatedStudents = [...students];
//         const updatedRooms = [...rooms];
        
//         successfulSaves.forEach(({ studentId, data }) => {
//           // Update student in students array
//           const studentIndex = updatedStudents.findIndex(s => s._id === studentId);
//           if (studentIndex !== -1 && data?.data?.student) {
//             updatedStudents[studentIndex] = {
//               ...updatedStudents[studentIndex],
//               examMarks: data.data.student.examMarks,
//               resultStatus: data.data.student.resultStatus
//             };
//           }
          
//           // Update student in rooms array
//           updatedRooms.forEach(room => {
//             if (room.roomNo === selectedRoom) {
//               const roomStudentIndex = room.students.findIndex(s => s._id === studentId);
//               if (roomStudentIndex !== -1 && data?.data?.student) {
//                 room.students[roomStudentIndex] = {
//                   ...room.students[roomStudentIndex],
//                   examMarks: data.data.student.examMarks,
//                   resultStatus: data.data.student.resultStatus
//                 };
//               }
//             }
//           });
//         });

//         // Recalculate room statistics
//         updatedRooms.forEach(room => {
//           if (room.roomNo === selectedRoom) {
//             room.marksEntered = room.students.filter(s => s.examMarks > 0).length;
//             room.marksPending = room.students.filter(s => !s.examMarks).length;
//           }
//         });

//         setStudents(updatedStudents);
//         setRooms(updatedRooms);
        
//         // Update dashboard data if callback provided
//         if (onDataUpdate) {
//           onDataUpdate();
//         }

//         toast.success(`Saved ${successfulSaves.length} marks${failedSaves.length > 0 ? `, ${failedSaves.length} failed` : ''}`);
//       }

//       if (failedSaves.length > 0) {
//         console.error("Failed saves:", failedSaves);
//       }

//     } catch (error) {
//       console.error("Error saving marks:", error);
//       toast.error("Failed to save marks");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Bulk save marks
//   const handleBulkSave = async () => {
//     const lines = bulkMarks.split('\n').filter(line => line.trim());
//     const marksData = [];

//     for (const line of lines) {
//       const [registrationCode, markStr] = line.split(',').map(item => item.trim());
//       const mark = parseInt(markStr);
      
//       if (registrationCode && !isNaN(mark) && mark >= 0 && mark <= 100) {
//         marksData.push({ registrationCode, marks: mark });
//       }
//     }

//     if (marksData.length === 0) {
//       toast.error("No valid marks found in bulk data");
//       return;
//     }

//     setSaving(true);
//     try {
//       const token = localStorage.getItem('invigilatorToken');
//       const response = await axios.post(
//         `http://localhost:5010/api/invigilator/rooms/${selectedRoom}/bulk-marks`,
//         { marksData },
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (response.data.success) {
//         toast.success(`Saved ${response.data.data.successful} marks. ${response.data.data.failed} failed.`);
//         setBulkDialogOpen(false);
//         setBulkMarks("");
        
//         // Refresh data
//         await refreshRoomData();
//       }
//     } catch (error) {
//       console.error("Error saving bulk marks:", error);
//       toast.error("Failed to save bulk marks");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Refresh room data
//   const refreshRoomData = async () => {
//     try {
//       const token = localStorage.getItem('invigilatorToken');
//       const dashboardResponse = await axios.get(
//         "http://localhost:5010/api/invigilator/dashboard",
//         {
//           headers: { "x-auth-token": token },
//         }
//       );

//       if (dashboardResponse.data.success) {
//         const updatedRooms = dashboardResponse.data.dashboard.assignedRooms;
//         setRooms(updatedRooms);
        
//         const updatedRoom = updatedRooms.find(r => r.roomNo === selectedRoom);
//         if (updatedRoom) {
//           setStudents(updatedRoom.students);
          
//           // Update marks object
//           const updatedMarks = {};
//           updatedRoom.students.forEach(student => {
//             updatedMarks[student._id] = student.examMarks || '';
//           });
//           setMarks(updatedMarks);
//         }
        
//         // Update dashboard data if callback provided
//         if (onDataUpdate) {
//           onDataUpdate();
//         }
//       }
//     } catch (error) {
//       console.error("Error refreshing data:", error);
//       toast.error("Failed to refresh data");
//     }
//   };

//   // Manual refresh
//   const handleRefresh = async () => {
//     setLoading(true);
//     await refreshRoomData();
//     setLoading(false);
//     toast.success("Data refreshed");
//   };

//   // Calculate progress
//   const calculateProgress = () => {
//     const totalStudents = students.length;
//     const enteredMarks = Object.values(marks).filter(mark => 
//       mark !== '' && mark !== undefined && mark !== null
//     ).length;
//     return totalStudents > 0 ? (enteredMarks / totalStudents) * 100 : 0;
//   };

//   // Get room by selectedRoom
//   const currentRoom = rooms.find(r => r.roomNo === selectedRoom);

//   if (rooms.length === 0) {
//     return (
//       <Alert severity="info">
//         No rooms assigned to you. Please contact the admin to get room assignments.
//       </Alert>
//     );
//   }

//   return (
//     <Box>
//       <Typography variant="h4" fontWeight={600} gutterBottom>
//         Enter Marks
//       </Typography>
//       <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
//         Enter exam marks for students in your assigned rooms
//       </Typography>

//       {/* Room Selection */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Typography variant="subtitle1" fontWeight={600} gutterBottom>
//           Select Room
//         </Typography>
//         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//           {rooms.map((room) => (
//             <Chip
//               key={room.roomNo}
//               label={`Room ${room.roomNo} (${room.marksEntered}/${room.totalStudents})`}
//               color={selectedRoom === room.roomNo ? "primary" : "default"}
//               onClick={() => handleRoomSelect(room.roomNo)}
//               icon={room.marksPending > 0 ? <WarningIcon /> : <CheckCircleIcon />}
//             />
//           ))}
//         </Box>
//       </Paper>

//       {/* Progress and Controls */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Grid container alignItems="center" spacing={2}>
//           <Grid item xs={12} md={6}>
//             <Box>
//               <Typography variant="body2" gutterBottom>
//                 Marks Entry Progress for Room {selectedRoom}
//               </Typography>
//               <LinearProgress
//                 variant="determinate"
//                 value={calculateProgress()}
//                 sx={{ height: 8, borderRadius: 4 }}
//               />
//               <Typography variant="caption" color="text.secondary">
//                 {Object.values(marks).filter(mark => mark !== '' && mark !== undefined && mark !== null).length} / {students.length} marks entered
//               </Typography>
//             </Box>
//           </Grid>
//           {/* <Grid item xs={12} md={6}>
//             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<RefreshIcon />}
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 size="small"
//               >
//                 {loading ? 'Refreshing...' : 'Refresh'}
//               </Button>
//               <Button
//                 variant="outlined"
//                 startIcon={<AutoSaveIcon />}
//                 onClick={() => setAutoSave(!autoSave)}
//                 color={autoSave ? "success" : "default"}
//                 size="small"
//               >
//                 Auto-save {autoSave ? 'ON' : 'OFF'}
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 onClick={handleSaveAllMarks}
//                 disabled={saving}
//                 size="small"
//               >
//                 {saving ? 'Saving...' : 'Save All'}
//               </Button>
//             </Box>
//           </Grid> */}
//         </Grid>
//       </Paper>

//       {/* Marks Entry Table */}
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow sx={{ bgcolor: '#f5f5f5' }}>
//               <TableCell>Seat No</TableCell>
//               <TableCell>Student</TableCell>
//               <TableCell>Registration Code</TableCell>
//               <TableCell>Previous Marks</TableCell>
//               <TableCell>Enter Marks (0-100)</TableCell>
//               <TableCell>Status</TableCell>
//               {/* <TableCell>Action</TableCell> */}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {students.map((student) => (
//               <TableRow key={student._id} hover>
//                 <TableCell>
//                   <Chip label={student.seatNo} size="small" />
//                 </TableCell>
//                 <TableCell>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Avatar sx={{ bgcolor: '#2563eb' }}>
//                       {student.name.charAt(0)}
//                     </Avatar>
//                     <Box>
//                       <Typography variant="body2" fontWeight={500}>
//                         {student.name}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {student.studyingClass}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="body2" fontFamily="monospace">
//                     {student.registrationCode}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="body2" fontWeight={600}>
//                     {student.examMarks || '-'}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <TextField
//                       size="small"
//                       type="number"
//                       value={marks[student._id] || ''}
//                       onChange={(e) => handleMarkChange(student._id, e.target.value)}
//                       onBlur={(e) => {
//                         if (!autoSave && e.target.value && parseInt(e.target.value) !== student.examMarks) {
//                           handleSaveSingleMark(student._id, e.target.value);
//                         }
//                       }}
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter' && !autoSave) {
//                           if (e.target.value && parseInt(e.target.value) !== student.examMarks) {
//                             handleSaveSingleMark(student._id, e.target.value);
//                           }
//                         }
//                       }}
//                       inputProps={{ 
//                         min: 0, 
//                         max: 100,
//                         style: { textAlign: 'center' }
//                       }}
//                       sx={{ width: 80 }}
//                       disabled={savingStudentId === student._id}
//                     />
//                     {savingStudentId === student._id && (
//                       <CircularProgress size={16} />
//                     )}
//                   </Box>
//                 </TableCell>
//                 <TableCell>
//                   {marks[student._id] !== undefined && marks[student._id] !== '' ? (
//                     <Chip label="Entered" color="success" size="small" />
//                   ) : student.examMarks ? (
//                     <Chip label="Previously Entered" color="info" size="small" />
//                   ) : (
//                     <Chip label="Pending" color="warning" size="small" />
//                   )}
//                 </TableCell>
//                 {/* <TableCell>
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     onClick={() => {
//                       if (marks[student._id] && marks[student._id] !== student.examMarks) {
//                         handleSaveSingleMark(student._id, marks[student._id]);
//                       }
//                     }}
//                     disabled={
//                       !marks[student._id] || 
//                       parseInt(marks[student._id]) === student.examMarks ||
//                       savingStudentId === student._id
//                     }
//                   >
//                     Save
//                   </Button>
//                 </TableCell> */}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Bulk Entry Dialog */}
//       <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
//         <DialogTitle>Bulk Marks Entry</DialogTitle>
//         <DialogContent>
//           <Alert severity="info" sx={{ mb: 2 }}>
//             Enter marks in CSV format: RegistrationCode,Marks (one per line)
//             <br />
//             Example:<br />
//             PPM1001,85<br />
//             PPM1002,92<br />
//             PPM1003,78
//           </Alert>
//           <TextField
//             multiline
//             rows={10}
//             fullWidth
//             value={bulkMarks}
//             onChange={(e) => setBulkMarks(e.target.value)}
//             placeholder="PPM1001,85&#10;PPM1002,92&#10;PPM1003,78"
//             sx={{ fontFamily: 'monospace' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleBulkSave}
//             disabled={saving || !bulkMarks.trim()}
//           >
//             {saving ? 'Saving...' : 'Save Bulk Marks'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

const EnterMarks = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Enter Marks Component
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a placeholder for the EnterMarks component.
      </Typography>
    </Box>
  );
}

export default EnterMarks;