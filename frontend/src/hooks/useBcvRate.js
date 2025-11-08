import { useState, useEffect } from "react";

/**
 * Hook personalizado para obtener la tasa de cambio del BCV (Banco Central de Venezuela)
 * desde la API de DolarVzla.
 *
 * @returns {{
 *   rate: number | null;
 *   loading: boolean;
 *   error: string | null;
 * }} - Un objeto que contiene:
 *    - `rate`: La tasa de cambio del dólar (USD) como un número redondeado a 2 decimales. `null` si no se ha cargado.
 *    - `loading`: Un booleano que indica si la solicitud está en curso.
 *    - `error`: Un mensaje de error si la API falla.
 */
const useBcvRate = () => {
    const [rate, setRate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const PRIMARY_API_URL = "https://api.dolarvzla.com/public/exchange-rate";

    useEffect(() => {
        const fetchRate = async () => {
            // Reseteamos el estado en cada ejecución por si se usa con dependencias en el futuro.
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(PRIMARY_API_URL);
                if (!response.ok) {
                    throw new Error(`La solicitud a la API falló con estado: ${response.status}`);
                }
                const data = await response.json();

                // Accedemos al valor del dólar desde la nueva estructura de la respuesta.
                if (data?.current?.usd) {
                    setRate(parseFloat(data.current.usd.toFixed(2)));
                } else {
                    throw new Error("No se encontró la tasa del dólar en la respuesta de la API.");
                }
            } catch (err) {
                console.error("No se pudo obtener la tasa de cambio del BCV:", err);
                setError("No se pudo obtener la tasa de cambio en este momento.");
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
    }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente.

    return { rate, loading, error };
};

export default useBcvRate;