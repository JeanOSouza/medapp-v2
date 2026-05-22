const User = require("./User");
const Medicacao = require("./Medicacao");
const HistoricoMed = require("./Historico");

const models = {
  User,
  Medicacao,
  HistoricoMed
};

// executa os associate
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;