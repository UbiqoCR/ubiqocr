/**
 * UbiqoCR — Canasta Basica
 * Instalacion: <script src="canasta.js"></script> despues de api.js
 */

const CANASTA_BASICA = [
  { id: 'leche',       nombre: 'Leche entera',        categoria: 'Lacteos',     keywords: ['leche','entera'] },
  { id: 'queso',       nombre: 'Queso blanco',         categoria: 'Lacteos',     keywords: ['queso','blanco','fresco'] },
  { id: 'carne_res',   nombre: 'Carne de res molida',  categoria: 'Carnes',      keywords: ['carne','res','molida'] },
  { id: 'pollo',       nombre: 'Pechuga de pollo',     categoria: 'Carnes',      keywords: ['pechuga','pollo'] },
  { id: 'atun',        nombre: 'Atun en lata',         categoria: 'Carnes',      keywords: ['atun','tuna'] },
  { id: 'frijoles_n',  nombre: 'Frijoles negros',      categoria: 'Leguminosas', keywords: ['frijol','frijoles','negro','negros'] },
  { id: 'frijoles_r',  nombre: 'Frijoles rojos',       categoria: 'Leguminosas', keywords: ['frijol','frijoles','rojo','rojos'] },
  { id: 'tomate',      nombre: 'Tomate',               categoria: 'Vegetales',   keywords: ['tomate'] },
  { id: 'cebolla',     nombre: 'Cebolla',              categoria: 'Vegetales',   keywords: ['cebolla'] },
  { id: 'chayote',     nombre: 'Chayote',              categoria: 'Vegetales',   keywords: ['chayote'] },
  { id: 'repollo',     nombre: 'Repollo',              categoria: 'Vegetales',   keywords: ['repollo'] },
  { id: 'zanahoria',   nombre: 'Zanahoria',            categoria: 'Vegetales',   keywords: ['zanahoria'] },
  { id: 'papa',        nombre: 'Papa',                 categoria: 'Vegetales',   keywords: ['papa','papas'] },
  { id: 'chile',       nombre: 'Chile dulce',          categoria: 'Vegetales',   keywords: ['chile','chiles'] },
  { id: 'banano',      nombre: 'Banano',               categoria: 'Frutas',      keywords: ['banano','bananos','banana'] },
  { id: 'naranja',     nombre: 'Naranja',              categoria: 'Frutas',      keywords: ['naranja','naranjas'] },
  { id: 'papaya',      nombre: 'Papaya',               categoria: 'Frutas',      keywords: ['papaya'] },
  { id: 'arroz',       nombre: 'Arroz',                categoria: 'Cereales',    keywords: ['arroz'] },
  { id: 'pan',         nombre: 'Pan de molde',         categoria: 'Cereales',    keywords: ['pan','molde'] },
  { id: 'pasta',       nombre: 'Pasta spaghetti',      categoria: 'Cereales',    keywords: ['pasta','spaghetti','fideos'] },
  { id: 'tortilla',    nombre: 'Tortilla de maiz',     categoria: 'Cereales',    keywords: ['tortilla','maiz'] },
  { id: 'aceite',      nombre: 'Aceite vegetal',       categoria: 'Aceites',     keywords: ['aceite','vegetal'] },
  { id: 'margarina',   nombre: 'Margarina',            categoria: 'Aceites',     keywords: ['margarina'] },
  { id: 'azucar',      nombre: 'Azucar',               categoria: 'Otros',       keywords: ['azucar','azucar'] },
  { id: 'cafe',        nombre: 'Cafe molido',          categoria: 'Otros',       keywords: ['cafe','molido'] },
];

// Palabras que EXCLUYEN un resultado de ciertos productos
var EXCLUSIONES = {
  'leche':      ['condensada','condensado','paleta','helado','polvo','cocoa','chocolate','saborizada','descremada','formula','bebe','infantil','cereal','galleta'],
  'queso':      ['crema','ricotta','feta','parmesano','cheetos','snack'],
  'arroz':      ['cereal','snack','galleta','tortilla','harina'],
  'pan':        ['rallado','molido','tostado'],
  'aceite':     ['esencial','perfume','coco','oliva','motor'],
  'frijoles_n': ['rojo','rojos','colorado'],
  'frijoles_r': ['negro','negros'],
};

