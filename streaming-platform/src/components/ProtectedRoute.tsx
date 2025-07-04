import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, customUser, isSubscribed, hasFreeTrial } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if admin access is required
  if (requireAdmin && customUser?.email !== 'admin@streaming.com') {
    return <Navigate to="/" replace />;
  }

  // Check if user has access to content (subscription or free trial)
  if (!requireAdmin && !isSubscribed && !hasFreeTrial) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;