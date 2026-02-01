import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;