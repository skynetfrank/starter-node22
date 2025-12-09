import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import splashReducer from "./slices/splashSlice";
import { usersApi } from "./api/usersApi";
import { clientesApi } from "./api/clientesApi"; // 1. Importar la nueva API de clientes
import { apiSlice } from "./slices/apiSlice"; // Importar el apiSlice principal
import userSigninReducer from "./slices/userSlice"; // 1. Importar el reducer del usuario

// Automatically adds the thunk middleware and the Redux DevTools extension
const store = configureStore({
  // Automatically calls `combineReducers`
  reducer: {
    // 2. Añadir los reducers al store
    userSignin: userSigninReducer,
    splash: splashReducer,
    [usersApi.reducerPath]: usersApi.reducer, // API de usuarios
    [clientesApi.reducerPath]: clientesApi.reducer, // 2. Añadir el reducer de la API de clientes
    [apiSlice.reducerPath]: apiSlice.reducer, // Añadir el reducer del apiSlice principal
  },
  // El middleware de RTK Query se añade automáticamente al configurar el store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware, clientesApi.middleware, apiSlice.middleware), // 3. Añadir el middleware del apiSlice principal
});
setupListeners(store.dispatch);
export default store;
