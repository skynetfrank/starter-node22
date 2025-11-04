import React from "react";

/**
 * Un componente de tooltip moderno y reutilizable que se muestra al pasar el cursor.
 * @param {object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - El elemento sobre el cual se mostrará el tooltip.
 * @param {string} props.text - El texto que se mostrará dentro del tooltip.
 * @param {'top' | 'bottom' | 'left' | 'right'} [props.position='top'] - La posición del tooltip.
 * @param {string} [props.className] - Clases CSS adicionales para el contenedor.
 */
const Tooltip = ({ children, text, position = "top", className = "" }) => {
  // El texto del tooltip no se renderiza en el DOM si está vacío.
  if (!text) {
    return <>{children}</>;
  }

  return (
    <div className={`tooltip-container ${className}`}>
      {children}
      <span className={`tooltip-text tooltip-${position}`}>{text}</span>
    </div>
  );
};

export default Tooltip;