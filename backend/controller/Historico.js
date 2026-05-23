const Historico = require("../models/Historico");
const Medicacao = require("../models/Medicacao");

module.exports = {
  async list(req, res) {
    try {
      const historico = await Historico.findAll({
        order: [["data_tomada", "DESC"]],
      });

      return res.json(historico);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao buscar histórico",
      });
    }
  },

  async listAll(req, res) {
    try {
      const userId = req.userId;

      const doses = await Historico.findAll({
        include: [
          {
            model: Medicacao,
            where: { id_usuario: userId },
            required: true,
            attributes: ["nome_medicacao", "dosagem"],
          },
        ],
        order: [["data_tomada", "DESC"]],
      });

      return res.json(doses);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // ✅ AQUI FOI O AJUSTE PRINCIPAL
  async registroDose(req, res) {
    try {
      const { id_medicacao } = req.params;
      const { data_tomada } = req.body; // 👈 agora aceita hora do app

      const dose = await Historico.create({
        id_medicacao: Number(id_medicacao),
        data_tomada: data_tomada ? new Date(data_tomada) : new Date(),
      });

      return res.status(201).json(dose);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
};
