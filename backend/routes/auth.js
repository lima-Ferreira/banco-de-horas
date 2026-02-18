const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { nome, email, senha, codigoAdmin } = req.body;
  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente)
      return res.status(400).json({ message: "Email já cadastrado" });

    const ehAdmin = codigoAdmin === "123";

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      role: ehAdmin ? "admin" : "user",
    });
    await novoUsuario.save();
    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { nome, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ nome });
    if (!usuario)
      return res.status(400).json({ message: "Usuário não encontrado" });

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(400).json({ message: "Senha inválida" });

    // SEGREDO NOVO: LIMA2025
    const token = jwt.sign(
      { id: usuario._id, role: usuario.role || "user" },
      "123",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role || "user",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao fazer login" });
  }
});

module.exports = router;
