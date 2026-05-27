const Historico = require("../models/Historico");
const Medicacao = require("../models/Medicacao");

module.exports = {
  async list(req, res) {
    try {
      const userId = req.userId;

      const doses = await Historico.findAll({
        where: {
          id_usuario: userId,
        },

        order: [["data_tomada", "DESC"]],
      });

      return res.json(doses);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  },

  async listAll(req, res) {
    try {
      const userId = req.userId;

      const doses = await Historico.findAll({
        where: {
          id_usuario: userId,
        },

        order: [["data_tomada", "DESC"]],
      });

      return res.json(doses);
    } catch (error) {
      console.error("Erro no listAll:", error.message);

      return res.status(500).json({
        error: error.message,
      });
    }
  },

  async registroDose(req, res) {
    try {
      const { id_medicacao } = req.params;

      const { data_tomada } = req.body;

      const remedio = await Medicacao.findOne({
        where: {
          id_medicacao: Number(id_medicacao),
        },
      });

      if (!remedio) {
        return res.status(404).json({
          error: "Medicamento não encontrado.",
        });
      }

      const dose = await Historico.create({
        id_medicacao: Number(id_medicacao),

        id_usuario: remedio.id_usuario,

        nome_medicacao: remedio.nome_medicacao,

        data_tomada: data_tomada || new Date(),
      });

      return res.status(201).json(dose);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  },
};
