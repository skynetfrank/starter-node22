import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";
import { useGetHorarioQuery, useGetDisponibilidadQuery, useCreateCitaMutation } from "../slices/citasApiSlice";
import "./AgendarCita.css";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

const AgendarCita = () => {
  const [fecha, setFecha] = useState(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

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
  };

  const handleReservarClick = async () => {
    if (!horaSeleccionada) {
      Swal.fire("Atención", "Por favor, selecciona una hora.", "warning");
      return;
    }

    try {
      await createCita({ fecha: fechaQuery, hora: horaSeleccionada }).unwrap();
      Swal.fire({
        icon: "success",
        title: "¡Cita Reservada!",
        text: `Tu cita para el ${fecha.toLocaleDateString()} a las ${horaSeleccionada} ha sido confirmada.`,
        timer: 3000,
        showConfirmButton: false,
      });
      setHoraSeleccionada(null);
      refetch(); // Vuelve a consultar la disponibilidad para actualizar la UI
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en la reserva",
        text: err?.data?.message || "No se pudo completar la reserva. Inténtalo de nuevo.",
      });
    }
  };

  if (isLoadingHorario) return <LoadingBox />;
  if (errorHorario)
    return (
      <MessageBox variant="danger">Error al cargar el horario. El servicio de citas no está disponible.</MessageBox>
    );

  return (
    <div className="agendar-cita-container">
      <div className="panel calendario-panel">
        <h3 className="panel-title">
          <CalendarDays /> 1. Selecciona un Día
        </h3>
        <Calendar
          onChange={handleDateChange}
          value={fecha}
          minDate={new Date()} // No permitir fechas pasadas
          tileClassName={({ date, view }) => (view === "month" && date.getDay() === 0 ? "domingo-deshabilitado" : null)}
          tileDisabled={({ date, view }) => view === "month" && date.getDay() === 0} // Deshabilitar Domingos
        />
      </div>

      <div className="panel horario-panel">
        <h3 className="panel-title">
          <Clock /> 2. Selecciona una Hora
        </h3>
        {isLoadingDisponibilidad ? (
          <LoadingBox />
        ) : (
          <div className="intervalos-grid">
            {intervalosDeTiempo.map((hora) => {
              const isOcupada = horasOcupadas.includes(hora);
              return (
                <button
                  key={hora}
                  className={`hora-slot ${horaSeleccionada === hora ? "seleccionada" : ""} ${
                    isOcupada ? "ocupada" : ""
                  }`}
                  onClick={() => setHoraSeleccionada(hora)}
                  disabled={isOcupada}
                >
                  {hora}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel confirmacion-panel">
        <h3 className="panel-title">
          <CheckCircle /> 3. Confirma tu Cita
        </h3>
        <div className="resumen-cita">
          <p>
            <strong>Día:</strong>{" "}
            {fecha.toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p>
            <strong>Hora:</strong> {horaSeleccionada || "No seleccionada"}
          </p>
        </div>
        <button className="btn-reservar" onClick={handleReservarClick} disabled={!horaSeleccionada || isCreatingCita}>
          {isCreatingCita ? "Reservando..." : "Reservar Cita"}
        </button>
      </div>
    </div>
  );
};

export default AgendarCita;
