function abrirModal() {
  const hasUser = localStorage.getItem("user");

  if (hasUser) {
    localStorage.removeItem("user");
    window.location.reload();

    return;
  }

  const modal = document.getElementById("janela-modal");
  
  const menu = document.querySelector(".menu");
  const menuButtonClose = document.querySelector(".menu-button.close");

  menu.classList.remove("open");
  menuButtonClose.classList.remove("show");

  modal.classList.add("abrir");

  modal.addEventListener("click", (e) => {
    if (e.target.id == "fechar" || e.target.id == "janela-modal") {
      modal.classList.remove("abrir");
    }
  });

  const mode = document.getElementById("mode_icon");

  mode.addEventListener("click", () => {
    const form = document.getElementById("login_form");

    if (mode.classList.contains("fa-moon")) {
      mode.classList.remove("fa-moon");
      mode.classList.add("fa-sun");

      form.classList.add("dark");
      return;
    }

    mode.classList.remove("fa-sun");
    mode.classList.add("fa-moon");

    form.classList.remove("dark");
  });
}
