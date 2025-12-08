import React, { useState } from "react";
import { Link } from "react-router";
import InputCedula from "../inputs/InputCedula";
import InputMoney from "../inputs/InputMoney";
import InputPhone from "../inputs/InputPhone";
import CurrencyInput from "../inputs/CurrencyInput"; // Importamos CurrencyInput

const containerStyle = {
  padding: "2rem",
  maxWidth: "800px",
  margin: "2rem auto",
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem",
};

const sectionStyle = {
  border: "1px solid #eee",
  padding: "1.5rem",
  borderRadius: "8px",
  backgroundColor: "white",
};

const preStyle = {
  backgroundColor: "#eef",
  padding: "1rem",
  borderRadius: "8px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  marginTop: "1rem",
};

const InputTester = () => {
  const [cedula, setCedula] = useState("");
  const [money, setMoney] = useState(0);
  const [phone, setPhone] = useState({ raw: "", formatted: "", isValid: false });
  const [currencyValue, setCurrencyValue] = useState(0); // Estado para CurrencyInput

  return (
    <div style={containerStyle}>
      <Link to="/">&larr; Volver a Inicio</Link>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Tester de Inputs</h1>
      <div style={formStyle}>
        {/* InputCedula */}
        <div style={sectionStyle}>
          <h2>Prueba de InputCedula</h2>
          <InputCedula value={cedula} onChange={(e) => setCedula(e.target.value)} />
          <pre style={preStyle}>
            <code>Valor: {JSON.stringify(cedula, null, 2)}</code>
          </pre>
        </div>

        {/* InputMoney */}
        <div style={sectionStyle}>
          <h2>Prueba de InputMoney</h2>
          <InputMoney label="Monto a ingresar" onValueChange={setMoney} />
          <pre style={preStyle}>
            <code>Valor numérico: {JSON.stringify(money, null, 2)}</code>
          </pre>
        </div>

        {/* InputPhone */}
        <div style={sectionStyle}>
          <h2>Prueba de InputPhone</h2>
          <InputPhone label="Teléfono de contacto" onPhoneChange={setPhone} />
          <pre style={preStyle}>
            <code>Objeto Phone: {JSON.stringify(phone, null, 2)}</code>
          </pre>
        </div>

        {/* CurrencyInput */}
        <div style={sectionStyle}>
          <h2>Prueba de CurrencyInput</h2>
          <CurrencyInput label="Monto con CurrencyInput" onValueChange={setCurrencyValue} />
          <pre style={preStyle}>
            <code>Valor numérico: {JSON.stringify(currencyValue, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InputTester;
