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
  "http://localhost:5174",
  "http://localhost:4173",
  "https://lima-ferreira.github.io",
];

console.log("✅ Allowed Origins:", allowedOrigins); // <- aqui, fora de qualquer rota

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origem da requisição:", origin); // opcional, mostra cada requisição
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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
