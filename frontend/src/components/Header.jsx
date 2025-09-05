import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // redireciona para login
  };

  return (
    <header className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">Banco de Horas</h1>
      {usuario && (
        <div className="flex items-center gap-4">
          <span>Olá, {usuario.nome}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
