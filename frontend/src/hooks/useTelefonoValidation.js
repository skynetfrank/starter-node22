/**
 * Hook personalizado para la validación de números de teléfono de Venezuela.
 * @returns {function(string): boolean} - Una función `validateTelefono` que toma un teléfono como string y devuelve `true` si es válido, o `false` si no lo es, mostrando una alerta en caso de error.
 */
const useTelefonoValidation = () => {
  const validateTelefono = (telefono) => {
    if (!telefono || telefono.trim() === "") {
      return "El campo de teléfono no puede estar vacío.";
    }

    // Expresión regular para validar prefijos específicos (0412, 0422, 0414, 0424, 0416, 0426, 0212) y el formato XXXX-XXXXXXX
    const phoneRegex = /^(0412|0422|0414|0424|0416|0426|0212)-\d{7}$/;

    if (!phoneRegex.test(telefono)) {
      return "El número de teléfono no es válido. Debe empezar con un código de área permitido (ej: 0412, 0414, 0212) y seguir el formato 0XXX-XXXXXXX.";
    }

    return null;
  };

  return validateTelefono;
};

export default useTelefonoValidation;
