import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="screen shell">Cargando sesión...</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
