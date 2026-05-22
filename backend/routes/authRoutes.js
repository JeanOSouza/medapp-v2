const express = require("express");
const router = express.Router();

const AuthController = require("../controller/AuthController");

// Lembre-se de corrigir o "registrar" (com o 's' que faltava)
router.post("/registrar", AuthController.registrar);
router.post("/login", AuthController.login);

module.exports = router;
