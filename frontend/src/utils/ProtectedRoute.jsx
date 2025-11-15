// utils/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { currentUser } from "../api";   // your API

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) {
      setValid(false);
      setLoading(false);
      return;
    }

    currentUser(token)
      .then(() => {
        setValid(true);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        setValid(false);
        setLoading(false);
      });
  }, [token]);

  if (loading) return null;

  if (!valid) return <Navigate to="/login" replace />;

  return children;
}
