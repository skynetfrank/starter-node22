import React, { useState, useCallback } from 'react';
import './rifvalidator.css';

/**
 * Componente RifValidator - Valida y formatea números de RIF venezolanos
 * Formato permitido:
 * - J/G: Letra + 9 dígitos (ej: J123456789)
 * - V/E: Letra + 5 a 9 dígitos (ej: V12345, V123456789)
 */
const RifValidator = ({ onRifChange, initialValue = '' }) => {
  const [rif, setRif] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Letras permitidas y sus configuraciones
  const ALLOWED_LETTERS = {
    'V': { minDigits: 5, maxDigits: 9, description: 'Personas Naturales' },
    'E': { minDigits: 5, maxDigits: 9, description: 'Extranjeros' },
    'J': { minDigits: 9, maxDigits: 9, description: 'Personas Jurídicas' },
    'G': { minDigits: 9, maxDigits: 9, description: 'Gobierno' }
  };

  /**
   * Valida el formato completo del RIF
   */
  const validateRif = useCallback((value) => {
    if (!value) return { isValid: false, message: '' };

    // Verificar longitud máxima
    if (value.length > 10) {
      return { 
        isValid: false, 
        message: 'Máximo 10 caracteres permitidos' 
      };
    }

    // Verificar que comience con letra permitida
    const firstChar = value.charAt(0).toUpperCase();
    if (!ALLOWED_LETTERS[firstChar]) {
      return { 
        isValid: false, 
        message: 'Debe comenzar con V, E, J o G' 
      };
    }

    // Obtener solo los números
    const numbers = value.slice(1);
    
    // Verificar que solo contenga números después de la letra
    if (numbers && !/^\d*$/.test(numbers)) {
      return { 
        isValid: false, 
        message: 'Solo se permiten números después de la letra' 
      };
    }

    const config = ALLOWED_LETTERS[firstChar];
    const digitCount = numbers.length;

    // Validar cantidad de dígitos según la letra
    if (digitCount < config.minDigits) {
      return { 
        isValid: false, 
        message: `${firstChar} requiere mínimo ${config.minDigits} dígitos` 
      };
    }

    if (digitCount > config.maxDigits) {
      return { 
        isValid: false, 
        message: `${firstChar} permite máximo ${config.maxDigits} dígitos` 
      };
    }

    return { isValid: true, message: '' };
  }, []);

  /**
   * Maneja el cambio en el input
   */
  const handleChange = useCallback((e) => {
    let inputValue = e.target.value.toUpperCase();
    
    // Limitar a 10 caracteres
    if (inputValue.length > 10) {
      inputValue = inputValue.substring(0, 10);
    }

    // Solo permitir letras válidas al inicio
    if (inputValue.length > 0) {
      const firstChar = inputValue.charAt(0);
      if (!['V', 'E', 'J', 'G', ''].includes(firstChar)) {
        return;
      }
    }

    // Filtrar caracteres no permitidos después de la letra
    if (inputValue.length > 1) {
      const firstChar = inputValue.charAt(0);
      const rest = inputValue.slice(1);
      const filteredRest = rest.replace(/[^0-9]/g, '');
      inputValue = firstChar + filteredRest;
    }

    // Actualizar estado
    setRif(inputValue);
    setTouched(true);

    // Validar
    const validation = validateRif(inputValue);
    setError(validation.message);

    // Notificar al padre si es válido
    if (validation.isValid && inputValue.length >= 2) {
      onRifChange?.(inputValue);
    } else {
      onRifChange?.('');
    }
  }, [validateRif, onRifChange]);

  /**
   * Maneja el blur del input
   */
  const handleBlur = useCallback(() => {
    setTouched(true);
    if (rif) {
      const validation = validateRif(rif);
      setError(validation.message);
    }
  }, [rif, validateRif]);

  /**
   * Formatea el RIF para mostrar
   */
  const formatDisplay = (value) => {
    if (!value || value.length < 2) return value;
    
    const firstChar = value.charAt(0);
    const numbers = value.slice(1);
    
    // Para mostrar con guion opcional (formato común: V-12345678)
    if (numbers.length > 0) {
      return `${firstChar}-${numbers}`;
    }
    
    return value;
  };

  /**
   * Obtiene información sobre el tipo de RIF
   */
  const getRifTypeInfo = () => {
    if (!rif || rif.length < 1) return null;
    
    const firstChar = rif.charAt(0).toUpperCase();
    const config = ALLOWED_LETTERS[firstChar];
    
    if (!config) return null;
    
    return {
      letter: firstChar,
      description: config.description,
      format: `${firstChar}-${'X'.repeat(config.minDigits)}${config.maxDigits > config.minDigits ? ' a ' + 'X'.repeat(config.maxDigits) : ''}`
    };
  };

  const rifInfo = getRifTypeInfo();
  const isValid = !error && rif.length >= 2;

  return (
    <div className="rif-validator-container">
      <div className="rif-input-group">
        <label htmlFor="rif-input" className="rif-label">
          Número de RIF
          <span className="required-indicator">*</span>
        </label>
        
        <div className={`input-wrapper ${error && touched ? 'input-error' : ''} ${isValid ? 'input-valid' : ''}`}>
          <input
            id="rif-input"
            type="text"
            value={formatDisplay(rif)}
            onChange={handleChange}
            onBlur={handleBlur}
            className="rif-input"
            placeholder="Ej: V-12345678"
            maxLength={12} // Considerando el guion en la visualización
            aria-invalid={!!error}
            aria-describedby={error ? "rif-error" : "rif-help"}
          />
          
          {isValid && (
            <span className="valid-indicator" aria-label="Formato válido">
              ✓
            </span>
          )}
        </div>
        
        {rifInfo && (
          <div className="rif-info">
            <span className="rif-type">
              {rifInfo.letter}: {rifInfo.description}
            </span>
            <span className="rif-format">
              Formato: {rifInfo.format}
            </span>
          </div>
        )}
        
        {error && touched && (
          <div id="rif-error" className="error-message" role="alert">
            {error}
          </div>
        )}
        
        {!error && rif.length >= 2 && (
          <div id="rif-help" className="success-message">
            Formato válido. RIF: {rif}
          </div>
        )}
        
        {!rif && touched && (
          <div className="help-text">
            Ingrese su RIF comenzando con V, E, J o G seguido de números
          </div>
        )}
      </div>
      
      <div className="rif-examples">
        <h4>Ejemplos válidos:</h4>
        <ul>
          <li><strong>V-123456789</strong> (Personas Naturales - 9 dígitos)</li>
          <li><strong>V-12345</strong> (Personas Naturales - mínimo 5 dígitos)</li>
          <li><strong>J-123456789</strong> (Personas Jurídicas - 9 dígitos)</li>
          <li><strong>E-12345678</strong> (Extranjeros - 8 dígitos)</li>
          <li><strong>G-987654321</strong> (Gobierno - 9 dígitos)</li>
        </ul>
      </div>
    </div>
  );
};

export default RifValidator;