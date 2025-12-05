import { useState, useEffect, useRef } from "react";
import "./inputphone.css";

const InputPhone = ({
  label = "Teléfono",
  placeholder = "0412-123-4567",
  onPhoneChange,
  required = false,
  disabled = false,
  errorMessage = "Número de teléfono inválido",
  defaultValue = "",
}) => {
  const [phone, setPhone] = useState("");
  const [rawPhone, setRawPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Códigos de operadora válidos en Venezuela
  const validOperators = [
    "0412",
    "0414",
    "0416",
    "0424", // Movistar
    "0426",
    "0412",
    "0414",
    "0416",
    "0424", // Digitel
    "0426",
    "0412",
    "0414", // Movilnet
    "0412",
    "0414",
    "0416",
    "0424", // Cantv (móvil)
    "0426",
    "0212",
    "0234",
    "0241",
    "0243", // Códigos de área fijos
    "0244",
    "0245",
    "0246",
    "0247",
    "0248",
    "0249",
    "0251",
    "0252",
    "0253",
    "0254",
    "0255",
    "0271",
    "0272",
    "0273",
    "0274",
    "0275",
    "0276",
    "0278",
    "0279",
    "0281",
    "0282",
    "0283",
    "0285",
    "0286",
    "0287",
    "0288",
    "0289",
    "0291",
    "0292",
    "0293",
    "0294",
    "0295",
  ];

  // Formatos de teléfono para Venezuela
  const phoneFormats = {
    mobile: "(####) ###-####", // Móvil: 10 dígitos
    landline: "(####) ###-####", // Fijo: 10 dígitos
    international: "+58 (###) ###-####", // Internacional
  };

  // Inicializar con valor por defecto
  useEffect(() => {
    if (defaultValue) {
      const cleaned = cleanPhoneNumber(defaultValue);
      setRawPhone(cleaned);
      formatPhoneNumber(cleaned);
      validatePhoneNumber(cleaned);
    }
  }, [defaultValue]);

  // Limpiar número de teléfono (solo dígitos)
  const cleanPhoneNumber = (number) => {
    return number.replace(/\D/g, "");
  };

  // Validar número de teléfono venezolano
  const validatePhoneNumber = (number) => {
    if (!number) {
      setIsValid(!required); // Vacío es válido solo si no es requerido
      return false;
    }

    // Limpiar número
    const cleaned = cleanPhoneNumber(number);

    // Validar longitud
    const isValidLength = cleaned.length === 10 || cleaned.length === 11;

    // Validar código de operadora para móviles (si es número de 10 dígitos)
    let isValidOperator = true;
    if (cleaned.length === 10) {
      const operatorCode = cleaned.substring(0, 4);
      isValidOperator = validOperators.includes(operatorCode);
    }

    // Validar código de área para fijos
    let isValidAreaCode = true;
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      const areaCode = cleaned.substring(0, 4);
      isValidAreaCode = validOperators.includes(areaCode);
    }

    const isValid = isValidLength && (isValidOperator || isValidAreaCode);
    setIsValid(isValid);

    return isValid;
  };

  // Formatear número de teléfono
  const formatPhoneNumber = (number) => {
    if (!number) {
      setPhone("");
      return "";
    }

    const cleaned = cleanPhoneNumber(number);
    let formatted = "";

    // Determinar formato basado en longitud y prefijo
    if (cleaned.length <= 10) {
      // Formato nacional
      formatted = cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "($1) $2-$3");
    } else if (cleaned.length === 11 && cleaned.startsWith("58")) {
      // Formato internacional sin +
      formatted = cleaned.replace(/(58)(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4");
    } else if (cleaned.length === 12 && cleaned.startsWith("58")) {
      // Formato internacional completo
      formatted = cleaned.replace(/(58)(\d{4})(\d{3})(\d{3})/, "+$1 ($2) $3-$4");
    } else {
      // Formato parcial mientras se escribe
      if (cleaned.length <= 4) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 7) {
        formatted = `(${cleaned.substring(0, 4)}) ${cleaned.substring(4)}`;
      } else {
        formatted = `(${cleaned.substring(0, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 10)}`;
      }
    }

    setPhone(formatted);
    return formatted;
  };

  // Manejar cambio en el input
  const handleChange = (e) => {
    const input = e.target.value;

    // Permitir solo dígitos, paréntesis, espacios, guiones y +
    const cleaned = input.replace(/[^\d\s\(\)\-\+]/g, "");

    // Extraer solo dígitos para el valor crudo
    const digitsOnly = cleaned.replace(/\D/g, "");

    setRawPhone(digitsOnly);

    // Formatear el número
    const formatted = formatPhoneNumber(digitsOnly);

    // Validar
    const isValid = validatePhoneNumber(digitsOnly);

    // Llamar al callback con el objeto completo
    onPhoneChange?.({
      raw: digitsOnly,
      formatted: formatted,
      isValid: isValid,
      type: getPhoneType(digitsOnly),
    });
  };

  // Determinar tipo de teléfono
  const getPhoneType = (number) => {
    if (!number) return "unknown";

    const cleaned = cleanPhoneNumber(number);

    if (cleaned.startsWith("58")) return "international";
    if (cleaned.startsWith("04")) return "mobile";
    if (cleaned.startsWith("02")) return "landline";

    return "unknown";
  };

  // Manejar foco
  const handleFocus = () => {
    setIsFocused(true);
    if (!touched) setTouched(true);

    // Si el campo está vacío, mostrar formato inicial
    if (!rawPhone) {
      setPhone("(");
    }
  };

  // Manejar pérdida de foco
  const handleBlur = () => {
    setIsFocused(false);

    // Si solo hay un paréntesis, limpiar
    if (phone === "(") {
      setPhone("");
    }

    // Validar al perder foco
    validatePhoneNumber(rawPhone);
  };

  // Manejar teclas presionadas
  const handleKeyDown = (e) => {
    // Permitir navegación y edición
    if (["ArrowLeft", "ArrowRight", "Tab", "Backspace", "Delete", "Home", "End"].includes(e.key)) {
      return;
    }

    // Solo permitir dígitos y algunos caracteres especiales
    if (!/[\d\s\(\)\-\+]/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  };

  // Manejar clic en el contenedor
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Obtener icono según tipo de teléfono
  const getPhoneIcon = () => {
    const type = getPhoneType(rawPhone);

    switch (type) {
      case "mobile":
        return "📱";
      case "landline":
        return "🏠";
      case "international":
        return "🌍";
      default:
        return "📞";
    }
  };

  // Obtener texto descriptivo del tipo de teléfono
  const getPhoneTypeText = () => {
    const type = getPhoneType(rawPhone);

    switch (type) {
      case "mobile":
        return "Móvil";
      case "landline":
        return "Fijo";
      case "international":
        return "Internacional";
      default:
        return "Teléfono";
    }
  };

  return (
    <div className="venezuelan-phone-input-container">
      <div className="phone-input-header">
        {label && (
          <label className="phone-input-label">
            {label} {required && <span className="required-asterisk">*</span>}
          </label>
        )}

        {rawPhone && (
          <span className="phone-type-indicator">
            {getPhoneIcon()} {getPhoneTypeText()}
          </span>
        )}
      </div>

      <div
        className={`phone-input-wrapper ${isFocused ? "focused" : ""} ${!isValid && touched ? "invalid" : ""} ${
          isValid && rawPhone ? "valid" : ""
        }`}
        onClick={handleContainerClick}
        data-disabled={disabled}
      >
        <span className="country-code">+58</span>

        <input
          ref={inputRef}
          type="tel"
          className="phone-input"
          value={phone}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="tel"
          maxLength="20"
        />

        {!phone && !isFocused && <div className="phone-placeholder">{placeholder}</div>}

        {rawPhone && isValid && <div className="phone-valid-icon">✓</div>}
      </div>

      <div className="phone-input-footer">
        {!isValid && touched && rawPhone && <div className="error-message">⚠️ {errorMessage}</div>}

        {isFocused && (
          <div className="format-hint">Formato: (0412) 123-4567 para móviles / (0212) 123-4567 para fijos</div>
        )}

        {!rawPhone && !isFocused && required && <div className="required-hint">Campo requerido</div>}
      </div>

      {rawPhone && (
        <div className="phone-details">
          <div className="phone-detail">
            <span className="detail-label">Número crudo:</span>
            <span className="detail-value">{rawPhone}</span>
          </div>
          <div className="phone-detail">
            <span className="detail-label">Longitud:</span>
            <span className="detail-value">{rawPhone.length} dígitos</span>
          </div>
          <div className="phone-detail">
            <span className="detail-label">Validación:</span>
            <span className={`detail-value ${isValid ? "valid-status" : "invalid-status"}`}>
              {isValid ? "✓ Válido" : "✗ Inválido"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPhone;
