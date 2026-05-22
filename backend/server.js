const express = require("express");
const app = express();
const cors = require("cors");

const conn = require("./database/conn");

require("./models/associacoes");

// ROTAS
const userRoutes = require("./routes/userRoutes");
const medicacaoRoutes = require("./routes/medicacaoRoutes");
const authRoutes = require("./routes/authRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODAS AS ROTAS COMEÇAM COM /api
app.use("/api", userRoutes);
app.use("/api", medicacaoRoutes);
app.use("/api", authRoutes);
app.use("/api", historicoRoutes);

const PORT = process.env.PORT || 3000;

conn.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
