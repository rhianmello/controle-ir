let receitas = JSON.parse(localStorage.getItem("receitas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

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

function adicionarReceita() {
  receitas.push({
    data: dataReceita.value,
    valor: Number(valorReceita.value),
    descricao: descReceita.value
  });
  salvar();
}

function adicionarDespesa() {
  despesas.push({
    data: dataDespesa.value,
    valor: Number(valorDespesa.value),
    categoria: catDespesa.value,
    dedutivel: dedutivel.checked
  });
  salvar();
}

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
    listaReceitas.innerHTML += `<li>${r.data} - R$ ${r.valor} - ${r.descricao}</li>`;
  });

  despesas.forEach(d => {
    totalD += d.valor;
    listaDespesas.innerHTML += `<li>${d.data} - R$ ${d.valor} - ${d.categoria} ${d.dedutivel ? "(Dedutível)" : ""}</li>`;
  });

  totalReceitas.textContent = totalR.toFixed(2);
  totalDespesas.textContent = totalD.toFixed(2);
  resultado.textContent = (totalR - totalD).toFixed(2);
}

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
