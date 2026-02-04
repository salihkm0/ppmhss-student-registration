import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RegistrationForm from './pages/RegistrationForm.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import InvigilatorLogin from './pages/admin/InvigilatorLogin.jsx';
import InvigilatorDashboard from './pages/invigilator/InvigilatorDashboard.jsx';
import StudentLookup from './pages/StudentLookup.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ResultLookup from './pages/ResultLookup.jsx'; // New result page
import HallTicketPage from './pages/HallTicketPage.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#64748b',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/lookup" element={<StudentLookup />} />
          <Route path="/results" element={<ResultLookup />} />
          <Route path="/hallticket/:code" element={<HallTicketPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Invigilator Routes */}
          <Route path="/invigilator/login" element={<InvigilatorLogin />} />
          <Route 
            path="/invigilator/*" 
            element={
              <ProtectedRoute role="invigilator">
                <InvigilatorDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Redirect */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;