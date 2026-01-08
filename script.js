let receitas = JSON.parse(localStorage.getItem("receitas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

let editandoReceita = null;
let editandoDespesa = null;

/* =========================
   CONTRIBUINTE
========================= */
function salvarContribuinte() {
  const dados = {
    nome: nome.value,
    cpf: cpf.value,
    cnpj: cnpj.value,
    tipo: tipo.value
  };
  localStorage.setItem("contribuinte", JSON.stringify(dados));
  alert("Dados do contribuinte salvos!");
}
const senhaSalva = localStorage.getItem("senha");
if (!senhaSalva) {
  const novaSenha = prompt("Crie uma senha de acesso:");
  localStorage.setItem("senha", novaSenha);
} else {
  const tentativa = prompt("Digite a senha:");
  if (tentativa !== senhaSalva) {
    alert("Senha incorreta");
    document.body.innerHTML = "";
  }
}

/* =========================
   RECEITAS
========================= */
function adicionarReceita() {
  const receita = {
    id: Date.now(),
    data: dataReceita.value,
    valor: Number(valorReceita.value),
    descricao: descReceita.value
  };

  if (editandoReceita) {
    receitas = receitas.map(r => r.id === editandoReceita ? receita : r);
    editandoReceita = null;
  } else {
    receitas.push(receita);
  }

  limparFormularioReceita();
  salvar();
}

function editarReceita(id) {
  const r = receitas.find(r => r.id === id);
  dataReceita.value = r.data;
  valorReceita.value = r.valor;
  descReceita.value = r.descricao;
  editandoReceita = id;
}

function excluirReceita(id) {
  if (confirm("Deseja excluir esta receita?")) {
    receitas = receitas.filter(r => r.id !== id);
    salvar();
  }
}

/* =========================
   DESPESAS
========================= */
function adicionarDespesa() {
  const despesa = {
    id: Date.now(),
    data: dataDespesa.value,
    valor: Number(valorDespesa.value),
    categoria: catDespesa.value,
    dedutivel: dedutivel.checked
  };

  if (editandoDespesa) {
    despesas = despesas.map(d => d.id === editandoDespesa ? despesa : d);
    editandoDespesa = null;
  } else {
    despesas.push(despesa);
  }

  limparFormularioDespesa();
  salvar();
}

function editarDespesa(id) {
  const d = despesas.find(d => d.id === id);
  dataDespesa.value = d.data;
  valorDespesa.value = d.valor;
  catDespesa.value = d.categoria;
  dedutivel.checked = d.dedutivel;
  editandoDespesa = id;
}

function excluirDespesa(id) {
  if (confirm("Deseja excluir esta despesa?")) {
    despesas = despesas.filter(d => d.id !== id);
    salvar();
  }
}

/* =========================
   TELA / STORAGE
========================= */
function salvar() {
  localStorage.setItem("receitas", JSON.stringify(receitas));
  localStorage.setItem("despesas", JSON.stringify(despesas));
  atualizarTela();
}

function atualizarTela() {
  listaReceitas.innerHTML = "";
  listaDespesas.innerHTML = "";

  let totalR = 0;
  let totalD = 0;

  receitas.forEach(r => {
    totalR += r.valor;
    listaReceitas.innerHTML += `
      <li>
        ${r.data} - R$ ${r.valor} - ${r.descricao}
        <button onclick="editarReceita(${r.id})">✏️</button>
        <button onclick="excluirReceita(${r.id})">🗑️</button>
      </li>
    `;
  });

  despesas.forEach(d => {
    totalD += d.valor;
    listaDespesas.innerHTML += `
      <li>
        ${d.data} - R$ ${d.valor} - ${d.categoria}
        ${d.dedutivel ? "(Dedutível)" : ""}
        <button onclick="editarDespesa(${d.id})">✏️</button>
        <button onclick="excluirDespesa(${d.id})">🗑️</button>
      </li>
    `;
  });

  totalReceitas.textContent = totalR.toFixed(2);
  totalDespesas.textContent = totalD.toFixed(2);
  resultado.textContent = (totalR - totalD).toFixed(2);
}

/* =========================
   UTILITÁRIOS
========================= */
function limparFormularioReceita() {
  dataReceita.value = "";
  valorReceita.value = "";
  descReceita.value = "";
}

function limparFormularioDespesa() {
  dataDespesa.value = "";
  valorDespesa.value = "";
  catDespesa.value = "";
  dedutivel.checked = false;
}

/* =========================
   EXPORTAÇÃO
========================= */
function exportarCSV() {
  const contribuinte = JSON.parse(localStorage.getItem("contribuinte")) || {};

  let csv = "DADOS DO CONTRIBUINTE\n";
  csv += `Nome,${contribuinte.nome || ""}\n`;
  csv += `CPF,${contribuinte.cpf || ""}\n`;
  csv += `CNPJ,${contribuinte.cnpj || ""}\n`;
  csv += `Tipo,${contribuinte.tipo || ""}\n\n`;

  csv += "LANÇAMENTOS\n";
  csv += "Tipo,Data,Valor,Descricao,Categoria,Dedutivel\n";

  receitas.forEach(r => {
    csv += `Receita,${r.data},${r.valor},${r.descricao},,\n`;
  });

  despesas.forEach(d => {
    csv += `Despesa,${d.data},${d.valor},,${d.categoria},${d.dedutivel}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "relatorio_ir.csv";
  link.click();
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const contribuinte = JSON.parse(localStorage.getItem("contribuinte")) || {};

  const abaContribuinte = XLSX.utils.json_to_sheet([contribuinte]);
  XLSX.utils.book_append_sheet(wb, abaContribuinte, "Contribuinte");

  const abaReceitas = XLSX.utils.json_to_sheet(receitas);
  XLSX.utils.book_append_sheet(wb, abaReceitas, "Receitas");

  const abaDespesas = XLSX.utils.json_to_sheet(despesas);
  XLSX.utils.book_append_sheet(wb, abaDespesas, "Despesas");

  const resumo = [{
    totalReceitas: totalReceitas.textContent,
    totalDespesas: totalDespesas.textContent,
    resultado: resultado.textContent
  }];
  const abaResumo = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, abaResumo, "Resumo");

  XLSX.writeFile(wb, "controle_ir.xlsx");
}

function gerarRelatorioIRPF() {
  const totalR = receitas.reduce((s, r) => s + r.valor, 0);
  const dedutiveis = despesas
    .filter(d => d.dedutivel)
    .reduce((s, d) => s + d.valor, 0);

  alert(
    `RELATÓRIO IRPF\n\n` +
    `Receita Bruta: R$ ${totalR.toFixed(2)}\n` +
    `Despesas Dedutíveis: R$ ${dedutiveis.toFixed(2)}\n` +
    `Resultado Tributável: R$ ${(totalR - dedutiveis).toFixed(2)}`
  );
}

function gerarGrafico() {
  const ctx = document.getElementById("grafico");
  const totalR = receitas.reduce((s, r) => s + r.valor, 0);
  const totalD = despesas.reduce((s, d) => s + d.valor, 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [totalR, totalD]
      }]
    }
  });
}

atualizarTela();
