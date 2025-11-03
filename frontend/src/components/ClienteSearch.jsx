import React, { useState, useEffect } from "react";
import { X, Search, Check, UserPlus } from "lucide-react";
import { useLazyGetClienteByRifQuery } from "../api/clientesApi";
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

  const validateCedula = useCedulaValidation();
  const [triggerSearch, { data, error, isLoading, isFetching }] = useLazyGetClienteByRifQuery();

  // Limpiar el estado interno cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setRif("");
        setValidationError(null);
        setFoundClient(null);
      }, 300); // Espera a que la animación de cierre termine
    }
  }, [isOpen]);

  // Manejar la respuesta de la API
  useEffect(() => {
    if (data) {
      setFoundClient(data);
      setValidationError(null);
    }
    if (error) {
      setFoundClient(null);
    }
  }, [data, error]);

  const handleSearch = () => {
    setValidationError(null);
    setFoundClient(null);

    const cedulaError = validateCedula(rif);
    if (cedulaError) {
      setValidationError(cedulaError);
      return;
    }
    triggerSearch(rif.toUpperCase());
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
  };

  if (!isOpen) {
    return null;
  }

  const isSearching = isLoading || isFetching;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Buscar Cliente</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {!foundClient && (
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Ingrese Cédula o RIF (ej: V12345678)"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                disabled={isSearching}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching || !rif} className="btn-primary">
                {isSearching ? <div className="spinner-small"></div> : <Search size={20} />}
              </Button>
            </div>
          )}

          {validationError && <MessageBox variant="danger">{validationError}</MessageBox>}
          {error && <MessageBox variant="danger">{error.data?.message || "Cliente no encontrado."}</MessageBox>}

          {foundClient && (
            <div className="client-found-card">
              <h4>Cliente Encontrado</h4>
              <p><strong>Nombre:</strong> {foundClient.nombre}</p>
              <p><strong>RIF:</strong> {foundClient.rif}</p>
              <p><strong>Dirección:</strong> {foundClient.direccion}</p>
              <p className="confirmation-question">¿Es este el cliente correcto?</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {foundClient ? (
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