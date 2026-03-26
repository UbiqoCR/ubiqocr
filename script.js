// Utilidades
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener("DOMContentLoaded", () => {
  // Año en el footer
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // ---------------------------
  // GALERÍAS (lightbox simple)
  // ---------------------------
  // Definimos las rutas por galería (puedes agregar/quitar imágenes)
  const GALLERIES = {
    cafe1: [
      "../assets/img/cafeteria1/1.jpg",
      "../assets/img/cafeteria1/2.jpg",
      "../assets/img/cafeteria1/3.jpg",
      "../assets/img/cafeteria1/4.jpg",
      "../assets/img/cafeteria1/5.jpg"
    ]
  };

  // Crea el lightbox una sola vez
  initLightbox(GALLERIES);

  // Delegación: botones de thumbs o hero para abrir
  document.body.addEventListener("click", (ev) => {
    const thumb = ev.target.closest("[data-gallery][data-index]");
    if (!thumb) return;

    const galleryKey = thumb.getAttribute("data-gallery");
    const startIndex = parseInt(thumb.getAttribute("data-index") || "0", 10);
    openLightbox(galleryKey, startIndex);
  });
});

/* ====== Lightbox ====== */
let LB_STATE = { key: null, index: 0, data: null };

function initLightbox(GALLERIES){
  // overlay
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = `
    <div class="lightbox-inner" role="dialog" aria-label="Galería de imágenes">
      <button class="close" aria-label="Cerrar galería"></button>
      <button class="nav-btn prev" aria-label="Imagen anterior"></button>
      <img id="lightbox-img" src="" alt="Imagen de la galería">
      <button class="nav-btn next" aria-label="Siguiente imagen"></button>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = $("#lightbox-img");

  function render(){
    if (!LB_STATE.data) return;
    imgEl.src = LB_STATE.data[LB_STATE.index];
  }

  function show(){
    overlay.classList.add("open");
    render();
    // Escuchas de teclado
    document.addEventListener("keydown", onKey);
  }
  function hide(){
    overlay.classList.remove("open");
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e){
    if (e.key === "Escape") hide();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }
  function next(){
    LB_STATE.index = (LB_STATE.index + 1) % LB_STATE.data.length;
    render();
  }
  function prev(){
    LB_STATE.index = (LB_STATE.index - 1 + LB_STATE.data.length) % LB_STATE.data.length;
    render();
  }

  overlay.querySelector(".close").addEventListener("click", hide);
  overlay.querySelector(".next").addEventListener("click", next);
  overlay.querySelector(".prev").addEventListener("click", prev);
  overlay.addEventListener("click", (e) => {
    // Clic fuera de la imagen cierra
    if (e.target.classList.contains("lightbox")) hide();
  });

  // Exponer funciones globales simples:
  window.openLightbox = (key, index=0) => {
    const arr = (GALLERIES[key] || []).filter(Boolean);
    if (!arr.length) return;
    LB_STATE = { key, index, data: arr };
    show();
  };
}

function openLightbox(key, index=0){
  if (typeof window.openLightbox === "function"){
    window.openLightbox(key, index);
  }
}