var _canastaItems = JSON.parse(localStorage.getItem('ubiqo_canasta') || 'null')
  || CANASTA_BASICA.map(function(p) { return { id:p.id, nombre:p.nombre, categoria:p.categoria, keywords:p.keywords, activo:true }; });

function guardarCanasta() {
  localStorage.setItem('ubiqo_canasta', JSON.stringify(_canastaItems));
}

function normN(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').trim();
}

function buscarProductos(item, todos) {
  var keywords = item.keywords || normN(item.nombre).split(/\s+/).filter(function(w){ return w.length>2; });
  var exclusiones = EXCLUSIONES[item.id] || [];
  var nb_item = normN(item.nombre);

  var resultados = todos.filter(function(p) {
    if (!p.precio) return false;
    var nb = normN(p.nombre);

    // Debe contener AL MENOS UNA keyword principal
    var tieneKeyword = keywords.some(function(k) { return nb.includes(k); });
    if (!tieneKeyword) return false;

    // No debe contener palabras de exclusion
    var tieneExclusion = exclusiones.some(function(e) { return nb.includes(e); });
    if (tieneExclusion) return false;

    return true;
  });

  // Puntuar y ordenar por relevancia
  resultados = resultados.map(function(p) {
    var nb = normN(p.nombre);
    var score = 0;

    // Cuantas keywords coinciden
    keywords.forEach(function(k) { if (nb.includes(k)) score += 2; });

    // Bonus si el nombre empieza con la primera keyword
    if (nb.startsWith(keywords[0])) score += 3;

    // Bonus si el nombre es corto (mas especifico)
    if (p.nombre.length < 30) score += 1;

    // Penalizar nombres muy largos
    if (p.nombre.length > 60) score -= 1;

    return Object.assign({}, p, { _score: score });
  });

  resultados.sort(function(a,b){ return b._score - a._score; });
  return resultados;
}

// ── Boton en header ───────────────────────────────────────────
function initCanasta() {
  if (document.getElementById('btnCanasta')) return;
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var li = document.createElement('li');
  li.innerHTML = '<a href="#" id="btnCanasta" onclick="abrirCanasta();return false;" style="display:flex;align-items:center;gap:.35rem;padding:.45rem .85rem;border-radius:999px;font-size:.875rem;font-weight:500;color:#64748b;transition:all 180ms;">Canasta basica</a>';
  menu.appendChild(li);
}

