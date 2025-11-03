import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { useRegisterUserMutation } from "../api/usersApi";
import Button from "../components/Button";
import { userSignin as signinAction } from "../slices/userSlice";
import useCedulaValidation from "../hooks/useCedulaValidation"; // Importamos el hook
import useApiNotification from "../hooks/useApiNotification"; // 1. Importamos el hook de notificación
import { User, Mail, Lock, Eye, EyeOff, LogIn, Phone, Fingerprint } from "lucide-react";

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

  const validateCedula = useCedulaValidation(); // Instanciamos el validador

  const dispatch = useDispatch();

  // 1. Usar el hook de la mutación de registro
  const [registerUser, mutationState] = useRegisterUserMutation();
  const { isLoading } = mutationState;

  // 2. Obtener userInfo para redirigir si el usuario ya está logueado
  const { userInfo } = useSelector((state) => state.userSignin);

  // 3. Instanciar el hook de notificaciones
  useApiNotification(
    mutationState,
    {
      loading: "Creando tu cuenta...",
      success: "¡Registro exitoso! Serás redirigido.",
      error: (err) => {
        const errorMessage = err.data?.message || "";
        if (errorMessage.includes("duplicate key") || errorMessage.includes("E11000")) {
          return "El correo electrónico que ingresaste ya está en uso. Por favor, intenta con otro.";
        }
        return "Ocurrió un error al registrar la cuenta.";
      },
    },
    () => navigate(redirect) // 4. Callback onSuccess para redirigir
  );

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validamos la cédula antes de continuar
    const cedulaError = validateCedula(cedula);
    if (cedulaError) {
      setMessage(cedulaError);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }
    setMessage(null);

    try {
      // 5. Llamar a la mutación y despachar la acción
      const userData = await registerUser({ nombre, apellido, email, cedula, password, telefono }).unwrap(); // .unwrap() para manejar el catch
      dispatch(signinAction(userData));
    } catch (err) {
      // El error ya es manejado por el hook useApiNotification
      console.error("Fallo al registrar:", err);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={submitHandler} style={{ gap: "1rem" }}>
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

        {/* 5. Mostrar el error de la API o el de validación local */}
        {/* Ahora solo mostramos el estado 'message', que controlamos manualmente */}
        {message && <p className="signin-error">{message}</p>}

        <div className="form-actions">
          <Button type="submit" size="large" disabled={isLoading} className="btn-with-icon">
            {isLoading ? <div className="spinner"></div> : <LogIn />}
            <span>{isLoading ? "Registrando..." : "Registrar"}</span>
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
