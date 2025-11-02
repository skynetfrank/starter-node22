import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      // Acceso seguro al token usando encadenamiento opcional (optional chaining)
      const token = getState().userSignin.userInfo?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Definición de 'tags' para la gestión automática de la caché.
  tagTypes: ["Users", "Vendedores"],
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => "/users",
      // Provee un tag general para la lista de usuarios.
      providesTags: (result) => (result ? [{ type: "Users", id: "LIST" }] : []),
    }),
    getVendedores: build.query({
      query: () => "/users/vendedores",
      // Provee un tag específico para la lista de vendedores.
      providesTags: (result) => (result ? [{ type: "Vendedores", id: "LIST" }] : []),
    }),
    getUser: build.query({
      // Corregido: la ruta correcta es /users/:id
      query: (id) => `/users/${id}`,
    }),
    registerUser: build.mutation({
      // Mejorado: Acepta un solo objeto como argumento para mayor mantenibilidad.
      query: (newUser) => ({
        url: "/users/register",
        method: "POST",
        body: newUser,
      }),
      // Invalida los tags correspondientes para que los queries se vuelvan a ejecutar.
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Vendedores", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUsersQuery, useGetUserQuery, useRegisterUserMutation, useGetVendedoresQuery } = usersApi;
