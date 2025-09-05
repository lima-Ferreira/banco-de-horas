import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

function Funcionarios() {
  const { request, loading } = useApi(); // hook que dispara o , global
  const [nome, setNome] = useState("");
  const [loja, setLoja] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  // Carregar funcionários ao montar o componente
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

    try {
      const novoFuncionario = await request("/funcionarios", {
        method: "POST",
        body: JSON.stringify({ nome, loja, cargo, setor }),
      });

      setMensagem("Funcionário cadastrado com sucesso!");
      setNome("");
      setLoja("");
      setCargo("");
      setSetor("");
      carregarFuncionarios(); // atualiza a lista
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
      setMensagem(err.message || "Erro ao salvar funcionário");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow">Carregando...</div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-center">
        Cadastro de Funcionário
      </h2>

      {mensagem && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-center rounded">
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome do funcionário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={loja}
          onChange={(e) => setLoja(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Selecione a Loja</option>
          <option>Loja 01 - Matriz</option>
          <option>Loja 02 - FL PAL</option>
          <option>Loja 03 - FL JAG</option>
          <option>Loja 04 - FL DEP</option>
        </select>

        <input
          type="text"
          placeholder="Cargo"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Setor"
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Cadastrar
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setMostrarLista(!mostrarLista)}
          className="text-blue-600 hover:underline"
        >
          {mostrarLista
            ? "Ocultar lista de funcionários"
            : "Ver lista de funcionários"}
        </button>
      </div>

      {mostrarLista && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">
            Funcionários Cadastrados
          </h3>
          <div className="max-h-80 overflow-y-auto border rounded p-2 bg-gray-50 shadow-inner">
            <ul className="space-y-2">
              {funcionarios.map((f) => (
                <li key={f._id} className="border p-2 rounded bg-white ">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium ">{f.nome}</span> —{" "}
                    {f.cargo || "Sem cargo"} / {f.setor || "Sem setor"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Funcionarios;
