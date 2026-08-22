import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../pages/LoadingScreen';

export default function GuestRoute({ children }) {
  const { isAuthenticated, bootstrapping, user } = useAuth();

  if (bootstrapping) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.dashboard_route ?? '/account'} replace />;
  }

  return children;
}
