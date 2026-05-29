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

    // 1. ADICIONE ESSE BLOCO AQUI:
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    timestamps: false, // Mantido false já que o banco cuida do createdAt/updatedAt via DEFAULT
  },
);

HistoricoMed.associate = (models) => {
  // O histórico pertence a uma medicação
  HistoricoMed.belongsTo(models.Medicacao, { foreignKey: "id_medicacao" });

  // 2. ADICIONE A ASSOCIAÇÃO COM O USUÁRIO (Se você tiver o Model de Usuario)
  if (models.Usuario) {
    HistoricoMed.belongsTo(models.Usuario, { foreignKey: "id_usuario" });
  }
};

module.exports = HistoricoMed;
