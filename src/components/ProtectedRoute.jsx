import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, role = 'admin' }) => {
  const location = useLocation();
  const token = localStorage.getItem(`${role}Token`);
  
  console.log(`ProtectedRoute Debug - Role: ${role}`);
  console.log(`Token exists: ${!!token}`);
  console.log(`Token value: ${token ? 'Yes' : 'No'}`);
  
  if (!token) {
    console.log('No token found, redirecting to login');
    toast.error('Please login to access this page');
    return <Navigate to={`/${role}/login`} replace state={{ from: location }} />;
  }
  
  // For admin routes, accept both 'admin' and 'superadmin' roles
  if (role === 'admin') {
    const userRole = localStorage.getItem('adminRole');
    console.log(`User role from storage: ${userRole}`);
    console.log(`Expected role (for admin): 'admin' or 'superadmin'`);
    
    // Accept both admin and superadmin roles
    if (!['admin', 'superadmin'].includes(userRole)) {
      console.log(`Role mismatch! User role: ${userRole}, Required: admin or superadmin`);
      toast.error('Unauthorized access');
      return <Navigate to="/" replace />;
    }
  }
  
  // For invigilator routes
  if (role === 'invigilator') {
    const userRole = localStorage.getItem('invigilatorRole');
    console.log(`User role from storage: ${userRole}`);
    console.log(`Expected role (for invigilator): 'invigilator'`);
    
    if (userRole !== 'invigilator') {
      console.log(`Role mismatch! User role: ${userRole}, Required: invigilator`);
      toast.error('Unauthorized access');
      return <Navigate to="/" replace />;
    }
  }
  
  console.log('Access granted');
  return children;
};

export default ProtectedRoute;