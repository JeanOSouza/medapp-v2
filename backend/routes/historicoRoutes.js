const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const historicoController = require("../controller/Historico");

console.log("DENTRO DAS ROTAS:", historicoController);

// Buscar histórico de um medicamento específico
router.get("/historico/:id_medicacao", auth, historicoController.list);

// Buscar TODOS os históricos do usuário (Ajustado para usar o controller)
router.get("/historico/todos", auth, historicoController.listAll);

// Registrar uma nova dose
router.post("/historico/:id_medicacao", auth, historicoController.registroDose);

module.exports = router;
