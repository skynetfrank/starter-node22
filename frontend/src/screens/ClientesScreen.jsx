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
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
                <Button onClick={handleCreate} className="btn-primary btn-with-icon">
                    <Plus size={18} />
                    <span>Crear Cliente</span>
                </Button>
            </div>

            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, RIF o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
            </div>

            {isLoading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error?.data?.message || "Error al cargar los clientes"}</MessageBox>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">RIF</th>
                                    <th className="py-2 px-4 border-b text-left">Nombre</th>
                                    <th className="py-2 px-4 border-b text-left hidden md:table-cell">Email</th>
                                    <th className="py-2 px-4 border-b text-left hidden sm:table-cell">Celular</th>
                                    <th className="py-2 px-4 border-b text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((cliente) => (
                                    <tr key={cliente._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{cliente.rif}</td>
                                        <td className="py-2 px-4 border-b">{cliente.nombre}</td>
                                        <td className="py-2 px-4 border-b hidden md:table-cell">{cliente.email}</td>
                                        <td className="py-2 px-4 border-b hidden sm:table-cell">{cliente.celular}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <button onClick={() => handleEdit(cliente._id)} className="text-blue-500 hover:text-blue-700 p-2">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(cliente._id)} className="text-red-500 hover:text-red-700 p-2" disabled={deleteState.isLoading}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {isFetching && <div className="text-center p-4">Actualizando...</div>}

                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>
                            Anterior
                        </Button>
                        <span>
                            Página {page} de {totalPages}
                        </span>
                        <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching}>
                            Siguiente
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientesScreen;