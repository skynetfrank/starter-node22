import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { useSigninUserMutation } from "../api/usersApi";
import Button from "../components/Button";
import { userSignin as signinAction } from "../slices/userSlice";
import useApiNotification from "../hooks/useApiNotification"; // 1. Importar el hook de notificación
import { Mail, Lock, LogIn } from "lucide-react";

export default function SigninScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const dispatch = useDispatch();

  // 2. Usar el hook de la mutación y obtener el estado completo
  const [signinUser, mutationState] = useSigninUserMutation();
  const { isLoading } = mutationState;

  // Obtenemos userInfo del estado global para saber si ya hay una sesión
  const { userInfo } = useSelector((state) => state.userSignin);

  // 3. Instanciar el hook de notificaciones
  useApiNotification(
    mutationState,
    {
      loading: "Iniciando sesión...",
      success: "¡Bienvenido de vuelta!",
      error: (err) => err?.data?.message || "Ocurrió un error al iniciar sesión.",
    },
    () => navigate(redirect), // 4. Callback para redirigir en caso de éxito
    // 5. Opciones adicionales para las notificaciones
    {
      success: {
        timer: 2000, // La alerta se cerrará después de 2 segundos
        timerProgressBar: true, // Muestra una barra de progreso
        showConfirmButton: false, // Oculta el botón "OK"
      },
    }
  );

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const userData = await signinUser({ email, password }).unwrap();
      // 5. Si el login es exitoso, despachamos la acción para guardar los datos en el store
      dispatch(signinAction(userData));
      // La redirección ahora es manejada por el callback onSuccess del hook
    } catch (err) {
      // La notificación de error es manejada por el hook useApiNotification
      console.error("Failed to sign in:", err);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={submitHandler}>
        <h2>Iniciar Sesión</h2>
        {/* 6. El mensaje de error ahora es manejado por la notificación, por lo que se elimina de aquí */}

        <div className="input-group">
          <Mail className="input-icon" />
          <input type="email" placeholder="Correo Electrónico" required onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input type="password" placeholder="Contraseña" required onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-actions">
          <Button type="submit" size="large" disabled={isLoading} className="btn-with-icon">
            {isLoading ? <div className="spinner"></div> : <LogIn />}
            <span>{isLoading ? "Iniciando..." : "Iniciar Sesión"}</span>
          </Button>
        </div>

        <div className="signin-footer">
          <span>
            ¿No tienes cuenta? <Link to={`/register?redirect=${redirect}`}>Regístrate</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
