let cpfLogado = null;
let receitas = [];
let despesas = [];
let contribuinte = {};
let editR = null;
let editD = null;
let grafico = null;

/* ================= INICIALIZAÇÃO ================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnLogin").addEventListener("click", fazerLogin);
  document.getElementById("btnSalvarContribuinte").addEventListener("click", salvarContribuinte);
  document.getElementById("btnSalvarReceita").addEventListener("click", salvarReceita);
  document.getElementById("btnSalvarDespesa").addEventListener("click", salvarDespesa);
  document.getElementById("btnCSV").addEventListener("click", exportarCSV);
  document.getElementById("btnExcel").addEventListener("click", exportarExcel);
  document.getElementById("btnIRPF").addEventListener("click", relatorioIRPF);
});

/* ================= LOGIN ================= */
function fazerLogin() {
  const cpfInput = document.getElementById("loginCpf").value.replace(/\D/g, "");
  const senha = document.getElementById("loginSenha").value;

  if (!cpfInput || !senha) {
    alert("Informe CPF e senha");
    return;
  }

  const chave = `usuario_${cpfInput}`;
  let user = JSON.parse(localStorage.getItem(chave));

  if (!user) {
    user = { senha, contribuinte: {}, receitas: [], despesas: [] };
    localStorage.setItem(chave, JSON.stringify(user));
  } else if (user.senha !== senha) {
    alert("Senha incorreta");
    return;
  }

  cpfLogado = cpfInput;
  carregarDados();

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("app").style.display = "block";
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

  document.getElementById("cpf").value = cpfLogado;
  document.getElementById("nome").value = contribuinte.nome || "";
  document.getElementById("cnpj").value = contribuinte.cnpj || "";
  document.getElementById("tipo").value = contribuinte.tipo || "";

  atualizarTela();
}

/* ================= CONTRIBUINTE ================= */
function salvarContribuinte() {
  contribuinte = {
    nome: document.getElementById("nome").value,
    cpf: cpfLogado,
    cnpj: document.getElementById("cnpj").value,
    tipo: document.getElementById("tipo").value
  };
  salvarTudo();
  alert("Dados salvos");
}

/* ================= RECEITAS ================= */
function salvarReceita() {
  const obj = {
    id: editR || Date.now(),
    data: document.getElementById("dataReceita").value,
    valor: Number(document.getElementById("valorReceita").value),
    descricao: document.getElementById("descReceita").value
  };

  receitas = editR ? receitas.map(r => r.id === editR ? obj : r) : [...receitas, obj];
  editR = null;
  salvarTudo();
  atualizarTela();
}

/* ================= DESPESAS ================= */
function salvarDespesa() {
  const obj = {
    id: editD || Date.now(),
    data: document.getElementById("dataDespesa").value,
    valor: Number(document.getElementById("valorDespesa").value),
    categoria: document.getElementById("catDespesa").value,
    dedutivel: document.getElementById("dedutivel").checked
  };

  despesas = editD ? despesas.map(d => d.id === editD ? obj : d) : [...despesas, obj];
  editD = null;
  salvarTudo();
  atualizarTela();
}

/* ================= TELA ================= */
function atualizarTela() {
  const lr = document.getElementById("listaReceitas");
  const ld = document.getElementById("listaDespesas");

  lr.innerHTML = "";
  ld.innerHTML = "";

  let tr = 0, td = 0;

  receitas.forEach(r => tr += r.valor);
  despesas.forEach(d => td += d.valor);

  document.getElementById("totalReceitas").textContent = tr.toFixed(2);
  document.getElementById("totalDespesas").textContent = td.toFixed(2);
  document.getElementById("resultado").textContent = (tr - td).toFixed(2);

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
      datasets: [{ data: [tr, td] }]
    }
  });
}

/* ================= RELATÓRIOS ================= */
function exportarCSV() {
  let csv = `Nome,${contribuinte.nome || ""}\nCPF,${cpfLogado}\nCNPJ,${contribuinte.cnpj || ""}\n\n`;
  csv += "Tipo,Data,Valor,Descricao,Categoria,Dedutivel\n";

  receitas.forEach(r => csv += `Receita,${r.data},${r.valor},${r.descricao},,\n`);
  despesas.forEach(d => csv += `Despesa,${d.data},${d.valor},,${d.categoria},${d.dedutivel}\n`);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = "relatorio_ir.csv";
  a.click();
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(receitas), "Receitas");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(despesas), "Despesas");
  XLSX.writeFile(wb, "controle_ir.xlsx");
}

function relatorioIRPF() {
  const ded = despesas.filter(d => d.dedutivel).reduce((s,d)=>s+d.valor,0);
  alert(`Receita: R$ ${document.getElementById("totalReceitas").textContent}
Dedutíveis: R$ ${ded.toFixed(2)}
Tributável: R$ ${(document.getElementById("totalReceitas").textContent - ded).toFixed(2)}`);
}
