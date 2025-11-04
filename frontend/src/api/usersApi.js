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
      query: ({ page = 1, limit = 10, search = "" }) => `/users?page=${page}&limit=${limit}&search=${search}`,
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
      // Provee un tag específico para este usuario.
      // Esto es crucial para la invalidación de caché.
      providesTags: (result, error, id) => [{ type: "Users", id }],
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
    signinUser: build.mutation({
      query: (credentials) => ({
        url: "/users/signin",
        method: "POST",
        body: credentials,
      }),
      // Opcional: invalidar tags si el login debe refrescar datos específicos.
      // Por ahora, no es estrictamente necesario para el login.
    }),
    updateUserProfile: build.mutation({
      query: (updates) => ({
        url: "/users/profile",
        method: "PUT",
        body: updates,
      }),
      // Invalida el tag del usuario específico para forzar un refetch de `getUser`.
      invalidatesTags: (result, error, { userId }) => [{ type: "Users", id: userId }],
    }),
    updateUser: build.mutation({
      query: ({ id, ...updates }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: updates,
      }),
      // Invalida la lista y el usuario específico para refrescar los datos.
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id: "LIST" },
        { type: "Users", id },
      ],
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      // Invalida la lista para que el usuario desactivado se refleje en la UI.
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetUsersQuery,
  useGetUserQuery,
  useRegisterUserMutation,
  useGetVendedoresQuery,
  useSigninUserMutation, // Exportamos el nuevo hook
  useUpdateUserProfileMutation, // Exportamos la nueva mutación
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
