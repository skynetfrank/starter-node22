import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserQuery, useUpdateUserProfileMutation } from "../api/usersApi";
import { userSignin as signinAction, userSignout } from "../slices/userSlice";
import Button from "../components/Button";
import { User, Mail, Lock, Eye, EyeOff, Fingerprint, Phone, Save, LogOut } from "lucide-react";
import useApiNotification from "../hooks/useApiNotification"; // 1. Importamos el nuevo hook
import useCedulaValidation from "../hooks/useCedulaValidation";

export default function ProfileScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();

  // 1. Usar RTK Query para obtener los datos del perfil del usuario
  const { data: user, isLoading, error: errorLoadingUser } = useGetUserQuery(userInfo._id);

  // 2. Usar RTK Query para la mutación de actualización de perfil
  const [updateProfile, mutationState] = useUpdateUserProfileMutation();
  const { isLoading: loadingUpdate, error: errorUpdate } = mutationState;

  // 3. Instanciar el hook de notificaciones
  useApiNotification(mutationState, {
    loading: "Actualizando perfil...",
    success: "Tu información ha sido guardada correctamente.",
    error: "Fallo al actualizar el perfil.",
  });

  useEffect(() => {
    // Rellenar el formulario cuando los datos del usuario se cargan desde la API
    if (user) {
      setNombre(user.nombre || " ");
      setEmail(user.email || " ");
      setApellido(user.apellido || " ");
      setCedula(user.cedula || " ");
      setTelefono(user.telefono || " ");
    }
  }, [user]);

  const validateCedula = useCedulaValidation();

  const submitHandler = async (e) => {
    e.preventDefault();

    const cedulaError = validateCedula(cedula);
    if (cedulaError) {
      setMessage(cedulaError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
    } else {
      setMessage(null); // Limpiamos mensajes de validación local
      // 3. Envolver la llamada a la mutación en un bloque try/catch
      try {
        const updatedUserData = await updateProfile({
          userId: userInfo._id, // Usar el ID del usuario en sesión
          nombre,
          email,
          password: password || undefined, // Enviar la clave solo si se ha escrito una nueva
          apellido,
          cedula,
          telefono,
        }).unwrap(); // .unwrap() aquí para obtener los datos o el error

        // 4. Actualizar el estado global con los nuevos datos del usuario y el token
        dispatch(signinAction(updatedUserData));
      } catch (err) {
        // El error ya es manejado por el hook useApiNotification
        console.error("Fallo al actualizar el perfil:", err);
      }
    }
  };

  const signoutHandler = () => {
    dispatch(userSignout());
  };

  return (
    <div className="signin-container">
      <form className="profile-form" onSubmit={submitHandler}>
        <h2>Perfil de Usuario</h2>
        {isLoading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {errorLoadingUser && (
              <p className="signin-error">{errorLoadingUser.data?.message || "Error al cargar el perfil"}</p>
            )}
            {errorUpdate && <p className="signin-error">{errorUpdate.data?.message || "Error al actualizar"}</p>}
            {message && <p className="signin-error">{message}</p>}

            <div className="input-group">
              <User className="input-icon" />
              <input
                id="nombre"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="input-group">
              <User className="input-icon" />
              <input
                id="apellido"
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva clave (opcional)"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar nueva clave"
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
              <input
                id="cedula"
                type="text"
                placeholder="Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Phone className="input-icon" />
              <input
                id="telefono"
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="profile-form-actions">
              <Button type="submit" size="large" variant="primary" disabled={loadingUpdate} className="btn-with-icon">
                {loadingUpdate ? <div className="spinner"></div> : <Save />}
                <span>{loadingUpdate ? "Actualizando..." : "Actualizar Perfil"}</span>
              </Button>
              <Button type="button" size="large" variant="outline" onClick={signoutHandler} className="btn-with-icon">
                <LogOut size={16} /> Cerrar Sesión
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
