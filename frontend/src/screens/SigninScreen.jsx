import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { useSigninUserMutation } from "../api/usersApi"; // 1. Importar el hook de RTK Query
import Button from "../components/Button";
import { userSignin as signinAction } from "../slices/userSlice"; // 2. Importar la acción del slice
import { Mail, Lock, LogIn } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function SigninScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const dispatch = useDispatch();

  // 3. Usar el hook de la mutación
  // isLoading es el equivalente a 'loading'
  // error contiene la información del error si la petición falla
  const [signinUser, { isLoading, error }] = useSigninUserMutation();

  // Obtenemos userInfo del estado global para saber si ya hay una sesión
  const { userInfo } = useSelector((state) => state.userSignin);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const userData = await signinUser({ email, password }).unwrap();
      // 4. Si el login es exitoso, despachamos la acción para guardar los datos del usuario en el store
      dispatch(signinAction(userData));
      navigate(redirect);
    } catch (err) {
      // El error ya es manejado por el estado 'error' del hook
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
        {/* 5. Mostrar el mensaje de error que viene del hook */}
        {error && <p className="signin-error">{error.data?.message || "Error al iniciar sesión"}</p>}
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
