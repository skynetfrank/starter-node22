import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import { CalendarDays, Clock, CheckCircle, MessageSquare, User, Mail } from "lucide-react";
import { useGetHorarioQuery, useGetDisponibilidadQuery, useCreateCitaMutation } from "../slices/citasApiSlice";
import { useGetUsersQuery } from "../api/usersApi";
import "./AgendarCita.css";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import UserSearch from "./UserSearch";

const AgendarCita = () => {
  const [activeTab, setActiveTab] = useState("dia"); // 'dia', 'hora', 'confirmar'
  const [fecha, setFecha] = useState(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Para que el admin seleccione un usuario

  // Obtener información del usuario desde el estado de Redux
  const { userInfo } = useSelector((state) => state.userSignin);

  // 1. Obtener configuración de horario
  const { data: horario, isLoading: isLoadingHorario, error: errorHorario } = useGetHorarioQuery();

  // 2. Formatear fecha para la query de disponibilidad
  const fechaQuery = fecha.toISOString().split("T")[0];

  // 3. Obtener horas ocupadas para la fecha seleccionada
  const {
    data: horasOcupadas = [],
    isLoading: isLoadingDisponibilidad,
    refetch,
  } = useGetDisponibilidadQuery(fechaQuery, {
    skip: !fecha,
  });

  // 4. Hook para la mutación de crear cita
  const [createCita, { isLoading: isCreatingCita }] = useCreateCitaMutation();

  // Generar los intervalos de tiempo disponibles
  const intervalosDeTiempo = useMemo(() => {
    if (!horario) return [];

    const slots = [];
    const { horaInicio, horaFin, duracionCita } = horario;

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += duracionCita) {
        const horaFormateada = hora.toString().padStart(2, "0");
        const minutoFormateado = minuto.toString().padStart(2, "0");
        slots.push(`${horaFormateada}:${minutoFormateado}`);
      }
    }
    return slots;
  }, [horario]);

  const handleDateChange = (nuevaFecha) => {
    setFecha(nuevaFecha);
    setHoraSeleccionada(null); // Resetear hora al cambiar de día
    setActiveTab("hora"); // Cambiar a la pestaña de selección de hora
  };

  const handleHoraSelect = (hora) => {
    setHoraSeleccionada(hora);
    setActiveTab("confirmar"); // Cambiar a la pestaña de confirmación
  };

  // Configuración del Toast de SweetAlert2 para notificaciones
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const handleReservarClick = async () => {
    if (!horaSeleccionada) {
      Swal.fire("Atención", "Por favor, selecciona una hora.", "warning");
      return;
    }

    // Determinar para qué usuario es la cita
    const targetUserId = userInfo.isAdmin && selectedUser ? selectedUser._id : userInfo._id;

    if (!targetUserId) {
      Swal.fire("Atención", "Por favor, selecciona un cliente para la cita.", "warning");
      return;
    }

    try {
      await createCita({ fecha: fechaQuery, hora: horaSeleccionada, motivo, userId: targetUserId }).unwrap();
      Toast.fire({
        icon: "success",
        title: "¡Cita reservada con éxito!",
      });
      setHoraSeleccionada(null);
      setMotivo("");
      setSelectedUser(null);
      setActiveTab("dia"); // Volver a la primera pestaña
      refetch(); // Vuelve a consultar la disponibilidad para actualizar la UI
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en la reserva",
        text: err?.data?.message || "No se pudo completar la reserva. Inténtalo de nuevo.",
      });
    }
  };

  // Efecto para establecer el usuario seleccionado si no es admin
  useEffect(() => {
    if (userInfo && !userInfo.isAdmin) setSelectedUser(userInfo);
  }, [userInfo]);

  // Limpiar el usuario seleccionado por el admin si se cambia de pestaña
  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      setSelectedUser(null);
    }
  }, [activeTab, userInfo]);

  if (isLoadingHorario) return <LoadingBox />;
  if (errorHorario)
    return (
      <MessageBox variant="danger">Error al cargar el horario. El servicio de citas no está disponible.</MessageBox>
    );

  return (
    <div className="agendar-cita-container-tabs">
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === "dia" ? "active" : ""}`} onClick={() => setActiveTab("dia")}>
          <CalendarDays size={18} />
          <span>Día</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "hora" ? "active" : ""}`}
          onClick={() => setActiveTab("hora")}
          disabled={!fecha}
        >
          <Clock size={18} />
          <span>Hora</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "confirmar" ? "active" : ""}`}
          onClick={() => setActiveTab("confirmar")}
          disabled={!horaSeleccionada}
        >
          <CheckCircle size={18} />
          <span>Confirmar</span>
        </button>
      </div>

      <div className="tabs-content">
        {/* Panel del Calendario */}
        <div className={`tab-panel ${activeTab === "dia" ? "active" : ""}`}>
          <Calendar
            onChange={handleDateChange}
            value={fecha}
            minDate={new Date()}
            tileClassName={({ date, view }) =>
              view === "month" && date.getDay() === 0 ? "domingo-deshabilitado" : null
            }
            tileDisabled={({ date, view }) => view === "month" && date.getDay() === 0}
          />
        </div>

        {/* Panel de Horarios */}
        <div className={`tab-panel ${activeTab === "hora" ? "active" : ""}`}>
          {isLoadingDisponibilidad ? (
            <LoadingBox />
          ) : (
            <div className="intervalos-grid">
              {intervalosDeTiempo.map((hora) => {
                const isOcupada = horasOcupadas.includes(hora);
                return (
                  <button
                    key={hora}
                    className={`hora-slot ${horaSeleccionada === hora ? "seleccionada" : ""}`}
                    onClick={() => !isOcupada && handleHoraSelect(hora)}
                    disabled={isOcupada}
                  >
                    {hora}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel de Confirmación */}
        <div className={`tab-panel ${activeTab === "confirmar" ? "active" : ""}`}>
          <div className="resumen-cita">
            {/* Si es admin, muestra el buscador de usuarios */}
            {userInfo && userInfo.isAdmin && <UserSearch onUserSelect={setSelectedUser} />}

            {/* Muestra los datos del cliente (seleccionado por admin o el propio usuario) */}
            {selectedUser ? (
              <div className="datos-usuario">
                <h4 className="resumen-subtitle">Datos del Cliente</h4>
                <p>
                  <User size={16} />
                  <strong>Nombre:</strong> {selectedUser.nombre} {selectedUser.apellido}
                </p>
                <p>
                  <Mail size={16} />
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
            ) : (
              !userInfo.isAdmin && (
                <MessageBox variant="warning">
                  Por favor, <a href="/signin">inicia sesión</a> para poder reservar una cita.
                </MessageBox>
              )
            )}

            <h4 className="resumen-subtitle">Detalles de la Cita</h4>
            <p>
              <strong>Día:</strong>{" "}
              {fecha.toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p>
              <strong>Hora:</strong> {horaSeleccionada || "No seleccionada"}
            </p>
            <div className="motivo-cita">
              <label htmlFor="motivo">
                <MessageSquare size={16} /> Motivo (Opcional):
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Consulta de seguimiento..."
              />
            </div>
          </div>
          <button
            className="btn-reservar"
            onClick={handleReservarClick}
            disabled={!horaSeleccionada || isCreatingCita || !selectedUser}
          >
            {isCreatingCita ? "Reservando..." : "Reservar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendarCita;
