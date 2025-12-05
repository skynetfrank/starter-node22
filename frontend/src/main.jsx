import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import ProtectedRoute from "./components/ProtectedRoute";
import SigninScreen from "./screens/SigninScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import UnderConstruction from "./components/UnderConstruction";
import ClientesScreen from "./screens/ClientesScreen";
import ClienteEditScreen from "./screens/ClienteEditScreen"; // O importa ClienteForm directamente
import UsersListScreen from "./screens/UsersListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import CombinedDashboardWidget from "./components/CombinedDashboardWidget";
import InputTester from "./components/InputTester";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} element={<HomeScreen />}></Route>
      <Route path="/input-tester" element={<InputTester />}></Route>
      <Route path="/signin" element={<SigninScreen />}></Route>
      <Route path="/register" element={<RegisterScreen />}></Route>
      <Route path="" element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfileScreen />}></Route>
        <Route path="/clientes" element={<ClientesScreen />} />
        <Route path="/clientes/nuevo" element={<ClienteEditScreen />} /> {/* Ruta para crear */}
        <Route path="/clientes/:id/edit" element={<ClienteEditScreen />} /> {/* Ruta para editar */}
        <Route path="/users" element={<UsersListScreen />} /> {/* Ruta para listar */}
        <Route path="/users/nuevo" element={<UserEditScreen />} /> {/* Ruta para crear */}
        <Route path="/users/:id/edit" element={<UserEditScreen />} /> {/* Ruta para editar */}
        <Route path="/dashboard" element={<CombinedDashboardWidget />}></Route>
      </Route>
      <Route path="/enconstruccion" element={<UnderConstruction />}></Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
