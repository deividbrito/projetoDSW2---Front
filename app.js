// url base da API
const BASE_URL = 'http://localhost:8080/controle-financeiro-api';

document.getElementById('toggleTema').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

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

function aplicarFiltros() {
  const mesAno = document.getElementById('filtroMes').value;
  const tipo = document.getElementById('filtroTipo').value;
  const categoria = document.getElementById('filtroCategoria').value;

  let filtros = {};
  if (mesAno) {
    const [ano, mes] = mesAno.split('-');
    filtros.ano = ano;
    filtros.mes = mes;
  }
  if (tipo) filtros.tipo = tipo;
  if (categoria) filtros.categoria = categoria;

  carregarTransacoes(filtros);
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

async function editarTransacao(id) {
  try {
    const resp = await fetch(`${BASE_URL}/transacoes/${id}`);
    const transacao = await resp.json();

    document.getElementById('descricao').value = transacao.descricao;
    document.getElementById('valor').value = transacao.valor;
    document.getElementById('tipo').value = transacao.tipo;
    document.getElementById('categoria').value = transacao.categoria;
    document.getElementById('data').value = transacao.data;

    const form = document.getElementById('formTransacao');
    form.removeEventListener('submit', cadastrarTransacao);
    form.onsubmit = async (event) => {
      event.preventDefault();

      const atualizada = {
        id: id,
        descricao: document.getElementById('descricao').value,
        valor: parseFloat(document.getElementById('valor').value),
        tipo: document.getElementById('tipo').value,
        categoria: document.getElementById('categoria').value,
        data: document.getElementById('data').value
      };

      try {
        const updateResp = await fetch(`${BASE_URL}/transacoes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(atualizada)
        });

        if (updateResp.ok) {
          form.reset();
          form.onsubmit = cadastrarTransacao;
          carregarTransacoes();
        } else {
          const erro = await updateResp.json();
          alert('Erro ao atualizar: ' + erro.erro);
        }
      } catch (error) {
        console.error('Erro ao atualizar transação:', error);
      }
    };
  } catch (error) {
    console.error('Erro ao buscar transação para edição:', error);
  }
}
async function excluirTransacao(id) {
  const confirmar = confirm('Tem certeza que deseja excluir esta transação?');
  if (!confirmar) return;

  try {
    const resp = await fetch(`${BASE_URL}/transacoes/${id}`, {
      method: 'DELETE'
    });

    if (resp.ok) {
      carregarTransacoes();
    } else {
      const erro = await resp.json();
      alert('Erro ao excluir: ' + erro.erro);
    }
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
  }
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
