import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import splashReducer from "./slices/splashSlice";
import { usersApi } from "./api/usersApi";
import userSigninReducer from "./slices/userSlice"; // 1. Importar el reducer del usuario

// Automatically adds the thunk middleware and the Redux DevTools extension
const store = configureStore({
  // Automatically calls `combineReducers`
  reducer: {
    // 2. Añadir los reducers al store
    userSignin: userSigninReducer,
    splash: splashReducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  // El middleware de RTK Query se añade automáticamente al configurar el store
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(usersApi.middleware),
});
setupListeners(store.dispatch);
export default store;
