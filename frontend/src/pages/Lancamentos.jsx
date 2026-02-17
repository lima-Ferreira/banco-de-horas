import { useEffect, useState, useCallback, useRef } from "react";
import { useApi } from "../hooks/useApi";

function Lancamentos() {
  const { request, loading } = useApi();
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [data, setData] = useState(() => {
    const hoje = new Date();
    hoje.setHours(hoje.getHours() - hoje.getTimezoneOffset() / 60);
    return hoje.toISOString().split("T")[0];
  });
  const [horas, setHoras] = useState("");
  const [tipo, setTipo] = useState("Hora extra");
  const [operacao, setOperacao] = useState("Crédito");
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregandoRef = useRef(false);

  // --- LÓGICA DE ADMIN ---
  const dadosUsuario = JSON.parse(localStorage.getItem("usuario"));
  const isAdmin = dadosUsuario?.role === "admin";
  // -----------------------

  const carregarFuncionarios = useCallback(async () => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    try {
      const resposta = await request("/api/funcionarios");
      setFuncionarios(resposta || []);
    } catch (err) {
      console.error("Erro ao carregar funcionários:", err);
    } finally {
      carregandoRef.current = false;
    }
  }, [request]);

  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !isAdmin) return; // Segurança extra: bloqueia o clique se não for admin
    setMensagem("");

    const partes = data.split("-");
    const dataAjustada = new Date(
      parseInt(partes[0]),
      parseInt(partes[1]) - 1,
      parseInt(partes[2]),
      12,
      0,
      0,
    );

    const novoLancamento = {
      funcionarioId,
      data: dataAjustada,
      horas: tipo === "Hora extra" ? horas : "00:00",
      tipo,
      operacao,
      observacao,
    };

    try {
      await request("/api/lancamentos", {
        method: "POST",
        body: JSON.stringify(novoLancamento),
      });

      setMensagem("Lançamento salvo com sucesso!");
      setHoras("");
      setObservacao("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMensagem(err.message || "Erro ao salvar lançamento.");
    }
  };

  // SE NÃO FOR ADMIN, MOSTRA MENSAGEM DE ACESSO RESTRITO
  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm my-10 border border-gray-100 text-center">
        <div className="text-amber-500 mb-4 flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase mb-2">
          Acesso Restrito
        </h2>
        <p className="text-slate-500 text-sm">
          Apenas o administrador pode realizar novos lançamentos no sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 md:p-6 rounded-2xl shadow-sm my-4 border border-gray-100">
      {/* ... todo o resto do seu return do formulário ... */}
      {/* (O código do seu form continua aqui exatamente como estava) */}

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-[60]">
          <div className="bg-white p-4 rounded-xl shadow-xl font-bold">
            Processando...
          </div>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 text-center uppercase tracking-tight">
        Novo Lançamento
      </h2>

      {mensagem && (
        <div
          className={`mb-6 p-4 rounded-xl text-center font-bold text-sm ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
        >
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pb-10">
        {/* CAMPOS DO FORMULÁRIO */}
        {/* ... (mantive igual para poupar espaço) ... */}

        <div className="pt-6 pb-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? "Salvando..." : "Finalizar Lançamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Lancamentos;
