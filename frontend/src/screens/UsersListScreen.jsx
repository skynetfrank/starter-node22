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
  const [filteredUsers, setFilteredUsers] = useState([]);

  // RTK Query hook para obtener los usuarios
  const { data: users = [], isLoading, error } = useGetUsersQuery();

  // RTK Query hook para eliminar (desactivar) un usuario
  const [deleteUser, deleteState] = useDeleteUserMutation();

  // Hook para manejar notificaciones de la eliminación
  useApiNotification(deleteState, {
    loading: "Desactivando usuario...",
    success: "Usuario desactivado correctamente.",
    error: (err) => err?.data?.message || "Error al desactivar el usuario.",
  });

  // Filtrado de usuarios en el lado del cliente
  useEffect(() => {
    if (users) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.nombre.toLowerCase().includes(lowercasedQuery) ||
          user.email.toLowerCase().includes(lowercasedQuery) ||
          user.cedula.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

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
              {filteredUsers.map((user) => (
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
      )}
    </div>
  );
};

export default UsersListScreen;
