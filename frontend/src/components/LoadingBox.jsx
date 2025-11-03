import React from "react";

/**
 * Un componente reutilizable que muestra un spinner de carga centrado.
 * Utiliza las clases CSS 'loading-spinner-container' y 'loading-spinner'
 * definidas en index.css para el estilo y la animación.
 */
const LoadingBox = () => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
        </div>
    );
};

export default LoadingBox;