const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente)
      return res.status(400).json({ message: "Email já cadastrado" });

    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();
    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
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

    const token = jwt.sign({ id: usuario._id }, "segredo123", {
      expiresIn: "1d",
    });

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao fazer login" });
  }
});

module.exports = router;
