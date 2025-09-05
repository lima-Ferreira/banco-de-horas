const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const funcionariosRoutes = require("./routes/funcionarios");
const lancamentosRoutes = require("./routes/lancamentos");
const authRoutes = require("./routes/auth");

const app = express();

const corsOptions = {
  origin: "http://localhost:5174",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/lancamentos", lancamentosRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Erro MongoDB:", err));

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000", "http://localhost:5000");
});
