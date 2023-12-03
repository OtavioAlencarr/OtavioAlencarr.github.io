const menu = document.querySelector(".menu");
const menuButtonOpen = document.querySelector(".menu-button.open");
const menuButtonClose = document.querySelector(".menu-button.close");
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

function toggleMenuShow() {
  menu.classList.toggle("open");
  menuButtonClose.classList.toggle("show");
}

function scrollToSection(event) {}

menuLinks.forEach((link) => {
  link.addEventListener("click", toggleMenuShow);
});

menuButtonOpen.addEventListener("click", toggleMenuShow);
menuButtonClose.addEventListener("click", toggleMenuShow);
