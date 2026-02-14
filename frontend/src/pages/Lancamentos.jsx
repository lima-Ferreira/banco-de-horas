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

      setMensagem("Lançamento salvo com sucesso!");
      setHoras("");
      setObservacao("");
    } catch (err) {
      console.error("Erro:", err);
      setMensagem(err.message || "Erro ao salvar lançamento.");
    }
  };

  return (
    /* 
      RESOLUÇÃO DO SCROLL E MENU: 
      - p-4 e pb-20 garante que o conteúdo não fique escondido sob menus inferiores ou laterais.
      - overflow-y-auto na div pai (ou no Layout principal) é essencial.
    */
    <div className="w-full min-h-screen bg-gray-50 p-4 pb-20 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Loader Moderno */}
        {loading && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]">
            <div className="bg-white p-6 rounded-2xl shadow-xl font-bold text-blue-600 animate-bounce">
              Carregando...
            </div>
          </div>
        )}

        {/* Cabeçalho Estilo App */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            Lançamento de Horas
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
            Registro de Jornada
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 text-center font-bold text-sm animate-fade-in">
            {mensagem}
          </div>
        )}

        {/* Card Principal */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5"
        >
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Funcionário
            </label>
            <select
              value={funcionarioId}
              onChange={(e) => setFuncionarioId(e.target.value)}
              className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              required
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.nome} - {f.loja}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Data do Evento
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Tipo de Registro
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
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
            <div className="flex gap-4 animate-slide-up">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Operação
                </label>
                <select
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  className="w-full bg-blue-50 border-none p-4 rounded-2xl text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Crédito</option>
                  <option>Débito</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Horas
                </label>
                <input
                  type="time"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  step="60"
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Observações
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Detalhes adicionais..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 hover:bg-blue-800 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Salvar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lancamentos;
