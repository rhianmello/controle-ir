const PIN_ADMIN = "9999";
let cpfLogado = null;
let receitas = [];
let despesas = [];
let contribuinte = {};
let editR = null;
let editD = null;
let grafico = null;

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  btnLogin.onclick = login;
  btnResetSenha.onclick = () => trocaTela(resetSection, loginSection);
  btnCancelarReset.onclick = () => trocaTela(loginSection, resetSection);
  btnConfirmarReset.onclick = resetarSenha;

  btnSalvarReceita.onclick = salvarReceita;
  btnSalvarDespesa.onclick = salvarDespesa;
  btnSalvarContribuinte.onclick = salvarContribuinte;
  btnPDF.onclick = gerarPDF;
});

/* LOGIN */
function login() {
  const cpf = loginCpf.value.replace(/\D/g,"");
  const senha = loginSenha.value;
  if(!cpf || !senha) return alert("CPF e senha");

  const key = `usuario_${cpf}`;
  let user = JSON.parse(localStorage.getItem(key));

  if(!user){
    user = { senha, contribuinte:{}, receitas:[], despesas:[] };
    localStorage.setItem(key, JSON.stringify(user));
  } else if(user.senha !== senha){
    return alert("Senha incorreta");
  }

  cpfLogado = cpf;
  carregarDados();
  trocaTela(app, loginSection);
}

/* RESET */
function resetarSenha(){
  if(resetPin.value !== PIN_ADMIN) return alert("PIN inválido");
  const cpf = resetCpf.value.replace(/\D/g,"");
  const key = `usuario_${cpf}`;
  let user = JSON.parse(localStorage.getItem(key));
  if(!user) return alert("CPF não encontrado");
  user.senha = novaSenha.value;
  localStorage.setItem(key, JSON.stringify(user));
  alert("Senha alterada");
  trocaTela(loginSection, resetSection);
}

/* STORAGE */
function salvarTudo(){
  localStorage.setItem(`usuario_${cpfLogado}`, JSON.stringify({
    senha: JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`)).senha,
    contribuinte, receitas, despesas
  }));
}

function carregarDados(){
  const user = JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`));
  receitas = user.receitas;
  despesas = user.despesas;
  contribuinte = user.contribuinte;

  cpf.value = cpfLogado;
  nome.value = contribuinte.nome || "";
  cnpj.value = contribuinte.cnpj || "";
  tipo.value = contribuinte.tipo || "";

  atualizarTela();
}

/* CONTRIBUINTE */
function salvarContribuinte(){
  contribuinte = { nome:nome.value, cpf:cpfLogado, cnpj:cnpj.value, tipo:tipo.value };
  salvarTudo();
}

/* RECEITAS */
function salvarReceita(){
  const obj = {
    id: editR || Date.now(),
    data: dataReceita.value,
    valor: +valorReceita.value,
    desc: descReceita.value
  };
  receitas = editR ? receitas.map(r=>r.id===editR?obj:r) : [...receitas,obj];
  editR=null;
  salvarTudo();
  atualizarTela();
}

/* DESPESAS */
function salvarDespesa(){
  const obj = {
    id: editD || Date.now(),
    data: dataDespesa.value,
    valor: +valorDespesa.value,
    cat: catDespesa.value,
    ded: dedutivel.checked
  };
  despesas = editD ? despesas.map(d=>d.id===editD?obj:d) : [...despesas,obj];
  editD=null;
  salvarTudo();
  atualizarTela();
}

/* TELA */
function atualizarTela(){
  listaReceitas.innerHTML="";
  listaDespesas.innerHTML="";
  let tr=0, td=0;

  receitas.forEach(r=>{
    tr+=r.valor;
    listaReceitas.innerHTML+=`
      <li>${r.desc} - R$${r.valor}
        <span>
          <button onclick="editarR(${r.id})">✏️</button>
          <button onclick="excluirR(${r.id})">🗑</button>
        </span>
      </li>`;
  });

  despesas.forEach(d=>{
    td+=d.valor;
    listaDespesas.innerHTML+=`
      <li>${d.cat} - R$${d.valor}
        <span>
          <button onclick="editarD(${d.id})">✏️</button>
          <button onclick="excluirD(${d.id})">🗑</button>
        </span>
      </li>`;
  });

  totalReceitas.textContent = tr.toFixed(2);
  totalDespesas.textContent = td.toFixed(2);
  resultado.textContent = (tr-td).toFixed(2);
  gerarGrafico(tr,td);
}

/* EDIT / DELETE */
function editarR(id){ const r=receitas.find(x=>x.id===id); editR=id; dataReceita.value=r.data; valorReceita.value=r.valor; descReceita.value=r.desc; }
function excluirR(id){ receitas=receitas.filter(x=>x.id!==id); salvarTudo(); atualizarTela(); }

function editarD(id){ const d=despesas.find(x=>x.id===id); editD=id; dataDespesa.value=d.data; valorDespesa.value=d.valor; catDespesa.value=d.cat; dedutivel.checked=d.ded; }
function excluirD(id){ despesas=despesas.filter(x=>x.id!==id); salvarTudo(); atualizarTela(); }

/* GRAFICO */
function gerarGrafico(r,d){
  if(grafico) grafico.destroy();
  grafico = new Chart(document.getElementById("grafico"),{
    type:"bar",
    data:{ labels:["Receitas","Despesas"], datasets:[{data:[r,d]}] }
  });
}

/* PDF */
function gerarPDF(){
  html2pdf().from(document.getElementById("relatorioPDF")).save("relatorio_ir.pdf");
}

/* UTILS */
function trocaTela(show, hide){
  show.classList.remove("hidden");
  hide.classList.add("hidden");
}
