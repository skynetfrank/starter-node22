import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useGetHorarioQuery, useUpdateHorarioMutation } from "../slices/citasApiSlice";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import Button from "./Button";
import { Clock, Save } from "lucide-react";

const ConfiguracionHorario = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userSignin);

  // Estado local para el formulario
  const [formData, setFormData] = useState({
    horaInicio: "9",
    horaFin: "18",
    duracionCita: "30",
  });

  // Hooks de RTK Query
  const { data: horarioActual, isLoading: isLoadingHorario, error: errorHorario } = useGetHorarioQuery();
  const [updateHorario, { isLoading: isUpdating }] = useUpdateHorarioMutation();

  // Proteger la ruta y cargar datos iniciales
  useEffect(() => {
    if (!userInfo?.isAdmin) {
      Swal.fire("Acceso Denegado", "Esta sección es solo para administradores.", "error");
      navigate("/");
    }

    if (horarioActual) {
      setFormData({
        horaInicio: horarioActual.horaInicio.toString(),
        horaFin: horarioActual.horaFin.toString(),
        duracionCita: horarioActual.duracionCita.toString(),
      });
    }
  }, [userInfo, navigate, horarioActual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateHorario(formData).unwrap();
      Swal.fire("¡Éxito!", "El horario ha sido actualizado correctamente.", "success");
    } catch (err) {
      Swal.fire("Error", err?.data?.message || "No se pudo actualizar el horario.", "error");
    }
  };

  if (isLoadingHorario) {
    return <LoadingBox />;
  }

  return (
    <div className="cliente-form-container">
      <div className="cliente-form-header">
        <h1>Configuración de Horario</h1>
      </div>

      {errorHorario && errorHorario.status !== 404 && (
        <MessageBox variant="danger">Error al cargar la configuración: {errorHorario.data?.message}</MessageBox>
      )}
      {errorHorario && errorHorario.status === 404 && (
        <MessageBox variant="info">Aún no se ha configurado un horario. Por favor, establece uno.</MessageBox>
      )}

      <form onSubmit={handleSubmit} className="cliente-form-card">
        <div className="form-group">
          <label htmlFor="horaInicio" className="form-label">
            Hora de Inicio (formato 24h)
          </label>
          <input
            type="number"
            id="horaInicio"
            name="horaInicio"
            className="form-input"
            value={formData.horaInicio}
            onChange={handleChange}
            min="0"
            max="23"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="horaFin" className="form-label">
            Hora de Fin (formato 24h)
          </label>
          <input
            type="number"
            id="horaFin"
            name="horaFin"
            className="form-input"
            value={formData.horaFin}
            onChange={handleChange}
            min="1"
            max="24"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duracionCita" className="form-label">
            Duración de la Cita (en minutos)
          </label>
          <select
            id="duracionCita"
            name="duracionCita"
            className="form-input"
            value={formData.duracionCita}
            onChange={handleChange}
            required
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>

        <div className="cliente-form-actions">
          <Button type="submit" disabled={isUpdating} className="btn-primary btn-with-icon">
            {isUpdating ? <div className="spinner"></div> : <Save size={18} />}
            <span>{isUpdating ? "Guardando..." : "Guardar Configuración"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracionHorario;
