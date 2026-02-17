const express = require("express");
const router = express.Router();
const Funcionario = require("../models/Funcionario");
const checkAdmin = require("../middlewares/checkAdmin"); // 1. Importa o segurança

// Rota para buscar: QUALQUER UM logado pode ver
router.get("/", async (req, res) => {
  try {
    const funcionarios = await Funcionario.find();
    res.json(funcionarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

// Rota para cadastrar: SÓ O ADMIN pode criar
router.post("/", checkAdmin, async (req, res) => {
  // 2. Adiciona o cadeado aqui
  try {
    const { nome, cargo, setor, loja } = req.body;
    const novoFuncionario = new Funcionario({ nome, cargo, setor, loja });
    await novoFuncionario.save();
    res.status(201).json(novoFuncionario);
  } catch (err) {
    console.error("Erro ao salvar funcionário:", err);
    res.status(500).json({ error: "Erro ao salvar funcionário" });
  }
});

module.exports = router;
