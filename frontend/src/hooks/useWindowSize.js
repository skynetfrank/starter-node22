import { useState, useEffect } from "react";

/**
 * Función auxiliar para obtener el tamaño de la ventana de forma segura,
 * evitando errores en entornos donde `window` no está definido (SSR).
 */
const getSize = () => {
  return {
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  };
};

/**
 * Hook personalizado para obtener las dimensiones de la ventana del navegador.
 * @returns {{width: number, height: number}} Objeto con el ancho y alto de la ventana.
 */
export function useWindowSize() {
  const [size, setSize] = useState(getSize());

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
