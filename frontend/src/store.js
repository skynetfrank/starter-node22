import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import splashReducer from "./slices/splashSlice";
import { usersApi } from "./api/usersApi";
import { clientesApi } from "./api/clientesApi"; // 1. Importar la nueva API de clientes
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
  },
  // El middleware de RTK Query se añade automáticamente al configurar el store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware, clientesApi.middleware), // 3. Añadir el middleware de la API de clientes
});
setupListeners(store.dispatch);
export default store;
