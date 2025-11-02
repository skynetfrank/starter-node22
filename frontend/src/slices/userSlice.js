import { createSlice } from "@reduxjs/toolkit";

// Cargar el estado inicial desde localStorage para persistir la sesión
const userInfoFromStorage = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;

const initialState = {
  userInfo: userInfoFromStorage,
};

const userSlice = createSlice({
  name: "userSignin", // El nombre del slice, coincidirá con la clave en el estado de Redux
  initialState,
  reducers: {
    // Reducer para manejar el inicio de sesión
    userSignin: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    // Reducer para manejar el cierre de sesión
    userSignout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

// Exportar las acciones generadas automáticamente
export const { userSignin, userSignout } = userSlice.actions;

// Exportar el reducer para añadirlo al store
export default userSlice.reducer;
