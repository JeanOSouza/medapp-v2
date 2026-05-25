const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Medicacao = sequelize.define(
  "medicacao",
  {
    id_medicacao: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nome_medicacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dosagem: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    inicio_medicacao: {
      type: DataTypes.DATE,
    },

    fim_medicacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    frequencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ultimadose: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "ativo",
    },
  },
  {
    tableName: "medicacaos",
    freezeTableName: true,
  },
);

//associar medicações e historico
Medicacao.associate = (models) => {
  // Um medicamento tem muitas doses registradas
  Medicacao.belongsTo(models.User, { foreignKey: "id_usuario" });
  Medicacao.hasMany(models.HistoricoMed, { foreignKey: "id_medicacao" });
};

module.exports = Medicacao;
