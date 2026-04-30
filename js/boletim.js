let clipCounter = 0; // CRIAR CONTROLE DE CONTAGEM
let takeCounter = 0; // controle de contagem take
let creatingRow = false; // Adiciona uma variável de controle

const tbody = document.getElementById("tableBody");

const headerFields = [
  "filme", "data", "foto", "produtora",
  "iso", "wb", "fps", "shutter", "resolucao", "card", "cam"
];

const savedHeader = JSON.parse(localStorage.getItem("headerBoletim")) || {};

headerFields.forEach(id => {
  if (savedHeader[id]) {
    document.getElementById(id).textContent = savedHeader[id];
  }
});
if (!savedHeader.data) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  document.getElementById("data").textContent = hoje;
}

// carregar dados salvos
const rawData = localStorage.getItem("boletim");
const savedData = rawData ? JSON.parse(rawData) : [];
// a causa de ter quebrado o codigo
//const savedData = JSON.parse(localStorage.getItem("boletim")) || [];

// função para criar linha
function createRow(data = []) {
  const tr = document.createElement("tr");

  for (let i = 0; i < 9; i++) {
    const td = document.createElement("td");

    // ⭐ STATUS (primeira coluna)
  if (i === 0) {
    td.classList.add("status-cell");
    td.addEventListener("click", (e) => openStatusMenu(e, td));
    td.addEventListener("touchstart", (e) => openStatusMenu(e, td)); //para celular
}

    // TAKE (índice 4)
    else if (i === 4) {
      td.contentEditable = true;
      td.textContent = data[i] || "";

      td.addEventListener("input", saveData);
      td.addEventListener("keydown", e => handleEnter(e, td, tr));
    }

    // 📝 OBS (índice 8)
else if (i === 8) {
  const text = data[i] || "";

  // guarda o texto real
  td.dataset.obs = text;

  // mostra só o ícone
  td.textContent = text ? "📝" : "";

  if (text.trim() !== "") {
    td.classList.add("obs-filled");
  }

  td.addEventListener("click", () => openModal(td));
  
  td.addEventListener("touchstart", () => {
  if (td.dataset.obs) {
    openModal(td);
  }
});

  // tooltip 👇
  td.addEventListener("mouseenter", (e) => {
  showTooltip(e, td.dataset.obs);
});

td.addEventListener("mousemove", moveTooltip);

td.addEventListener("mouseleave", hideTooltip);
}

    // outras colunas
  else {
    td.contentEditable = true;
    td.textContent = data[i] || "";

    td.addEventListener("input", saveData);
    td.addEventListener("keydown", e => handleEnter(e, td, tr));

    // 👇 colunas com repetição
    if ([2, 3, 5, 6, 7].includes(i)) {
      td.addEventListener("dblclick", () => repeatLastValue(td, i));
    }
  }

    tr.appendChild(td);
  }

  return tr;
} 

// função de navegação
function moveToNextCell(td, tr) {
  let next = td.nextElementSibling;

  if (next) {
    focusCell(next);
  } else {
    let nextRow = tr.nextElementSibling;

    if (!nextRow) {
      nextRow = createRow();
      tbody.appendChild(nextRow);
    }

    focusCell(nextRow.firstChild);
  }
}
 

// focar corretamente (inclusive na coluna TAKE)
function focusCell(td) {
  const input = td.querySelector(".take-input");
  if (input) {
    input.focus();
  } else {
    td.focus();
  }
}
if (navigator.vibrate) { // 01
  navigator.vibrate(10);
}
// salvar dados
function saveData() {
  const rows = [];

  document.querySelectorAll("#tableBody tr").forEach(tr => {
    const cells = [];

    tr.querySelectorAll("td").forEach((td, index) => {
      if (index === 8) {
        cells.push(td.dataset.obs || "");
      } else if (index === 0) {
        cells.push("");
      } else {
        cells.push(td.textContent);
      }
    });

    rows.push({
      data: cells,
      status: tr.className
    });
  });

  localStorage.setItem("boletim", JSON.stringify(rows));
  // localStorage.clear();  limpa toda pagina
}

updateStats();

// carregar tabela
if (savedData.length) {
  savedData.forEach(row => {
    const tr = createRow(row.data);
    tr.className = row.status;
    
    const statusCell = tr.querySelector(".status-cell");

    if (row.status === "status-good") statusCell.textContent = "✅";
    if (row.status === "status-bad") statusCell.textContent = "❌";
    if (row.status === "status-best") statusCell.textContent = "⭐";

    tbody.appendChild(tr);
  });

  syncCounters(); // 🔥 mantém contagem
} else {
  for (let i = 0; i < 15; i++) {
    const newRow = createRow();
    tbody.appendChild(newRow);
  }

  syncCounters(); // 🔥 garante início correto
}

