const Historico = require("../models/Historico");
const Medicacao = require("../models/Medicacao");

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

  // 🔄 BUSCA SEGURA: Cruza os dados manualmente para evitar erros de relacionamento no Sequelize
  async listAll(req, res) {
    try {
      // 1. Busca todos os registros de histórico salvos no banco
      const doses = await Historico.findAll({
        order: [["data_tomada", "DESC"]],
      });

      // 2. Busca todas as medicações cadastradas (tanto ativas quanto inativas)
      const todasMedicacoes = await Medicacao.findAll();

      // 3. Joga os dados na memória e faz o cruzamento via JavaScript puro
      const dadosFormatados = doses.map((dose) => {
        // Converte a instância do Sequelize em um objeto JS comum para podermos manipular
        const dosePura = dose.get({ plain: true });

        // Procura se o id_medicacao da dose bate com o id_medicacao de algum remédio
        const remedio = todasMedicacoes.find(
          (m) => Number(m.id_medicacao) === Number(dosePura.id_medicacao),
        );

        // Injeta a propriedade .medicacao que o seu front-end (HomeScreen) espera receber
        dosePura.medicacao = {
          nome_medicacao: remedio
            ? remedio.nome_medicacao
            : "Medicamento Inativo/Removido",
          dosagem: remedio ? remedio.dosagem : "",
        };

        return dosePura;
      });

      return res.json(dadosFormatados);
    } catch (error) {
      console.error("Erro no listAll seguro:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  // Registro de nova dose (aceitando a data/hora vinda do aplicativo)
  async registroDose(req, res) {
    try {
      const { id_medicacao } = req.params;
      const { data_tomada } = req.body;

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
