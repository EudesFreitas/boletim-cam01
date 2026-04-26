function irPara(Pagina) {
  window.location.href = Pagina;
}

function irParaProjeto() {
  window.location.href = 'projeto.html';
}

function novaPagina() {
  alert("Aqui você pode criar uma nova página ou projeto futuramente.");
}

// tema claro escuro
const html = document.documentElement;
const button = document.getElementById("toggleTheme");

// aplica tema salvo em TODAS as páginas
const temaSalvo = localStorage.getItem("theme");

if (temaSalvo === "dark") {
  html.setAttribute("data-theme", "dark");
}

// botão só no index (se existir)
if (button) {
  button.textContent = temaSalvo === "dark" ? "☀️" : "🌙";

  button.addEventListener("click", () => {
    if (html.getAttribute("data-theme") === "dark") {
      html.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      button.textContent = "🌙";
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      button.textContent = "☀️";
    }
  });
}