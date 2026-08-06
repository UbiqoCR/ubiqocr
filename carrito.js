/**
 * UbiqoCR — Carrito de compras con Supabase
 * Instalación: <script src="carrito.js"></script> después de api.js
 */

const SUPABASE_URL = 'https://yaokclqtckltkdshkquh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2tjbHF0Y2tsdGtkc2hrcXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Njk5NzQsImV4cCI6MjEwMTU0NTk3NH0.hwKTobj9SItnOXsjb-3wDR_oU2EZw3ZgUsOoIOxkmMc';

// ── Cliente Supabase liviano ─────────────────────────────────
const sb = {
  async query(table, method, body, filters) {
    method  = method  || 'GET';
    filters = filters || '';
    const url = SUPABASE_URL + '/rest/v1/' + table + filters;
    const opts = {
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : '',
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.json().catch(function() { return {}; });
      throw new Error(err.message || 'HTTP ' + res.status);
    }
    if (res.status === 204) return null;
    return res.json();
  },
  async select(table, filters) { return this.query(table, 'GET', null, filters); },
  async insert(table, data)    { return this.query(table, 'POST', data); },
  async update(table, data, f) { return this.query(table, 'PATCH', data, f); },
  async delete(table, filters) { return this.query(table, 'DELETE', null, filters); },
};

// ── Estado global ────────────────────────────────────────────
var _usuario = null;
var _carrito = null;
var _items   = [];

// ── Init ─────────────────────────────────────────────────────
async function initCarrito() {
  var uid = localStorage.getItem('ubiqo_user_id');
  if (uid) {
    try {
      var rows = await sb.select('usuarios', '?id=eq.' + uid);
      if (rows && rows.length) {
        _usuario = rows[0];
        await cargarCarrito();
      }
    } catch(e) {
      localStorage.removeItem('ubiqo_user_id');
    }
  }
  renderBotonCarrito();
}

async function cargarCarrito() {
  if (!_usuario) return;
  var carritos = await sb.select('carritos', '?usuario_id=eq.' + _usuario.id + '&order=created_at.asc&limit=1');
  if (!carritos || !carritos.length) {
    var nuevo = await sb.insert('carritos', { usuario_id: _usuario.id, nombre: 'Mi lista' });
    _carrito = nuevo[0];
  } else {
    _carrito = carritos[0];
  }
  _items = await sb.select('carrito_items', '?carrito_id=eq.' + _carrito.id + '&order=created_at.asc') || [];
  actualizarContadorCarrito();
}

// ── Agregar producto ─────────────────────────────────────────
async function agregarAlCarrito(producto) {
  if (!_usuario) { mostrarModalAuth(); return; }
  if (!_carrito) await cargarCarrito();
  var item = {
    carrito_id:      _carrito.id,
    nombre_producto: producto.nombre,
    tienda:          producto.tienda || producto.negocio || '',
    precio:          producto.precio || null,
    moneda:          producto.moneda || 'CRC',
    imagen:          producto.imagen || '',
    url:             producto.url    || '',
    manual:          producto.manual || false,
  };
  var nuevo = await sb.insert('carrito_items', item);
  _items.push(nuevo[0]);
  actualizarContadorCarrito();
  mostrarToast('✓ "' + producto.nombre.substring(0, 40) + '..." agregado a tu lista');
}

async function eliminarDelCarrito(itemId) {
  await sb.delete('carrito_items', '?id=eq.' + itemId);
  _items = _items.filter(function(i) { return i.id !== itemId; });
  actualizarContadorCarrito();
  renderPanelCarrito();
}

async function vaciarCarrito() {
  if (!_carrito) return;
  await sb.delete('carrito_items', '?carrito_id=eq.' + _carrito.id);
  _items = [];
  actualizarContadorCarrito();
  renderPanelCarrito();
}

