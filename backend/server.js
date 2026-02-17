// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Inicialização do app (Deve vir antes de qualquer app.use)
const app = express();

const funcionariosRoutes = require("./routes/funcionarios");
const lancamentosRoutes = require("./routes/lancamentos");
const authRoutes = require("./routes/auth");

// 1. CONFIGURAÇÕES DE MIDDLEWARE (CORS e JSON primeiro)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://lima-ferreira.github.io",
  "https://banco-de-horas-ps6j.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error("BLOQUEIO DE SEGURANÇA CORS:", origin);
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

// 2. ROTAS DA API (Sempre vêm antes do Front-end)
app.use("/api/lancamentos", lancamentosRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/auth", authRoutes);

// 3. CONFIGURAÇÃO DO FRONT-END (REACT)
// Isso serve os arquivos como CSS, JS e Imagens da pasta dist
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// O PULO DO GATO: Esta rota "pega-tudo" (*) deve ser a ÚLTIMA antes do listen.
// Ela garante que se você der F5 em /lancamentos, o React assuma o controle.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// 4. CONEXÃO COM MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// 5. INICIALIZAÇÃO
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
