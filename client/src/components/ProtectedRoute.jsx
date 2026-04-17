import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from './ui/PageLoader.jsx';

const ROLE_HOME = {
  admin:    '/admin',
  delivery: '/delivery',
  customer: '/menu',
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Auth is still rehydrating from localStorage — show full-page loader
  if (loading) return <PageLoader />;

  // Not logged in — redirect to login, save intended destination
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Logged in but wrong role — send to their own home
  if (requiredRole && user?.role !== requiredRole) {
    const home = ROLE_HOME[user?.role] || '/menu';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;