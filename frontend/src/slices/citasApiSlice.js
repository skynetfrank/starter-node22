import { apiSlice } from "./apiSlice.js";

export const citasApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint para obtener el horario configurado
    getHorario: builder.query({
      query: () => "/api/horarios",
      providesTags: ["Horario"],
    }),

    // Endpoint para obtener las horas ocupadas en una fecha
    getDisponibilidad: builder.query({
      query: (fecha) => `/api/citas/disponibilidad?fecha=${fecha}`,
    }),

    // Endpoint para crear una cita
    createCita: builder.mutation({
      query: (data) => ({
        url: "/api/citas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cita"],
    }),

    // Endpoint para obtener las citas del usuario
    getMisCitas: builder.query({
      query: () => "/api/citas/mias",
      providesTags: ["Cita"],
    }),

    // Endpoint para cancelar una cita
    cancelarCita: builder.mutation({
      query: (citaId) => ({
        url: `/api/citas/${citaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cita"],
    }),

    // Endpoint para que el admin actualice el horario
    updateHorario: builder.mutation({
      query: (data) => ({
        url: "/api/horarios",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Horario"],
    }),
  }),
});

export const {
  useGetHorarioQuery,
  useGetDisponibilidadQuery,
  useCreateCitaMutation,
  useGetMisCitasQuery,
  useCancelarCitaMutation,
  useUpdateHorarioMutation,
} = citasApiSlice;
