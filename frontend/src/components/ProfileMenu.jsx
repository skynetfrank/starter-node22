import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { User, LogOut, PersonStandingIcon } from "lucide-react";

const getInitials = (name = "", lastName = "") => {
  if (!name) return "";
  const firstInitial = name.charAt(0);
  const lastInitial = lastName ? lastName.charAt(0) : name.charAt(1) || "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

function ProfileMenu({ userInfo, onSignout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleSignout = () => {
    setIsOpen(false);
    onSignout();
  };

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button className="profile-avatar-button" onClick={() => setIsOpen(!isOpen)} aria-label="Menú de perfil">
        {userInfo.avatar ? (
          <img src={userInfo.avatar} alt="Avatar" className="profile-avatar" />
        ) : (
          <div className="profile-initials">{getInitials(userInfo.nombre, userInfo.apellido)}</div>
        )}
      </button>
      <div className={`profile-menu ${isOpen ? "open" : ""}`}>
        <Link to="/profile" onClick={() => setIsOpen(false)}>
          <User size={16} /> Perfil
        </Link>
        <Link to="#signout" onClick={handleSignout}>
          <LogOut size={16} /> Cerrar Sesión
        </Link>
        <Link to="/clientes" onClick={() => setIsOpen(false)}>
          <PersonStandingIcon size={16} /> Clientes
        </Link>
      </div>
    </div>
  );
}

export default ProfileMenu;
