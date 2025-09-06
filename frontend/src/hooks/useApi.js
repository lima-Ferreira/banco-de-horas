import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);

  // URL base da API, vem do .env
  const API_URL = import.meta.env.VITE_API_URL;

  const getToken = () => localStorage.getItem("token");

  const request = async (endpoint, options = {}) => {
    setLoading(true);

    try {
      const token = getToken();

      const defaultHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Garantir que endpoint comece com '/'
      const url = `${API_URL}${
        endpoint.startsWith("/") ? endpoint : "/" + endpoint
      }`.trim();
      const res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
      });

      if (!res.ok) {
        const erroMsg = await res.text();
        throw new Error(erroMsg || "Erro na requisição");
      }

      try {
        return await res.json();
      } catch {
        return null; // caso não retorne JSON
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading };
}
