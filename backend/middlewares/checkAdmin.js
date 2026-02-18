const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  try {
    // 1. Pega o texto bruto do header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Acesso negado. Faça login." });
    }

    // 2. Extrai o token ignorando se tem "Bearer" ou não, e limpa espaços
    const token = authHeader.replace(/Bearer\s+/i, "").trim();

    // 3. Valida com o segredo
    const verificado = jwt.verify(token, "LIMA2025");

    if (verificado.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso restrito ao Administrador." });
    }

    req.usuario = verificado;
    next();
  } catch (err) {
    console.error("ERRO NO JWT:", err.message);
    return res
      .status(401)
      .json({ message: "Sessão expirada. Saia e entre de novo." });
  }
};

module.exports = checkAdmin;
