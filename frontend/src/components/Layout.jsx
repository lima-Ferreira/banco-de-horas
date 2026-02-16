import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // 2. Inicialize o navigate

  // 3. Função para deslogar
  const handleSair = () => {
    localStorage.removeItem("token"); // Remove o acesso
    navigate("/"); // Manda para o login
  };

  const fecharMenu = () => setMenuAberto(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
      : "hover:bg-slate-700 text-slate-300";

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* 1. SIDEBAR (MENU LATERAL) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${menuAberto ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="text-white font-black text-xl mb-10 flex justify-between items-center tracking-tighter">
            BANCO DE HORAS
            <button
              onClick={fecharMenu}
              className="md:hidden text-white p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/funcionarios", label: "Funcionários" },
              { to: "/lancamentos", label: "Lançamentos" },
              { to: "/historico", label: "Histórico" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={fecharMenu}
                className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${isActive(link.to)}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* 2. OVERLAY */}
      {menuAberto && (
        <div
          onClick={fecharMenu}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-30 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAberto(true)}
              className="md:hidden p-2 text-slate-600 bg-slate-50 rounded-lg active:scale-90 transition-all"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <span className="font-black text-slate-800 md:text-lg uppercase tracking-tight">
              {location.pathname.replace("/", "") || "Início"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-bold text-slate-500 text-sm">
              Olá, Lima
            </span>
            <button
              onClick={handleSair} // 4. Adicione o clique aqui
              className="bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-rose-600 transition-all active:scale-95"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden h-full">
          <div className="max-w-5xl mx-auto p-4 md:p-6 pb-44">
            {/* Esse pb-44 (176px de espaço vazio) garante que o botão 
        suba acima das barras do navegador do celular */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
