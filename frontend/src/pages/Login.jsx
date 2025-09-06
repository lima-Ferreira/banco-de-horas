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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
      // Adicionado /api para combinar com o backend
      const data = await request("/api/auth/login", {
        method: "POST",
        credentials: "include", // essencial para CORS e cookies
        body: JSON.stringify({ nome, senha }),
      });

      login(data.usuario);
      navigate("/dashboard");
    } catch (err) {
      setMensagem(err.message || "Erro ao fazer login");
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
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {mensagem && <p className="text-red-600 text-sm mb-4">{mensagem}</p>}

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

        <p className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Cadastre-se
          </a>
        </p>

        <p className="text-center text-sm mt-2">
          <a href="/recuperar" className="text-blue-600 hover:underline">
            Esqueceu a senha?
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