updateStats();

// marcar take
function mark(btn, type) {
  const row = btn.closest("tr");

  row.classList.remove("good", "bad", "best");
  row.classList.add(type);

  saveData();
  
}

function handleEnter(e, td, tr) {
  if (e.key === "Enter") {
    e.preventDefault();
    moveToNextCell(td, tr);
  }
}

// salvar topo
headerFields.forEach(id => {
  const el = document.getElementById(id);

  el.addEventListener("input", () => {
    const headerData = {};

    headerFields.forEach(field => {
      headerData[field] = document.getElementById(field).textContent;
    });

    localStorage.setItem("headerBoletim", JSON.stringify(headerData));
  });
});

let currentCell = null;

function openModal(td) {
  currentCell = td;

  const modal = document.getElementById("modal");
  const textarea = document.getElementById("modalText");

  // 👉 pega do dataset, não do textContent
  textarea.value = td.dataset.obs || "";

  modal.style.display = "flex";
  textarea.focus();
}

function closeModal() {
  const modal = document.getElementById("modal");
  const textarea = document.getElementById("modalText");

  if (currentCell) {
    const value = textarea.value;

    // 👉 salva no dataset
    currentCell.dataset.obs = value;

    // 👉 mostra só o ícone
    currentCell.textContent = value ? "📝" : "";

    if (value.trim() !== "") {
      currentCell.classList.add("obs-filled");
    } else {
      currentCell.classList.remove("obs-filled");
    }

    saveData();
  }

  modal.style.display = "none";
}

const tooltip = document.getElementById("tooltip");

function showTooltip(e, text) {
  if (!text) return;

  tooltip.textContent = text;
  tooltip.style.display = "block";

  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
}

function moveTooltip(e) {
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
}

function hideTooltip() {
  tooltip.style.display = "none";
}

const toggleBtn = document.getElementById("toggleHeader");
const headerContainer = document.getElementById("headerContainer");

// carregar estado salvo
const isHidden = localStorage.getItem("headerHidden") === "true";

if (isHidden) {
  headerContainer.style.display = "none";
}

toggleBtn.addEventListener("click", () => {
  if (headerContainer.style.display === "none") {
    headerContainer.style.display = "block";
    localStorage.setItem("headerHidden", "false");
  } else {
    headerContainer.style.display = "none";
    localStorage.setItem("headerHidden", "true");
  }
});


const modal = document.getElementById("modal");

modal.addEventListener("click", function (e) {
  // se clicar no fundo (fora da caixa)
  if (e.target === modal) {
    closeModal();
  }
});


 function syncCounters() {
  const rows = document.querySelectorAll("#tableBody tr");

  takeCounter = 0;
  clipCounter = 0;

  rows.forEach(tr => {
    const take = tr.children[4].textContent.trim();
    const clip = tr.children[1].textContent.trim();

    // TAKE
    const takeMatch = take.match(/\d+/);
    if (takeMatch) {
      const num = Number(takeMatch[0]);
      if (num > takeCounter) takeCounter = num;
    }

    // CLIPE
    const clipMatch = clip.match(/\d+/);
    if (clipMatch) {
      const num = Number(clipMatch[0]);
      if (num > clipCounter) clipCounter = num;
    }
  });
}
// Contador de takes
function updateStats() {
  let good = 0, bad = 0, best = 0;

  document.querySelectorAll("#tableBody tr").forEach(tr => {
    if (tr.classList.contains("status-good")) good++;
    if (tr.classList.contains("status-bad")) bad++;
    if (tr.classList.contains("status-best")) best++;
  });


    // 👇 TOTAL agora é só o que foi marcado
  const total = good + bad + best;

  document.getElementById("total").textContent = total;
  document.getElementById("goodCount").textContent = good;
  document.getElementById("badCount").textContent = bad;
  document.getElementById("bestCount").textContent = best;
 
}

