import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGetClientesQuery, useDeleteClienteMutation } from "../api/clientesApi";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "../components/Button";
import useApiNotification from "../hooks/useApiNotification";

const ClientesScreen = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

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

    // RTK Query hook para obtener los clientes
    const { data, isLoading, isFetching, error } = useGetClientesQuery(
        { page, search: debouncedSearchQuery, limit: 10 },
        { refetchOnMountOrArgChange: true }
    );

    // RTK Query hook para eliminar un cliente
    const [deleteCliente, deleteState] = useDeleteClienteMutation();

    // Hook para manejar notificaciones de la eliminación
    useApiNotification(deleteState, {
        loading: "Desactivando cliente...",
        success: "Cliente desactivado correctamente.",
        error: (err) => err?.data?.message || "Error al desactivar el cliente.",
    });

    const handleDelete = async (id) => {
        // Podríamos agregar una confirmación aquí
        if (window.confirm("¿Estás seguro de que quieres desactivar este cliente?")) {
            await deleteCliente(id);
        }
    };

    const handleCreate = () => {
        navigate("/clientes/nuevo"); // Ruta para el formulario de creación
    };

    const handleEdit = (id) => {
        navigate(`/clientes/${id}/edit`); // Ruta para el formulario de edición
    };

    const { clientes, pages: totalPages } = data || { clientes: [], pages: 1 };

    return (
        <div className="clientes-screen-container">
            <div className="clientes-header">
                <h1>Gestión de Clientes</h1>
                <Button onClick={handleCreate} className="btn-primary btn-with-icon">
                    <Plus size={18} />
                    <span>Crear Cliente</span>
                </Button>
            </div>

            <div className="search-bar-wrapper">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, RIF o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error?.data?.message || "Error al cargar los clientes"}</MessageBox>
            ) : (
                <>
                    <div className="clientes-table-container">
                        <table className="clientes-table">
                            <thead>
                                <tr>
                                    <th>RIF</th>
                                    <th>Nombre</th>
                                    <th className="responsive-hide-sm">Telefono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((cliente) => (
                                    <tr key={cliente._id}>
                                        <td>{cliente.rif}</td>
                                        <td>{cliente.nombre}</td>
                                        <td className="responsive-hide-sm">{cliente.celular}</td>
                                        <td className="clientes-table-actions">
                                            <button onClick={() => handleEdit(cliente._id)} title="Editar Cliente">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(cliente._id)} className="btn-delete" title="Eliminar Cliente" disabled={deleteState.isLoading}>
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
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="pagination-button">
                            Anterior
                        </button>
                        <span className="pagination-info">
                            Página {page} de {totalPages}
                        </span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching} className="pagination-button">
                            Siguiente
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientesScreen;