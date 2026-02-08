import { Navigate, useLocation } from 'react-router';
import { useAuth } from './AuthContextProvider';

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
    );
  }

  if (isAuthenticated) {
    // Redirect to the page they were trying to visit or home
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
}

export default PublicRoute;