// ── Registro y Login ─────────────────────────────────────────
async function registrarUsuario(datos) {
  var existente = await sb.select('usuarios', '?correo=eq.' + encodeURIComponent(datos.correo));
  if (existente && existente.length) throw new Error('Ya existe una cuenta con ese correo.');
  var existenteCedula = await sb.select('usuarios', '?cedula=eq.' + encodeURIComponent(datos.cedula));
  if (existenteCedula && existenteCedula.length) throw new Error('Ya existe una cuenta con esa cédula.');
  var nuevo = await sb.insert('usuarios', datos);
  return nuevo[0];
}

async function loginUsuario(correo, cedula) {
  var rows = await sb.select('usuarios', '?correo=eq.' + encodeURIComponent(correo) + '&cedula=eq.' + encodeURIComponent(cedula));
  if (!rows || !rows.length) throw new Error('Correo o cédula incorrectos.');
  return rows[0];
}

// ── UI: Botón header ─────────────────────────────────────────
function renderBotonCarrito() {
  if (document.getElementById('btnCarrito')) return;
  var nav = document.querySelector('.menu') || document.querySelector('.nav');
  if (!nav) return;
  var li = document.createElement('li');
  li.innerHTML = '<button id="btnCarrito" onclick="togglePanelCarrito()" style="display:flex;align-items:center;gap:.4rem;padding:.45rem .85rem;border-radius:999px;font-size:.875rem;font-weight:500;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;">🛒 Mi lista <span id="carritoCount" style="display:none;background:#2563eb;color:#fff;font-size:.7rem;font-weight:700;padding:.1rem .45rem;border-radius:999px;min-width:18px;text-align:center;">0</span></button>';
  nav.appendChild(li);
}

function actualizarContadorCarrito() {
  var el = document.getElementById('carritoCount');
  if (!el) return;
  if (_items.length > 0) { el.style.display = 'inline'; el.textContent = _items.length; }
  else { el.style.display = 'none'; }
}

// ── UI: Panel carrito ─────────────────────────────────────────
function togglePanelCarrito() {
  if (!_usuario) { mostrarModalAuth(); return; }
  var panel = document.getElementById('panelCarrito');
  if (panel) { panel.remove(); }
  else { abrirPanelCarrito(); }
}

function abrirPanelCarrito() {
  var panel = document.createElement('div');
  panel.id = 'panelCarrito';
  panel.style.cssText = 'position:fixed;top:0;right:0;width:420px;max-width:100vw;height:100vh;background:#fff;border-left:1px solid #e2e8f0;box-shadow:-4px 0 24px rgba(0,0,0,.12);z-index:1000;display:flex;flex-direction:column;font-family:\'DM Sans\',system-ui,sans-serif;overflow:hidden;';
  panel.innerHTML = '<div style="padding:1.25rem 1.5rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;"><div><div style="font-weight:700;font-size:1rem;color:#0f172a;">🛒 Mi lista</div><div style="font-size:.75rem;color:#64748b;margin-top:.1rem;">Hola, ' + _usuario.nombre + '</div></div><button onclick="togglePanelCarrito()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#94a3b8;padding:.25rem;">✕</button></div>'
    + '<div style="padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;background:#f8fafc;"><div style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.5rem;">Agregar producto</div><div style="display:flex;gap:.5rem;"><input id="carritoSearch" type="search" placeholder="Buscar producto..." style="flex:1;padding:.5rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;" oninput="buscarParaCarrito(this.value)"></div><div id="carritoResultados" style="margin-top:.5rem;max-height:180px;overflow-y:auto;"></div><details style="margin-top:.75rem;"><summary style="font-size:.75rem;color:#2563eb;cursor:pointer;font-weight:500;">+ Agregar manualmente</summary><div style="margin-top:.5rem;display:grid;gap:.4rem;"><input id="manualNombre" placeholder="Nombre del producto" style="padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;"><div style="display:flex;gap:.4rem;"><input id="manualPrecio" type="number" placeholder="Precio ₡" style="flex:1;padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;"><input id="manualTienda" placeholder="Tienda" style="flex:1;padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;"></div><button onclick="agregarManual()" style="padding:.45rem;background:#2563eb;color:#fff;border:none;border-radius:6px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;">Agregar</button></div></details></div>'
    + '<div id="carritoItems" style="flex:1;overflow-y:auto;padding:1rem 1.5rem;"></div>'
    + '<div id="carritoFooter" style="border-top:1px solid #e2e8f0;padding:1rem 1.5rem;background:#f8fafc;overflow-y:auto;max-height:55vh;"></div>';
  document.body.appendChild(panel);
  renderPanelCarrito();
  setTimeout(function() {
    document.addEventListener('click', cerrarPanelSiAfuera);
  }, 100);
}

