import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthUser } from '../types.ts';

interface ProtectedRouteProps {
  currentUser: AuthUser | null;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ currentUser, children }) => {
  const location = useLocation();
  const token = localStorage.getItem('keyhole-jwt');

  // Only redirect if both currentUser and stored token are missing
  if (!currentUser && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
