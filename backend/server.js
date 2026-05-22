const sequelize = require("./config/database");
const express = require("express");

const app = express();
app.use(express.json());

require("./models/User");
require("./models/Medicacao");
require("./models/Historico");
require("./models/associacoes");

sequelize.sync({ alter: true }).then(() => {
  console.log("Conectado com Servidor");
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado");
  })
  .catch((err) => {
    console.error("Erro", err);
  });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT} `);
});
