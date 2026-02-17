const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("--- DEBUG CHECKADMIN ---");
  console.log("Header recebido:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "Acesso negado. Faça login." });
  }

  // Pega o token limpando o 'Bearer '
  const token = authHeader.replace("Bearer ", "").trim();
  console.log("Token extraído:", token.substring(0, 10) + "...");

  try {
    const segredo = "Lima1128071993"; // Garanta que é o mesmo do auth.js
    const verificado = jwt.verify(token, segredo);

    console.log("Role no token:", verificado.role);

    if (verificado.role !== "admin") {
      console.log("Bloqueado: Usuário não é admin");
      return res
        .status(403)
        .json({ message: "Acesso restrito ao Administrador." });
    }

    req.usuario = verificado;
    next();
  } catch (err) {
    console.error("ERRO NA VERIFICAÇÃO:", err.message);
    return res
      .status(401)
      .json({ message: "Sessão inválida. Saia e entre novamente." });
  }
};

module.exports = checkAdmin;
