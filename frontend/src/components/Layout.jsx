import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  // Função para fechar o menu ao clicar em um link (no mobile)
  const fecharMenu = () => setMenuAberto(false);

  // Verificação de link ativo para dar destaque no menu
  const isActive = (path) => location.pathname === path ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-300";

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 1. SIDEBAR (MENU LATERAL) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${menuAberto ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="text-white font-black text-xl mb-10 flex justify-between items-center tracking-tighter">
            BANCO DE HORAS
            {/* Botão de fechar (apenas mobile) */}
            <button onClick={fecharMenu} className="md:hidden text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12""")/>></svg>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link to="/dashboard" onClick={fecharMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${isActive("/dashboard")}`}>
               Dashboard
            </Link>
            <Link to="/funcionarios" onClick={fecharMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${isActive("/funcionarios")}`}>
               Funcionários
            </Link>
            <Link to="/lancamentos" onClick={fecharMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${isActive("/lancamentos")}`}>
               Lançamentos
            </Link>
            <Link to="/historico" onClick={fecharMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${isActive("/historico")}`}>
               Histórico
            </Link>
          </nav>
        </div>
      </aside>

      {/* 2. OVERLAY (Escurece o fundo quando o menu abre no mobile) */}
      {menuAberto && (
        <div onClick={fecharMenu} className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" />
      )}

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        
        {/* HEADER SUPERIOR */}
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* BOTÃO HAMBÚRGUER (Aparece só no celular) */}
            <button onClick={() => setMenuAberto(true)} className="md:hidden p-2 text-slate-600 active:scale-90 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <span className="font-black text-slate-800 md:hidden">OLÁ, LIMA</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-bold text-slate-500">Olá, Lima</span>
            <button className="bg-rose-500 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all">
              Sair
            </button>
          </div>
        </header>

        {/* ÁREA DOS FORMULÁRIOS / DASHBOARD */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
