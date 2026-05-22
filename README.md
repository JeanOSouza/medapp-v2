<<<<<<< HEAD

# 💊 Projeto MedApp

Um sistema completo para gestão e controle de medicação, composto por uma API REST e um aplicativo móvel cross-platform.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**

- **Node.js & Express:** Servidor e roteamento.
- **Sequelize:** ORM para manipulação de dados.
- **SQLite3:** Banco de dados relacional leve.
- **JWT & Bcrypt:** Autenticação segura e hash de senhas.

### **Frontend (Mobile)**

- **React Native & Expo:** Estrutura do aplicativo.
- **Axios:** Consumo de APIs.
- **React Navigation:** Navegação entre telas (Tabs e Stack).
- **Ionicons:** Biblioteca de ícones.

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar os ambientes localmente.

### 1. Clonar o Repositório

# Baixar o projeto

git clone [https://github.com/JeanOSouza/MedApp.git]

# Entrar na pasta

cd seu-repositorio

### 2. Configuração do Backend (API)

1. Navegue até a pasta do servidor:

   cd backend

2. Instale as dependências:

   npm install

3. Inicie o servidor:

   node server.js

> **Nota:** O banco de dados SQLite será criado automaticamente (`database.sqlite`) na primeira execução.

### 3. Configuração do Mobile (Frontend)

1. Abra um novo terminal e navegue até a pasta do projeto mobile:

   cd native

2. Instale as dependências:

   npm install

3. Inicie o Expo:

   npx expo start

---

## 📱 Funcionalidades Principais

- **Registro e Login:** Sistema de autenticação seguro.
- **Cadastro de Medicamentos:** Registro de nome, dosagem, frequência e horário de início.
- **Dashboard Inteligente (Home):** \* Cálculo automático da próxima dose com base no histórico de tomadas.
  - Sinalização de medicamentos atrasados.
  - Confirmação de ingestão em tempo real.
- **Histórico Geral:** Lista completa de medicamentos cadastrados com busca dinâmica e recarregamento (_Pull to Refresh_).
- **Perfil e Detalhes:** Visualização individualizada de cada medicação.

---

## 💡 Dicas de Desenvolvimento

- **IP do Servidor:** Se testar em um dispositivo físico, altere o IP em `service/api.js` para o endereço IP local da sua máquina.
- **Logs:** O backend possui logs detalhados para debug de inserção de dados e autenticação.

---

Desenvolvido por [Jean e Luslene] - 2026

```

```

=======

# MedApp 💊

## ✅ COMO RODAR (passo a passo)

### 1. Abrir no VS Code

- Extraia o ZIP
- No VS Code: File → Open Folder → selecione a pasta `MedAppFinal`

### 2. Instalar dependências (UMA VEZ SÓ)

```powershell
npm install --legacy-peer-deps
```

### 3. Rodar o projeto

```powershell
npx expo start --tunnel --clear
```

### 4. Abrir no celular

- Abra o app **Expo Go** no iPhone
- Toque em **"Scan QR Code"**
- Escaneie o QR Code que aparece no terminal

---

## ⚠️ IMPORTANTE

- Sempre use `npm install --legacy-peer-deps` (nunca só `npm install`)
- Sempre use `npx expo start --tunnel --clear` para rodar
- Este projeto usa **Expo SDK 52** — compatível com Expo Go atual

## 📱 Telas incluídas

- Splash (tela inicial)
- Login
- Cadastro (passo 1 e 2)
- Home (medicamentos ativos/tomados)
- Cadastro de Medicamento
- Histórico de doses
- Calendário com horários
- Medicamentos Atuais
- Medicamentos Tomados
  > > > > > > > origin/master
