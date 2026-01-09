const PIN_ADMIN = "9999";
let cpfLogado=null, receitas=[], despesas=[], contribuinte={}, editR=null, editD=null, grafico=null;

document.addEventListener("DOMContentLoaded",()=>{

  document.getElementById("btnLogin").onclick = login;
  document.getElementById("btnResetSenha").onclick = ()=>trocaTela(resetSection,loginSection);
  document.getElementById("btnCancelarReset").onclick = ()=>trocaTela(loginSection,resetSection);
  document.getElementById("btnConfirmarReset").onclick = resetarSenha;

  document.getElementById("btnSalvarReceita").onclick = salvarReceita;
  document.getElementById("btnSalvarDespesa").onclick = salvarDespesa;
  document.getElementById("btnSalvarContribuinte").onclick = salvarContribuinte;

  document.getElementById("btnPDFResumo").onclick = ()=>html2pdf().from(document.querySelector(".responsive-pdf")).save("resumo_ir.pdf");
  document.getElementById("btnPDFIRPF").onclick = ()=>html2pdf().from(document.getElementById("irpfPDF")).save("irpf.pdf");
  document.getElementById("btnExcel").onclick = exportarExcel;

  document.getElementById("loginSenha").addEventListener("keyup",e=>{ if(e.key==="Enter") login(); });
  document.getElementById("novaSenha").addEventListener("keyup",e=>{ if(e.key==="Enter") resetarSenha(); });
});

function login(){
  const cpf=loginCpf.value.replace(/\D/g,"");
  const senha=loginSenha.value;
  if(!cpf||!senha) return alert("CPF e senha");
  const k=`usuario_${cpf}`;
  let u=JSON.parse(localStorage.getItem(k));
  if(!u){u={senha,contribuinte:{},receitas:[],despesas:[]};localStorage.setItem(k,JSON.stringify(u));}
  else if(u.senha!==senha) return alert("Senha incorreta");
  cpfLogado=cpf;
  carregarDados();
  trocaTela(app,loginSection);
}

function resetarSenha(){
  if(resetPin.value!==PIN_ADMIN) return alert("PIN inválido");
  const cpf=resetCpf.value.replace(/\D/g,"");
  const k=`usuario_${cpf}`;
  let u=JSON.parse(localStorage.getItem(k));
  if(!u) return alert("CPF não encontrado");
  u.senha=novaSenha.value;
  localStorage.setItem(k,JSON.stringify(u));
  alert("Senha redefinida");
  trocaTela(loginSection,resetSection);
}

function salvarTudo(){
  localStorage.setItem(`usuario_${cpfLogado}`,JSON.stringify({
    senha:JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`)).senha,
    contribuinte,receitas,despesas
  }));
}

function carregarDados(){
  const u=JSON.parse(localStorage.getItem(`usuario_${cpfLogado}`));
  receitas=u.receitas; despesas=u.despesas; contribuinte=u.contribuinte;
  cpf.value=cpfLogado; nome.value=contribuinte.nome||""; cnpj.value=contribuinte.cnpj||""; tipo.value=contribuinte.tipo||"";
  atualizarTela();
}

function salvarContribuinte(){
  contribuinte={nome:nome.value,cpf:cpfLogado,cnpj:cnpj.value,tipo:tipo.value};
  salvarTudo(); atualizarTela();
}

function salvarReceita(){
  const o={id:editR||Date.now(),data:dataReceita.value,valor:+valorReceita.value,desc:descReceita.value};
  receitas=editR?receitas.map(r=>r.id===editR?o:r):[...receitas,o];
  editR=null; salvarTudo(); atualizarTela();
}

function salvarDespesa(){
  const o={id:editD||Date.now(),data:dataDespesa.value,valor:+valorDespesa.value,cat:catDespesa.value,ded:dedutivel.checked};
  despesas=editD?despesas.map(d=>d.id===editD?o:d):[...despesas,o];
  editD=null; salvarTudo(); atualizarTela();
}

function atualizarTela(){
  listaReceitas.innerHTML=""; listaDespesas.innerHTML="";
  let tr=0,td=0,dd=0;

  receitas.forEach(r=>{
    tr+=r.valor;
    listaReceitas.innerHTML+=`<li>${r.desc} R$${r.valor}
    <span><button onclick="editarR(${r.id})">✏️</button><button onclick="excluirR(${r.id})">🗑</button></span></li>`;
  });

  despesas.forEach(d=>{
    td+=d.valor; if(d.ded) dd+=d.valor;
    listaDespesas.innerHTML+=`<li>${d.cat} R$${d.valor}
    <span><button onclick="editarD(${d.id})">✏️</button><button onclick="excluirD(${d.id})">🗑</button></span></li>`;
  });

  totalReceitas.textContent=tr.toFixed(2);
  totalDespesas.textContent=td.toFixed(2);
  resultado.textContent=(tr-td).toFixed(2);

  irNome.textContent=contribuinte.nome||"";
  irCpf.textContent=cpfLogado;
  irCnpj.textContent=contribuinte.cnpj||"";
  irReceita.textContent=tr.toFixed(2);
  irDedutivel.textContent=dd.toFixed(2);
  irBase.textContent=(tr-dd).toFixed(2);

  gerarGrafico(tr,td);
}

function editarR(id){const r=receitas.find(x=>x.id===id);editR=id;dataReceita.value=r.data;valorReceita.value=r.valor;descReceita.value=r.desc;}
function excluirR(id){receitas=receitas.filter(x=>x.id!==id);salvarTudo();atualizarTela();}
function editarD(id){const d=despesas.find(x=>x.id===id);editD=id;dataDespesa.value=d.data;valorDespesa.value=d.valor;catDespesa.value=d.cat;dedutivel.checked=d.ded;}
function excluirD(id){despesas=despesas.filter(x=>x.id!==id);salvarTudo();atualizarTela();}

function gerarGrafico(r,d){
  if(grafico) grafico.destroy();
  grafico=new Chart(document.getElementById("grafico"),{
    type:"bar",
    data:{labels:["Receitas","Despesas"],datasets:[{data:[r,d]}]},
    options:{responsive:true,maintainAspectRatio:false}
  });
}

function exportarExcel(){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(receitas),"Receitas");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(despesas),"Despesas");
  XLSX.writeFile(wb,"controle_ir.xlsx");
}

function trocaTela(show,hide){
  show.classList.remove("hidden");
  hide.classList.add("hidden");
}
