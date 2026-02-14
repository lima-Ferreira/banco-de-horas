import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

function Lancamentos() {
  const { request, loading } = useApi(); // hook que dispara o loading global
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [data, setData] = useState(() => {
    const hoje = new Date();
    hoje.setHours(hoje.getHours() - hoje.getTimezoneOffset() / 60); // corrige o fuso
    return hoje.toISOString().split("T")[0];
  });
  const [horas, setHoras] = useState("");
  const [tipo, setTipo] = useState("Hora extra");
  const [operacao, setOperacao] = useState("Crédito");
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Carregar funcionários ao montar
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const data = await request("/funcionarios"); // GET /api/funcionarios
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
      parseInt(partes[0]), // ano
      parseInt(partes[1]) - 1, // mês (0-11)
      parseInt(partes[2]), // dia
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
      setData(new Date().toISOString().split("T")[0]);
      setHoras("");
      setTipo("Hora extra");
      setOperacao("Crédito");
      setObservacao("");
    } catch (err) {
      console.error("Erro:", err);
      setMensagem(err.message || "Erro ao salvar lançamento.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow">Carregando...</div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lançamento de Horas
      </h2>

      {mensagem && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-center">
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Funcionário</label>
          <select
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            className="w-full border p-2 rounded text-sm text-gray-700 capitalize"
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
          <label className="block font-medium mb-1">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border p-2 rounded"
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
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[120px]">
              <label className="block font-medium mb-1">Operação</label>
              <select
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option>Crédito</option>
                <option>Débito</option>
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block font-medium mb-1">Horas</label>
              <input
                type="time"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                step="60"
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Observação</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Salvar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
}

export default Lancamentos;