// Menu de marcar a qualidade do take
let currentMenu = null;
let currentStatusCell = null;  // nova funçao para marcar os takes
// mudar status do menu
function openStatusMenu(e, td) {
  closeStatusMenu();


  currentStatusCell = td; // 👈 GUARDA A CÉLULA

  const menu = document.createElement("div");
  menu.className = "status-menu";

  menu.innerHTML = `
  <button class="status-btn" onclick="setStatus('status-good')">✅</button>
  <button class="status-btn" onclick="setStatus('status-bad')">❌</button>
  <button class="status-btn" onclick="setStatus('status-best')">⭐</button>
  <div class="divider"></div>

  <button class="status-btn delete" id="deleteBtn">🧽</button>
  <button class="status-btn clean" onclick="removeEmptyRows()">🗑️</button>
`;

  document.body.appendChild(menu);

  menu.style.left = (e.pageX + 10) + "px";
  menu.style.top = e.pageY - 50 + "px";
  //menu.style.left = e.pageX - 60 + "px";
  //menu.style.left = e.pageX + "px";
  //menu.style.top = e.pageY + "px";

  currentMenu = menu;
}

// aplicar o status
function setStatus(type) {
  if (!currentStatusCell) return;

  const row = currentStatusCell.closest("tr");

  row.classList.remove("status-good", "status-bad", "status-best");
  row.classList.add(type);

  // atualizar ícone
  if (type === "status-good") currentStatusCell.textContent = "✅";
  if (type === "status-bad") currentStatusCell.textContent = "❌";
  if (type === "status-best") currentStatusCell.textContent = "⭐";

  saveData();
  closeStatusMenu();
}


// fechar ao clicar fora
function closeStatusMenu() {
  if (currentMenu) {
    currentMenu.remove();
    currentMenu = null;
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".status-menu") && !e.target.closest(".status-cell")) {
    closeStatusMenu();
  }
});

/*resetar o clip
function resetClipCounter() {
  clipCounter = 0;
  closeStatusMenu();
} */

function removeEmptyRows() {
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach(tr => {
    const cells = tr.querySelectorAll("td");

    let isEmpty = true;

    cells.forEach((td, index) => {
      if (index === 0) return; // ignora STATUS
      if (index === 8 && td.dataset.obs) isEmpty = false;

      if (td.textContent.trim() !== "") {
        isEmpty = false;
      }
    });

    if (isEmpty) {
      tr.remove();
    }
  });

  saveData();
  updateStats();
}

// LIMPAR TODAS AS CELULAS 

function clearRow() {
  if (!currentStatusCell) return;

  const row = currentStatusCell.closest("tr");

  row.querySelectorAll("td").forEach((td, index) => {
    // não mexe na coluna OBS (tratamento especial)
    if (index === 8) {
      td.dataset.obs = "";
      td.textContent = "";
      td.classList.remove("obs-filled");
    }
    // não mexe na coluna STATUS (ícone)
    else if (index === 0) {
      td.textContent = "";
    }
    else {
      td.textContent = "";
    }
  });

  // remove status da linha
  row.classList.remove("status-good", "status-bad", "status-best");

  saveData();
  updateStats();
  closeStatusMenu();
} 

// BOTAO (TOQUE LONGO) PARA LIMPAR
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


//função para pegar último valor
function getLastValue(colIndex) { // 1º
  const rows = document.querySelectorAll("#tableBody tr");
  let last = 0;

  rows.forEach(tr => {
    const td = tr.children[colIndex];
    const value = parseInt(td.textContent);

    if (!isNaN(value) && value > last) {
      last = value;
    }
  });

  return last;
}
// função de formatação TAKE
function formatTake(num) {
  return "T" + String(num).padStart(3, "0");
}

function getNextTake() {
  const rows = document.querySelectorAll("#tableBody tr");

  let lastNumber = 0;

  // 🔥 percorre DE BAIXO PRA CIMA
  for (let i = rows.length - 1; i >= 0; i--) {
    const value = rows[i].children[4].textContent.trim();

    const match = value.match(/\d+/);
    if (match) {
      lastNumber = Number(match[0]);
      break;
    }
  }

  return lastNumber + 1;
}
//botão TAKE
document.getElementById("addTake").addEventListener("click", (e) => {
  e.preventDefault();

  const rows = document.querySelectorAll("#tableBody tr");

  let emptyRow = null;

  rows.forEach(tr => {
    const cell = tr.children[4]; // coluna TAKE
    const value = cell.textContent.trim();

    if (!value && !emptyRow) {
      emptyRow = tr;
    }
  });

  // 👉 incrementa contador
  //takeCounter++;
  //const newTake = formatTake(takeCounter);
  const newTake = formatTake(getNextTake());

  if (emptyRow) {
    emptyRow.children[4].textContent = newTake;
    emptyRow.children[4].focus();
  } else {
    const newRow = createRow();
    newRow.children[4].textContent = newTake;

    tbody.appendChild(newRow);
    newRow.children[4].focus();
  }

  saveData();
});

//mostrar formatado (C001)
function formatClip(num) {
  return "C" + String(num).padStart(3, "0");
}

