import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-60 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Banco de Horas</h2>
      <nav className="flex flex-col gap-2">
        <Link to="/" className="hover:text-gray-300">
          Dashboard
        </Link>
        <Link to="/funcionarios" className="hover:text-gray-300">
          Funcionários
        </Link>
        <Link to="/lancamentos" className="hover:text-gray-300">
          Lançamentos
        </Link>
        <Link to="/historico" className="hover:text-gray-300">
          Histórico
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