function cerrarPanelSiAfuera(e) {
  var panel = document.getElementById('panelCarrito');
  var btn   = document.getElementById('btnCarrito');
  if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
    panel.remove();
    document.removeEventListener('click', cerrarPanelSiAfuera);
  }
}

function renderPanelCarrito() {
  var itemsEl  = document.getElementById('carritoItems');
  var footerEl = document.getElementById('carritoFooter');
  if (!itemsEl) return;

  if (!_items.length) {
    itemsEl.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8;"><div style="font-size:2rem;margin-bottom:.5rem;">🛒</div><div style="font-size:.9rem;">Tu lista está vacía</div><div style="font-size:.78rem;margin-top:.25rem;">Buscá productos arriba para agregarlos</div></div>';
    footerEl.innerHTML = '';
    return;
  }

  // Totales por tienda
  var porTienda = {};
  _items.forEach(function(item) {
    if (item.precio) {
      var t = item.tienda || 'Sin tienda';
      porTienda[t] = (porTienda[t] || 0) + parseFloat(item.precio) * (item.cantidad || 1);
    }
  });

  var tiendas = Object.entries(porTienda).sort(function(a, b) { return a[1] - b[1]; });
  var totalGeneral = _items.reduce(function(s, i) { return s + (i.precio ? parseFloat(i.precio) * (i.cantidad || 1) : 0); }, 0);

  // Items
  itemsEl.innerHTML = _items.map(function(item) {
    var imgHtml = item.imagen
      ? '<img src="' + item.imagen + '" style="width:44px;height:44px;object-fit:contain;border-radius:6px;background:#f8fafc;flex-shrink:0;" onerror="this.style.display=\'none\'">'
      : '<div style="width:44px;height:44px;background:#f1f5f9;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🛍️</div>';
    var precioHtml = item.precio
      ? '<div style="font-size:.88rem;font-weight:700;color:#1d4ed8;margin-top:.2rem;">₡' + parseFloat(item.precio).toLocaleString('es-CR') + '</div>'
      : '<div style="font-size:.75rem;color:#94a3b8;">Sin precio</div>';
    return '<div style="display:flex;gap:.75rem;align-items:start;padding:.75rem 0;border-bottom:1px dashed #e2e8f0;">'
      + imgHtml
      + '<div style="flex:1;min-width:0;"><div style="font-size:.82rem;font-weight:500;color:#0f172a;line-height:1.3;">' + item.nombre_producto + '</div><div style="font-size:.72rem;color:#64748b;margin-top:.15rem;">' + (item.tienda || 'Sin tienda') + '</div>' + precioHtml + '</div>'
      + '<button onclick="eliminarDelCarrito(\'' + item.id + '\')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:.9rem;padding:.25rem;flex-shrink:0;" title="Eliminar">🗑️</button>'
      + '</div>';
  }).join('');

  // Footer
  var tiendasHtml = tiendas.map(function(entry, i) {
    return '<div style="display:flex;justify-content:space-between;padding:.3rem 0;' + (i===0?'color:#16a34a;font-weight:700;':'color:#64748b;') + 'font-size:.82rem;"><span>' + (i===0?'⭐ ':'') + entry[0] + '</span><span>₡' + entry[1].toLocaleString('es-CR') + '</span></div>';
  }).join('');

  var tiendasUnicas = Object.keys(porTienda).length; var desgloseBtn = tiendasUnicas > 1
    ? '<button onclick="toggleDesglose()" id="btnDesglose" style="margin-top:.75rem;width:100%;padding:.6rem;background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,.2);border-radius:8px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;">📊 Comparar precios por producto</button><div id="panelDesglose" style="display:none;margin-top:.75rem;"></div>'
    : '';

  footerEl.innerHTML = '<div style="margin-bottom:.75rem;"><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.5rem;">Total por tienda</div>' + tiendasHtml + '</div>'
    + '<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-top:2px solid #e2e8f0;font-weight:700;font-size:.9rem;"><span>Total (' + _items.length + ' productos)</span><span style="color:#1d4ed8;">₡' + totalGeneral.toLocaleString('es-CR') + '</span></div>'
    + desgloseBtn
    + '<button onclick="vaciarCarrito()" style="margin-top:.75rem;width:100%;padding:.5rem;background:none;border:1px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.78rem;color:#94a3b8;cursor:pointer;">Vaciar lista</button>';
}

