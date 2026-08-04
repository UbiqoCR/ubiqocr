/**
 * UbiqoCR — API Client v2
 * Prioridad:
 *   1. Backend Django (localhost)
 *   2. JSONs estáticos en /data/ (Vercel)
 *   3. localStorage (fallback)
 */

const API_URL = (() => {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:8000/api";
  }
  // Cuando tengas Railway listo:
  // return "https://ubiqocr-api-production.up.railway.app/api";
  return null;
})();

const USANDO_API = API_URL !== null;

// ── Archivos JSON estáticos disponibles ─────────────────────
// Agregá aquí cada JSON nuevo que subas a /data/
const DATA_FILES = [
  { file: "/data/epa.json",       negocio: "EPA" },
  { file: "/data/novex.json",     negocio: "Novex" },
  // { file: "/data/lagar.json",  negocio: "El Lagar" },
  { file: "/data/masxmenos.json", negocio: "MasxMenos" },
  { file: "/data/prueba.json",    negocio: "Prueba Comparacion" },
  { file: "/data/walmart.json", negocio: "WalmartCR" },
];

// ── Cache de productos estáticos ────────────────────────────
let _productosCache = null;
let _cacheLoading   = false;
let _cacheCallbacks = [];

async function cargarProductosEstaticos() {
  if (_productosCache !== null) return _productosCache;
  if (_cacheLoading) {
    return new Promise(resolve => _cacheCallbacks.push(resolve));
  }

  _cacheLoading = true;

  const todos = [];
  for (const { file, negocio } of DATA_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(p => {
          if (!p.negocio) p.negocio = negocio;
        });
        todos.push(...data);
        console.log(`✓ ${negocio}: ${data.length} productos cargados`);
      }
    } catch (err) {
      console.warn(`No se pudo cargar ${file}:`, err.message);
    }
  }

  _productosCache = todos;
  _cacheLoading   = false;
  _cacheCallbacks.forEach(cb => cb(todos));
  _cacheCallbacks = [];

  console.log(`✓ Total productos estáticos: ${todos.length}`);
  return todos;
}

// ── Normalizar texto para búsqueda ──────────────────────────
function norm(s) {
  return (s || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ── Buscar en productos estáticos ───────────────────────────
async function buscarEnEstaticos(query, filtros = {}) {
  const productos = await cargarProductosEstaticos();
  if (!productos.length) return null;

  const q = norm(query);
  const palabras = q.split(/\s+/).filter(Boolean);

  const resultados = productos.filter(p => {
    const nombre = norm(p.nombre);
    const cat    = norm(p.categoria);
    return palabras.every(pal => nombre.includes(pal) || cat.includes(pal));
  });

  // Ordenar
  const orden = filtros.orden || "relevance";
  if (orden === "price_asc") {
    resultados.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
  } else if (orden === "price_desc") {
    resultados.sort((a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity));
  } else if (orden === "name_asc") {
    resultados.sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)));
  } else if (orden === "name_desc") {
    resultados.sort((a, b) => norm(b.nombre).localeCompare(norm(a.nombre)));
  }

  // Agrupar por negocio
  const porNegocio = {};
  resultados.forEach(p => {
    const key = p.negocio || "Sin tienda";
    if (!porNegocio[key]) {
      porNegocio[key] = {
        id:         key,
        nombre:     key,
        tipo:       "Tienda",
        ubicacion:  { provincia: "", canton: "", distrito: "" },
        horario:    "",
        telefono:   "",
        whatsapp:   "",
        maps:       "",
        es_premium: false,
        _score:     5,
        productos:  [],
        _raw:       [],
      };
    }
    porNegocio[key]._raw.push(p);
    porNegocio[key].productos.push({
      producto: p.nombre,
      precio:   p.precio,
      moneda:   p.moneda || "CRC",
      imagen:   p.imagen || "",
      url:      p.url    || "",
    });
  });

  return Object.values(porNegocio);
}

// ── Indicador visual ─────────────────────────────────────────
if (USANDO_API) {
  const chip = document.createElement("div");
  chip.style.cssText = `
    position:fixed;bottom:1rem;right:1rem;z-index:9999;
    background:#065f46;color:#6ee7b7;font-size:.75rem;
    font-weight:600;padding:.35rem .75rem;border-radius:999px;
    font-family:monospace;box-shadow:0 2px 8px rgba(0,0,0,.2);
  `;
  chip.textContent = "⚡ API local activa";
  document.body.appendChild(chip);
}

// Pre-cargar los JSON en cuanto carga la página
if (!USANDO_API && DATA_FILES.length > 0) {
  cargarProductosEstaticos();
}

// ── Función principal: buscarProductosAPI ───────────────────
async function buscarProductosAPI(query, filtros = {}) {
  // 1. Django local
  if (USANDO_API) {
    const params = new URLSearchParams({ q: query });
    if (filtros.provincia) params.append("provincia", filtros.provincia);
    if (filtros.canton)    params.append("canton",    filtros.canton);
    if (filtros.distrito)  params.append("distrito",  filtros.distrito);
    if (filtros.orden)     params.append("orden",     filtros.orden);

    try {
      const res = await fetch(`${API_URL}/buscar/?${params}`, {
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.resultados.map(r => ({
        id:         r.negocio_id,
        nombre:     r.negocio_nombre,
        tipo:       r.tipo,
        ubicacion:  { provincia: r.provincia, canton: r.canton, distrito: r.distrito },
        horario:    r.horario,
        telefono:   r.telefono,
        whatsapp:   r.whatsapp,
        maps:       r.maps_url,
        es_premium: r.es_premium,
        _score:     r.score,
        productos:  r.productos.map(p => ({
          producto: p.nombre,
          precio:   parseFloat(p.precio),
          moneda:   p.moneda,
        })),
      }));
    } catch (err) {
      console.warn("API no disponible:", err.message);
    }
  }

  // 2. JSONs estáticos
  if (DATA_FILES.length > 0) {
    const resultados = await buscarEnEstaticos(query, filtros);
    if (resultados !== null) return resultados;
  }

  // 3. localStorage (el index.html lo maneja solo)
  return null;
}

// ── Helpers ──────────────────────────────────────────────────
async function obtenerProvinciasAPI() {
  if (!USANDO_API) return null;
  try {
    const res  = await fetch(`${API_URL}/provincias/`);
    const data = await res.json();
    return data.map(p => p.nombre);
  } catch { return null; }
}

async function obtenerCantonesAPI(provincia) {
  if (!USANDO_API) return null;
  try {
    const res  = await fetch(`${API_URL}/cantones/?provincia=${encodeURIComponent(provincia)}`);
    const data = await res.json();
    return data.map(c => c.nombre);
  } catch { return null; }
}

async function verificarConexionAPI() {
  if (!USANDO_API) return false;
  try {
    const res = await fetch(API_URL.replace("/api", "/health/"), {
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch { return false; }
}
