// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const funcionariosRoutes = require("./routes/funcionarios");
const lancamentosRoutes = require("./routes/lancamentos");
const authRoutes = require("./routes/auth");

const app = express();

// Lista de origens permitidas

const allowedOrigins = [
  "https://banco-de-horas-frontend.onrender.com", // Exemplo: seu site no ar
  "http://localhost:5173", // Seu acesso local
  "http://127.0.0.1:5173", // Alternativa para local
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Se não houver origin (ex: ferramentas de teste) ou se estiver na lista
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Bloqueado pelo CORS:", origin); // Log para você saber quem foi barrado
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware para JSON
app.use(express.json());

// Rotas
app.use("/api/lancamentos", lancamentosRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/auth", authRoutes);

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// Porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
