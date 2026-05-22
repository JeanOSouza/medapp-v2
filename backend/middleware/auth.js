const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Sem token" });
  }

  // Pega só o token (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "segredo");

    console.log("Header", req.headers.authorization);
    console.log("UserID: ", decoded.id);
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = auth;
