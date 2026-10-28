const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'barbearia2_db',
  password: 'senai', // <--- SUBSTITUA PELA SUA SENHA DO PGADMIN
  port: 5432,
});

// Teste de conexão imediato ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERRO AO CONECTAR À BASE DE DADOS:', err.message);
  } else {
    console.log('✅ CONEXÃO COM O POSTGRESQL REALIZADA COM SUCESSO!');
    release();
  }
});

module.exports = pool;