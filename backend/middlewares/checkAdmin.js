const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Acesso negado. Faça login." });
    }

    // Lógica infalível para pegar o token:
    // Se vier "Bearer TOKEN", ele pega só o TOKEN. Se vier só o TOKEN, ele mantém.
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token não encontrado." });
    }

    // O "segredo123" deve ser RIGOROSAMENTE igual ao do seu auth.js
    const verificado = jwt.verify(token, "segredo123");

    if (verificado.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso restrito ao Administrador." });
    }

    req.usuario = verificado;
    next();
  } catch (err) {
    console.error("ERRO JWT:", err.message);
    return res
      .status(401)
      .json({ message: "Sessão expirada. Por favor, saia e entre novamente." });
  }
};

module.exports = checkAdmin;
