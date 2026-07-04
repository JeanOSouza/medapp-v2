const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const historicoController = require("../controller/Historico");
const HistoricoMed = require("../models/Historico");

console.log("DENTRO DAS ROTAS:", historicoController);

// Buscar histórico de um medicamento específico
router.get("/historico/porusuario", auth, historicoController.list);
router.get("/historico/pormedicacao", auth, historicoController.cadaMedicacao);

// Buscar TODOS os históricos do usuário (Ajustado para usar o controller)
router.get("/historico/todosusuarios", auth, historicoController.listAll);

// Registrar uma nova dose
router.post("/historico/:id_medicacao", auth, historicoController.registroDose);

module.exports = router;