// CRIAR FUNÇÃO (GLOBAL) REPETIR CELULAS
function repeatLastValue(td, colIndex) {
  const rows = document.querySelectorAll("#tableBody tr");

  let lastValue = "";

  rows.forEach(tr => {
    const cell = tr.children[colIndex];
    const value = cell.textContent.trim();

    if (value) {
      lastValue = value;
    }

    // para quando chegar na linha atual
    if (tr === td.parentElement) return;
  });

  if (lastValue) {
    td.textContent = lastValue;
    saveData();
  }
}

//botão CLIPE
document.getElementById("addClip").addEventListener("click", (e) => {
  e.preventDefault();

  const rows = document.querySelectorAll("#tableBody tr");

  let emptyRow = null;

  rows.forEach(tr => {
    const cell = tr.children[1];
    const value = cell.textContent.trim();

    if (!value && !emptyRow) {
      emptyRow = tr;
    }
  });

  // 👉 incrementa contador
  clipCounter++;

  const newClip = "C" + String(clipCounter).padStart(3, "0");

  if (emptyRow) {
    emptyRow.children[1].textContent = newClip;
    emptyRow.children[1].focus();
  } else {
    const newRow = createRow();
    newRow.children[1].textContent = newClip;

    tbody.appendChild(newRow);
    newRow.children[1].focus();
  }

  saveData();
});

let pressTimer;

document.addEventListener("click", (e) => {
  if (e.target.closest("#deleteBtn")) {
    clearRow();
  }
});

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.addEventListener("touchstart", (e) => {
    if (e.target.closest("#deleteBtn")) {
      const btn = e.target.closest("#deleteBtn");

      btn.classList.add("holding");

      pressTimer = setTimeout(() => {
        clearRow();
      }, 2000);
    }
  });

  document.addEventListener("touchend", (e) => {
    if (e.target.closest("#deleteBtn")) {
      const btn = e.target.closest("#deleteBtn");

      btn.classList.remove("holding");
      clearTimeout(pressTimer);
    }
  });
}


// FUNÇAO EXPORTAR PDF
function exportPDF() {
  const element = document.getElementById("boletimExport");

  // esconder UI
  const ui = document.querySelectorAll(".actions, #exportMenu, .back-btn");
  ui.forEach(el => el.style.display = "none");

  // mostrar observações reais
  const obsCells = document.querySelectorAll("#tableBody td:nth-child(9)");
  obsCells.forEach(td => {
    if (td.dataset.obs) {
      td.textContent = td.dataset.obs;
    }
  });

  // abrir impressão
  setTimeout(() => {
    window.print();

    // restaurar tudo depois
    ui.forEach(el => el.style.display = "");
    obsCells.forEach(td => {
      td.textContent = td.dataset.obs ? "📝" : "";
    });

  }, 300);
}
/* function exportPDF() {
  const element = document.getElementById("boletimExport");

  // 🔥 GRADE
  const gradeBtn = document.getElementById("gradeBtn");
  const gradeInfo = document.createElement("div");

  gradeInfo.textContent = "CÂMERA: " + gradeBtn.textContent;
  gradeInfo.style.fontWeight = "bold";
  gradeInfo.style.margin = "10px 0";

  element.insertBefore(gradeInfo, element.firstChild);

  // 🔥 esconder UI
  const ui = document.querySelectorAll(".actions, #exportMenu, .back-btn");
  ui.forEach(el => el.style.display = "none");

  // 🔥 observações
  const obsCells = document.querySelectorAll("#tableBody td:nth-child(9)");
  obsCells.forEach(td => {
    if (td.dataset.obs) {
      td.textContent = td.dataset.obs;
    }
  });

  // 🔥 tabela
  const tableContainer = document.querySelector(".table-container");
  const originalOverflow = tableContainer.style.overflow;
  const originalHeight = tableContainer.style.height;

  tableContainer.style.overflow = "visible";
  tableContainer.style.height = "auto";

  // 🔥 HEADER
  const header = document.querySelector(".header");
  const groups = document.querySelectorAll(".header-group");
  const headerItems = document.querySelectorAll(".header-group div");

  const originalDisplay = header.style.display;
  const originalFlexWrap = header.style.flexWrap;
  const originalGap = header.style.gap;

  // 👉 compactar + organizar
  header.style.display = "flex";
  header.style.flexWrap = "wrap";
  header.style.gap = "2px";

  groups.forEach(group => {
    group.style.flex = "1 1 180px";
    group.style.gap = "1px";
    group.style.margin = "0";
  });

  headerItems.forEach(item => {
    item.style.whiteSpace = "nowrap";
    item.style.margin = "0";
    item.style.lineHeight = "1.1";
  });

    // 🔥 salvar tamanho atual
    const originalFont = element.style.fontSize;
    const originalWidth = element.style.width;

    // 🔥 compactar tudo
    element.style.fontSize = "12px";
    element.style.width = "1120px";
  // 🔥 PDF
  html2pdf()
    .set({
      margin: 5,
      filename: `boletim_${document.getElementById("filme").textContent || "sem_nome"}.pdf`,
      html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
      jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
      pagebreak: { mode: ['css', 'legacy'] }
    })
    .from(element)
    .save()
    .finally(() => {

      // 🔥 restaurar tamanho
      element.style.fontSize = originalFont;
      element.style.width = originalWidth;

      // 🔥 restaurar header
      header.style.display = "flex";
      header.style.flexWrap = "wrap";
      header.style.gap = "2px";
      header.style.fontSize = "11px"; // 🔥 essencial

      groups.forEach(group => {
        group.style.flex = "1 1 140px"; // 🔥 menor = menos espaço
        group.style.gap = "1px";
        group.style.margin = "0";
      });

      headerItems.forEach(item => {
        item.style.whiteSpace = "nowrap";
        item.style.margin = "0";
        item.style.lineHeight = "1.1"; // 🔥 mais compacto
      });

      // 🔥 restaurar UI
      ui.forEach(el => el.style.display = "");

      // 🔥 restaurar observações
      obsCells.forEach(td => {
        td.textContent = td.dataset.obs ? "📝" : "";
      });

      // 🔥 restaurar tabela
      tableContainer.style.overflow = originalOverflow;
      tableContainer.style.height = originalHeight;

      // 🔥 remover grade
      gradeInfo.remove();
    });
} */


