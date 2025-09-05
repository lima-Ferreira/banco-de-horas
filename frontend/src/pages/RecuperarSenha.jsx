import { useState } from "react";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMensagem(data.message);
    } catch {
      setMensagem("Erro ao tentar recuperar senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-sm"
      >
        <h2 className="text-lg font-bold mb-4 text-center">Recuperar Senha</h2>

        {mensagem && <p className="text-blue-600 mb-4 text-sm">{mensagem}</p>}

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Recuperar
        </button>
      </form>
    </div>
  );
}

export default RecuperarSenha;
