import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { userSignout } from "./slices/userSlice"; // 1. Importar la nueva acción desde el slice
import SplashScreen from "./components/SplashScreen";
import ProfileMenu from "./components/ProfileMenu";
import logo from "./assets/logo.jpg";
import { Sun, Moon, User, CalendarPlus } from "lucide-react";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const userSignin = useSelector((state) => state.userSignin);
  const isSplashVisible = useSelector((state) => state.splash.isVisible);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const signoutHandler = () => {
    dispatch(userSignout()); // 2. Despachar la acción correcta
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <>
      <div className="grid-container">
        <header className="app-header">
          <Link to="/" className="header-logo-link">
            <img src={logo} alt="Logo de la empresa" className="header-logo" />
            <span className="header-title">Starter-App</span>
          </Link>
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-button"
              aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
            >
              {/* Sol */}
              <Sun className="theme-icon sun-icon" />
              {/* Luna */}
              <Moon className="theme-icon moon-icon" />
            </button>

            <Link to="/citas" className="header-icon-link" aria-label="Agendar Cita">
              <CalendarPlus />
            </Link>

            {userInfo ? (
              <ProfileMenu userInfo={userInfo} onSignout={signoutHandler} />
            ) : (
              <Link to="/signin" className="header-icon-link" aria-label="Iniciar sesión">
                <User />
              </Link>
            )}
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>Todos los derechos reservados &copy; {new Date().getFullYear()}</footer>
      </div>
    </>
  );
}

export default App;
