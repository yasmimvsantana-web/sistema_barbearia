document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const mensagemErro = document.getElementById('mensagemErro');
  mensagemErro.innerText = '';

  try {
    const resposta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.innerText = dados.mensagem || 'Falha ao realizar login.';
      return;
    }

    // Salva o token de sessão e redireciona para o painel
    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
    window.location.href = 'painel.html';
  } catch (error) {
    mensagemErro.innerText = 'Erro de conexão com o servidor.';
  }
});