const express = require("express");
const cors = require("cors");

const app = express();

const sequelize = require("./config/database");

require("./models/associacoes");

// ROTAS
const userRoutes = require("./routes/userRoutes");
const medicacaoRoutes = require("./routes/medicacaoRoutes");
const authRoutes = require("./routes/authRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTA TESTE
app.get("/", (req, res) => {
  res.json({
    mensagem: "API MedApp funcionando!",
  });
});

// ROTAS API
app.use("/api", userRoutes);
app.use("/api", medicacaoRoutes);
app.use("/api", authRoutes);
app.use("/api", historicoRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado com PostgreSQL");

    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Tabelas sincronizadas");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
