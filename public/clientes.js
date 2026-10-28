const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'index.html';
}

// Carregar Lista de Clientes
async function carregarClientes(termo = '') {
  try {
    const url = termo ? `/api/clientes?busca=${encodeURIComponent(termo)}` : '/api/clientes';
    const resposta = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!resposta.ok) {
      alert('Erro ao carregar lista de clientes.');
      return;
    }

    const clientes = await resposta.json();
    const tabela = document.getElementById('tabelaClientes');
    tabela.innerHTML = '';

    if (clientes.length === 0) {
      tabela.innerHTML = '<tr><td colspan="3">Nenhum cliente encontrado.</td></tr>';
      return;
    }

    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.nome}</td>
        <td>${c.telefone}</td>
      `;
      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
  }
}

// Submeter Novo Cliente
document.getElementById('formCliente').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const telefone = document.getElementById('telefone').value;

  try {
    const resposta = await fetch('/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nome, cpf, telefone })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      alert(resultado.mensagem || 'Erro ao cadastrar.');
      return;
    }

    alert('Cliente cadastrado com sucesso!');
    document.getElementById('formCliente').reset();
    carregarClientes();
  } catch (error) {
    alert('Erro de conexão ao cadastrar cliente.');
  }
});

// Ações do Botão de Pesquisa
document.getElementById('btnBuscar').addEventListener('click', () => {
  const termo = document.getElementById('campoBusca').value;
  carregarClientes(termo);
});

document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('campoBusca').value = '';
  carregarClientes();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => carregarClientes());