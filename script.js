const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener("DOMContentLoaded", () => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
});

function toggleMenuMovil() {
  var m = document.getElementById('menuMovil');
  m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function cerrarMenuMovil() {
  var m = document.getElementById('menuMovil');
  if (m) m.style.display = 'none';
}