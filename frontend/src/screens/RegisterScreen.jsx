import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { register } from "../actions/userActions";
import { USER_REGISTER_RESET } from "../constants/userConstants";
import Button from "../components/Button";
import { User, Mail, Lock, Eye, EyeOff, LogIn, Phone, Fingerprint } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null); // Para error de contraseñas

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const userRegister = useSelector((state) => state.userRegister);
  const { userInfo, loading, error } = userRegister;

  const dispatch = useDispatch();
  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
    } else {
      setMessage(null);
      dispatch(register(nombre, email, apellido, cedula, password, telefono));
    }
  };
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Limpia el mensaje de error del servidor después de unos segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch({ type: USER_REGISTER_RESET });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, error]);

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={submitHandler} style={{ gap: "1rem" }}>
        <img src={logo} alt="Logo" className="signin-logo" />
        <h2>Crear Cuenta</h2>

        <div className="input-group">
          <User className="input-icon" />
          <input type="text" placeholder="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div className="input-group">
          <User className="input-icon" />
          <input
            type="text"
            placeholder="Apellido"
            required
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </div>

        <div className="input-group">
          <Mail className="input-icon" />
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Clave"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar Clave"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="input-group">
          <Fingerprint className="input-icon" />
          <input type="text" placeholder="Cédula" required value={cedula} onChange={(e) => setCedula(e.target.value)} />
        </div>

        <div className="input-group">
          <Phone className="input-icon" />
          <input
            type="text"
            placeholder="Teléfono"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        {/* Muestra el error del servidor o el de la validación local */}
        {(error || message) && <p className="signin-error">{error || message}</p>}

        <div className="form-actions">
          <Button type="submit" size="large" disabled={loading} className="btn-with-icon">
            {loading ? <div className="spinner"></div> : <LogIn />}
            <span>{loading ? "Registrando..." : "Registrar"}</span>
          </Button>
        </div>

        <div className="signin-footer">
          <span>¿Ya tienes una cuenta? </span>
          <Link to={`/signin?redirect=${redirect}`}>Inicia Sesión</Link>
        </div>
      </form>
    </div>
  );
}
