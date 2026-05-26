const Historico = require("../models/Historico"); // Este modelo agora aponta para 'historico_meds'
const Medicacao = require("../models/Medicacao"); // Este modelo aponta para 'medicacaos'

module.exports = {
  // Lista o histórico de forma simples (ordem decrescente)
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

  // 🔄 LISTAR TODOS (Simplificado, pois o nome já está gravado diretamente no histórico)
  async listAll(req, res) {
    try {
      // Busca todos os registros de histórico salvos na nova tabela historico_meds
      const doses = await Historico.findAll({
        order: [["data_tomada", "DESC"]],
      });

      // Retorna os dados direto do banco sem precisar cruzar na memória via JS puro!
      return res.json(doses);
    } catch (error) {
      console.error("Erro no listAll:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  async registroDose(req, res) {
    try {
      const { id_medicacao } = req.params;
      const { data_tomada } = req.body;

      const remedio = await Medicacao.findOne({
        where: { id_medicacao: Number(id_medicacao) },
      });

      if (!remedio) {
        return res
          .status(404)
          .json({ error: "Medicamento não encontrado na tabela medicacaos." });
      }

      const dose = await Historico.create({
        id_medicacao: Number(id_medicacao),
        nome_medicacao: remedio.nome_medicacao,
        data_tomada: data_tomada ? new Date(data_tomada) : new Date(),
      });

      return res.status(201).json(dose);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
};
