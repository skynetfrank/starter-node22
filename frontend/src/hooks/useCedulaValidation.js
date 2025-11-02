/**
 * Hook personalizado para la validación de cédulas y RIF de Venezuela.
 * @returns {function(string): boolean} - Una función `validateCedula` que toma una cédula como string y devuelve `true` si es válida, o `false` si no lo es, mostrando una alerta en caso de error.
 */
const useCedulaValidation = () => {
  const validateCedula = (cedula) => {
    // Comprueba si la cédula es nula o vacía.
    if (!cedula || cedula.trim() === "") {
      return "El campo de la cédula no puede estar vacío.";
    }

    const cedulaUpper = cedula.toUpperCase();
    const firstChar = cedulaUpper.charAt(0);
    const numericPart = cedulaUpper.substring(1);

    // 1. Valida que la primera letra sea V, E, J, o G.
    if (!/^[VEJG]$/.test(firstChar)) {
      return "La cédula debe comenzar con V, E, J o G.";
    }

    // 2. Valida que el resto de los caracteres sean solo números.
    if (!/^\d+$/.test(numericPart)) {
      return "Después de la letra inicial, la cédula solo debe contener números.";
    }

    // 3. Valida la longitud para V o E.
    if ((firstChar === "V" || firstChar === "E") && (numericPart.length < 4 || numericPart.length > 10)) {
      return "Para cédulas V o E, se requieren entre 4 y 10 dígitos numéricos.";
    }

    // 4. Valida la longitud para J o G.
    if ((firstChar === "J" || firstChar === "G") && numericPart.length < 9) {
      return "Para RIF (J o G), se requieren al menos 9 dígitos numéricos.";
    }

    // Si todas las validaciones pasan, es válido.
    return null;
  };

  return validateCedula;
};

export default useCedulaValidation;
