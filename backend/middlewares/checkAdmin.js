const jwt = require("jsonwebtoken"); // Certifique-se que essa linha existe!

const checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("ERRO: Nenhum header de autorização encontrado");
      return res.status(401).json({ message: "Acesso negado. Faça login." });
    }

    // Pega o token removendo o "Bearer "
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token não encontrado." });
    }

    // O SEGREDO "segredo123" deve ser igual ao do seu auth.js
    const verificado = jwt.verify(token, "segredo123");

    // Verifica a role
    if (verificado.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso restrito ao Administrador." });
    }

    req.usuario = verificado;
    next(); // TUDO OK! Segue para a rota.
  } catch (err) {
    console.error("ERRO NO MIDDLEWARE ADMIN:", err.message);
    return res.status(401).json({ message: "Sessão inválida ou expirada." });
  }
};

module.exports = checkAdmin;
