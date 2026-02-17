const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  // 1. Pega o token do header (formato: "Bearer TOKEN")
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Faça login." });
  }

  try {
    // 2. Valida o token com o SEU segredo (deve ser o mesmo do auth.js)
    const verificado = jwt.verify(token, "Lima1128071993#");

    // 3. O PULO DO GATO: Se no token não disser que é admin, barra aqui!
    if (verificado.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso restrito apenas ao Administrador." });
    }

    req.usuario = verificado;
    next(); // Se chegou aqui, é o Lima! Pode seguir.
  } catch (err) {
    res.status(400).json({ message: "Sessão inválida ou expirada." });
  }
};

module.exports = checkAdmin;
