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

    // Define se é admin ou usuário comum
    // ESCOLHA SUA SENHA SECRETA AQUI:
    const ehAdmin = codigoAdmin === "Lima1128071993";

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      role: ehAdmin ? "admin" : "user",
    });
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

    // AJUSTE AQUI: Incluímos a 'role' dentro do Token
    const token = jwt.sign(
      {
        id: usuario._id,
        role: usuario.role || "user", // Se não achar no banco, assume 'user'
      },
      "Lima1128071993",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role, // AJUSTE AQUI: Enviamos para o Frontend também
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
});

module.exports = router;
