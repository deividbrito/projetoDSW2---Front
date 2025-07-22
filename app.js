// url base da API
const BASE_URL = 'http://localhost:8080/controle-financeiro-api';

// carregar transacoes quando inicia
window.addEventListener('DOMContentLoaded', () => {
  carregarTransacoes();
  document.getElementById('formTransacao').addEventListener('submit', cadastrarTransacao);
  document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
});

async function carregarTransacoes(filtros = {}) {
  let url = BASE_URL + '/transacoes';
  const params = new URLSearchParams();
  if (filtros.mes) params.append('mes', filtros.mes);
  if (filtros.ano) params.append('ano', filtros.ano);
  if (filtros.tipo) params.append('tipo', filtros.tipo);
  if (filtros.categoria) params.append('categoria', filtros.categoria);
  if (Array.from(params).length > 0) url += '?' + params.toString();

  try {
    const resp = await fetch(url);
    const transacoes = await resp.json();
    exibirTransacoes(transacoes);
    atualizarResumo(transacoes);
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
  }
}

function exibirTransacoes(transacoes) {
  const tbody = document.getElementById('tabelaTransacoes');
  tbody.innerHTML = '';

  transacoes.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.descricao}</td>
      <td class="${t.tipo}">R$ ${parseFloat(t.valor).toFixed(2)}</td>
      <td>${t.tipo}</td>
      <td>${t.categoria}</td>
      <td>${t.data}</td>
      <td>
        <button onclick="editarTransacao(${t.id})">Editar</button>
        <button onclick="excluirTransacao(${t.id})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

//fazer a seguir
function aplicarFiltros() {
  alert('Função ainda será implementada.');
}

async function cadastrarTransacao(event) {
  event.preventDefault();

  const transacao = {
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value),
    tipo: document.getElementById('tipo').value,
    categoria: document.getElementById('categoria').value,
    data: document.getElementById('data').value
  };

  try {
    const resp = await fetch(BASE_URL + '/transacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transacao)
    });

    if (resp.ok) {
      document.getElementById('formTransacao').reset();
      carregarTransacoes();
    } else {
      const erro = await resp.json();
      alert('Erro: ' + erro.erro);
    }
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
  }
}

//implementar a seguir
function editarTransacao(id) {
  alert('Função ainda será implementada.');
}

//implementar a seguir
async function excluirTransacao(id) {
  alert('Função ainda será implementada.');
}

function atualizarResumo(transacoes) {
  const saldoEl = document.getElementById('saldo');
  const totaisEl = document.getElementById('totais');

  let saldo = 0;
  const categorias = {};

  transacoes.forEach(t => {
    const valor = parseFloat(t.valor);
    if (t.tipo === 'receita') {
      saldo += valor;
    } else {
      saldo -= valor;
    }

    if (!categorias[t.categoria]) {
      categorias[t.categoria] = { receita: 0, despesa: 0 };
    }
    categorias[t.categoria][t.tipo] += valor;
  });

  saldoEl.textContent = `Saldo: R$ ${saldo.toFixed(2)}`;

  totaisEl.innerHTML = '';
  for (let cat in categorias) {
    const r = categorias[cat].receita || 0;
    const d = categorias[cat].despesa || 0;
    totaisEl.innerHTML += `<div><strong>${cat}</strong>: +R$ ${r.toFixed(2)} / -R$ ${d.toFixed(2)}</div>`;
  }
}
