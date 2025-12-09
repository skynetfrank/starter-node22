import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define la URL base de tu API.
// Dado que tu servidor Express sirve tanto el frontend como la API,
// una ruta relativa vacía es suficiente, ya que las peticiones irán al mismo origen.
const baseQuery = fetchBaseQuery({ baseUrl: "" });

/**
 * Crea el "slice" de la API principal.
 * Los endpoints se inyectarán en este slice desde otros archivos
 * para mantener el código organizado.
 */
export const apiSlice = createApi({
  baseQuery,
  // Define los "tags" para el cacheo. Estos tags se usan para invalidar y refrescar datos automáticamente.
  tagTypes: ["Cita", "Horario", "Cliente", "User"],
  endpoints: (builder) => ({}), // Los endpoints se inyectan aquí.
});
