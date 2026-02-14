import { useState, useCallback } from "react"; // Adicione useCallback aqui

export function useApi() {
  const [loading, setLoading] = useState(false);
  const API_URL =
    import.meta.env.VITE_API_URL || "https://banco-de-horas-ps6j.onrender.com";

  // Use useCallback para que a função 'request' não mude a cada renderização
  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    // Movemos o log para aqui dentro!
    console.log("Chamando API:", `${API_URL}${endpoint}`);

    try {
      const token = localStorage.getItem("token");
      const defaultHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const url = `${API_URL}${
        endpoint.startsWith("/") ? endpoint : "/" + endpoint
      }`;
      const res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
      });

      if (!res.ok) {
        const erroMsg = await res.text();
        throw new Error(erroMsg || "Erro na requisição");
      }

      return await res.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias para a função ser estável

  return { request, loading };
}
