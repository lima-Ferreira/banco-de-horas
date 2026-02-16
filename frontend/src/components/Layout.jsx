import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSair = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fecharMenu = () => setMenuAberto(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
      : "hover:bg-slate-700 text-slate-300";

  return (
    /* h-screen e overflow-hidden no pai travam a página para não rolar tudo */
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* 1. SIDEBAR */}
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

      {/* 3. COLUNA DA DIREITA (Header + Conteúdo) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER FIXO: Ele não tem scroll */}
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-30 h-16 shrink-0">
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
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <span className="font-black text-slate-800 md:text-lg uppercase tracking-tight truncate">
              {location.pathname.replace("/", "") || "Início"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-bold text-slate-500 text-sm">
              Olá, Lima
            </span>
            <button
              onClick={handleSair}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-rose-600 transition-all active:scale-95"
            >
              Sair
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO COM SCROLL INDEPENDENTE */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
          <div className="max-w-5xl mx-auto p-4 md:p-6 pb-32">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
