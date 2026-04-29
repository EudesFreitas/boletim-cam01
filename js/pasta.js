const tema = localStorage.getItem("theme");
  if (tema) {
    document.documentElement.setAttribute("data-theme", tema);
  }

function voltar() {
  window.location.href = "boletins.html";
}

function getFolders() {
  return JSON.parse(localStorage.getItem("folders")) || [];
}

function saveFolders(folders) {
  localStorage.setItem("folders", JSON.stringify(folders));
}


function renderBoletins() {
  let folders = getFolders();
  let pastaAtual = localStorage.getItem("pastaAtual");

  let pasta = folders[pastaAtual];

  if (!pasta) {
    alert("Pasta não encontrada");
    window.location.href = "boletins.html";
    return;
  }

  document.getElementById("tituloPasta").innerText = "📁 " + pasta.nome;

  const container = document.querySelector(".container");
  container.innerHTML = "";

  let lista = pasta.boletins || [];

  lista.forEach((boletim, index) => {
    const div = document.createElement("div");
    div.classList.add("card");

    let titulo = typeof boletim === "string"
      ? boletim
      : boletim.titulo;

     div.innerHTML = `
        <div class="card-content">
            <span>📄 ${titulo}</span>
            <button class="delete-btn">🗑️</button>
        </div>
        <small>${boletim.data || ""}</small>
        `; 
    //div.innerHTML = `📄 ${titulo}`;
    //<br>
    //<small>${boletim.data || ""}</small>
    //`;
    // abrir boletim
    div.onclick = () => abrirBoletim(index);
    // 🔥 ATIVAR BOTÃO
    const btn = div.querySelector(".delete-btn");

    btn.onclick = (e) => {
        e.stopPropagation();
        apagarBoletim(index);
    };


    container.appendChild(div);
  });
} 

function corrigirBoletins() {
  let folders = getFolders();

  folders.forEach(folder => {
    folder.boletins = (folder.boletins || []).map(b => {
      if (typeof b === "string") {
        return {
          titulo: b,
          conteudo: "",
          data: new Date().toLocaleDateString()
        };
      }
      return b;
    });
  });

  saveFolders(folders);
}

// roda só uma vez
if (!localStorage.getItem("migradoBoletins")) {
  corrigirBoletins();
  localStorage.setItem("migradoBoletins", "true");
}



// 🗑️ apagar boletim
function apagarBoletim(index) {
  let folders = getFolders();
  let pastaAtual = localStorage.getItem("pastaAtual");

  let confirmar = confirm("Apagar este boletim?");
  if (!confirmar) return;

  folders[pastaAtual].boletins.splice(index, 1);

  saveFolders(folders);

  renderBoletins();
}

function abrirBoletim(index) {
  localStorage.setItem("boletimAtual", index);
  window.location.href = "boletim.html";
}

renderBoletins(); 

