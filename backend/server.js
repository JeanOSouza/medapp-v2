const express = require("express");
const cors = require("cors");

const app = express();

const sequelize = require("./config/database");

require("./models/associacoes");

// ROTAS
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const medicacaoRoutes = require("./routes/medicacaoRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

app.use(cors());
app.use(express.json());

// TESTE
app.get("/", (req, res) => {
  res.json({ status: "online" });
});

// ROTAS (SEM /api)
app.use(authRoutes);
app.use(userRoutes);
app.use(medicacaoRoutes);
app.use(historicoRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    console.log("Conectado com PostgreSQL");

    app.listen(PORT, () => {
      console.log("Servidor rodando na porta", PORT);
    });
  })
  .catch((err) => console.log(err));
