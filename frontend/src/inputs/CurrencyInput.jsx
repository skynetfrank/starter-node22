import React, { useState, useRef, useLayoutEffect } from 'react';
import './CurrencyInput.css';

/**
 * CurrencyInput Component
 * 
 * A reusable React 19 component for numeric input with banking-style formatting.
 * 
 * Features:
 * - Real-time thousands separator formatting.
 * - "Smart Decimal" behavior: Pressing '.' converts the last two digits of an integer input into decimals (e.g., 12345 + '.' -> 123.45).
 * - Automatic formatting on blur: Appends .00 if no decimal is present (e.g., 100 -> 100.00).
 * - Max 2 decimal places.
 * - Pure CSS styling.
 * 
 * @param {Object} props
 * @param {function} props.onValueChange - Callback returning the numeric value (monto).
 * @param {string} [props.label] - Optional label for the input.
 * @param {string} [props.placeholder] - Optional placeholder.
 * @param {string} [props.className] - Optional extra classes.
 */
const CurrencyInput = ({ onValueChange, label = "Monto", placeholder = "0.00", className = "" }) => {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef(null);

  // Helper to format number with commas
  const formatNumber = (numStr) => {
    if (!numStr) return "";
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  // Helper to clean formatting (remove commas)
  const cleanNumber = (val) => val.replace(/,/g, '');

  const handleChange = (e) => {
    let val = e.target.value;
    
    // Allow only digits and one dot
    if (!/^[\d,.]*$/.test(val)) return;

    // Remove existing commas for processing
    let rawVal = cleanNumber(val);

    // Handle the "Smart Decimal" logic:
    // If the user just typed a dot at the end of an integer string
    // AND the previous state didn't have a dot (implied by logic flow usually, but let's check input type)
    // Actually, checking if the last char entered was '.' is tricky in standard onChange.
    // We'll check if the raw value ends in '.' and if it was an integer before.
    
    // However, the prompt says: "if the user enters the decimal point the last two digits... become the decimal part"
    // Example: 12345 -> User types '.' -> 123.45
    // Standard input behavior for '.' is just appending it. We need to intercept this.
    
    // We can detect if the user *just* added a decimal point to an integer.
    if (rawVal.endsWith('.') && (rawVal.match(/\./g) || []).length === 1) {
      const integerPart = rawVal.slice(0, -1); // Remove the dot
      if (integerPart.length >= 2) {
        // Move decimal point two places back
        const main = integerPart.slice(0, -2);
        const dec = integerPart.slice(-2);
        rawVal = `${main}.${dec}`;
      } else if (integerPart.length === 1) {
         // 1. -> 0.01? Or 1.00?
         // "Last two digits". If only 1 digit, maybe 0.01? 
         // Let's stick to the literal "last two digits". If < 2 digits, standard behavior (1.)
      }
    }

    // Enforce max 2 decimals
    if (rawVal.includes('.')) {
      const parts = rawVal.split('.');
      if (parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        rawVal = parts.join('.');
      }
    }

    // Update State
    const formatted = formatNumber(rawVal);
    setDisplayValue(formatted);

    // Notify Parent
    if (onValueChange) {
      const numValue = parseFloat(rawVal);
      onValueChange(isNaN(numValue) ? 0 : numValue);
    }
  };

  const handleKeyDown = (e) => {
    // Intercept the '.' key to force the "Smart Decimal" logic explicitly if needed
    // The onChange handler covers most, but preventing default '.' behavior might be cleaner for the "transform" effect.
    if (e.key === '.') {
      e.preventDefault();
      
      const currentVal = cleanNumber(displayValue);
      
      // If already has a dot, do nothing or just focus it?
      if (currentVal.includes('.')) return;

      // "Last two digits become decimal"
      if (currentVal.length >= 2) {
        const main = currentVal.slice(0, -2);
        const dec = currentVal.slice(-2);
        const newVal = `${main}.${dec}`; // e.g. 12345 -> 123.45
        
        setDisplayValue(formatNumber(newVal));
        if (onValueChange) onValueChange(parseFloat(newVal));
      } else {
        // If less than 2 digits, maybe just append dot?
        // Prompt implies "last two digits". If I have "1", I can't take 2 digits.
        // Fallback to standard appending '.'
        const newVal = currentVal + '.';
        setDisplayValue(formatNumber(newVal));
      }
    }
    
    // Allow Backspace to work naturally (deleting commas is handled by re-formatting in onChange)
  };

  const handleBlur = () => {
    if (!displayValue) return;
    
    let rawVal = cleanNumber(displayValue);
    
    // "If user does not enter decimal point... formatted to two decimals automatically"
    if (!rawVal.includes('.')) {
      rawVal += '.00';
    } else {
      // Ensure 2 decimals if dot exists (e.g. 12.5 -> 12.50)
      const parts = rawVal.split('.');
      if (parts[1].length === 0) rawVal += '00';
      else if (parts[1].length === 1) rawVal += '0';
    }

    setDisplayValue(formatNumber(rawVal));
    if (onValueChange) onValueChange(parseFloat(rawVal));
  };

  return (
    <div className="currency-input-container">
      {label && <label className="currency-label">{label}</label>}
      <div className="input-wrapper">
        <span className="currency-symbol">$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className={`currency-field ${className}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // Using KeyDown for the specific '.' interception
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
