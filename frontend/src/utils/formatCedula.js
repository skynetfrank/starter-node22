/**
 * Helper function to format the cedula.
 * Removes special characters (including hyphens) and converts to uppercase.
 * Allows only letters (V, E, J, G) and numbers.
 *
 * @param {string} value - The input value.
 * @returns {string} - The formatted value.
 */
export const formatCedula = (value) => {
  if (!value) return "";
  // Convert to uppercase
  let formatted = value.toUpperCase();
  // So we strip everything except V, J, E, G and 0-9.
  formatted = formatted.replace(/[^VJEG0-9]/g, "");
  return formatted;
};
