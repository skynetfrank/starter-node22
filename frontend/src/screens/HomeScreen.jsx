import React, { useState } from "react";
import ClienteSearch from "../components/ClienteSearch";
import Button from "../components/Button";

function HomeScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteInfo, setClienteInfo] = useState({
    nombre: "",
    rif: "",
    direccion: "",
  });

  // Esta función se pasará como prop a ClienteSearch
  // y se ejecutará cuando un cliente sea confirmado en el modal.
  const handleClientSelected = (cliente) => {
    console.log("Cliente seleccionado recibido en HomeScreen:", cliente);
    setClienteInfo(cliente);
  };

  return (
    <>
      <div className="home-container" style={{ flexDirection: "column", gap: "2rem" }}>
        <h1>STARTER NODEJS-22</h1>

        {/* Sección de prueba para el componente ClienteSearch */}
        <div style={{ border: "1px solid var(--border-color)", padding: "2rem", borderRadius: "12px", backgroundColor: "var(--color-primary)" }}>
          <h2 style={{ marginBottom: "1rem" }}>Prueba del Modal de Búsqueda</h2>
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Buscar Cliente
          </Button>

          {clienteInfo.nombre && (
            <div style={{ marginTop: "1.5rem", textAlign: "left", backgroundColor: "var(--color-secondary)", padding: "1rem", borderRadius: "8px" }}>
              <h3>Último Cliente Seleccionado:</h3>
              <p><strong>Nombre:</strong> {clienteInfo.nombre}</p>
              <p><strong>RIF:</strong> {clienteInfo.rif}</p>
              <p><strong>Dirección:</strong> {clienteInfo.direccion}</p>
            </div>
          )}
        </div>
      </div>

      <ClienteSearch isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClientSelect={handleClientSelected} />
    </>
  );
}

export default HomeScreen;
