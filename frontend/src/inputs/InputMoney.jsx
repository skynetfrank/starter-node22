import { useState, useEffect, useRef } from 'react';
import './inputmoney.css';

const InputMoney = ({ 
  label = "Cantidad", 
  placeholder = "0.00",
  currencySymbol = "$",
  onValueChange 
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Función para formatear el valor
  const formatCurrency = (value) => {
    if (!value || value === '0') return '';
    
    // Limpiar ceros a la izquierda
    let cleanValue = value.replace(/^0+/, '') || '0';
    
    // Separar parte entera y decimal
    let integerPart = cleanValue;
    let decimalPart = '';
    
    // Si el valor contiene un punto, separamos
    if (cleanValue.includes('.')) {
      const parts = cleanValue.split('.');
      integerPart = parts[0] || '0';
      decimalPart = parts[1] || '';
      
      // Limitar decimales a 2 dígitos
      if (decimalPart.length > 2) {
        decimalPart = decimalPart.substring(0, 2);
      }
    } else if (cleanValue.length > 2 && !isFocused) {
      // Si estamos enfocados, no asumimos decimales automáticamente
      // Si no estamos enfocados, los últimos 2 dígitos son decimales
      decimalPart = cleanValue.slice(-2);
      integerPart = cleanValue.slice(0, -2) || '0';
    }
    
    // Formatear parte entera con separadores de miles
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Construir resultado
    let result = formattedInteger;
    if (decimalPart || (isFocused && cleanValue.includes('.'))) {
      result += `.${decimalPart.padEnd(isFocused && cleanValue.includes('.') ? 1 : 2, '0')}`;
    }
    
    return result;
  };

  // Actualizar valor formateado cuando cambia rawValue
  useEffect(() => {
    if (rawValue === '' || rawValue === '0') {
      setDisplayValue('');
      onValueChange?.(0);
      return;
    }

    const formatted = formatCurrency(rawValue);
    setDisplayValue(formatted);
    
    // Calcular valor numérico para el callback
    const numericValue = parseFloat(rawValue) / 100;
    onValueChange?.(numericValue);
  }, [rawValue, isFocused]);

  // Manejar cambios en el input
  const handleChange = (e) => {
    const input = e.target.value;
    
    // Eliminar caracteres no numéricos excepto punto
    let cleanedInput = input.replace(/[^\d.]/g, '');
    
    // Permitir solo un punto decimal
    const dotCount = (cleanedInput.match(/\./g) || []).length;
    if (dotCount > 1) {
      cleanedInput = cleanedInput.replace(/\.+$/, '.');
    }
    
    // Si empieza con punto, agregar 0 antes
    if (cleanedInput.startsWith('.')) {
      cleanedInput = '0' + cleanedInput;
    }
    
    // Actualizar valor crudo
    setRawValue(cleanedInput);
  };

  // Manejar el enfoque
  const handleFocus = () => {
    setIsFocused(true);
    // Si el valor está vacío, establecer 0 para formato
    if (!rawValue || rawValue === '0') {
      setRawValue('0');
    }
  };

  // Manejar la pérdida de enfoque
  const handleBlur = () => {
    setIsFocused(false);
    
    // Si solo hay ceros, limpiar
    if (rawValue === '0' || rawValue === '00') {
      setRawValue('');
      setDisplayValue('');
    } else if (rawValue && !rawValue.includes('.')) {
      // Asegurar que tenga formato decimal completo
      const paddedValue = rawValue.padStart(3, '0');
      const integerPart = paddedValue.slice(0, -2) || '0';
      const decimalPart = paddedValue.slice(-2);
      setRawValue(`${integerPart}.${decimalPart}`);
    }
  };

  // Manejar teclas presionadas
  const handleKeyDown = (e) => {
    // Permitir navegación con teclado
    if (['ArrowLeft', 'ArrowRight', 'Tab', 'Backspace', 'Delete', 'Home', 'End'].includes(e.key)) {
      return;
    }
    
    // Permitir punto solo si no existe ya uno
    if (e.key === '.' && rawValue.includes('.')) {
      e.preventDefault();
      return;
    }
    
    // Solo permitir dígitos y punto
    if (!/[\d.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Manejar clic en el contenedor para enfocar el input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="money-input-container">
      {label && <label className="money-input-label">{label}</label>}
      
      <div 
        className={`money-input-wrapper ${isFocused ? 'focused' : ''}`}
        onClick={handleContainerClick}
      >
        <span className="currency-symbol">{currencySymbol}</span>
        
        <input
          ref={inputRef}
          type="text"
          className="money-input"
          value={isFocused && !rawValue ? '' : displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          inputMode="decimal"
        />
        
        {!rawValue && !isFocused && (
          <div className="money-placeholder">{placeholder}</div>
        )}
        
        <div className="input-decoration">
          <div className="decoration-line"></div>
        </div>
      </div>
      
      <div className="money-input-hint">
        Ingrese solo números y un punto decimal
      </div>
    </div>
  );
};

export default InputMoney;