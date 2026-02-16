import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Funcionarios from "./pages/Funcionarios";
import Lancamentos from "./pages/Lancamentos";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";

// 1. IMPORTAR O NOVO LAYOUT (aquele que tem o menu hambúrguer)
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        {/* Adicionei o basename se você estiver usando GitHub Pages */}
        <BrowserRouter basename="/banco-de-horas">
          <LoadingOverlay />

          <Routes>
            {/* ROTAS SEM MENU (Login, etc) */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* ROTAS COM MENU (Envoltas pelo Layout) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/funcionarios"
              element={
                <PrivateRoute>
                  <Layout>
                    <Funcionarios />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/lancamentos"
              element={
                <PrivateRoute>
                  <Layout>
                    <Lancamentos />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <PrivateRoute>
                  <Layout>
                    <Historico />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
