import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/usersApi";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "../components/Button";
import Tooltip from "../components/Tooltip";
import useApiNotification from "../hooks/useApiNotification";

const UsersListScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Hook para debounce en la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Resetear a la primera página con cada nueva búsqueda
    }, 500); // 500ms de delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // RTK Query hook para obtener los usuarios
  const { data, isLoading, isFetching, error } = useGetUsersQuery(
    { page, search: debouncedSearchQuery, limit: 10 },
    { refetchOnMountOrArgChange: true }
  );

  // RTK Query hook para eliminar (desactivar) un usuario
  const [deleteUser, deleteState] = useDeleteUserMutation();

  // Hook para manejar notificaciones de la eliminación
  useApiNotification(deleteState, {
    loading: "Desactivando usuario...",
    success: "Usuario desactivado correctamente.",
    error: (err) => err?.data?.message || "Error al desactivar el usuario.",
  });

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar este usuario?")) {
      await deleteUser(id);
    }
  };

  const handleCreate = () => {
    navigate("/users/nuevo"); // Ruta para el formulario de creación
  };

  const handleEdit = (id) => {
    navigate(`/users/${id}/edit`); // Ruta para el formulario de edición
  };

  const { users, pages: totalPages } = data || { users: [], pages: 1 };

  return (
    <div className="clientes-screen-container">
      <h1>Gestión de Usuarios</h1>
      <div className="flx">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="clientes-header">
          <Tooltip text="Nuevo Usuario" position="left">
            <Button onClick={handleCreate} className="btn-primary btn-with-icon">
              <Plus size={24} />
            </Button>
          </Tooltip>
        </div>
      </div>
      {isLoading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error?.data?.message || "Error al cargar los usuarios"}</MessageBox>
      ) : (
        <>
          <div className="clientes-table-container">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th className="responsive-hide-sm">Cédula</th>
                  <th>Admin</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td data-label="Nombre" className="card-group-info">
                      {user.nombre}
                    </td>
                    <td data-label="Email" className="card-group-info">
                      {user.email}
                    </td>
                    <td data-label="Cédula" className="responsive-hide-sm card-group-info">
                      {user.cedula}
                    </td>
                    <td data-label="Admin" className="card-group-status">
                      {user.isAdmin ? "Sí" : "No"}
                    </td>
                    <td data-label="Activo" className="card-group-status">
                      {user.isActive ? "Sí" : "No"}
                    </td>
                    <td data-label="Acciones" className="clientes-table-actions card-group-actions">
                      <Tooltip text="Editar" position="left">
                        <button onClick={() => handleEdit(user._id)}>
                          <Edit size={18} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Desactivar" position="top">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="btn-delete"
                          disabled={deleteState.isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isFetching && <div className="fetching-indicator">Actualizando...</div>}

          <div className="pagination-container">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="pagination-button"
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="pagination-button"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersListScreen;
