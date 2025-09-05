import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Funcionarios from "./pages/Funcionarios";
import Lancamentos from "./pages/Lancamentos";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import RecuperarSenha from "./pages/RecuperarSenha";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

// 👇 importa o Provider e o Overlay do loading
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          {/* overlay fica sempre montado, mas só aparece quando isLoading = true */}
          <LoadingOverlay />

          <div className="flex">
            <Sidebar />
            <div className="flex-1">
              <Header />
              <div className="p-4">
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/recuperar" element={<RecuperarSenha />} />

                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/funcionarios"
                    element={
                      <PrivateRoute>
                        <Funcionarios />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/lancamentos"
                    element={
                      <PrivateRoute>
                        <Lancamentos />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/historico"
                    element={
                      <PrivateRoute>
                        <Historico />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </div>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
