const Medicacao = require("../models/Medicacao");
const HistoricoMed = require("../models/Historico");

module.exports = {
  async create(req, res) {
    try {
      const {
        nome_medicacao,
        dosagem,
        descricao,
        inicio_medicacao,
        frequencia,
        ultimadose,
        status,
        fim_medicacao,
      } = req.body;

      const id_usuario = req.userId;

      if (!id_usuario) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const medicacao = await Medicacao.create({
        nome_medicacao,
        dosagem,
        descricao,
        id_usuario,
        inicio_medicacao,
        frequencia,
        ultimadose,
        status,
        fim_medicacao,
      });

      console.log(">>> Medicamento cadastrado:", nome_medicacao);
      res.status(201).json(medicacao);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  async registroDose(req, res) {
    try {
      const { id_medicacao } = req.params;

      console.log(">>> EXECUTANDO REGISTRO DE DOSE NO BACKEND"); // Adicione esse log!

      const dose = await HistoricoMed.create({
        id_medicacao: Number(id_medicacao),
        data_tomada: new Date(),
      });

      return res.status(201).json(dose);
    } catch (error) {
      console.error("ERRO NO CREATE:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.userId;
      const medicacoes = await Medicacao.findAll({
        where: { id_usuario: userId, status: "ativo" },
      });
      res.json(medicacoes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome_medicacao, descricao, dosagem, frequencia } = req.body;

      await Medicacao.update(
        { nome_medicacao, dosagem, descricao, frequencia },
        { where: { id_medicacao: id, id_usuario: req.userId } }, // Segurança: só edita o próprio
      );

      const medicacaoAtualizada = await Medicacao.findByPk(id);
      res.json(medicacaoAtualizada);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deletado = await Medicacao.destroy({
        where: { id_medicacao: id, id_usuario: req.userId }, // Segurança: só deleta o próprio
      });

      if (deletado) {
        res.json({ message: "Medicamento apagado com sucesso" });
      } else {
        res.status(404).json({ message: "Medicamento não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async listByUser(req, res) {
    try {
      const userId = req.userId;
      console.log(">>> Buscando medicamentos para o usuário:", userId);

      const medicacoes = await Medicacao.findAll({
        where: { id_usuario: userId, status: "ativo" },
      });

      return res.json(medicacoes);
    } catch (error) {
      // 🚨 ISSO AQUI VAI SALVAR SEU DIA:
      console.error("ERRO DETALHADO NO SEQUELIZE:", error);
      return res.status(500).json({
        error: "Erro no banco de dados",
        message: error.message,
        sqlError: error.name,
      });
    }
  },

  async listInativos(req, res) {
    try {
      const userId = req.userId;

      const medicacoes = await Medicacao.findAll({
        where: {
          id_usuario: userId,
          status: "inativo",
        },
      });

      return res.json(medicacoes);
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  },
  async finalizarMedicacao(req, res) {
    try {
      const { id } = req.params;

      const dataFinalizacao = new Date();

      console.log("SALVANDO DATA:", dataFinalizacao);

      const atualizado = await Medicacao.update(
        {
          status: "inativo",
          fim_medicacao: dataFinalizacao,
        },
        {
          where: {
            id_medicacao: id,
            id_usuario: req.userId,
          },
        },
      );

      console.log("RESULTADO UPDATE:", atualizado);

      const medicacao = await Medicacao.findByPk(id);

      return res.json(medicacao);
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  },
  async reativarMedicacao(req, res) {
    try {
      const { id } = req.params;

      const atualizado = await Medicacao.update(
        {
          status: "ativo",
        },
        {
          where: {
            id_medicacao: id,
            id_usuario: req.userId,
          },
        },
      );

      console.log("RESULTADO UPDATE:", atualizado);

      const medicacao = await Medicacao.findByPk(id);

      return res.json(medicacao);
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  },
};
