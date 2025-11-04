import React, { useState, useEffect } from "react";
import { X, Search, Check, UserCheck, Save } from "lucide-react";
import { useLazyGetClienteByRifQuery, useAddClienteMutation } from "../api/clientesApi";
import Swal from "sweetalert2";
import useCedulaValidation from "../hooks/useCedulaValidation";
import Button from "./Button";
import MessageBox from "./MessageBox";

/**
 * Componente modal para buscar un cliente por su RIF/Cédula.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function(object): void} props.onClientSelect - Callback que se ejecuta al seleccionar un cliente.
 */
const ClienteSearch = ({ isOpen, onClose, onClientSelect }) => {
  const [rif, setRif] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [foundClient, setFoundClient] = useState(null);
  // Nuevos estados para el formulario de creación
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nombre: "",
    direccion: "",
    celular: "",
  });

  const validateCedula = useCedulaValidation();
  const [triggerSearch, { data, error, isLoading, isFetching, reset: resetSearch }] = useLazyGetClienteByRifQuery();
  const [addCliente, { isLoading: isCreating, isSuccess: isCreateSuccess, data: createdClient }] =
    useAddClienteMutation();

  // Limpiar el estado interno cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setRif("");
        setValidationError(null);
        setFoundClient(null);
        setShowCreateForm(false);
        resetSearch(); // 1. Limpiar el estado de RTK Query al cerrar
        setNewClientData({ nombre: "", direccion: "", celular: "" });
      }, 300); // Espera a que la animación de cierre termine
    }
  }, [isOpen, resetSearch]);

  // Manejar la respuesta de la API
  useEffect(() => {
    const handleResponse = async () => {
      // Solo procesar si no hay una búsqueda activa
      if (isLoading || isFetching) return;

      if (data) {
        setFoundClient(data);
        setValidationError(null);
        setShowCreateForm(false); // Ocultar formulario si se encuentra un cliente
      }
      if (error) {
        // El estado de foundClient ya se resetea en handleSearch
        // Usar SweetAlert2 para una confirmación más elegante
        const result = await Swal.fire({
          title: "Cliente no encontrado",
          text: `¿Deseas agregar un nuevo cliente con el RIF "${rif.toUpperCase()}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, crear nuevo",
          cancelButtonText: "Cancelar",
          customClass: {
            popup: "swal2-custom-popup",
            confirmButton: "swal2-custom-confirm",
            cancelButton: "swal2-custom-cancel",
          },
        });
        if (result.isConfirmed) {
          setShowCreateForm(true);
        }
      }
    };
    handleResponse();
  }, [data, error, isLoading, isFetching]); // 2. Ajustar dependencias

  // Manejar la respuesta de la creación de un nuevo cliente
  useEffect(() => {
    if (isCreateSuccess && createdClient) {
      // Si la creación fue exitosa, enviar los datos al padre y cerrar.
      onClientSelect({
        nombre: createdClient.nombre,
        rif: createdClient.rif,
        direccion: createdClient.direccion,
      });
      onClose();
    }
  }, [isCreateSuccess, createdClient, onClientSelect, onClose]);

  const handleSearch = () => {
    setValidationError(null);
    setFoundClient(null);
    setShowCreateForm(false);

    // 1. Reinicia el estado del hook de RTK Query a su estado inicial.
    resetSearch();

    const cedulaError = validateCedula(rif);
    if (cedulaError) {
      setValidationError(cedulaError);
      return;
    }
    // 2. Dispara la búsqueda. Ya no es necesario el segundo argumento `false`.
    triggerSearch(rif.toUpperCase());
  };

  const handleCreateClient = async () => {
    if (!newClientData.nombre || !newClientData.direccion) {
      Swal.fire({
        title: "Campos incompletos",
        text: "El nombre y la dirección son obligatorios.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-custom-popup",
          confirmButton: "swal2-custom-confirm",
        },
      });
      return;
    }
    await addCliente({
      rif: rif.toUpperCase(),
      ...newClientData,
    });
  };

  const handleConfirm = () => {
    if (foundClient) {
      onClientSelect({
        nombre: foundClient.nombre,
        rif: foundClient.rif,
        direccion: foundClient.direccion,
      });
      onClose();
    }
  };

  const handleReset = () => {
    setRif("");
    setValidationError(null);
    setFoundClient(null);
    setShowCreateForm(false);
    resetSearch(); // 3. Limpiar el estado de RTK Query al resetear
    setNewClientData({ nombre: "", direccion: "", celular: "" });
  };

  const handleNewClientDataChange = (e) => {
    const { name, value } = e.target;
    setNewClientData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) {
    return null;
  }

  const isSearching = isLoading || isFetching || isCreating;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {showCreateForm ? <h4>CREAR NUEVO CLIENTE - RIF: {rif.toUpperCase()}</h4> : <h4>Buscar Cliente </h4>}

          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {!foundClient && !showCreateForm && (
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Ingrese Cédula o RIF (ej: V12345678)"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                disabled={isSearching}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching || !rif} className="btn-primary btn-icon-only">
                {isSearching ? <div className="spinner-small"></div> : <Search size={20} />}
              </Button>
            </div>
          )}

          {validationError && <MessageBox variant="danger">{validationError}</MessageBox>}

          {/* Formulario de creación de cliente */}
          {showCreateForm && (
            <div className="create-form-card">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={newClientData.nombre}
                  onChange={handleNewClientDataChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={newClientData.direccion}
                  onChange={handleNewClientDataChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="celular">Teléfono (Opcional)</label>
                <input
                  type="text"
                  id="celular"
                  name="celular"
                  value={newClientData.celular}
                  onChange={handleNewClientDataChange}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {foundClient && (
            <div className="client-found-card">
              <div className="client-found-header">
                <UserCheck className="client-found-icon" size={28} />
                <h4>Cliente Encontrado</h4>
              </div>
              <p className="client-name">{foundClient.nombre}</p>
              <p className="client-detail">
                <strong>RIF:</strong> {foundClient.rif}
              </p>
              <p className="client-detail">
                <strong>Dirección:</strong> {foundClient.direccion}
              </p>
              <p className="confirmation-question">¿Es este el cliente correcto?</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {showCreateForm ? (
            <>
              <Button onClick={() => setShowCreateForm(false)} className="btn-secondary">
                Cancelar
              </Button>
              <Button onClick={handleCreateClient} disabled={isCreating} className="btn-primary btn-with-icon">
                {isCreating ? <div className="spinner-small"></div> : <Save size={18} />}
                <span>Guardar Cliente</span>
              </Button>
            </>
          ) : foundClient ? (
            <>
              <Button onClick={handleReset} className="btn-secondary">
                Buscar Otro
              </Button>
              <Button onClick={handleConfirm} className="btn-primary btn-with-icon">
                <Check size={18} />
                <span>Confirmar</span>
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="btn-secondary">
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteSearch;
