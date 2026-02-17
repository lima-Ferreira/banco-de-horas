// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const funcionariosRoutes = require("./routes/funcionarios");
const lancamentosRoutes = require("./routes/lancamentos");
const authRoutes = require("./routes/auth");
const path = require("path");

// 1. Serve os arquivos estáticos da pasta build/dist do React
// ou 'build'
app.use(
  express.static(path.join(__dirname, "../banco-de-horas-frontend/dist")),
);

const app = express();

// Lista de origens permitidas

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://lima-ferreira.github.io", // <-- ADICIONE ESTA LINHA AQUI
  "https://banco-de-horas-ps6j.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requisições sem 'origin' (como apps mobile ou Postman)
      // ou se a origem estiver na nossa lista de permissões
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

// Qualquer rota que não seja da API, manda o index.html
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../banco-de-horas-frontend/dist", "index.html"),
  );
});
// Porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
