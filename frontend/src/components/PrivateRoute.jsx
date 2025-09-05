import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { usuario } = useContext(AuthContext);

  if (usuario === null) {
    // Pode trocar por um spinner ou skeleton se quiser
    return <div className="text-center mt-10 text-gray-500">Carregando...</div>;
  }

  return usuario ? children : <Navigate to="/" />;
}

export default PrivateRoute;
