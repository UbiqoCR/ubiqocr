/**
 * UbiqoCR — Carrito de compras con Supabase
 * Instalación: <script src="carrito.js"></script> después de api.js
 */

const SUPABASE_URL = 'https://yaokclqtckltkdshkquh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2tjbHF0Y2tsdGtkc2hrcXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Njk5NzQsImV4cCI6MjEwMTU0NTk3NH0.hwKTobj9SItnOXsjb-3wDR_oU2EZw3ZgUsOoIOxkmMc';

// ── Cliente Supabase liviano ─────────────────────────────────
const sb = {
  async query(table, method = 'GET', body = null, filters = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;
    const opts = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : '',
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  async select(table, filters = '') {
    return this.query(table, 'GET', null, filters);
  },
  async insert(table, data) {
    return this.query(table, 'POST', data);
  },
  async update(table, data, filters) {
    return this.query(table, 'PATCH', data, filters);
  },
  async delete(table, filters) {
    return this.query(table, 'DELETE', null, filters);
  },
};

// ── Estado global ────────────────────────────────────────────
let _usuario = null;
let _carrito = null;
let _items   = [];

function getUsuario() { return _usuario; }
function setUsuario(u) { _usuario = u; localStorage.setItem('ubiqo_user_id', u?.id || ''); }

// ── Init ─────────────────────────────────────────────────────
async function initCarrito() {
  // Recuperar sesión guardada
  const uid = localStorage.getItem('ubiqo_user_id');
  if (uid) {
    try {
      const rows = await sb.select('usuarios', `?id=eq.${uid}`);
      if (rows?.length) {
        _usuario = rows[0];
        await cargarCarrito();
      }
    } catch (e) {
      localStorage.removeItem('ubiqo_user_id');
    }
  }
  renderBotonCarrito();
}

// ── Cargar carrito del usuario ───────────────────────────────
async function cargarCarrito() {
  if (!_usuario) return;
  // Obtener o crear carrito
  let carritos = await sb.select('carritos', `?usuario_id=eq.${_usuario.id}&order=created_at.asc&limit=1`);
  if (!carritos?.length) {
    const nuevo = await sb.insert('carritos', { usuario_id: _usuario.id, nombre: 'Mi lista' });
    _carrito = nuevo[0];
  } else {
    _carrito = carritos[0];
  }
  // Cargar items
  _items = await sb.select('carrito_items', `?carrito_id=eq.${_carrito.id}&order=created_at.asc`) || [];
  actualizarContadorCarrito();
}

// ── Agregar producto al carrito ──────────────────────────────
async function agregarAlCarrito(producto) {
  if (!_usuario) {
    mostrarModalAuth();
    return;
  }
  if (!_carrito) await cargarCarrito();

  const item = {
    carrito_id:      _carrito.id,
    nombre_producto: producto.nombre,
    tienda:          producto.tienda || producto.negocio || '',
    precio:          producto.precio || null,
    moneda:          producto.moneda || 'CRC',
    imagen:          producto.imagen || '',
    url:             producto.url    || '',
    manual:          producto.manual || false,
  };

  const nuevo = await sb.insert('carrito_items', item);
  _items.push(nuevo[0]);
  actualizarContadorCarrito();
  mostrarToast(`✓ "${producto.nombre.substring(0, 40)}..." agregado a tu lista`);
}

// ── Eliminar item ────────────────────────────────────────────
async function eliminarDelCarrito(itemId) {
  await sb.delete('carrito_items', `?id=eq.${itemId}`);
  _items = _items.filter(i => i.id !== itemId);
  actualizarContadorCarrito();
  renderPanelCarrito();
}

// ── Vaciar carrito ───────────────────────────────────────────
async function vaciarCarrito() {
  if (!_carrito) return;
  await sb.delete('carrito_items', `?carrito_id=eq.${_carrito.id}`);
  _items = [];
  actualizarContadorCarrito();
  renderPanelCarrito();
}

// ── Registro de usuario ──────────────────────────────────────
async function registrarUsuario(datos) {
  // Verificar si ya existe
  const existente = await sb.select('usuarios', `?correo=eq.${encodeURIComponent(datos.correo)}`);
  if (existente?.length) throw new Error('Ya existe una cuenta con ese correo.');

  const existenteCedula = await sb.select('usuarios', `?cedula=eq.${encodeURIComponent(datos.cedula)}`);
  if (existenteCedula?.length) throw new Error('Ya existe una cuenta con esa cédula.');

  const nuevo = await sb.insert('usuarios', datos);
  return nuevo[0];
}

// ── Login por correo y cédula ────────────────────────────────
async function loginUsuario(correo, cedula) {
  const rows = await sb.select('usuarios',
    `?correo=eq.${encodeURIComponent(correo)}&cedula=eq.${encodeURIComponent(cedula)}`
  );
  if (!rows?.length) throw new Error('Correo o cédula incorrectos.');
  return rows[0];
}

// ── UI: Botón carrito en header ──────────────────────────────
function renderBotonCarrito() {
  if (document.getElementById('btnCarrito')) return;

  const nav = document.querySelector('.menu') || document.querySelector('.nav');
  if (!nav) return;

  const li = document.createElement('li');
  li.innerHTML = `
    <button id="btnCarrito" onclick="togglePanelCarrito()" style="
      display:flex;align-items:center;gap:.4rem;
      padding:.45rem .85rem;border-radius:999px;
      font-size:.875rem;font-weight:500;
      color:#64748b;background:none;border:none;cursor:pointer;
      transition:all 180ms;font-family:inherit;
    " onmouseover="this.style.background='#e2e8f0';this.style.color='#0f172a'"
       onmouseout="this.style.background='none';this.style.color='#64748b'">
      🛒 Mi lista
      <span id="carritoCount" style="
        display:none;background:#2563eb;color:#fff;
        font-size:.7rem;font-weight:700;
        padding:.1rem .45rem;border-radius:999px;
        min-width:18px;text-align:center;
      ">0</span>
    </button>
  `;
  nav.appendChild(li);
}

function actualizarContadorCarrito() {
  const el = document.getElementById('carritoCount');
  if (!el) return;
  if (_items.length > 0) {
    el.style.display = 'inline';
    el.textContent = _items.length;
  } else {
    el.style.display = 'none';
  }
}

// ── UI: Panel carrito ────────────────────────────────────────
function togglePanelCarrito() {
  if (!_usuario) {
    mostrarModalAuth();
    return;
  }
  const panel = document.getElementById('panelCarrito');
  if (panel) {
    panel.remove();
  } else {
    abrirPanelCarrito();
  }
}

function abrirPanelCarrito() {
  const panel = document.createElement('div');
  panel.id = 'panelCarrito';
  panel.style.cssText = `
    position:fixed;top:0;right:0;width:420px;max-width:100vw;height:100vh;
    background:#fff;border-left:1px solid #e2e8f0;
    box-shadow:-4px 0 24px rgba(0,0,0,.12);
    z-index:1000;display:flex;flex-direction:column;
    font-family:'DM Sans',system-ui,sans-serif;
    overflow:hidden;
  `;

  panel.innerHTML = `
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-weight:700;font-size:1rem;color:#0f172a;">🛒 Mi lista</div>
        <div style="font-size:.75rem;color:#64748b;margin-top:.1rem;">Hola, ${_usuario.nombre}</div>
      </div>
      <button onclick="togglePanelCarrito()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#94a3b8;padding:.25rem;">✕</button>
    </div>

    <!-- Buscador para agregar productos -->
    <div style="padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
      <div style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.5rem;">Agregar producto</div>
      <div style="display:flex;gap:.5rem;">
        <input id="carritoSearch" type="search" placeholder="Buscar producto..." style="
          flex:1;padding:.5rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;
          font:inherit;font-size:.85rem;outline:none;
        " oninput="buscarParaCarrito(this.value)">
      </div>
      <div id="carritoResultados" style="margin-top:.5rem;max-height:180px;overflow-y:auto;"></div>
      <!-- Agregar manualmente -->
      <details style="margin-top:.75rem;">
        <summary style="font-size:.75rem;color:#2563eb;cursor:pointer;font-weight:500;">+ Agregar manualmente</summary>
        <div style="margin-top:.5rem;display:grid;gap:.4rem;">
          <input id="manualNombre" placeholder="Nombre del producto" style="padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;">
          <div style="display:flex;gap:.4rem;">
            <input id="manualPrecio" type="number" placeholder="Precio ₡" style="flex:1;padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;">
            <input id="manualTienda" placeholder="Tienda" style="flex:1;padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:6px;font:inherit;font-size:.82rem;outline:none;">
          </div>
          <button onclick="agregarManual()" style="
            padding:.45rem;background:#2563eb;color:#fff;border:none;border-radius:6px;
            font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;
          ">Agregar</button>
        </div>
      </details>
    </div>

    <!-- Items del carrito -->
    <div id="carritoItems" style="flex:1;overflow-y:auto;padding:1rem 1.5rem;"></div>

    <!-- Footer con totales -->
    <div id="carritoFooter" style="border-top:1px solid #e2e8f0;padding:1rem 1.5rem;background:#f8fafc;"></div>
  `;

  document.body.appendChild(panel);
  renderPanelCarrito();

  // Cerrar al hacer clic fuera
  setTimeout(() => {
    document.addEventListener('click', cerrarPanelSiAfuera);
  }, 100);
}

function cerrarPanelSiAfuera(e) {
  const panel = document.getElementById('panelCarrito');
  if (panel && !panel.contains(e.target) && !document.getElementById('btnCarrito').contains(e.target)) {
    panel.remove();
    document.removeEventListener('click', cerrarPanelSiAfuera);
  }
}

function renderPanelCarrito() {
  const itemsEl  = document.getElementById('carritoItems');
  const footerEl = document.getElementById('carritoFooter');
  if (!itemsEl) return;

  if (!_items.length) {
    itemsEl.innerHTML = `
      <div style="text-align:center;padding:2rem;color:#94a3b8;">
        <div style="font-size:2rem;margin-bottom:.5rem;">🛒</div>
        <div style="font-size:.9rem;">Tu lista está vacía</div>
        <div style="font-size:.78rem;margin-top:.25rem;">Buscá productos arriba para agregarlos</div>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  // Calcular totales por tienda
  const porTienda = {};
  _items.forEach(item => {
    if (item.precio) {
      const t = item.tienda || 'Sin tienda';
      porTienda[t] = (porTienda[t] || 0) + parseFloat(item.precio) * (item.cantidad || 1);
    }
  });

  // Render items
  itemsEl.innerHTML = _items.map(item => `
    <div style="display:flex;gap:.75rem;align-items:start;padding:.75rem 0;border-bottom:1px dashed #e2e8f0;">
      ${item.imagen
        ? `<img src="${item.imagen}" style="width:44px;height:44px;object-fit:contain;border-radius:6px;background:#f8fafc;flex-shrink:0;" onerror="this.style.display='none'">`
        : '<div style="width:44px;height:44px;background:#f1f5f9;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🛍️</div>'}
      <div style="flex:1;min-width:0;">
        <div style="font-size:.82rem;font-weight:500;color:#0f172a;line-height:1.3;">${item.nombre_producto}</div>
        <div style="font-size:.72rem;color:#64748b;margin-top:.15rem;">${item.tienda || 'Sin tienda'}</div>
        ${item.precio ? `<div style="font-size:.88rem;font-weight:700;color:#1d4ed8;margin-top:.2rem;">₡${parseFloat(item.precio).toLocaleString('es-CR')}</div>` : '<div style="font-size:.75rem;color:#94a3b8;">Sin precio</div>'}
      </div>
      <button onclick="eliminarDelCarrito('${item.id}')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:.9rem;padding:.25rem;flex-shrink:0;" title="Eliminar">🗑️</button>
    </div>
  `).join('');

  // Footer con totales
  const tiendas = Object.entries(porTienda).sort((a, b) => a[1] - b[1]);
  const totalGeneral = _items.reduce((s, i) => s + (i.precio ? parseFloat(i.precio) * (i.cantidad || 1) : 0), 0);

  footerEl.innerHTML = `
    <div style="margin-bottom:.75rem;">
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.5rem;">Total por tienda</div>
      ${tiendas.map(([tienda, total], i) => `
        <div style="display:flex;justify-content:space-between;padding:.3rem 0;${i === 0 ? 'color:#16a34a;font-weight:700;' : 'color:#64748b;'}font-size:.82rem;">
          <span>${i === 0 ? '⭐ ' : ''}${tienda}</span>
          <span>₡${total.toLocaleString('es-CR')}</span>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;border-top:2px solid #e2e8f0;font-weight:700;font-size:.9rem;">
      <span>Total (${_items.length} productos)</span>
      <span style="color:#1d4ed8;">₡${totalGeneral.toLocaleString('es-CR')}</span>
    </div>
    ${tiendas.length > 1 ? `
    <button onclick="toggleDesglose()" id="btnDesglose" style="
      margin-top:.75rem;width:100%;padding:.6rem;
      background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,.2);
      border-radius:8px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;
    ">📊 Comparar precios por producto</button>
    <div id="panelDesglose" style="display:none;margin-top:.75rem;"></div>
    ` : ''}
    <button onclick="vaciarCarrito()" style="
      margin-top:.75rem;width:100%;padding:.5rem;
      background:none;border:1px solid #e2e8f0;border-radius:8px;
      font:inherit;font-size:.78rem;color:#94a3b8;cursor:pointer;
    ">Vaciar lista</button>
  `;
}

// ── Búsqueda dentro del carrito ──────────────────────────────
let _searchDebounce;
async function buscarParaCarrito(q) {
  clearTimeout(_searchDebounce);
  const resEl = document.getElementById('carritoResultados');
  if (!resEl) return;
  if (!q || q.length < 2) { resEl.innerHTML = ''; return; }

  _searchDebounce = setTimeout(async () => {
    resEl.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;padding:.3rem;">Buscando...</div>';

    try {
      const productos = await cargarProductosEstaticos();
      const qn = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const encontrados = productos
        .filter(p => {
          const n = (p.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return qn.split(' ').every(w => n.includes(w));
        })
        .slice(0, 8);

      if (!encontrados.length) {
        resEl.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;padding:.3rem;">Sin resultados</div>';
        return;
      }

      resEl.innerHTML = encontrados.map((p, i) => `
        <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .25rem;border-bottom:1px solid #f1f5f9;cursor:pointer;"
             onclick="agregarDesdeResultado(${i})" data-idx="${i}">
          ${p.imagen ? `<img src="${p.imagen}" style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:#f8fafc;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
          <div style="flex:1;min-width:0;">
            <div style="font-size:.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.nombre}</div>
            <div style="font-size:.68rem;color:#64748b;">${p.negocio || ''} ${p.precio ? '· ₡' + parseFloat(p.precio).toLocaleString('es-CR') : ''}</div>
          </div>
          <button style="background:#eff6ff;color:#2563eb;border:none;border-radius:6px;padding:.2rem .5rem;font-size:.72rem;font-weight:600;cursor:pointer;flex-shrink:0;">+ Agregar</button>
        </div>
      `).join('');

      // Guardar resultados para agregarlos por índice
      window._carritoResultados = encontrados;

    } catch (e) {
      resEl.innerHTML = '<div style="font-size:.78rem;color:#ef4444;padding:.3rem;">Error buscando</div>';
    }
  }, 300);
}

async function agregarDesdeResultado(idx) {
  const p = window._carritoResultados?.[idx];
  if (!p) return;
  await agregarAlCarrito({
    nombre: p.nombre,
    tienda: p.negocio || '',
    precio: p.precio,
    moneda: p.moneda || 'CRC',
    imagen: p.imagen || '',
    url:    p.url    || '',
  });
  renderPanelCarrito();
}

async function agregarManual() {
  const nombre = document.getElementById('manualNombre')?.value?.trim();
  const precio = parseFloat(document.getElementById('manualPrecio')?.value) || null;
  const tienda = document.getElementById('manualTienda')?.value?.trim() || '';
  if (!nombre) return;

  await agregarAlCarrito({ nombre, precio, tienda, manual: true });
  document.getElementById('manualNombre').value = '';
  document.getElementById('manualPrecio').value = '';
  document.getElementById('manualTienda').value = '';
  renderPanelCarrito();
}

// ── Modal de autenticación ───────────────────────────────────
function mostrarModalAuth(modo = 'login') {
  document.getElementById('modalAuth')?.remove();

  const modal = document.createElement('div');
  modal.id = 'modalAuth';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;
    display:flex;align-items:center;justify-content:center;padding:1rem;
  `;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:440px;padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2);position:relative;">
      <button onclick="document.getElementById('modalAuth').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;cursor:pointer;font-size:1.1rem;color:#94a3b8;">✕</button>

      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="font-size:1.75rem;margin-bottom:.5rem;">🛒</div>
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:.3rem;">Accedé a tu lista de compras</h2>
        <p style="font-size:.82rem;color:#64748b;">Guardá productos y comparás precios entre tiendas. <strong>Completamente gratis.</strong></p>
      </div>

      <!-- Tabs -->
      <div style="display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:1.25rem;">
        <button id="tabLogin" onclick="switchTab('login')" style="flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:600;color:#2563eb;border-bottom:2px solid #2563eb;margin-bottom:-2px;cursor:pointer;">Iniciar sesión</button>
        <button id="tabRegistro" onclick="switchTab('registro')" style="flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:500;color:#64748b;cursor:pointer;">Crear cuenta</button>
      </div>

      <!-- Login -->
      <div id="formLogin">
        <div style="display:grid;gap:.75rem;">
          <div>
            <label style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Correo</label>
            <input id="loginCorreo" type="email" placeholder="tu@correo.com" style="width:100%;margin-top:.3rem;padding:.65rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.9rem;outline:none;">
          </div>
          <div>
            <label style="font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Número de cédula</label>
            <input id="loginCedula" type="text" placeholder="1-2345-6789" style="width:100%;margin-top:.3rem;padding:.65rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.9rem;outline:none;">
          </div>
          <div id="loginError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div>
          <button onclick="handleLogin()" style="width:100%;padding:.75rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;">Entrar</button>
        </div>
      </div>

      <!-- Registro -->
      <div id="formRegistro" style="display:none;">
        <div style="display:grid;gap:.6rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
            <div>
              <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Nombre</label>
              <input id="regNombre" placeholder="Juan" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
            </div>
            <div>
              <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Apellidos</label>
              <input id="regApellidos" placeholder="Arce Navarro" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
            </div>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Correo electrónico</label>
            <input id="regCorreo" type="email" placeholder="tu@correo.com" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
            <div>
              <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Número de cédula</label>
              <input id="regCedula" placeholder="1-2345-6789" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
            </div>
            <div>
              <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Teléfono</label>
              <input id="regTelefono" placeholder="8888-8888" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
            </div>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Fecha de nacimiento</label>
            <input id="regFecha" type="date" style="width:100%;margin-top:.25rem;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.85rem;outline:none;">
          </div>
          <div id="regError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div>
          <button onclick="handleRegistro()" style="width:100%;padding:.7rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;">Crear cuenta gratis</button>
          <p style="font-size:.72rem;color:#94a3b8;text-align:center;margin:0;">Al crear una cuenta aceptás nuestros términos de uso. Tus datos son privados y no se comparten con terceros.</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (modo === 'registro') switchTab('registro');
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('formLogin').style.display    = isLogin ? '' : 'none';
  document.getElementById('formRegistro').style.display = isLogin ? 'none' : '';
  document.getElementById('tabLogin').style.cssText    = `flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;cursor:pointer;font-weight:${isLogin?'600':'500'};color:${isLogin?'#2563eb':'#64748b'};border-bottom:${isLogin?'2px solid #2563eb':'none'};margin-bottom:-2px;`;
  document.getElementById('tabRegistro').style.cssText = `flex:1;padding:.6rem;border:none;background:none;font:inherit;font-size:.875rem;cursor:pointer;font-weight:${isLogin?'500':'600'};color:${isLogin?'#64748b':'#2563eb'};border-bottom:${isLogin?'none':'2px solid #2563eb'};margin-bottom:-2px;`;
}

async function handleLogin() {
  const correo = document.getElementById('loginCorreo')?.value?.trim();
  const cedula = document.getElementById('loginCedula')?.value?.trim();
  const errEl  = document.getElementById('loginError');

  if (!correo || !cedula) {
    errEl.style.display = '';
    errEl.textContent = 'Completá todos los campos.';
    return;
  }

  try {
    errEl.style.display = 'none';
    const usuario = await loginUsuario(correo, cedula);
    setUsuario(usuario);
    _usuario = usuario;
    await cargarCarrito();
    document.getElementById('modalAuth')?.remove();
    actualizarContadorCarrito();
    mostrarToast(`¡Bienvenido, ${usuario.nombre}! 👋`);
    abrirPanelCarrito();
  } catch (e) {
    errEl.style.display = '';
    errEl.textContent = e.message;
  }
}

async function handleRegistro() {
  const nombre   = document.getElementById('regNombre')?.value?.trim();
  const apellidos= document.getElementById('regApellidos')?.value?.trim();
  const correo   = document.getElementById('regCorreo')?.value?.trim();
  const cedula   = document.getElementById('regCedula')?.value?.trim();
  const telefono = document.getElementById('regTelefono')?.value?.trim();
  const fecha    = document.getElementById('regFecha')?.value;
  const errEl    = document.getElementById('regError');

  if (!nombre || !apellidos || !correo || !cedula) {
    errEl.style.display = '';
    errEl.textContent = 'Nombre, apellidos, correo y cédula son obligatorios.';
    return;
  }

  try {
    errEl.style.display = 'none';
    const usuario = await registrarUsuario({
      nombre, apellidos, correo, cedula,
      telefono: telefono || null,
      fecha_nacimiento: fecha || null,
    });
    setUsuario(usuario);
    _usuario = usuario;
    await cargarCarrito();
    document.getElementById('modalAuth')?.remove();
    actualizarContadorCarrito();
    mostrarToast(`¡Cuenta creada! Bienvenido, ${usuario.nombre} 🎉`);
    abrirPanelCarrito();
  } catch (e) {
    errEl.style.display = '';
    errEl.textContent = e.message;
  }
}

// ── Toast notification ───────────────────────────────────────
function mostrarToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
    background:#0f172a;color:#fff;padding:.65rem 1.25rem;border-radius:999px;
    font-size:.85rem;font-weight:500;z-index:3000;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    animation:fadeUp 200ms ease both;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}


// ── Desglose por producto ────────────────────────────────────
function toggleDesglose() {
  const panel = document.getElementById('panelDesglose');
  const btn   = document.getElementById('btnDesglose');
  if (!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : '';
  btn.textContent = visible ? '📊 Comparar precios por producto' : '▲ Ocultar comparación';
  if (!visible) renderDesglose(panel);
}

function renderDesglose(panel) {
  // Agrupar items por nombre de producto normalizado
  const porProducto = {};
  _items.forEach(item => {
    const key = item.nombre_producto.toLowerCase().trim();
    if (!porProducto[key]) {
      porProducto[key] = { nombre: item.nombre_producto, tiendas: [] };
    }
    if (item.precio) {
      porProducto[key].tiendas.push({
        tienda: item.tienda || 'Sin tienda',
        precio: parseFloat(item.precio)
      });
    }
  });

  const prods = Object.values(porProducto).filter(p => p.tiendas.length > 0);

  if (!prods.length) {
    panel.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;text-align:center;padding:.5rem;">Agregá el mismo producto de distintas tiendas para comparar.</div>';
    return;
  }

  panel.innerHTML = `
    <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:.5rem;">Comparación por producto</div>
    ${prods.map(p => {
      const ordenadas = [...p.tiendas].sort((a, b) => a.precio - b.precio);
      const ahorro = ordenadas.length > 1
        ? ordenadas[ordenadas.length-1].precio - ordenadas[0].precio
        : 0;
      return \`
        <div style="margin-bottom:.875rem;padding:.75rem;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <div style="font-size:.8rem;font-weight:600;color:#0f172a;margin-bottom:.5rem;">\${p.nombre}</div>
          \${ordenadas.map((t, i) => \`
            <div style="display:flex;justify-content:space-between;padding:.25rem 0;font-size:.78rem;\${i===0?'color:#16a34a;font-weight:700;':'color:#64748b;'}">
              <span>\${i===0?'⭐ ':''}\${t.tienda}</span>
              <span>₡\${t.precio.toLocaleString('es-CR')}</span>
            </div>
          \`).join('')}
          \${ahorro > 0 ? \`<div style="font-size:.7rem;color:#16a34a;margin-top:.25rem;">Ahorrás ₡\${ahorro.toLocaleString('es-CR')} eligiendo \${ordenadas[0].tienda}</div>\` : ''}
        </div>
      \`;
    }).join('')}
  `;
}

// ── Agregar botón "Añadir a lista" en resultados ─────────────
function agregarBotonesALista() {
  document.querySelectorAll('.result-products .line').forEach(line => {
    if (line.querySelector('.btn-add-lista')) return;
    const nameEl  = line.querySelector('.prod-name');
    const priceEl = line.querySelector('.prod-price');
    const imgEl   = line.querySelector('img');
    const linkEl  = line.querySelector('a');
    const cardEl  = line.closest('.result-card');
    const tienda  = cardEl?.querySelector('.result-name')?.textContent || '';

    if (!nameEl) return;

    const nombre = nameEl.textContent.trim();
    const precioTxt = priceEl?.textContent?.replace(/[₡\s]/g, '').replace(/\./g, '').replace(',', '.') || '';
    const precio = parseFloat(precioTxt) || null;
    const imagen = imgEl?.src || '';
    const url    = linkEl?.href || '';

    const btn = document.createElement('button');
    btn.className = 'btn-add-lista';
    btn.title = 'Agregar a mi lista';
    btn.style.cssText = `
      background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,.2);
      border-radius:6px;padding:.15rem .5rem;font-size:.68rem;font-weight:600;
      cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:.25rem;
      transition:all 150ms;
    `;
    btn.textContent = '+ Lista';
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await agregarAlCarrito({ nombre, precio, tienda, imagen, url });
      btn.textContent = '✓';
      btn.style.background = '#ecfdf5';
      btn.style.color = '#16a34a';
      btn.style.borderColor = 'rgba(22,163,74,.2)';
      setTimeout(() => {
        btn.textContent = '+ Lista';
        btn.style.background = '#eff6ff';
        btn.style.color = '#2563eb';
        btn.style.borderColor = 'rgba(37,99,235,.2)';
      }, 2000);
    });

    line.appendChild(btn);
  });
}

// Observar cambios en resultados para agregar botones
const _resObserver = new MutationObserver(() => {
  setTimeout(agregarBotonesALista, 100);
});

window.addEventListener('DOMContentLoaded', () => {
  const results = document.getElementById('results');
  if (results) {
    _resObserver.observe(results, { childList: true, subtree: true });
  }
  initCarrito();
});
