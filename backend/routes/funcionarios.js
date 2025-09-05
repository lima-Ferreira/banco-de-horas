const express = require("express");
const router = express.Router();
const Funcionario = require("../models/Funcionario");

router.get("/", async (req, res) => {
  const funcionarios = await Funcionario.find();
  res.json(funcionarios);
});

router.post("/", async (req, res) => {
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
module.exports = router; // ✅ Aqui
