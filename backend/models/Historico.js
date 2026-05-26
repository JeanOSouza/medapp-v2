const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const HistoricoMed = sequelize.define(
  "HistoricoMed",
  {
    id_historico: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_medicacao: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    nome_medicacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    data_tomada: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    observacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "historico_meds",
    timestamps: false,
  },
);

HistoricoMed.associate = (models) => {
  // O histórico pertence a uma medicação
  HistoricoMed.belongsTo(models.Medicacao, { foreignKey: "id_medicacao" });
};

module.exports = HistoricoMed;
