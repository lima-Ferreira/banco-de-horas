import { useEffect, useState, useCallback } from "react";
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

  // Usando useCallback para evitar que a função seja recriada e cause loops no useEffect
  const carregarFuncionarios = useCallback(async () => {
    try {
      const resposta = await request("/funcionarios"); // Nome alterado para evitar conflito com o estado 'data'
      setFuncionarios(resposta);
    } catch (err) {
      console.error("Erro ao carregar funcionários:", err);
      setMensagem(err.message || "Erro ao carregar funcionários");
    }
  }, [request]);

  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
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
        data: dataAjustada.toISOString(), // Enviando como String ISO para o Backend
        horas: tipo === "Hora extra" ? horas : "00:00", // Garante valor se não for hora extra
        tipo,
        operacao,
        observacao,
      };

      await request("/lancamentos", {
        method: "POST",
        body: JSON.stringify(novoLancamento),
      });

      setMensagem("Lançamento salvo com sucesso!");

      // Resetando campos
      setFuncionarioId("");
      setHoras("");
      setObservacao("");
      // Mantém o tipo e operação padrão se desejar, ou reseta também.
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setMensagem(err.message || "Erro ao salvar lançamento.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 md:p-6 rounded shadow-md my-2">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow font-bold">
            Carregando...
          </div>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
        Lançamento de Horas
      </h2>

      {mensagem && (
        <div
          className={`mb-4 p-3 rounded text-center text-sm md:text-base ${
            mensagem.includes("sucesso")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-sm md:text-base">
            Funcionário
          </label>
          <select
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            className="w-full border p-3 md:p-2 rounded text-sm text-gray-700 capitalize focus:ring-2 focus:ring-blue-500 outline-none"
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

        <div>
          <label className="block font-medium mb-1 text-sm md:text-base">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border p-3 md:p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm md:text-base">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border p-3 md:p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

        {tipo === "Hora extra" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1 text-sm md:text-base">
                Operação
              </label>
              <select
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                className="w-full border p-3 md:p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Crédito</option>
                <option>Débito</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block font-medium mb-1 text-sm md:text-base">
                Horas
              </label>
              <input
                type="time"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full border p-3 md:p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required={tipo === "Hora extra"}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium mb-1 text-sm md:text-base">
            Observação
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full border p-3 md:p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold px-6 py-4 md:py-2 rounded hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Salvando..." : "Salvar Lançamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Lancamentos;
