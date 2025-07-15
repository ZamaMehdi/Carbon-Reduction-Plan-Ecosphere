// components/RequireAdmin.jsx
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ user, children }) => {
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
  if (!user) return null; // loading or not yet fetched
  if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RequireAdmin;
