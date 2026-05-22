const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  // ✅ REGISTRO
  async registrar(req, res) {
    try {
      console.log("--> DADOS CHEGANDO NO BACKEND:", req.body); // ADICIONE ESTA LINHA
      const { nome, email, senha, data, raca, genero, telefone, comorbidades } =
        req.body;

      if (!nome || !email || !senha) {
        return res
          .status(400)
          .json({ message: "Preencha os campos obrigatórios." });
      }

      const emailLimpo = email.trim().toLowerCase();

      const userExists = await User.findOne({ where: { email: emailLimpo } });

      if (userExists) {
        return res
          .status(400)
          .json({ message: "Este e-mail já está cadastrado." });
      }

      // 🔐 HASH DA SENHA
      const senhaHash = await bcrypt.hash(senha.trim(), 10);

      const user = await User.create({
        nome,
        email: emailLimpo,
        senha: senhaHash,
        data_nascimento: data,
        raca,
        genero,
        telefone,
        comorbidades,
      });

      console.log(">>> NOVO USUÁRIO CADASTRADO:", emailLimpo);

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        id: user.id_usuario,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar no banco." });
    }
  },

  // ✅ LOGIN
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos." });
      }

      const emailBusca = email.trim().toLowerCase();

      const user = await User.findOne({ where: { email: emailBusca } });

      if (!user) {
        console.log(">>> LOGIN FALHOU: E-mail não encontrado:", emailBusca);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      let senhaValida = false;

      // 🔥 SUPORTE PARA SENHAS ANTIGAS (sem hash)
      if (user.senha.startsWith("$2")) {
        senhaValida = await bcrypt.compare(senha.trim(), user.senha);
      } else {
        senhaValida = senha.trim() === user.senha;
      }

      console.log("--- DEBUG LOGIN ---");
      console.log("Email:", emailBusca);
      console.log("Senha válida?:", senhaValida);

      if (!senhaValida) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // 🔐 TOKEN JWT
      const token = jwt.sign(
        { id: user.id_usuario },
        process.env.JWT_SECRET || "segredo_dev",
        { expiresIn: "24h" },
      );

      return res.json({
        token,
        user: {
          id: user.id_usuario,
          nome: user.nome,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  },
};
