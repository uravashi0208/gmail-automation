import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { currentUser } from '../api';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  const token = localStorage.getItem('jwt');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    currentUser()
      .then(() => setValid(true))
      .catch(() => localStorage.removeItem('jwt'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return null;
  if (!valid) return <Navigate to="/login" replace />;
  return children;
}