// FUNÇAO EXPORTAR IMAGEM
function exportImage() {
  const element = document.querySelector("table");

  html2canvas(element).then(canvas => {
    const link = document.createElement("a");
    link.download = "boletim.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// SALVAR (estrutura para página futura)
function saveProject() {
  const data = localStorage.getItem("boletim");

  let folders = JSON.parse(localStorage.getItem("folders")) || [];

  const semana = prompt("Semana (1, 2, 3...)");

  if (!semana) return;

  const nomePasta = "Semana " + semana;

  let pasta = folders.find(f => f.nome === nomePasta);

  if (!pasta) {
    pasta = {
      nome: nomePasta,
      boletins: []
    };
    folders.push(pasta);
  }

  const agora = new Date();

  pasta.boletins.push({
  titulo: "Boletim - " + agora.toLocaleDateString("pt-BR"),
  conteudo: data ? JSON.parse(data) : [],
  //conteudo: JSON.parse(data),
  data: agora.toLocaleString()
});
  /*pasta.boletins.push({
    nome: "Boletim - " + agora.toLocaleDateString("pt-BR"),
    data: JSON.parse(data),
    dataCriacao: agora.toISOString()
  }); */

  localStorage.setItem("folders", JSON.stringify(folders));

  alert("Salvo em " + nomePasta);
}


// COMPARTILHAR
function shareData() {
  const text = "Confira meu boletim de filmagem 🎬";

  if (navigator.share) {
    navigator.share({
      title: "Boletim",
      text: text,
    });
  } else {
    alert("Compartilhamento não suportado nesse dispositivo");
  }
}

// MENU EXPORTAR (versão com animação)
const exportBtn = document.getElementById("exportBtn");
const exportMenu = document.getElementById("exportMenu");

if (exportBtn && exportMenu) {

  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle("active");
  });

  // fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#exportMenu") && !e.target.closest("#exportBtn")) {
      exportMenu.classList.remove("active");
    }
  });

}
// CAM A, B, C, D
const gradeBtn = document.getElementById("gradeBtn");

const grades = ["A", "B", "C", "D"];
let currentIndex = 0;

// carregar
const savedGrade = localStorage.getItem("grade");
if (savedGrade) {
  currentIndex = grades.indexOf(savedGrade);
}

// aplicar estado inicial
updateGrade();


gradeBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % grades.length;
  updateGrade();
});

function updateGrade() {
  const grade = grades[currentIndex];

  gradeBtn.textContent = grade;

  // limpa classes antigas
  gradeBtn.classList.remove("grade-A", "grade-B", "grade-C", "grade-D");

  // adiciona nova
  gradeBtn.classList.add(`grade-${grade}`);

  // dentro do updateGrade()
localStorage.setItem("grade", grade);
}