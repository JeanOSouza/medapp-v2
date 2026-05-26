const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id_usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Mudamos 'idade' para 'data_nascimento' para bater com o formulário
  data_nascimento: {
    type: DataTypes.STRING, // Ou DATE, dependendo de como você trata a string DD/MM/AAAA
  },
  raca: {
    type: DataTypes.STRING,
  },
  genero: {
    type: DataTypes.STRING,
  },
  telefone: {
    type: DataTypes.STRING,
  },
  comorbidades: {
    type: DataTypes.TEXT,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Associação
User.associate = (models) => {
  User.hasMany(models.Medicacao, { foreignKey: "id_usuario" });
};

module.exports = User;
