import Swal from "sweetalert2";

/**
 * Muestra una notificación SweetAlert2 estandarizada.
 *
 * @param {object} options - Las opciones para la notificación.
 * @param {'success' | 'error' | 'warning' | 'info' | 'question'} options.type - El tipo de alerta, que define el ícono y el color.
 * @param {string} options.title - El título de la alerta.
 * @param {string} [options.text] - El texto o cuerpo del mensaje.
 * @param {string} [options.confirmButtonText='OK'] - Texto para el botón de confirmación.
 * @param {function} [options.onConfirm] - Una función callback que se ejecuta cuando se confirma la alerta.
 * @param {object} [options.rest] - Cualquier otra opción válida de SweetAlert2 que se quiera sobreescribir.
 */
export const showNotification = ({ type, title, text, confirmButtonText = "OK", onConfirm, ...rest }) => {
  // Configuraciones por defecto para cada tipo de alerta
  const typeDefaults = {
    success: {
      icon: "success",
      title: title || "¡Éxito!",
      confirmButtonColor: "#28a745", // Verde
    },
    error: {
      icon: "error",
      title: title || "¡Error!",
      confirmButtonColor: "#dc3545", // Rojo
    },
    warning: {
      icon: "warning",
      title: title || "Advertencia",
      confirmButtonColor: "#ffc107", // Amarillo
    },
  };

  // Fusionamos los defaults del tipo con las opciones personalizadas
  const config = {
    ...typeDefaults[type],
    text,
    confirmButtonText,
    ...rest, // Permite pasar cualquier otra opción de Swal
  };

  Swal.fire(config).then((result) => {
    // Ejecutar onConfirm si la alerta fue confirmada O si fue cerrada por el temporizador
    if ((result.isConfirmed || result.dismiss === Swal.DismissReason.timer) && onConfirm) {
      onConfirm();
    }
  });
};
