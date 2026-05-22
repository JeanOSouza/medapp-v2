const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const historicoController = require("../controller/Historico");
console.log("DENTRO DAS ROTAS:", historicoController);

router.get("/historico/:id_medicacao", auth, historicoController.list);
router.get("/historico/todos", auth, async (req, res) => {
  try {
    const historico = await historicoController.findAll({
      where: { id_usuario: req.userId }, // Se houver filtro por usuário
      order: [["data_tomada", "DESC"]], // Para mostrar os mais recentes primeiro
    });

    console.log(">>> Registros encontrados no banco:", historico.length);
    return res.json(historico);
  } catch (error) {
    console.error("❌ ERRO NA BUSCA DE HISTÓRICO:", error.message);
    return res.status(500).json({ error: error.message });
  }
});
router.post("/historico/:id_medicacao", historicoController.registroDose);

module.exports = router;
