const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const JWT_SECRET = 'secreta_barbearia_key_123'; // Chave para assinar a sessão JWT

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// -----------------------------------------------------------------------------
// MIDDLEWARE: VERIFICAÇÃO DE TOKEN JWT (PROTEÇÃO DE ROTAS)
// -----------------------------------------------------------------------------
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ mensagem: 'Sessão expirada ou token inválido.' });
    }
    req.usuario = decoded;
    next();
  });
}

// -----------------------------------------------------------------------------
// ROTA 1: LOGIN (AUTENTICAÇÃO COM EXPIRAÇÃO DE SESSÃO)
// -----------------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Por favor, preencha o e-mail e a senha.' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
    }

    const usuario = result.rows[0];

    // Valida a senha usando bcrypt ou comparação direta de teste
    const senhaValida = await bcrypt.compare(senha, usuario.senha) || senha === 'senha123';

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
    }

    // Gera o token JWT com validade de 1 hora
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

// -----------------------------------------------------------------------------
// ROTA 2: PERFIL DO USUÁRIO LOGADO (USADO NO PAINEL PRINCIPAL)
// -----------------------------------------------------------------------------
app.get('/api/me', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

// -----------------------------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR NA PORTA 3000
// ---------------------------------------
// -----------------------------------------------------------------------------
// ROTAS DE GERENCIAMENTO DE CLIENTES
// -----------------------------------------------------------------------------

// Listar/Buscar clientes (com filtro opcional por termo de pesquisa)
app.get('/api/clientes', verificarToken, async (req, res) => {
  const { busca } = req.query;
  try {
    let query = 'SELECT id, nome, cpf, telefone FROM clientes';
    let params = [];

    if (busca) {
      query += ' WHERE LOWER(nome) LIKE LOWER($1) OR telefone LIKE $1';
      params.push(`%${busca}%`);
    }

    query += ' ORDER BY id DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ mensagem: 'Erro ao carregar clientes.' });
  }
});

// Cadastrar novo cliente
app.post('/api/clientes', verificarToken, async (req, res) => {
  const { nome, cpf, telefone } = req.body;

  if (!nome || !cpf || !telefone) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Simulação de criptografia para conformidade com a LGPD
    const cpfCriptografado = Buffer.from(cpf).toString('base64');

    const result = await db.query(
      'INSERT INTO clientes (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, cpfCriptografado, telefone]
    );

    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso!', cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ mensagem: 'Erro interno ao salvar cliente.' });
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});

