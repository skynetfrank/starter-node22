import React from "react";

/**
 * Un botón reutilizable con estilos primarios.
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onClick - La función a ejecutar al hacer clic.
 * @param {React.ReactNode} props.children - El contenido del botón.
 * @param {string} [props.type='button'] - El tipo de botón (button, submit, reset).
 * @param {'small' | 'medium' | 'large'} [props.size='large'] - El tamaño del botón.
 * @param {'primary' | 'outline'} [props.variant='primary'] - La variante de estilo del botón.
 */
function Button({ children, onClick, type = "button", size = "large", variant = "primary", className = "", ...props }) {
  // Combina las clases base, de variante, de tamaño y cualquier clase adicional pasada.
  const buttonClasses = `btn btn-${variant} btn-${size} ${className}`.trim();

  return (
    <button type={type} className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default Button;
