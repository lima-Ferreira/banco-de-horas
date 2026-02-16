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
    if (loading) return;
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
      window.scrollTo({ top: 0, behavior: "smooth" }); // Sobe a tela ao salvar
    } catch (err) {
      setMensagem(err.message || "Erro ao salvar lançamento.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 md:p-6 rounded-2xl shadow-sm my-4 border border-gray-100 mb-20">
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
        <div>
          <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
            Funcionário
          </label>
          <select
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Selecione...</option>
            {funcionarios.map((f) => (
              <option key={f._id} value={f._id}>
                {f.nome} - {f.loja}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50"
              required
            >
              <option>Hora extra</option>
              <option>Falta justificada</option>
              <option>Falta injustificada</option>
              <option>Folga</option>
              <option>Atestado</option>
              <option>Suspensão</option>
            </select>
          </div>
        </div>

        {tipo === "Hora extra" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
                Operação
              </label>
              <select
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50"
              >
                <option>Crédito</option>
                <option>Débito</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
                Horas
              </label>
              <input
                type="time"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest">
            Observação
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full border-gray-200 border p-4 rounded-xl text-sm bg-gray-50"
            rows={3}
            placeholder="Opcional..."
          />
        </div>

        <div className="pt-8 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? "Salvando..." : "Finalizar Lançamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Lancamentos;
