import { useState } from 'react';
import MoneyInput from './MoneyInput';
import './App.css';

function App() {
  const [amount, setAmount] = useState(0);
  const [amount2, setAmount2] = useState(0);

  const handleAmountChange = (value) => {
    console.log('Valor actualizado:', value);
    setAmount(value);
  };

  const handleAmount2Change = (value) => {
    setAmount2(value);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Input de Dinero con Formato Dinámico</h1>
        <p>Componente React 19 para entrada de cantidades monetarias</p>
      </header>

      <main className="app-main">
        <div className="demo-section">
          <div className="demo-card">
            <h2>Ejemplo Básico</h2>
            <MoneyInput 
              label="Cantidad en Pesos"
              placeholder="0.00"
              currencySymbol="$"
              onValueChange={handleAmountChange}
            />
            <div className="value-display">
              Valor numérico: <strong>{amount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="demo-card">
            <h2>Ejemplo con Euros</h2>
            <MoneyInput 
              label="Cantidad en Euros"
              placeholder="0.00"
              currencySymbol="€"
              onValueChange={handleAmount2Change}
            />
            <div className="value-display">
              Valor numérico: <strong>{amount2.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="instructions">
          <h3>Instrucciones de uso:</h3>
          <ul>
            <li>Ingrese dígitos numéricos (0-9) para la cantidad</li>
            <li>Use el punto (.) como separador decimal</li>
            <li>El formateo con separadores de miles es automático</li>
            <li>Los decimales se limitan automáticamente a 2 dígitos</li>
            <li>Al perder el foco, se completa con .00 si no hay decimales</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;