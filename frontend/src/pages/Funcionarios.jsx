import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

function Funcionarios() {
  const { request, loading } = useApi();
  const [nome, setNome] = useState("");
  const [loja, setLoja] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  // --- NOVA LÓGICA DE SEGURANÇA ---
  const dadosUsuario = JSON.parse(localStorage.getItem("usuario"));
  const isAdmin = dadosUsuario?.role === "admin";
  // --------------------------------

  useEffect(() => {
    carregarFuncionarios();
    // Se não for admin, já deixa a lista aberta por padrão para ele ver algo
    if (!isAdmin) setMostrarLista(true);
  }, [isAdmin]);

  const carregarFuncionarios = async () => {
    try {
      const data = await request("/api/funcionarios");
      setFuncionarios(data);
    } catch (err) {
      console.error("Erro ao carregar funcionários:", err);
      setMensagem(err.message || "Erro ao carregar funcionários");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Proteção extra no clique

    setMensagem("");
    try {
      await request("/api/funcionarios", {
        method: "POST",
        body: JSON.stringify({ nome, loja, cargo, setor }),
      });

      setMensagem("Funcionário cadastrado com sucesso!");
      setNome("");
      setLoja("");
      setCargo("");
      setSetor("");
      carregarFuncionarios();
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

      {/* TÍTULO DINÂMICO */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isAdmin ? "Cadastro de Funcionário" : "Lista de Funcionários"}
      </h2>

      {mensagem && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-center rounded">
          {mensagem}
        </div>
      )}

      {/* SÓ MOSTRA O FORMULÁRIO SE FOR ADMIN */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6 mb-6">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition-all"
          >
            Cadastrar Funcionário
          </button>
        </form>
      )}

      {/* BOTÃO DE OCULTAR SÓ APARECE PARA ADMIN (Já que para user a lista é o foco) */}
      {isAdmin && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setMostrarLista(!mostrarLista)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {mostrarLista ? "Ocultar lista" : "Ver funcionários cadastrados"}
          </button>
        </div>
      )}

      {/* LISTA (Sempre visível para usuários comuns) */}
      {mostrarLista && (
        <div className={isAdmin ? "mt-4" : ""}>
          <h3 className="text-lg font-semibold mb-3 text-slate-700">
            Base de Funcionários ({funcionarios.length})
          </h3>
          <div className="max-h-96 overflow-y-auto border rounded p-2 bg-gray-50 shadow-inner">
            <ul className="space-y-2">
              {funcionarios.length === 0 ? (
                <li className="text-center text-gray-500 py-4">
                  Nenhum funcionário encontrado.
                </li>
              ) : (
                funcionarios.map((f) => (
                  <li
                    key={f._id}
                    className="border p-3 rounded bg-white shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{f.nome}</p>
                      <p className="text-xs text-gray-500">
                        {f.cargo || "Sem cargo"} | {f.setor || "Sem setor"} |{" "}
                        {f.loja}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Funcionarios;
