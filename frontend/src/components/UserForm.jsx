import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetUserQuery, useRegisterUserMutation, useUpdateUserMutation } from "../api/usersApi";
import useApiNotification from "../hooks/useApiNotification";
import Button from "./Button";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import { Save, ArrowLeft } from "lucide-react";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    password: "",
    isAdmin: false,
    isVendedor: false,
    isActive: true,
  });

  // Hooks de RTK Query
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: loadError,
  } = useGetUserQuery(id, {
    skip: !isEditMode,
  });

  const [addUser, addState] = useRegisterUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();

  // Llenar el formulario con los datos del usuario en modo edición
  useEffect(() => {
    if (isEditMode && userData) {
      setFormData({
        nombre: userData.nombre || "",
        apellido: userData.apellido || "",
        cedula: userData.cedula || "",
        email: userData.email || "",
        telefono: userData.telefono || "",
        password: "", // La contraseña no se precarga por seguridad
        isAdmin: userData.isAdmin || false,
        isVendedor: userData.isVendedor || false,
        isActive: userData.isActive,
      });
    }
  }, [isEditMode, userData]);

  // Hooks de notificación para creación y actualización
  const onSuccess = () => navigate("/users");

  useApiNotification(
    addState,
    {
      loading: "Creando usuario...",
      success: "Usuario creado con éxito.",
      error: (err) => err?.data?.message || "Error al crear el usuario.",
    },
    onSuccess
  );

  useApiNotification(
    updateState,
    {
      loading: "Actualizando usuario...",
      success: "Usuario actualizado con éxito.",
      error: (err) => err?.data?.message || "Error al actualizar el usuario.",
    },
    onSuccess
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = { ...formData };
    // No enviar la contraseña si está vacía en modo edición
    if (isEditMode && !submissionData.password) {
      delete submissionData.password;
    }

    if (isEditMode) {
      await updateUser({ id, ...submissionData });
    } else {
      await addUser(submissionData);
    }
  };

  const isLoading = addState.isLoading || updateState.isLoading;

  if (isLoadingUser) return <LoadingBox />;
  if (loadError)
    return <MessageBox variant="danger">{loadError?.data?.message || "Error al cargar datos del usuario"}</MessageBox>;

  return (
    <div className="cliente-form-container">
      <div className="cliente-form-header">
        <h1>{isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}</h1>
        <Button onClick={() => navigate("/users")} className="btn-secondary btn-with-icon">
          <ArrowLeft size={18} />
          <span>Volver a Usuarios</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="cliente-form-card">
        {/* Campos de texto */}
        {["nombre", "apellido", "cedula", "email", "telefono", "password"].map((key) => (
          <div key={key} className="form-group">
            <label htmlFor={key} className="form-label">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              type={key === "email" ? "email" : key === "password" ? "password" : "text"}
              id={key}
              name={key}
              className="form-input"
              value={formData[key]}
              onChange={handleChange}
              placeholder={isEditMode && key === "password" ? "Dejar en blanco para no cambiar" : ""}
              required={!isEditMode && key !== "telefono"} // Requerido en creación, opcional en edición
            />
          </div>
        ))}

        {/* Checkboxes para roles y estado */}
        {["isAdmin", "isVendedor", "isActive"].map((key) => (
          <div key={key} className="form-group-checkbox">
            <input type="checkbox" id={key} name={key} checked={formData[key]} onChange={handleChange} />
            <label htmlFor={key}>{key}</label>
          </div>
        ))}

        <div className="cliente-form-actions">
          <Button type="submit" disabled={isLoading} className="btn-primary btn-with-icon">
            {isLoading ? <div className="spinner"></div> : <Save size={18} />}
            <span>{isLoading ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Crear Usuario"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
