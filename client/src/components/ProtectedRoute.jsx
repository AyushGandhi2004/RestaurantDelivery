import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './ui/Spinner.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save attempted URL so we can return after login
    return (
      <Navigate to={`/login?redirect=${location.pathname}`} replace />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Wrong role — redirect to appropriate home
    if (user?.role === 'admin')    return <Navigate to="/admin"    replace />;
    if (user?.role === 'delivery') return <Navigate to="/delivery" replace />;
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default ProtectedRoute;