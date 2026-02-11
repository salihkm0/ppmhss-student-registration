import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Room as RoomIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

// Import Dashboard Components
import DashboardHome from "../../components/admin/DashboardHome.jsx";
import StudentManagement from "../../components/admin/StudentManagement.jsx";
import RoomManagement from "../../components/admin/RoomManagement.jsx";
import ResultsManagement from "../../components/admin/ResultsManagement.jsx";
import InvigilatorManagement from "../../components/admin/InvigilatorManagement.jsx";
import AdminSettings from "../../components/admin/AdminSettings.jsx";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin data and stats
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
        setAdminData(admin);
        
        // Fetch dashboard stats
        const response = await axios.get(
          "http://localhost:5010/api/admin/dashboard/stats",
          {
            headers: { "x-auth-token": token },
          }
          
        );
        
        if (response.data.success) {
          setStats(response.data);
        }
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminRole');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <DashboardIcon className="w-5 h-5" />, 
      path: "/admin/dashboard" 
    },
    { 
      text: "Students", 
      icon: <PeopleIcon className="w-5 h-5" />, 
      path: "/admin/students" 
    },
    { 
      text: "Rooms", 
      icon: <RoomIcon className="w-5 h-5" />, 
      path: "/admin/rooms" 
    },
    { 
      text: "Results", 
      icon: <AssessmentIcon className="w-5 h-5" />, 
      path: "/admin/results" 
    },
    { 
      text: "Invigilators", 
      icon: <PersonAddIcon className="w-5 h-5" />, 
      path: "/admin/invigilators" 
    },
    { 
      text: "Settings", 
      icon: <SettingsIcon className="w-5 h-5" />, 
      path: "/admin/settings" 
    },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.text : 'Dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
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

      {/* Sidebar - Fixed positioned */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <AdminIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
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
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className={`mr-3 ${
                  location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {item.icon}
                </div>
                {item.text}
                {location.pathname === item.path && (
                  <ChevronRightIcon className="w-4 h-4 ml-auto" />
                )}
              </a>
            ))}
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

          {/* Admin Info */}
          {/* <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-sm font-medium text-blue-600">
                  {adminData?.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{adminData?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{adminData?.role || 'Administrator'}</p>
              </div>
            </div>
          </div> */}
        </div>
      </aside>

      {/* Main Content - Offset for sidebar */}
      <div className="lg:pl-64">
        {/* Topbar - Fixed positioned */}
        <header className="sticky top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
              >
                <MenuIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-gray-800">{getCurrentPageTitle()}</h1>
                <p className="text-sm text-gray-500">Manage NMEA TENDER SCHOLAR 26</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Stats Badge */}
              <div className="hidden px-3 py-1 text-sm border border-blue-200 rounded-full md:flex items-center bg-blue-50">
                <TrendingUpIcon className="w-4 h-4 mr-1 text-blue-600" />
                <span className="font-medium text-blue-700">
                  {stats?.stats?.totalStudents || 0} Students
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <NotificationsIcon className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                  <span className="relative inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-medium text-blue-600">
                    {adminData?.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden ml-3 md:block">
                  <p className="text-sm font-medium text-gray-800">{adminData?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{adminData?.role || 'Administrator'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Main area with padding to avoid overlap */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardHome stats={stats} />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/rooms" element={<RoomManagement stats={stats} />} />
              <Route path="/results" element={<ResultsManagement />} />
              <Route path="/invigilators" element={<InvigilatorManagement />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/" element={<DashboardHome stats={stats} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;