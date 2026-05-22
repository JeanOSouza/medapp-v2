const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const medicacaoController = require("../controller/Medicacao");

router.post("/medicamentos", auth, medicacaoController.create);
router.get("/medicamentos", auth, medicacaoController.listByUser);

router.post(
  "/medicamentosHist/:id_medicacao",
  auth,
  (req, res, next) => {
    console.log(">>> A REQUISIÇÃO CHEGOU NA ROTA DE HISTÓRICO!");
    next();
  },
  medicacaoController.registroDose,
);
router.put("/medicamentosAtualizar/:id", auth, medicacaoController.update);
router.delete("/medicamentosApagar/:id", auth, medicacaoController.delete);

module.exports = router;
