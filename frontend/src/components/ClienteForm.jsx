import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
    useGetClienteQuery,
    useAddClienteMutation,
    useUpdateClienteMutation,
} from "../api/clientesApi";
import useApiNotification from "../hooks/useApiNotification";
import Button from "./Button";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import { Save, ArrowLeft } from "lucide-react";

const ClienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // State para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        rif: "",
        email: "",
        celular: "",
        direccion: "",
        canal: "",
    });

    // Hooks de RTK Query
    const {
        data: clienteData,
        isLoading: isLoadingCliente,
        error: loadError,
    } = useGetClienteQuery(id, {
        skip: !isEditMode, // No ejecutar si no estamos en modo edición
    });

    const [addCliente, addState] = useAddClienteMutation();
    const [updateCliente, updateState] = useUpdateClienteMutation();

    // Llenar el formulario con los datos del cliente en modo edición
    useEffect(() => {
        if (isEditMode && clienteData) {
            setFormData({
                nombre: clienteData.nombre || "",
                rif: clienteData.rif || "",
                email: clienteData.email || "",
                celular: clienteData.celular || "",
                direccion: clienteData.direccion || "",
                canal: clienteData.canal || "",
            });
        }
    }, [isEditMode, clienteData]);

    // Hooks de notificación para creación y actualización
    const onSuccess = () => navigate("/clientes");

    useApiNotification(addState, {
        loading: "Creando cliente...",
        success: "Cliente creado con éxito.",
        error: (err) => err?.data?.message || "Error al crear el cliente.",
    }, onSuccess);

    useApiNotification(updateState, {
        loading: "Actualizando cliente...",
        success: "Cliente actualizado con éxito.",
        error: (err) => err?.data?.message || "Error al actualizar el cliente.",
    }, onSuccess);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditMode) {
            await updateCliente({ id, ...formData });
        } else {
            await addCliente(formData);
        }
    };

    const isLoading = addState.isLoading || updateState.isLoading;

    if (isLoadingCliente) return <LoadingBox />;
    if (loadError) return <MessageBox variant="danger">{loadError?.data?.message || "Error al cargar datos del cliente"}</MessageBox>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{isEditMode ? "Editar Cliente" : "Crear Nuevo Cliente"}</h1>
                <Button onClick={() => navigate("/clientes")} className="btn-secondary btn-with-icon">
                    <ArrowLeft size={18} />
                    <span>Volver</span>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                {Object.keys(formData).map((key) => (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                            {key}
                        </label>
                        <input
                            type={key === "email" ? "email" : "text"}
                            id={key}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            required={["nombre", "rif", "direccion"].includes(key)}
                            maxLength={key === "rif" ? 10 : undefined}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                ))}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="btn-primary btn-with-icon">
                        {isLoading ? <div className="spinner"></div> : <Save size={18} />}
                        <span>{isLoading ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Crear Cliente"}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;