// ── Modal principal ───────────────────────────────────────────
function abrirCanasta() {
  if (document.getElementById('modalCanasta')) {
    document.getElementById('modalCanasta').remove();
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'modalCanasta';
  modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:2000;display:flex;flex-direction:column;font-family:\'DM Sans\',system-ui,sans-serif;overflow:hidden;';

  modal.innerHTML =
    '<div style="padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">'
    + '<div><div style="font-weight:700;font-size:1.05rem;color:#0f172a;">Canasta Basica</div><div style="font-size:.75rem;color:#64748b;">Lista oficial INEC Costa Rica</div></div>'
    + '<button onclick="document.getElementById(\'modalCanasta\').remove()" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:.4rem .875rem;font:inherit;font-size:.875rem;cursor:pointer;color:#64748b;">Cerrar</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:340px 1fr;flex:1;overflow:hidden;" id="canastaGrid">'
    + '<div style="border-right:1px solid #e2e8f0;overflow-y:auto;display:flex;flex-direction:column;">'
    + '<div style="padding:.75rem 1.25rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">'
    + '<span style="font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Productos</span>'
    + '<div style="display:flex;gap:.5rem;">'
    + '<button onclick="toggleTodosCanasta(true)" style="font:inherit;font-size:.72rem;padding:.25rem .6rem;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff;">Todos</button>'
    + '<button onclick="toggleTodosCanasta(false)" style="font:inherit;font-size:.72rem;padding:.25rem .6rem;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff;">Ninguno</button>'
    + '<button onclick="compararCanasta()" style="font:inherit;font-size:.78rem;font-weight:600;padding:.25rem .75rem;border:none;border-radius:6px;cursor:pointer;background:#2563eb;color:#fff;">Comparar</button>'
    + '</div></div>'
    + '<div id="canastaLista" style="flex:1;overflow-y:auto;padding:.5rem 0;"></div>'
    + '<div style="padding:.75rem 1.25rem;border-top:1px solid #e2e8f0;background:#f8fafc;flex-shrink:0;">'
    + '<div style="font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.4rem;">Agregar producto</div>'
    + '<div style="display:flex;gap:.4rem;">'
    + '<input id="canastaCustomInput" type="text" placeholder="Ej: Aceite de oliva" style="flex:1;padding:.45rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.82rem;outline:none;">'
    + '<button onclick="agregarProductoCustom()" style="padding:.45rem .875rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;">+</button>'
    + '</div></div>'
    + '</div>'
    + '<div id="canastaComparacion" style="overflow-y:auto;padding:1.5rem;display:flex;align-items:center;justify-content:center;">'
    + '<div style="text-align:center;color:#94a3b8;"><div style="font-size:.95rem;font-weight:500;margin-bottom:.4rem;">Selecciona los productos</div>'
    + '<div style="font-size:.82rem;">y haz clic en "Comparar" para ver en cual tienda te sale mas barata la canasta</div>'
    + '</div></div>'
    + '</div>';

  document.body.appendChild(modal);

  if (window.innerWidth < 700) {
    document.getElementById('canastaGrid').style.gridTemplateColumns = '1fr';
    document.getElementById('canastaComparacion').style.display = 'none';
  }

  renderCanastaLista();
}

function renderCanastaLista() {
  var el = document.getElementById('canastaLista');
  if (!el) return;
  var categorias = {};
  _canastaItems.forEach(function(item) {
    if (!categorias[item.categoria]) categorias[item.categoria] = [];
    categorias[item.categoria].push(item);
  });
  var html = '';
  Object.keys(categorias).forEach(function(cat) {
    html += '<div style="padding:.35rem 1.25rem .2rem;font-size:.65rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">' + cat + '</div>';
    categorias[cat].forEach(function(item) {
      var checked = item.activo ? 'checked' : '';
      html += '<div style="display:flex;align-items:center;gap:.625rem;padding:.4rem 1.25rem;cursor:pointer;" onclick="toggleItemCanasta(\'' + item.id + '\')">'
        + '<input type="checkbox" ' + checked + ' style="width:16px;height:16px;cursor:pointer;accent-color:#2563eb;" onclick="event.stopPropagation();toggleItemCanasta(\'' + item.id + '\')">'
        + '<span style="font-size:.875rem;color:#0f172a;flex:1;">' + item.nombre + '</span>'
        + (item.custom ? '<button onclick="event.stopPropagation();eliminarItemCanasta(\'' + item.id + '\')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:.75rem;padding:.1rem .3rem;">x</button>' : '')
        + '</div>';
    });
  });
  el.innerHTML = html;
}

function toggleItemCanasta(id) {
  var item = _canastaItems.find(function(i) { return i.id === id; });
  if (item) { item.activo = !item.activo; guardarCanasta(); renderCanastaLista(); }
}

function toggleTodosCanasta(valor) {
  _canastaItems.forEach(function(i) { i.activo = valor; });
  guardarCanasta();
  renderCanastaLista();
}

function eliminarItemCanasta(id) {
  _canastaItems = _canastaItems.filter(function(i) { return i.id !== id; });
  guardarCanasta();
  renderCanastaLista();
}

function agregarProductoCustom() {
  var input = document.getElementById('canastaCustomInput');
  var nombre = input && input.value.trim();
  if (!nombre) return;
  var id = 'custom_' + Date.now();
  var kws = normN(nombre).split(/\s+/).filter(function(w){ return w.length>2; });
  _canastaItems.push({ id:id, nombre:nombre, categoria:'Personalizados', keywords:kws, activo:true, custom:true });
  guardarCanasta();
  renderCanastaLista();
  if (input) input.value = '';
}

// ── Comparacion por tienda ────────────────────────────────────
async function compararCanasta() {
  var activos = _canastaItems.filter(function(i) { return i.activo; });
  if (!activos.length) { alert('Selecciona al menos un producto.'); return; }

  var panel = document.getElementById('canastaComparacion');
  if (!panel) return;
  panel.style.display = '';
  panel.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">Buscando precios en todas las tiendas...</div>';

  var todos = [];
  if (typeof cargarProductosEstaticos === 'function') {
    try { todos = await cargarProductosEstaticos(); } catch(e) {}
  }

  var resumenTiendas = {};
  var detalle = [];

  activos.forEach(function(item) {
    var similares = buscarProductos(item, todos);

    var porTienda = {};
    similares.forEach(function(p) {
      var t = p.negocio || 'Sin tienda';
      if (!porTienda[t] || p.precio < porTienda[t].precio) {
        porTienda[t] = { precio:p.precio, nombre:p.nombre, imagen:p.imagen||'', url:p.url||'' };
      }
    });

    var tiendas = Object.keys(porTienda);
    detalle.push({
      buscado: item.nombre,
      tiendas: porTienda,
      encontrado: tiendas.length > 0,
    });

    tiendas.forEach(function(t) {
      if (!resumenTiendas[t]) resumenTiendas[t] = { total:0, encontrados:0 };
      resumenTiendas[t].total += porTienda[t].precio;
      resumenTiendas[t].encontrados++;
    });
  });

  var tiendasOrdenadas = Object.keys(resumenTiendas).sort(function(a,b) {
    return resumenTiendas[a].total - resumenTiendas[b].total;
  });

  var totalActivos = activos.length;
  var html = '';

  html += '<div style="margin-bottom:1.5rem;">'
    + '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.75rem;">Total de la canasta por tienda</div>';

  tiendasOrdenadas.forEach(function(t, i) {
    var info = resumenTiendas[t];
    var pct = Math.round(info.encontrados / totalActivos * 100);
    var esMejor = i === 0;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:.6rem .875rem;margin-bottom:.4rem;border-radius:10px;background:' + (esMejor?'#ecfdf5':'#f8fafc') + ';border:1px solid ' + (esMejor?'#16a34a':'#e2e8f0') + ';">'
      + '<div><div style="font-weight:' + (esMejor?'700':'500') + ';font-size:.9rem;color:' + (esMejor?'#16a34a':'#0f172a') + ';">' + t + '</div>'
      + '<div style="font-size:.72rem;color:#64748b;">' + info.encontrados + ' de ' + totalActivos + ' productos encontrados (' + pct + '%)</div></div>'
      + '<div style="font-size:1.1rem;font-weight:800;color:' + (esMejor?'#16a34a':'#0f172a') + ';">₡' + info.total.toLocaleString('es-CR') + '</div>'
      + '</div>';
  });

  if (tiendasOrdenadas.length > 1) {
    var ahorro = resumenTiendas[tiendasOrdenadas[tiendasOrdenadas.length-1]].total - resumenTiendas[tiendasOrdenadas[0]].total;
    html += '<div style="padding:.625rem .875rem;background:#eff6ff;border-radius:8px;font-size:.82rem;color:#1d4ed8;font-weight:600;margin-top:.5rem;">Ahorras hasta ₡' + ahorro.toLocaleString('es-CR') + ' comprando en ' + tiendasOrdenadas[0] + '</div>';
  }
  html += '</div>';

  html += '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.75rem;">Desglose por producto</div>';

  detalle.forEach(function(d) {
    html += '<div style="margin-bottom:.875rem;padding:.875rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">';
    html += '<div style="font-size:.85rem;font-weight:600;color:#0f172a;margin-bottom:.4rem;">' + d.buscado + '</div>';
    if (!d.encontrado) {
      html += '<div style="font-size:.75rem;color:#94a3b8;">No encontrado en ninguna tienda</div>';
    } else {
      var ts = Object.keys(d.tiendas).sort(function(a,b){ return d.tiendas[a].precio - d.tiendas[b].precio; });
      ts.forEach(function(t, i) {
        var p = d.tiendas[t];
        html += '<div style="display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:1px dashed #e2e8f0;font-size:.78rem;' + (i===0?'color:#16a34a;font-weight:700;':'color:#64748b;') + '">'
          + '<span>' + t + '</span><span>₡' + p.precio.toLocaleString('es-CR') + '</span></div>';
      });
    }
    html += '</div>';
  });

  panel.innerHTML = '<div style="max-width:600px;width:100%;">' + html + '</div>';
}

window.addEventListener('DOMContentLoaded', function() {
  initCanasta();
});
