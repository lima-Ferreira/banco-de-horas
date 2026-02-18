import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

function Login() {
  const { login } = useContext(AuthContext);
  const { request, loading } = useApi();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para o olhinho
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    // Exemplo de como deve ficar dentro do seu Login.jsx
    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ nome, senha }),
      });

      // O SEGREDO ESTÁ AQUI: Salvar no navegador com o nome "token"
      if (data.token) {
        localStorage.setItem("token", data.token); // Salva o crachá
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); // Salva os dados do Lima (incluindo a role admin)

        navigate("/dashboard"); // Redireciona para o sistema
      }
    } catch (err) {
      setMensagem("Erro ao entrar: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow">Carregando...</div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        /* Ajustado padding para mobile (px-6) e desktop (px-8) */
        className="bg-white shadow-md rounded px-6 md:px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {mensagem && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4 text-center border border-red-200">
            {mensagem}
          </p>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            /* Aumentado padding (p-3) para facilitar toque no celular */
            className="w-full border p-3 md:p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
        </div>

        {/* Container relativo para posicionar o botão do olho */}
        <div className="mb-6 relative">
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border p-3 md:p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl opacity-60 hover:opacity-100 transition-opacity"
            title={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
          >
            {mostrarSenha ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 md:py-2 rounded font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-blue-400 shadow-sm"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="mt-6 text-center text-sm space-y-2">
          <p>
            Não tem conta?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Cadastre-se
            </a>
          </p>
          <p>
            <a
              href="/recuperar"
              className="text-blue-600 font-medium hover:underline"
            >
              Esqueceu a senha?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
