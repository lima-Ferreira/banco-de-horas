import React from "react";
import { useLoading } from "../context/LoadingContext";
import "./loading.css"; // vamos criar este arquivo já já

const LoadingOverlay = () => {
  const { isLoading, activeCount } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className="loading-overlay"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="spinner" />
      <p className="loading-text">
        Carregando{activeCount > 1 ? ` (${activeCount} tarefas...)` : "..."}
      </p>
    </div>
  );
};

export default LoadingOverlay;
