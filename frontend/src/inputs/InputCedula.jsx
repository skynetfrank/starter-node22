import React, { useState, useId } from "react";
import useCedulaValidation from "../hooks/useCedulaValidation";
import "./inputcedula.css";
import PropTypes from "prop-types";
import { formatCedula } from "../utils/formatCedula";

/**
 * Helper function to format the cedula.
 * Removes special characters (including hyphens) and converts to uppercase.
 * Allows only letters (V, E, J, G) and numbers.
 *
 * @param {string} value - The input value.
 * @returns {string} - The formatted value.
 */

/**
 * InputCedula Component
 *
 * A reusable input component for Venezuelan Cedula/RIF validation.
 * Includes formatting (uppercase, no special chars) and validation logic.
 *
 * @param {object} props - Component props.
 * @param {string} props.value - The current value of the input.
 * @param {function} props.onChange - Callback when the value changes.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.placeholder] - Input placeholder.
 * @param {boolean} [props.disabled] - Whether the input is disabled.
 * @param {boolean} [props.required] - Whether the input is required.
 */
const InputCedula = ({
  value,
  onChange,
  className = "",
  placeholder = "V12345678",
  disabled = false,
  required = false,
  ...props
}) => {
  const [error, setError] = useState(null);
  const validateCedula = useCedulaValidation();
  const id = useId();

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = formatCedula(inputValue);

    // Validate the formatted value
    // We validate on every change to give immediate feedback,
    // but typically we might want to validate on blur to be less annoying.
    // However, "equivalent to an input with all its validation" often implies immediate or on-blur.
    // Let's validate immediately but maybe only show error if it's not empty?
    // The hook returns null if valid, string if invalid.

    // If the user is typing, we might want to wait until they finish?
    // But the requirements are strict.
    // Let's validate immediately.
    const validationError = validateCedula(formattedValue);

    // If the value is empty and not required, maybe clear error?
    // But validateCedulaLogic says "cannot be empty".
    // We'll trust the hook.
    setError(validationError);

    // Create a synthetic event with the formatted value to pass to parent
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue,
        name: props.name || "cedula",
      },
    };

    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  const handleBlur = () => {
    // Re-validate on blur to ensure the final state is checked
    const validationError = validateCedula(value);
    setError(validationError);
  };

  return (
    <div className={`input-cedula-wrapper ${className}`}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-cedula ${error ? "has-error" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="input-cedula-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

InputCedula.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default InputCedula;
