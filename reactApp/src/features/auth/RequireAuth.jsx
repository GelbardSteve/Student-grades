import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

// Keeps signed-out visitors on the login page. This is only navigation: the data itself is protected by RLS.
export const RequireAuth = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};
