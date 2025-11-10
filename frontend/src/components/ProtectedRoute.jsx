import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";

/**
 * Componente de Ruta Protegida.
 * Verifica si el usuario está autenticado.
 * - Si está autenticado, renderiza el contenido de la ruta anidada (`<Outlet />`).
 * - Si no, redirige al usuario a la página de inicio de sesión, guardando la
 *   ubicación original para poder volver a ella después del login.
 */
const ProtectedRoute = () => {
  // 1. Selección más directa del estado y obtención de la ubicación actual.
  const { userInfo } = useSelector((state) => state.userSignin);
  const location = useLocation();

  // 2. Uso de un operador ternario y paso del estado de la ubicación.
  // La prop 'replace' mejora la experiencia de navegación al presionar "atrás".
  return userInfo ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} replace />;
};

export default ProtectedRoute;
