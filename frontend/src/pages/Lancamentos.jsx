import { useEffect, useState } from "react";
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

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const data = await request("/funcionarios");
      setFuncionarios(data);
    } catch (err) {
      console.error("Erro ao carregar funcionários:", err);
      setMensagem(err.message || "Erro ao carregar funcionários");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    const partes = data.split("-");
    const dataAjustada = new Date(
      parseInt(partes[0]),
      parseInt(partes[1]) - 1,
      parseInt(partes[2]),
      12,
      0,
      0
    );

    const novoLancamento = {
      funcionarioId,
      data: dataAjustada,
      horas,
      tipo,
      operacao,
      observacao,
    };

    try {
      await request("/lancamentos", {
        method: "POST",
        body: JSON.stringify(novoLancamento),
      });

      setMensagem("✅ Lançamento salvo com sucesso!");
      setHoras("");
      setObservacao("");
    } catch (err) {
      console.error("Erro:", err);
      setMensagem(err.message || "❌ Erro ao salvar lançamento.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 pb-24 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Loader Moderno */}
        {loading && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl font-black text-blue-600 animate-bounce">
              Carregando...
            </div>
          </div>
        )}

        {/* Cabeçalho */}
        <div className="text-center space-y-1 py-4">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
            Lançamento de Horas
          </h2>
          <div className="h-1.5 w-12 bg-blue-600 rounded-full mx-auto"></div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 text-center font-black text-sm animate-pulse">
            {mensagem}
          </div>
        )}

        {/* Card do Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6"
        >
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
              Funcionário
            </label>
            <select
              value={funcionarioId}
              onChange={(e) => setFuncionarioId(e.target.value)}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              required
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.nome.toUpperCase()} - {f.loja.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
                Data do Registro
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
                Tipo de Evento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
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
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 ml-2">
                  Operação
                </label>
                <select
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  className="w-full bg-blue-50 border-none p-4 rounded-2xl text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option>Crédito</option>
                  <option>Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 ml-2">
                  Qtd Horas
                </label>
                <input
                  type="time"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  className="w-full bg-blue-50 border-none p-4 rounded-2xl text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
              Observações / Detalhes
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Ex: Reforço de inventário..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-blue-100 hover:bg-blue-800 active:scale-[0.97] transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Lancamentos;
