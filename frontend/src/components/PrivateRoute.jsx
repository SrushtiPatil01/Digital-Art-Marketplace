import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles, usertypes }) => {
  const user = useSelector((state) => state.auth.user);

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Check role (admin/user)
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  // Check userType (buyer/seller) if role === 'user'
  if (usertypes && user.role === 'user' && !usertypes.includes(user.userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
