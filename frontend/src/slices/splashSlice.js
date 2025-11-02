import { createSlice } from "@reduxjs/toolkit";

const splashSlice = createSlice({
  name: "splash",
  initialState: {
    // Leemos de sessionStorage. Si 'splashShown' es 'true', isVisible es false.
    // De lo contrario, es visible.
    isVisible: sessionStorage.getItem("splashShown") !== "true",
  },
  reducers: {
    hideSplash: (state) => {
      state.isVisible = false;
      // Guardamos en sessionStorage que la splash ya se mostró en esta sesión.
      sessionStorage.setItem("splashShown", "true");
    },
  },
});

export const { hideSplash } = splashSlice.actions;
export default splashSlice.reducer;
