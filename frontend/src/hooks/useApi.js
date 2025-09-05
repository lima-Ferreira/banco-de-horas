import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL; // vem do .env

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const request = async (endpoint, options = {}) => {
    setLoading(true);

    try {
      const token = getToken();

      const defaultHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_URL}${endpoint}`, {
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
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  return { request, loading };
}
