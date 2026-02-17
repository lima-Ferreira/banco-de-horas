import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi"; // Importe o seu hook!

function SignUp() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigoAdmin, setCodigoAdmin] = useState(""); // Campo para a chave mestra
  const [mensagem, setMensagem] = useState("");
  const { request, loading } = useApi(); // Use o seu hook aqui
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
      // Usando o seu hook 'request', ele já sabe que deve ir para o Render!
      await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome,
          email,
          senha,
          codigoAdmin, // Enviando a chave para o backend conferir
        }),
      });

      setMensagem("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMensagem(err.message || "Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h2 className="text-xl font-black mb-6 text-center text-slate-800 uppercase">
          Criar Conta
        </h2>

        {mensagem && (
          <div
            className={`mb-4 p-2 text-sm text-center rounded ${mensagem.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {mensagem}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Campo opcional para código admin */}
          <div className="pt-2 border-t mt-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Chave de Administrador (Opcional)
            </label>
            <input
              type="password"
              placeholder="Código Secreto"
              value={codigoAdmin}
              onChange={(e) => setCodigoAdmin(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm bg-gray-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-6 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Finalizar Cadastro"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-bold hover:underline"
          >
            Entrar
          </button>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
