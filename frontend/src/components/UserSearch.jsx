import React, { useState } from "react";
import { useGetUsersQuery } from "../api/usersApi";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

const UserSearch = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Llamamos al hook con un objeto para compatibilidad con paginación/búsqueda.
  // La respuesta de la API es un objeto { users: [...] }, por lo que extraemos el array.
  const { data, isLoading, error } = useGetUsersQuery({});

  const handleSelectChange = (e) => {
    const userId = e.target.value;
    const selectedUser = data.users.find((user) => user._id === userId);
    onUserSelect(selectedUser);
    setSearchTerm(selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : "");
  };

  if (isLoading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">No se pudieron cargar los usuarios.</MessageBox>;

  return (
    <div className="user-search-container">
      <label htmlFor="user-select">Buscar Cliente</label>
      <select id="user-select" onChange={handleSelectChange} defaultValue="">
        <option value="" disabled>
          -- Selecciona un cliente --
        </option>
        {data &&
          data.users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.nombre} {user.apellido} ({user.email})
            </option>
          ))}
      </select>
    </div>
  );
};

export default UserSearch;
