function irPara(pagina) {
  window.location.href = pagina;
}

function voltar() {
  window.history.back();
}

// criar boletim simples
function novoBoletim() {
  const boletim = prompt("Nome do boletim:");

  if (!boletim) return;

  //const lista = document.getElementById("boletins");

  const div = document.createElement("div");
  div.classList.add("card");
  div.textContent = "🎬 " + boletim;

  lista.appendChild(div);
}

// simular exportação de PDF
function exportarPDF() {
  const nome = prompt("Nome do PDF:");

  if (!nome) return;

  let pdfs = JSON.parse(localStorage.getItem("pdfs")) || [];

  pdfs.push(nome);
  localStorage.setItem("pdfs", JSON.stringify(pdfs));

  carregarPDFs();
}

// carregar PDFs salvos
function carregarPDFs() {
  const container = document.getElementById("pdfs");
  container.innerHTML = "";

  let pdfs = JSON.parse(localStorage.getItem("pdfs")) || [];

  pdfs.forEach(pdf => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.textContent = "📄 " + pdf;

    container.appendChild(div);
  });
}

carregarPDFs();

function novaPagina() {
  alert("Criar nova página ou boletim");
}

