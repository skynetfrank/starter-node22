import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { signin } from "../actions/userActions";
import Button from "../components/Button";
import { Mail, Lock, LogIn } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function SigninScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo, loading, error } = userSignin;

  const dispatch = useDispatch();
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(signin(email, password));
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={submitHandler}>
        <img src={logo} alt="Logo" className="signin-logo" />
        <h2>Iniciar Sesión</h2>

        {error && <p className="signin-error">{error}</p>}

        <div className="input-group">
          <Mail className="input-icon" />
          <input type="email" placeholder="Correo Electrónico" required onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input type="password" placeholder="Contraseña" required onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-actions">
          <Button type="submit" size="large" disabled={loading} className="btn-with-icon">
            {loading ? <div className="spinner"></div> : <LogIn />}
            <span>{loading ? "Iniciando..." : "Iniciar Sesión"}</span>
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
