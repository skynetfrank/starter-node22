import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { detailsUser, updateUserProfile } from "../actions/userActions";
import { signout } from "../actions/userActions";
import { USER_UPDATE_PROFILE_RESET } from "../constants/userConstants";
import Button from "../components/Button";
import logo from "../assets/logo.jpg";
import { User, Mail, Lock, Eye, EyeOff, Fingerprint, Phone, Save, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import MessageBox from "../components/MessageBox";

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
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;
  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success: successUpdate, error: errorUpdate, loading: loadingUpdate } = userUpdateProfile;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      dispatch(detailsUser(userInfo._id));
    } else {
      setNombre(user.nombre || " ");
      setEmail(user.email || " ");
      setApellido(user.apellido || " ");
      setCedula(user.cedula || " ");
      setTelefono(user.telefono || " ");
    }
  }, [dispatch, userInfo._id, user, successUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
    } else {
      setMessage(null);
      dispatch(
        updateUserProfile({
          userId: user._id,
          nombre,
          email,
          password,
          apellido,
          cedula,
          telefono,
        })
      );
    }
  };

  const signoutHandler = () => {
    dispatch(signout());
  };

  return (
    <div className="signin-container">
      <form className="profile-form" onSubmit={submitHandler}>
        <h2>Perfil de Usuario</h2>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {error && <MessageBox variant="danger">{error}</MessageBox>}
            {errorUpdate && <MessageBox variant="danger">{errorUpdate}</MessageBox>}
            {message && <MessageBox variant="danger">{message}</MessageBox>}
            {successUpdate && <MessageBox variant="success">Perfil actualizado correctamente</MessageBox>}

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
