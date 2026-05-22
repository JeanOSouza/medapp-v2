const User = require("../models/User");
const Medicacao = require("../models/Medicacao");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  async create(req, res) {
    try {
      const { nome, email, senha, data, raca, genero, telefone, comorbidades } =
        req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          message: "Preencha todos os campos",
        });
      }

      const emailLimpo = email.trim().toLowerCase();

      const userExists = await User.findOne({ where: { email: emailLimpo } });

      if (userExists) {
        return res.status(400).json({
          message: "E-mail já cadastrado",
        });
      }
      const senhaHash = await bcrypt.hash(senha.trim(), 10);

      const user = await User.create({
        nome,
        email: emailLimpo,
        senha: senhaHash,
        data_nascimento: data, // Mapeando 'data' para 'data_nascimento'
        raca,
        genero,
        telefone,
        comorbidades,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const emailLimpo = email.trim().toLowerCase();

      const user = await User.findOne({ where: { email: emailLimpo } });

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const senhaValida = await bcrypt.compare(senha.trim(), user.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { id: user.id_usuario },
        process.env.JWT_SECRET || "segredo",
        { expiresIn: "1d" },
      );

      return res.json({ user, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const users = await User.findAll({
        include: [{ model: Medicacao }],
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const id = req.params.id;

      const user = await User.findOne({
        where: { id_usuario: id },
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const id = req.params.id;
      const { nome, email, telefone, comorbidades } = req.body;

      let senhaHash = senha;

      if (senha) {
        senhaHash = await bcrypt.hash(senha.trim(), 10);
      }

      await User.update(
        { nome, email, telefone, comorbidades },
        { where: { id_usuario: id } },
      );

      const userAtualizado = await User.findByPk(id);

      res.json(userAtualizado);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  // 🔹 DELETE
  async delete(req, res) {
    try {
      const id = req.params.id;

      await User.destroy({
        where: { id_usuario: id },
      });

      res.json({
        message: "Usuario apagado",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },
};
