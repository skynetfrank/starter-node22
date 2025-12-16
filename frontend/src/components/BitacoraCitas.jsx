import React, { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useGetAllCitasQuery, useCancelCitaMutation } from "../slices/citasApiSlice";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  BookOpen,
  Trash2,
  MessageSquareText,
  ArrowDownUp,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
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

  // Hook para la mutación de cancelar cita
  const [cancelCita, { isLoading: isCancelling }] = useCancelCitaMutation();
  const [openDay, setOpenDay] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Mostrar 5 días por página

  const [searchTerm, setSearchTerm] = useState("");
  // Proteger la ruta para que solo los administradores puedan acceder
  useEffect(() => {
    if (!userInfo?.isAdmin) {
      Swal.fire("Acceso Denegado", "Esta sección es solo para administradores.", "error");
      navigate("/");
    }
  }, [userInfo, navigate]);

  // Filtrar citas por nombre de usuario
  const citasFiltradas = useMemo(() => {
    if (!citas) return [];
    if (!searchTerm.trim()) return citas;

    const lowercasedFilter = searchTerm.toLowerCase();
    return citas.filter((cita) => {
      if (!cita.user) return false;
      const fullName = `${cita.user.nombre} ${cita.user.apellido}`.toLowerCase();
      return fullName.includes(lowercasedFilter);
    });
  }, [citas, searchTerm]);

  // Agrupar citas por día usando useMemo para optimizar
  const citasAgrupadas = useMemo(() => {
    if (!citasFiltradas) return {};
    return citasFiltradas.reduce((acc, cita) => {
      const fecha = new Date(cita.fecha).toLocaleDateString("es-VE", {
        timeZone: "UTC", // Asegura que la fecha se interprete correctamente
      });

      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(cita);
      return acc;
    }, {});
  }, [citasFiltradas]);

  const diasOrdenados = useMemo(
    () => Object.keys(citasAgrupadas).sort((a, b) => new Date(a) - new Date(b)),
    [citasAgrupadas]
  );

  // --- Lógica de Paginación ---
  const totalPages = Math.ceil(diasOrdenados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDias = diasOrdenados.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página y asegurarse de que el día abierto se cierre si no está en la nueva página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
  const handleToggle = (dia) => {
    // Si el día clickeado ya está abierto, lo cerramos.
    // Si no, lo abrimos. Esto da a React el control total.
    setOpenDay((currentOpenDay) => (currentOpenDay === dia ? null : dia));
  };

  const handleCancelClick = async (citaId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede revertir. La cita será cancelada permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantener",
    });

    if (result.isConfirmed) {
      try {
        await cancelCita(citaId).unwrap();
        Swal.fire("¡Cancelada!", "La cita ha sido cancelada con éxito.", "success");
        // La lista se actualizará automáticamente gracias a `invalidatesTags`
      } catch (err) {
        Swal.fire("Error", err?.data?.message || "No se pudo cancelar la cita.", "error");
      }
    }
  };

  return (
    <div className="bitacora-container">
      <div className="bitacora-header">
        <div className="bitacora-titulo">
          <BookOpen size={32} />
          <h1>Gestión de Citas</h1>
        </div>

        <div className="bitacora-search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {diasOrdenados.length === 0 ? (
        <MessageBox variant="info">No hay citas registradas en la bitácora.</MessageBox>
      ) : (
        <div className="dias-grid">
          {currentDias.map((dia) => {
            const isCardOpen = openDay === dia;
            return (
              // Determinar si el día completo es pasado (para atenuar la tarjeta si todas las citas son pasadas)
              // Aunque el filtro de citas futuras se haría en el backend o en el useMemo si se quisiera ocultar
              // Aquí solo se atenúa visualmente si la cita individual es pasada.
              // Para el día completo, podríamos verificar si todas las citas de ese día son pasadas.
              // Por ahora, la atenuación se aplicará a cada cita individual.
              // Si se desea atenuar el día completo si todas sus citas son pasadas, se necesitaría una lógica adicional aquí.
              // Por simplicidad, la atenuación se aplica a nivel de cita-item.

              <details key={dia} className="dia-card" open={isCardOpen}>
                <summary
                  className="dia-titulo"
                  onClick={(e) => {
                    e.preventDefault(); // Prevenir el comportamiento nativo del summary/details
                    handleToggle(dia);
                  }}
                >
                  <Calendar size={20} />
                  <span>{dia}</span>
                  <span className="cita-contador">{citasAgrupadas[dia].length}</span>
                </summary>
                <div className="dia-card-content-wrapper">
                  <div className="citas-lista">
                    {[...citasAgrupadas[dia]] // Clonamos para no mutar el array original
                      .sort((a, b) => a.hora.localeCompare(b.hora)) // Ordenar siempre de menor a mayor hora
                      .map((cita) => {
                        const now = new Date();
                        const [citaHour, citaMinute] = cita.hora.split(":").map(Number);
                        const citaDateTime = new Date(cita.fecha);
                        citaDateTime.setHours(citaHour, citaMinute, 0, 0);

                        const isPastCita = citaDateTime < now;

                        return (
                          <div key={cita._id} className={`cita-item ${isPastCita ? "cita-pasada" : ""}`}>
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
                              {cita.user?.telefono && (
                                <div className="usuario-detalle telefono">
                                  <Phone size={16} />
                                  <span>{cita.user.telefono}</span>
                                </div>
                              )}
                              {cita.user?.email && (
                                <div className="usuario-detalle email">
                                  <Mail size={16} />
                                  <span>{cita.user.email}</span>
                                </div>
                              )}
                              {cita.motivo && (
                                <div className="usuario-detalle motivo">
                                  <MessageSquareText size={16} />
                                  <span>{cita.motivo}</span>
                                </div>
                              )}
                            </div>
                            <div className="cita-acciones">
                              <button
                                className="btn-cancelar"
                                onClick={() => handleCancelClick(cita._id)}
                                disabled={isCancelling || isPastCita}
                              >
                                {isCancelling ? <div className="spinner-small"></div> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BitacoraCitas;
