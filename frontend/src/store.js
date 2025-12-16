import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import userSigninReducer from "./slices/userSlice";
import splashReducer from "./slices/splashSlice";

/**
 * Configuración de la tienda de Redux.
 *
 * Ahora que todos los endpoints de la API se inyectan en `apiSlice`,
 * solo necesitamos incluir un único reducer y un único middleware para la API.
 */
const store = configureStore({
  reducer: {
    // Registra el reducer principal de la API.
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Otros reducers de la aplicación.
    userSignin: userSigninReducer,
    splash: splashReducer,
  },
  // Agrega el middleware de la API a la cadena de middleware por defecto.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
