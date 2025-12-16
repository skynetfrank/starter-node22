import React from "react";
import { useSelector } from "react-redux";
import { useGetMisCitasQuery, useCancelCitaMutation } from "../slices/citasApiSlice";
import Swal from "sweetalert2";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import { Calendar, Clock, MessageSquare, Trash2, ListChecks } from "lucide-react";
import "./MisCitas.css"; // Estilos para este componente

const MisCitas = () => {
  const { userInfo } = useSelector((state) => state.userSignin);

  // Obtener las citas del usuario, se omite si no hay usuario logueado
  const {
    data: citas,
    isLoading,
    error,
  } = useGetMisCitasQuery(undefined, {
    skip: !userInfo,
  });

  const [cancelCita, { isLoading: isCancelling }] = useCancelCitaMutation();

  const handleCancelClick = async (citaId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Tu cita será cancelada y deberás agendar una nueva si lo necesitas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
    });

    if (result.isConfirmed) {
      try {
        await cancelCita(citaId).unwrap();
        Swal.fire("¡Cancelada!", "Tu cita ha sido cancelada.", "success");
      } catch (err) {
        Swal.fire("Error", err?.data?.message || "No se pudo cancelar la cita.", "error");
      }
    }
  };

  if (isLoading) {
    return <LoadingBox />;
  }

  if (error) {
    return <MessageBox variant="danger">Error al cargar tus citas: {error.data?.message || error.error}</MessageBox>;
  }

  // Filtrar solo las citas futuras
  const proximasCitas =
    citas?.filter((cita) => {
      const fechaCita = new Date(cita.fecha);
      // Comparamos solo la fecha, ignorando la hora
      fechaCita.setHours(0, 0, 0, 0);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaCita >= hoy;
    }) || [];

  return (
    <div className="mis-citas-container">
      <div className="mis-citas-header">
        <ListChecks size={32} />
        <h1>Mis Próximas Citas</h1>
      </div>

      {proximasCitas.length === 0 ? (
        <MessageBox variant="info">
          No tienes citas agendadas. <a href="/agendar">¡Agenda una ahora!</a>
        </MessageBox>
      ) : (
        <div className="citas-grid">
          {proximasCitas.map((cita) => (
            <div key={cita._id} className="mi-cita-card">
              <div className="mi-cita-info">
                <div className="info-item">
                  <Calendar size={18} />
                  <span>{new Date(cita.fecha).toLocaleDateString("es-VE", { timeZone: "UTC" })}</span>
                </div>
                <div className="info-item">
                  <Clock size={18} />
                  <span>{cita.hora}</span>
                </div>
              </div>
              {cita.motivo && (
                <div className="mi-cita-motivo">
                  <MessageSquare size={16} />
                  <p>{cita.motivo}</p>
                </div>
              )}
              <button className="btn-cancelar-user" onClick={() => handleCancelClick(cita._id)} disabled={isCancelling}>
                <Trash2 size={16} />
                <span>{isCancelling ? "Cancelando..." : "Cancelar Cita"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCitas;
