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
    <div className="cliente-form-container">
      <div className="cliente-form-header">
        <h1>{isEditMode ? "Editar Cliente" : "Crear Nuevo Cliente"}</h1>
                <Button onClick={() => navigate("/clientes")} className="btn-secondary btn-with-icon">
                    <ArrowLeft size={18} />
                    <span>Volver</span>
                </Button>
            </div>

      <form onSubmit={handleSubmit} className="cliente-form-card">
                {Object.keys(formData).map((key) => (
          <div key={key} className="form-group">
            <label htmlFor={key} className="form-label">
                            {key}
                        </label>
                        <input
                            type={key === "email" ? "email" : "text"}
                            id={key}
                            name={key}
              className="form-input"
                            value={formData[key]}
                            onChange={handleChange}
                            required={["nombre", "rif", "direccion"].includes(key)}
                            maxLength={key === "rif" ? 10 : undefined}
                        />
                    </div>
                ))}

        <div className="cliente-form-actions">
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