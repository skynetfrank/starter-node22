import React, { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useGetAllCitasQuery } from "../slices/citasApiSlice";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import { Calendar, Clock, User, Mail, BookOpen } from "lucide-react";
import "./BitacoraCitas.css";

const BitacoraCitas = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userSignin);

  // --- REGLA DE HOOKS: Todos los hooks deben ser llamados en el nivel superior ---
  const {
    data: citas,
    isLoading,
    error,
  } = useGetAllCitasQuery(undefined, {
    skip: !userInfo?.isAdmin, // No ejecutar la consulta si el usuario no es admin
  });
  const [openDay, setOpenDay] = useState(null);

  // Proteger la ruta para que solo los administradores puedan acceder
  useEffect(() => {
    if (!userInfo?.isAdmin) {
      Swal.fire("Acceso Denegado", "Esta sección es solo para administradores.", "error");
      navigate("/");
    }
  }, [userInfo, navigate]);

  // Agrupar citas por día usando useMemo para optimizar
  const citasAgrupadas = useMemo(() => {
    if (!citas) return {};

    return citas.reduce((acc, cita) => {
      const fecha = new Date(cita.fecha).toLocaleDateString("es-VE", {
        timeZone: "UTC", // Asegura que la fecha se interprete correctamente
      });

      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(cita);
      return acc;
    }, {});
  }, [citas]);

  const diasOrdenados = useMemo(
    () => Object.keys(citasAgrupadas).sort((a, b) => new Date(b) - new Date(a)),
    [citasAgrupadas]
  );

  useEffect(() => {
    setOpenDay(diasOrdenados[0] || null);
  }, [diasOrdenados]);

  if (!userInfo?.isAdmin) {
    return null; // No renderizar nada si el usuario no es admin
  }

  if (isLoading) {
    return <LoadingBox />;
  }

  if (error) {
    return <MessageBox variant="danger">Error al cargar la bitácora: {error.data?.message || error.error}</MessageBox>;
  }

  // Maneja el acordeón: solo un día puede estar abierto a la vez.
  const handleToggle = (dia, isOpen) => {
    setOpenDay(isOpen ? dia : null);
  };

  return (
    <div className="bitacora-container">
      <div className="bitacora-header">
        <BookOpen size={32} />
        <h1>Bitácora de Citas</h1>
      </div>

      {diasOrdenados.length === 0 ? (
        <MessageBox variant="info">No hay citas registradas en la bitácora.</MessageBox>
      ) : (
        <div className="dias-grid">
          {diasOrdenados.map((dia) => {
            const isCardOpen = openDay === dia;
            return (
              <details
                key={dia}
                className="dia-card"
                open={isCardOpen}
                onToggle={(e) => handleToggle(dia, e.target.open)}
              >
                <summary className="dia-titulo">
                  <Calendar size={20} />
                  <span>{dia}</span>
                </summary>
                <div className="citas-lista">
                  {citasAgrupadas[dia].map((cita) => (
                    <div key={cita._id} className="cita-item">
                      <div className="cita-hora">
                        <Clock size={16} />
                        <span>{cita.hora}</span>
                      </div>
                      <div className="cita-usuario">
                        <div className="usuario-detalle">
                          <User size={16} />
                          <span>
                            {cita.user ? `${cita.user.nombre} ${cita.user.apellido}` : "Usuario no disponible"}
                          </span>
                        </div>
                        {cita.user?.email && (
                          <div className="usuario-detalle email">
                            <Mail size={16} />
                            <span>{cita.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BitacoraCitas;
