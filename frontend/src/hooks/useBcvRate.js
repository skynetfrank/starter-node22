import { useState, useEffect } from "react";
import Swal from "sweetalert2";

/**
 * Hook personalizado para obtener la tasa de cambio del BCV (Banco Central de Venezuela)
 * desde la API de DolarVzla.
 *
 * @returns {{
 *   rates: { usd: number | null, eur: number | null };
 *   loading: boolean;
 *   error: string | null;
 * }} - Un objeto que contiene:
 *    - `rates`: Un objeto con las tasas de cambio para USD y EUR, redondeadas a 2 decimales.
 *    - `loading`: Un booleano que indica si la solicitud está en curso.
 *    - `error`: Un mensaje de error si la API falla.
 */
const useBcvRate = () => {
  const [rates, setRates] = useState({ usd: null, eur: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PRIMARY_API_URL = "https://api.dolarvzla.com/public/exchange-rate";

  const promptForManualRate = async () => {
    const { value: manualRate } = await Swal.fire({
      title: "Error al obtener la tasa",
      text: "No se pudo obtener la tasa de cambio automáticamente. Por favor, ingrésala manualmente (USD).",
      input: "number",
      inputAttributes: {
        min: "0.01",
        step: "0.01",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return "Debes ingresar un valor numérico mayor a cero.";
        }
      },
    });

    if (manualRate) {
      setRates({ usd: parseFloat(manualRate), eur: null });
      setLoading(false);
      setError(null); // Limpiamos cualquier error previo
    } else {
      setError("Operación cancelada. No se pudo establecer una tasa de cambio.");
    }
    setLoading(false);
  };

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

        // Accedemos a los valores de USD y EUR desde la respuesta.
        if (data?.current?.usd && data?.current?.eur) {
          setRates({
            usd: parseFloat(data.current.usd.toFixed(2)),
            eur: parseFloat(data.current.eur.toFixed(2)),
          });
        } else {
          throw new Error("No se encontraron las tasas de cambio en la respuesta de la API.");
        }
      } catch (err) {
        console.error("No se pudo obtener las tasas de cambio:", err);
        // En caso de error, el prompt se encargará del estado de carga.
        // Para evitar que el finally se ejecute antes, lo esperamos.
        return await promptForManualRate();
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente.

  return { rates, loading, error };
};

export default useBcvRate;
