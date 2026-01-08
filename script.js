let cpfLogado = null;
let receitas = [];
let despesas = [];
let editR = null;
let editD = null;
let grafico = null;

/* ================= LOGIN ================= */
function fazerLogin() {
  const cpf = loginCpf.value;
  const senha = loginSenha.value;
  const chave = `usuario_${cpf}`;

  let user = JSON.parse(localStorage.getItem(chave));

  if (!user) {
    user = { senha, contribuinte:{}, receitas:[], despesas:[] };
    localStorage.setItem(chave, JSON.stringify(user));
  } else if (user.senha !== senha) {
    return alert("Senha incorreta");
  }

  cpfLogado = cpf;
  carregarDados();
  login.style.display = "none";
  app.style.display = "block";
}

/* ================= STORAGE ================= */
function salvarTudo() {
  localStorage.setItem(`usuario_${cpfLogado}`, JSON.stringify({
    senha: JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`)).senha,
    contribuinte,
    receitas,
    despesas
  }));
}

function carregarDados() {
  const user = JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`));
  receitas = user.receitas || [];
  despesas = user.despesas || [];
  contribuinte = user.contribuinte || {};
  cpf.value = cpfLogado;
  nome.value = contribuinte.nome || "";
  cnpj.value = contribuinte.cnpj || "";
  tipo.value = contribuinte.tipo || "";
  atualizarTela();
}

/* ================= CONTRIBUINTE ================= */
let contribuinte = {};
function salvarContribuinte() {
  contribuinte = {
    nome: nome.value,
    cpf: cpfLogado,
    cnpj: cnpj.value,
    tipo: tipo.value
  };
  salvarTudo();
  alert("Salvo");
}

/* ================= RECEITAS ================= */
function salvarReceita() {
  const obj = {
    id: editR || Date.now(),
    data: dataReceita.value,
    valor: Number(valorReceita.value),
    descricao: descReceita.value
  };

  receitas = editR ? receitas.map(r => r.id === editR ? obj : r) : [...receitas, obj];
  editR = null;
  limparReceita();
  salvarTudo();
  atualizarTela();
}

function editarReceita(id) {
  const r = receitas.find(r => r.id === id);
  dataReceita.value = r.data;
  valorReceita.value = r.valor;
  descReceita.value = r.descricao;
  editR = id;
}

function excluirReceita(id) {
  receitas = receitas.filter(r => r.id !== id);
  salvarTudo();
  atualizarTela();
}

/* ================= DESPESAS ================= */
function salvarDespesa() {
  const obj = {
    id: editD || Date.now(),
    data: dataDespesa.value,
    valor: Number(valorDespesa.value),
    categoria: catDespesa.value,
    dedutivel: dedutivel.checked
  };

  despesas = editD ? despesas.map(d => d.id === editD ? obj : d) : [...despesas, obj];
  editD = null;
  limparDespesa();
  salvarTudo();
  atualizarTela();
}

function editarDespesa(id) {
  const d = despesas.find(d => d.id === id);
  dataDespesa.value = d.data;
  valorDespesa.value = d.valor;
  catDespesa.value = d.categoria;
  dedutivel.checked = d.dedutivel;
  editD = id;
}

function excluirDespesa(id) {
  despesas = despesas.filter(d => d.id !== id);
  salvarTudo();
  atualizarTela();
}

/* ================= TELA ================= */
function atualizarTela() {
  listaReceitas.innerHTML = "";
  listaDespesas.innerHTML = "";

  let tr = 0, td = 0;

  receitas.forEach(r => {
    tr += r.valor;
    listaReceitas.innerHTML += `
      <li>${r.data} - R$ ${r.valor}
      <button onclick="editarReceita(${r.id})">✏️</button>
      <button onclick="excluirReceita(${r.id})">🗑️</button></li>`;
  });

  despesas.forEach(d => {
    td += d.valor;
    listaDespesas.innerHTML += `
      <li>${d.data} - R$ ${d.valor}
      <button onclick="editarDespesa(${d.id})">✏️</button>
      <button onclick="excluirDespesa(${d.id})">🗑️</button></li>`;
  });

  totalReceitas.textContent = tr.toFixed(2);
  totalDespesas.textContent = td.toFixed(2);
  resultado.textContent = (tr - td).toFixed(2);

  gerarGrafico(tr, td);
}

/* ================= GRÁFICO ================= */
function gerarGrafico(tr, td) {
  const ctx = document.getElementById("grafico");
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [tr, td]
      }]
    }
  });
}

/* ================= RELATÓRIOS ================= */
function exportarCSV() {
  let csv = `Nome,${contribuinte.nome}\nCPF,${cpfLogado}\nCNPJ,${contribuinte.cnpj}\n\n`;
  csv += "Tipo,Data,Valor,Descricao,Categoria,Dedutivel\n";

  receitas.forEach(r => csv += `Receita,${r.data},${r.valor},${r.descricao},,\n`);
  despesas.forEach(d => csv += `Despesa,${d.data},${d.valor},,${d.categoria},${d.dedutivel}\n`);

  baixar(csv, "relatorio_ir.csv");
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(receitas), "Receitas");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(despesas), "Despesas");
  XLSX.writeFile(wb, "controle_ir.xlsx");
}

function relatorioIRPF() {
  const ded = despesas.filter(d => d.dedutivel).reduce((s,d)=>s+d.valor,0);
  alert(`Receita: R$ ${totalReceitas.textContent}\nDedutíveis: R$ ${ded}\nTributável: R$ ${(totalReceitas.textContent - ded).toFixed(2)}`);
}

/* ================= UTILS ================= */
function baixar(conteudo, nome) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([conteudo]));
  a.download = nome;
  a.click();
}

function limparReceita() {
  dataReceita.value = valorReceita.value = descReceita.value = "";
}

function limparDespesa() {
  dataDespesa.value = valorDespesa.value = catDespesa.value = "";
  dedutivel.checked = false;
}
