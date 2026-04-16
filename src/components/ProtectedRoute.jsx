import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';

// Protected Route Component
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user?.role === 'admin' ? '/admin' : '/seller';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading text="Loading..." />;
  }

  if (isAuthenticated) {
    const redirectPath = user?.role === 'admin' ? '/admin' : '/seller';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