// ── Desglose ─────────────────────────────────────────────────
function toggleDesglose() {
  var panel = document.getElementById('panelDesglose');
  var btn   = document.getElementById('btnDesglose');
  if (!panel) return;
  var visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : '';
  btn.textContent = visible ? '📊 Comparar precios por producto' : '▲ Ocultar comparación';
  if (!visible) renderDesglose(panel);
}

function normalizarNombre(nombre) {
  return nombre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function similitud(a, b) {
  var wa = normalizarNombre(a).split(' ').filter(function(w) { return w.length > 2; });
  var wb = normalizarNombre(b).split(' ').filter(function(w) { return w.length > 2; });
  if (!wa.length || !wb.length) return 0;
  var coinciden = wa.filter(function(w) { return wb.indexOf(w) !== -1; }).length;
  return coinciden / Math.max(wa.length, wb.length);
}

function renderDesglose(panel) {
  // Agrupar por similitud de nombre (fuzzy matching)
  var grupos = [];

  _items.forEach(function(item) {
    if (!item.precio) return;
    var encontrado = false;
    for (var g = 0; g < grupos.length; g++) {
      if (similitud(item.nombre_producto, grupos[g].nombre) >= 0.45) {
        grupos[g].tiendas.push({ tienda: item.tienda || 'Sin tienda', precio: parseFloat(item.precio), nombre: item.nombre_producto });
        encontrado = true;
        break;
      }
    }
    if (!encontrado) {
      grupos.push({ nombre: item.nombre_producto, tiendas: [{ tienda: item.tienda || 'Sin tienda', precio: parseFloat(item.precio), nombre: item.nombre_producto }] });
    }
  });

  // Solo mostrar grupos con productos de DISTINTAS tiendas
  var comparables = grupos.filter(function(g) {
    var tiendas = g.tiendas.map(function(t) { return t.tienda; });
    var unicas = tiendas.filter(function(t, i) { return tiendas.indexOf(t) === i; });
    return unicas.length > 1;
  });

  if (!comparables.length) {
    panel.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;text-align:center;padding:.75rem;">Agregá el mismo producto de distintas tiendas para comparar precios.</div>';
    return;
  }

  var html = '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.75rem;">'
    + comparables.length + ' producto' + (comparables.length !== 1 ? 's' : '') + ' con comparación disponible</div>';

  comparables.forEach(function(g) {
    // Ordenar por precio
    var ordenadas = g.tiendas.slice().sort(function(a, b) { return a.precio - b.precio; });
    var ahorro = ordenadas[ordenadas.length-1].precio - ordenadas[0].precio;

    html += '<div style="margin-bottom:.875rem;padding:.75rem;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">';
    html += '<div style="font-size:.8rem;font-weight:600;color:#0f172a;margin-bottom:.5rem;">' + g.nombre + '</div>';
    ordenadas.forEach(function(t, i) {
      html += '<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px dashed #e2e8f0;font-size:.78rem;' + (i===0?'color:#16a34a;font-weight:700;':'color:#64748b;') + '">'
        + '<span>' + (i===0?'⭐ ':'') + t.tienda + '</span>'
        + '<span>₡' + t.precio.toLocaleString('es-CR') + '</span>'
        + '</div>';
    });
    if (ahorro > 0) {
      html += '<div style="font-size:.7rem;color:#16a34a;margin-top:.5rem;font-weight:600;">Ahorrás ₡' + ahorro.toLocaleString('es-CR') + ' comprando en ' + ordenadas[0].tienda + '</div>';
    }
    html += '</div>';
  });

  panel.style.cssText = 'display:block;margin-top:.75rem;max-height:300px;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  panel.innerHTML = html;
}

// ── Búsqueda en carrito ───────────────────────────────────────
var _searchDebounce;
async function buscarParaCarrito(q) {
  clearTimeout(_searchDebounce);
  var resEl = document.getElementById('carritoResultados');
  if (!resEl) return;
  if (!q || q.length < 2) { resEl.innerHTML = ''; return; }
  _searchDebounce = setTimeout(async function() {
    resEl.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;padding:.3rem;">Buscando...</div>';
    try {
      var productos = await cargarProductosEstaticos();
      var qn = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var encontrados = productos.filter(function(p) {
        var n = (p.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return qn.split(' ').every(function(w) { return n.includes(w); });
      }).slice(0, 8);

      if (!encontrados.length) {
        resEl.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;padding:.3rem;">Sin resultados</div>';
        return;
      }
      window._carritoResultados = encontrados;
      resEl.innerHTML = encontrados.map(function(p, i) {
        var imgHtml = p.imagen ? '<img src="' + p.imagen + '" style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:#f8fafc;flex-shrink:0;" onerror="this.style.display=\'none\'">' : '';
        var precioStr = p.precio ? '· ₡' + parseFloat(p.precio).toLocaleString('es-CR') : '';
        return '<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .25rem;border-bottom:1px solid #f1f5f9;cursor:pointer;" onclick="agregarDesdeResultado(' + i + ')">'
          + imgHtml
          + '<div style="flex:1;min-width:0;"><div style="font-size:.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.nombre + '</div><div style="font-size:.68rem;color:#64748b;">' + (p.negocio || '') + ' ' + precioStr + '</div></div>'
          + '<button style="background:#eff6ff;color:#2563eb;border:none;border-radius:6px;padding:.2rem .5rem;font-size:.72rem;font-weight:600;cursor:pointer;flex-shrink:0;">+ Agregar</button>'
          + '</div>';
      }).join('');
    } catch(e) {
      resEl.innerHTML = '<div style="font-size:.78rem;color:#ef4444;padding:.3rem;">Error buscando</div>';
    }
  }, 300);
}

async function agregarDesdeResultado(idx) {
  var p = window._carritoResultados && window._carritoResultados[idx];
  if (!p) return;
  await agregarAlCarrito({ nombre: p.nombre, tienda: p.negocio || '', precio: p.precio, moneda: p.moneda || 'CRC', imagen: p.imagen || '', url: p.url || '' });
  renderPanelCarrito();
}

async function agregarManual() {
  var nombre = document.getElementById('manualNombre') && document.getElementById('manualNombre').value.trim();
  var precio = parseFloat(document.getElementById('manualPrecio') && document.getElementById('manualPrecio').value) || null;
  var tienda = document.getElementById('manualTienda') && document.getElementById('manualTienda').value.trim() || '';
  if (!nombre) return;
  await agregarAlCarrito({ nombre: nombre, precio: precio, tienda: tienda, manual: true });
  document.getElementById('manualNombre').value = '';
  document.getElementById('manualPrecio').value = '';
  document.getElementById('manualTienda').value = '';
  renderPanelCarrito();
}

// ── Modal Auth ────────────────────────────────────────────────
function mostrarModalAuth(modo) {
  modo = modo || 'login';
  var existing = document.getElementById('modalAuth');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'modalAuth';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem;';

  modal.innerHTML = '<div style="background:#fff;border-radius:16px;width:100%;max-width:440px;padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2);position:relative;">'
    + '<button onclick="document.getElementById(\'modalAuth\').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;cursor:pointer;font-size:1.1rem;color:#94a3b8;">✕</button>'
    + '<div style="text-align:center;margin-bottom:1.5rem;"><div style="font-size:1.75rem;margin-bottom:.5rem;">🛒</div><h2 style="font-size:1.1rem;font-weight:700;margin-bottom:.3rem;">Accedé a tu lista de compras</h2><p style="font-size:.82rem;color:#64748b;">Guardá productos y comparás precios entre tiendas. <strong>Completamente gratis.</strong></p></div>'
    + '<div style="display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:1.25rem;"><button id="tabLogin" onclick="switchTab(\'login\')" style="flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:600;color:#2563eb;border-bottom:2px solid #2563eb;margin-bottom:-2px;cursor:pointer;">Iniciar sesión</button><button id="tabRegistro" onclick="switchTab(\'registro\')" style="flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:500;color:#64748b;cursor:pointer;">Crear cuenta</button></div>'
    + '<div id="formLogin"><div style="display:grid;gap:.75rem;"><div><label style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Correo</label><input id="loginCorreo" type="email" placeholder="tu@correo.com" style="width:100%;margin-top:.3rem;padding:.65rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.9rem;outline:none;"></div><div><label style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Número de cédula</label><input id="loginCedula" type="text" placeholder="1-2345-6789" style="width:100%;margin-top:.3rem;padding:.65rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.9rem;outline:none;"></div><div id="loginError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div><button onclick="handleLogin()" style="width:100%;padding:.75rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;">Entrar</button></div></div>'
    + '<div id="formRegistro" style="display:none;"><div style="display:grid;gap:.6rem;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;"><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Nombre</label><input id="regNombre" placeholder="Juan" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Apellidos</label><input id="regApellidos" placeholder="Arce Navarro" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div></div><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Correo electrónico</label><input id="regCorreo" type="email" placeholder="tu@correo.com" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;"><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Número de cédula</label><input id="regCedula" placeholder="1-2345-6789" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Teléfono</label><input id="regTelefono" placeholder="8888-8888" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div></div><div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Fecha de nacimiento</label><input id="regFecha" type="date" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;"></div><div id="regError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div><button onclick="handleRegistro()" style="width:100%;padding:.7rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;">Crear cuenta gratis</button><p style="font-size:.72rem;color:#94a3b8;text-align:center;margin:0;">Tus datos son privados y no se comparten con terceros.</p></div></div>'
    + '</div>';

  document.body.appendChild(modal);
  if (modo === 'registro') switchTab('registro');
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

function switchTab(tab) {
  var isLogin = tab === 'login';
  document.getElementById('formLogin').style.display    = isLogin ? '' : 'none';
  document.getElementById('formRegistro').style.display = isLogin ? 'none' : '';
  document.getElementById('tabLogin').style.fontWeight    = isLogin ? '600' : '500';
  document.getElementById('tabLogin').style.color         = isLogin ? '#2563eb' : '#64748b';
  document.getElementById('tabLogin').style.borderBottom  = isLogin ? '2px solid #2563eb' : 'none';
  document.getElementById('tabRegistro').style.fontWeight   = isLogin ? '500' : '600';
  document.getElementById('tabRegistro').style.color        = isLogin ? '#64748b' : '#2563eb';
  document.getElementById('tabRegistro').style.borderBottom = isLogin ? 'none' : '2px solid #2563eb';
}

async function handleLogin() {
  var correo = document.getElementById('loginCorreo') && document.getElementById('loginCorreo').value.trim();
  var cedula = document.getElementById('loginCedula') && document.getElementById('loginCedula').value.trim();
  var errEl  = document.getElementById('loginError');
  if (!correo || !cedula) { errEl.style.display = ''; errEl.textContent = 'Completá todos los campos.'; return; }
  try {
    errEl.style.display = 'none';
    var usuario = await loginUsuario(correo, cedula);
    _usuario = usuario;
    localStorage.setItem('ubiqo_user_id', usuario.id);
    await cargarCarrito();
    document.getElementById('modalAuth') && document.getElementById('modalAuth').remove();
    actualizarContadorCarrito();
    mostrarToast('¡Bienvenido, ' + usuario.nombre + '! 👋');
    abrirPanelCarrito();
  } catch(e) {
    errEl.style.display = ''; errEl.textContent = e.message;
  }
}

async function handleRegistro() {
  var nombre    = document.getElementById('regNombre') && document.getElementById('regNombre').value.trim();
  var apellidos = document.getElementById('regApellidos') && document.getElementById('regApellidos').value.trim();
  var correo    = document.getElementById('regCorreo') && document.getElementById('regCorreo').value.trim();
  var cedula    = document.getElementById('regCedula') && document.getElementById('regCedula').value.trim();
  var telefono  = document.getElementById('regTelefono') && document.getElementById('regTelefono').value.trim();
  var fecha     = document.getElementById('regFecha') && document.getElementById('regFecha').value;
  var errEl     = document.getElementById('regError');
  if (!nombre || !apellidos || !correo || !cedula) { errEl.style.display = ''; errEl.textContent = 'Nombre, apellidos, correo y cédula son obligatorios.'; return; }
  try {
    errEl.style.display = 'none';
    var usuario = await registrarUsuario({ nombre: nombre, apellidos: apellidos, correo: correo, cedula: cedula, telefono: telefono || null, fecha_nacimiento: fecha || null });
    _usuario = usuario;
    localStorage.setItem('ubiqo_user_id', usuario.id);
    await cargarCarrito();
    document.getElementById('modalAuth') && document.getElementById('modalAuth').remove();
    actualizarContadorCarrito();
    mostrarToast('¡Cuenta creada! Bienvenido, ' + usuario.nombre + ' 🎉');
    abrirPanelCarrito();
  } catch(e) {
    errEl.style.display = ''; errEl.textContent = e.message;
  }
}

// ── Toast ─────────────────────────────────────────────────────
function mostrarToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:.65rem 1.25rem;border-radius:999px;font-size:.85rem;font-weight:500;z-index:3000;box-shadow:0 4px 16px rgba(0,0,0,.2);';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

// ── Botones "+ Lista" en resultados ───────────────────────────
function agregarBotonesALista() {
  document.querySelectorAll('.result-products .line').forEach(function(line) {
    if (line.querySelector('.btn-add-lista')) return;
    var nameEl  = line.querySelector('.prod-name');
    var priceEl = line.querySelector('.prod-price');
    var imgEl   = line.querySelector('img');
    var linkEl  = line.querySelector('a');
    var cardEl  = line.closest('.result-card');
    var tienda  = cardEl && cardEl.querySelector('.result-name') ? cardEl.querySelector('.result-name').textContent : '';
    if (!nameEl) return;
    var nombre    = nameEl.textContent.trim();
    var precioTxt = priceEl ? priceEl.textContent.replace(/[₡\s]/g, '').replace(/\./g, '').replace(',', '.') : '';
    var precio    = parseFloat(precioTxt) || null;
    var imagen    = imgEl ? imgEl.src : '';
    var url       = linkEl ? linkEl.href : '';
    var btn = document.createElement('button');
    btn.className = 'btn-add-lista';
    btn.title = 'Agregar a mi lista';
    btn.style.cssText = 'background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,.2);border-radius:6px;padding:.15rem .5rem;font-size:.68rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:.25rem;';
    btn.textContent = '+ Lista';
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      await agregarAlCarrito({ nombre: nombre, precio: precio, tienda: tienda, imagen: imagen, url: url });
      btn.textContent = '✓';
      btn.style.background = '#ecfdf5';
      btn.style.color = '#16a34a';
      setTimeout(function() { btn.textContent = '+ Lista'; btn.style.background = '#eff6ff'; btn.style.color = '#2563eb'; }, 2000);
    });
    line.appendChild(btn);
  });
}

var _resObserver = new MutationObserver(function() {
  setTimeout(agregarBotonesALista, 100);
});

window.addEventListener('DOMContentLoaded', function() {
  var results = document.getElementById('results');
  if (results) _resObserver.observe(results, { childList: true, subtree: true });
  initCarrito();
});
