//📁 1. boletins.js (SÓ INDEX)
function getFolders() {
  return JSON.parse(localStorage.getItem("folders")) || [];
}

function saveFolders(folders) {
  localStorage.setItem("folders", JSON.stringify(folders));
}
//📦 RENDER INDEX
function renderPastas() {
  const container = document.getElementById("listaBoletins");
  container.innerHTML = "";

  let folders = getFolders();

  folders.forEach((folder, index) => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <h3>📁 ${folder.nome}</h3>
      <p>📄 ${folder.boletins.length} boletins</p>
    `;

    div.onclick = () => abrirPasta(index);

    container.appendChild(div);
  });
}
//📂 ABRIR PASTA
function abrirPasta(index) {
  localStorage.setItem("pastaAtual", index);
  window.location.href = "boletins.html";
}
//➕ CRIAR PASTA
function criarPasta(nome) {
  if (!nome || nome.trim() === "") {
    alert("Digite um nome válido");
    return;
  }

  let folders = getFolders();

  const existe = folders.some(
    f => f.nome.toLowerCase() === nome.toLowerCase()
  );

  if (existe) {
    alert("Essa pasta já existe!");
    return;
  }

  folders.push({
    nome,
    boletins: []
  });

  saveFolders(folders);
  renderPastas();
}

function novaPasta() {
  let folders = getFolders();
  let numero = folders.length + 1;

  let nome = prompt("Nome da pasta:", `Semana ${numero}`);

  if (!nome) return;

  criarPasta(nome);
}


//🗑️ APAGAR PASTA
function apagarPasta() {
  let folders = getFolders();
  let pastaAtual = localStorage.getItem("pastaAtual");

  let pasta = folders[pastaAtual];

  if (!pasta) {
    alert("Nenhuma pasta selecionada");
    return;
  }

  let confirmar = confirm(`Deseja apagar "${pasta.nome}"?`);

  if (!confirmar) return;

  folders = folders.filter((_, i) => i != pastaAtual);

  saveFolders(folders);
  localStorage.removeItem("pastaAtual");

  alert("Pasta apagada!");

  window.location.href = "/pages/boletins.html";
}

const btn = document.getElementById("deleteFolderBtn");

if (btn) {
  btn.addEventListener("click", apagarPasta);
}

// 🚀 INICIALIZAÇÃO (AQUI)
renderPastas();
function renderPastas() {
  const container = document.getElementById("listaBoletins");
  if (!container) return; // 🔒 proteção
  container.innerHTML = "";

  let folders = getFolders();

  folders.forEach((folder, index) => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <h3 class="folder-name">📁 ${folder.nome}</h3>
      <p>📄 ${folder.boletins.length} boletins</p>
    `;

    // 📂 abrir pasta
    // clique simples = selecionar
div.onclick = () => selecionarPasta(index);

// duplo clique = abrir
div.ondblclick = () => abrirPasta(index);

    // ✏️ editar nome
    const titulo = div.querySelector(".folder-name");

    titulo.addEventListener("click", (e) => {
      e.stopPropagation(); // evita abrir a pasta
      editarPasta(index);
    });

    container.appendChild(div);
  });
}

function selecionarPasta(index) {
  localStorage.setItem("pastaAtual", index);

  // destaque visual (opcional)
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));

  const cards = document.querySelectorAll(".card");
  if (cards[index]) {
    cards[index].classList.add("active");
  }
}


function editarPasta(index) {
  let folders = getFolders();

  let nomeAtual = folders[index].nome;

  let novoNome = prompt("Editar nome da pasta:", nomeAtual);

  if (!novoNome || novoNome.trim() === "") return;

  const existe = folders.some(
    (f, i) => f.nome.toLowerCase() === novoNome.toLowerCase() && i !== index
  );

  if (existe) {
    alert("Já existe uma pasta com esse nome!");
    return;
  }

  folders[index].nome = novoNome;

  saveFolders(folders);

  renderPastas();
}