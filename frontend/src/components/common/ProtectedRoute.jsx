import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoading: isReduxLoading } = useSelector(state => state.auth);

  if (!isLoaded || (isSignedIn && !user && isReduxLoading)) {
    return <Loader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user to be synced from backend to Redux
  if (!user) {
    return <Loader />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
