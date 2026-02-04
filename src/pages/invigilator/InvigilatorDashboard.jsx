import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dashboard as DashboardIcon,
  Room as RoomIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

// Import Invigilator Components
import InvigilatorHome from "../../components/invigilator/InvigilatorHome.jsx";
import AssignedRooms from "../../components/invigilator/AssignedRooms.jsx";
import EnterMarks from "../../components/invigilator/EnterMarks.jsx";
import StudentList from "../../components/invigilator/StudentList.jsx";
import InvigilatorProfile from "../../components/invigilator/InvigilatorProfile.jsx";

const InvigilatorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invigilatorData, setInvigilatorData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch invigilator data
  useEffect(() => {
    const fetchInvigilatorData = async () => {
      try {
        const token = localStorage.getItem('invigilatorToken');
        const invigilator = JSON.parse(localStorage.getItem('invigilatorData') || '{}');
        setInvigilatorData(invigilator);
        
        // Fetch dashboard data
        const response = await axios.get(
          "https://apinmea.oxiumev.com/api/invigilator/dashboard",
          {
            headers: { "x-auth-token": token },
          }
        );
        
        if (response.data.success) {
          setDashboardData(response.data.dashboard);
          
          // Generate notifications
          const newNotifications = [];
          response.data.dashboard.assignedRooms.forEach(room => {
            if (room.marksPending > 0) {
              newNotifications.push({
                id: room.roomNo,
                message: `Room ${room.roomNo}: ${room.marksPending} marks pending`,
                time: "Just now",
                type: "warning",
                read: false,
              });
            }
            if (room.marksEntered > 0) {
              newNotifications.push({
                id: `completed-${room.roomNo}`,
                message: `Room ${room.roomNo}: ${room.marksEntered} marks entered`,
                time: "Today",
                type: "success",
                read: true,
              });
            }
          });
          setNotifications(newNotifications);
        }
        
      } catch (error) {
        console.error("Error fetching invigilator data:", error);
        if (error.response?.status === 401) {
          handleLogout();
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvigilatorData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('invigilatorToken');
    localStorage.removeItem('invigilatorData');
    localStorage.removeItem('invigilatorRole');
    navigate('/invigilator/login');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <DashboardIcon className="w-5 h-5" />, 
      path: "/invigilator/dashboard" 
    },
    { 
      text: "Assigned Rooms", 
      icon: <RoomIcon className="w-5 h-5" />, 
      path: "/invigilator/rooms" 
    },
    { 
      text: "Enter Marks", 
      icon: <AssignmentIcon className="w-5 h-5" />, 
      path: "/invigilator/marks" 
    },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.text : 'Dashboard';
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const pendingMarks = dashboardData?.stats?.totalMarksPending || 0;
  const totalRooms = dashboardData?.stats?.totalAssignedRooms || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Invigilator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <AssignmentIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Invigilator</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg lg:hidden hover:bg-gray-100"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <a
                key={item.text}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className={`mr-3 ${
                  location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {item.icon}
                </div>
                {item.text}
                {location.pathname === item.path && (
                  <ChevronRightIcon className="w-4 h-4 ml-auto" />
                )}
              </a>
            ))}

            {/* Pending Marks Quick Link */}
            {pendingMarks > 0 && (
              <a
                href="/invigilator/marks"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/invigilator/marks');
                  setSidebarOpen(false);
                }}
                className="flex items-center px-4 py-3 text-sm font-medium text-amber-700 rounded-lg bg-amber-50 hover:bg-amber-100 hover:text-amber-800 border-l-4 border-amber-500"
              >
                <div className="mr-3">
                  <WarningIcon className="w-5 h-5" />
                </div>
                Pending Marks
                <span className="ml-auto px-2 py-1 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingMarks}
                </span>
              </a>
            )}
          </nav>

          {/* Footer Links */}
          <div className="p-4 border-t border-gray-200">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
            >
              <HomeIcon className="w-5 h-5 mr-3 text-gray-400" />
              Home Page
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700"
            >
              <LogoutIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>

          {/* Invigilator Info */}
          {/* <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                <span className="text-sm font-medium text-indigo-600">
                  {invigilatorData?.name?.charAt(0) || 'I'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {invigilatorData?.name || 'Invigilator'}
                </p>
                <p className="text-xs text-gray-500">
                  {totalRooms} room{totalRooms !== 1 ? 's' : ''} assigned
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
              >
                <MenuIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-gray-800">
                  {getCurrentPageTitle()}
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {invigilatorData?.name || 'Invigilator'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Pending Marks Badge */}
              {pendingMarks > 0 && (
                <div className="hidden px-3 py-1 text-sm border border-amber-200 rounded-full md:flex items-center bg-amber-50">
                  <WarningIcon className="w-4 h-4 mr-1 text-amber-600" />
                  <span className="font-medium text-amber-700">
                    {pendingMarks} pending marks
                  </span>
                </div>
              )}

              {/* Completed Marks Badge */}
              {dashboardData?.stats?.totalMarksEntered > 0 && (
                <div className="hidden px-3 py-1 text-sm border border-green-200 rounded-full md:flex items-center bg-green-50">
                  <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                  <span className="font-medium text-green-700">
                    {dashboardData.stats.totalMarksEntered} entered
                  </span>
                </div>
              )}

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <NotificationsIcon className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
                  </span>
                )}
              </button>

              {/* Invigilator Avatar */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                  <span className="text-sm font-medium text-indigo-600">
                    {invigilatorData?.name?.charAt(0) || 'I'}
                  </span>
                </div>
                <div className="hidden ml-3 md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {invigilatorData?.name || 'Invigilator'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {invigilatorData?.invigilatorCode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <WarningIcon className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/dashboard" element={<InvigilatorHome dashboardData={dashboardData} />} />
              <Route path="/rooms" element={<AssignedRooms dashboardData={dashboardData} />} />
              <Route path="/marks" element={<EnterMarks dashboardData={dashboardData} />} />
              <Route path="/students" element={<StudentList dashboardData={dashboardData} />} />
              <Route path="/profile" element={<InvigilatorProfile invigilatorData={invigilatorData} />} />
              <Route path="/" element={<InvigilatorHome dashboardData={dashboardData} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvigilatorDashboard;