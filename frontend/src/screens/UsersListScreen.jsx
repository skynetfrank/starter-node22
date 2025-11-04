import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/usersApi";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "../components/Button";
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
      <div className="clientes-header">
        <h1>Gestión de Usuarios</h1>
        <Button onClick={handleCreate} className="btn-primary btn-with-icon">
          <Plus size={18} />
          <span>Crear Usuario</span>
        </Button>
      </div>

      <div className="search-bar-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, email o cédula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td className="responsive-hide-sm">{user.cedula}</td>
                    <td>{user.isAdmin ? "Sí" : "No"}</td>
                    <td>{user.isActive ? "Sí" : "No"}</td>
                    <td className="clientes-table-actions">
                      <button onClick={() => handleEdit(user._id)} title="Editar Usuario">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn-delete"
                        title="Desactivar Usuario"
                        disabled={deleteState.isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
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
