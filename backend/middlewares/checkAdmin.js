const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Acesso negado. Faça login." });
    }

    // Pega o token limpando o "Bearer " e espaços
    const token = authHeader.replace("Bearer ", "").trim();

    // SEGREDO NOVO: LIMA2025 (Deve ser igual ao auth.js)
    const verificado = jwt.verify(token, "LIMA_ADMIN_2024");

    if (verificado.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso restrito ao Administrador." });
    }

    req.usuario = verificado;
    next();
  } catch (err) {
    console.error("Erro na verificação:", err.message);
    return res
      .status(401)
      .json({ message: "Sessão expirada. Saia e entre novamente." });
  }
};

module.exports = checkAdmin;
