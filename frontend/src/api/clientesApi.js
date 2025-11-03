import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define un servicio usando una URL base y endpoints esperados
export const clientesApi = createApi({
    reducerPath: "clientesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        prepareHeaders: (headers, { getState }) => {
            // Acceso seguro al token desde el estado de Redux
            const token = getState().userSignin.userInfo?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    // Definición de 'tags' para la invalidación y refetching automático de caché.
    tagTypes: ["Clientes"],
    endpoints: (build) => ({
        // Endpoint para obtener la lista de clientes con paginación y búsqueda
        getClientes: build.query({
            query: ({ page = 1, limit = 10, search = "" }) =>
                `clientes?page=${page}&limit=${limit}&search=${search}`,
            // Provee un tag general para la lista de clientes.
            // Cualquier mutación que invalide 'LIST' hará que este query se vuelva a ejecutar.
            providesTags: (result) => (result ? [{ type: "Clientes", id: "LIST" }] : []),
        }),

        // Endpoint para obtener un cliente específico por su ID
        getCliente: build.query({
            query: (id) => `clientes/${id}`,
            // Provee un tag específico para este cliente.
            // Si una mutación invalida este ID, solo este query se refrescará.
            providesTags: (result, error, id) => [{ type: "Clientes", id }],
        }),

        // Endpoint para crear un nuevo cliente
        addCliente: build.mutation({
            query: (newCliente) => ({
                url: "clientes/register",
                method: "POST",
                body: newCliente,
            }),
            // Invalida el tag de la lista para que se actualice con el nuevo cliente.
            invalidatesTags: [{ type: "Clientes", id: "LIST" }],
        }),

        // Endpoint para actualizar un cliente existente
        updateCliente: build.mutation({
            query: ({ id, ...updates }) => ({
                url: `clientes/${id}`,
                method: "PUT",
                body: updates,
            }),
            // Invalida tanto la lista como el cliente específico.
            invalidatesTags: (result, error, { id }) => [
                { type: "Clientes", id: "LIST" },
                { type: "Clientes", id },
            ],
        }),

        // Endpoint para eliminar (desactivar) un cliente
        deleteCliente: build.mutation({
            query: (id) => ({
                url: `clientes/${id}`,
                method: "DELETE",
            }),
            // Invalida la lista para que el cliente desactivado ya no aparezca (si el backend lo filtra).
            invalidatesTags: [{ type: "Clientes", id: "LIST" }],
        }),
    }),
});

// Exporta los hooks generados automáticamente para su uso en componentes funcionales.
export const {
    useGetClientesQuery,
    useGetClienteQuery,
    useAddClienteMutation,
    useUpdateClienteMutation,
    useDeleteClienteMutation,
} = clientesApi;