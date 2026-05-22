const conn = require("../database/conn");
const { DataTypes } = require("sequelize");

const HistoricoMed = conn.define("historico_med", {
  id_historico: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  id_medicacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Data e hora da toma da medicação
  data_tomada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  // Para futuras observações (opcional)
  observacao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

HistoricoMed.associate = (models) => {
  // O histórico pertence a uma medicação
  HistoricoMed.belongsTo(models.Medicacao, { foreignKey: "id_medicacao" });
};

module.exports = HistoricoMed;
