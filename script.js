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
  let csv = "Tipo,Data,Valor,Descricao,Categoria,Dedutivel\n";

  receitas.forEach(r => {
    csv += `Receita,${r.data},${r.valor},${r.descricao},,\n`;
  });

  despesas.forEach(d => {
    csv += `Despesa,${d.data},${d.valor},,${d.categoria},${d.dedutivel}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "controle_ir.csv";
  link.click();
}

atualizarTela();
