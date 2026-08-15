/**
 * UbiqoCR — Portal de Partners
 * Instalación: <script src="partner.js"></script> después de api.js
 */

const SB_URL = 'https://yaokclqtckltkdshkquh.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2tjbHF0Y2tsdGtkc2hrcXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Njk5NzQsImV4cCI6MjEwMTU0NTk3NH0.hwKTobj9SItnOXsjb-3wDR_oU2EZw3ZgUsOoIOxkmMc';

// ── Cliente Supabase ─────────────────────────────────────────
const sbp = {
  async query(table, method, body, filters) {
    method = method || 'GET';
    filters = filters || '';
    var res = await fetch(SB_URL + '/rest/v1/' + table + filters, {
      method: method,
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : '',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      var err = await res.json().catch(function() { return {}; });
      throw new Error(err.message || 'HTTP ' + res.status);
    }
    if (res.status === 204) return null;
    return res.json();
  },
  async select(table, filters) { return this.query(table, 'GET', null, filters); },
  async insert(table, data)    { return this.query(table, 'POST', data); },
};

// ── Estado ────────────────────────────────────────────────────
var _partner = null;
var _partnerProductos = [];

// ── Init ─────────────────────────────────────────────────────
function initPartner() {
  // Agregar botón en el header
  agregarBotonPartner();

  // Recuperar sesión guardada
  var pid = localStorage.getItem('ubiqo_partner_id');
  if (pid) {
    sbp.select('partners', '?id=eq.' + pid).then(function(rows) {
      if (rows && rows.length) {
        _partner = rows[0];
        actualizarBotonPartner();
      }
    }).catch(function() {
      localStorage.removeItem('ubiqo_partner_id');
    });
  }
}

// ── Botón en header ───────────────────────────────────────────
function agregarBotonPartner() {
  if (document.getElementById('btnPartner')) return;
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var li = document.createElement('li');
  li.innerHTML = '<a href="#" id="btnPartner" onclick="abrirPortalPartner();return false;" style="display:flex;align-items:center;gap:.35rem;padding:.45rem .85rem;border-radius:999px;font-size:.875rem;font-weight:500;color:#64748b;transition:all 180ms;">Partners</a>';
  menu.appendChild(li);
}

function actualizarBotonPartner() {
  var btn = document.getElementById('btnPartner');
  if (!btn || !_partner) return;
  btn.innerHTML = '' + _partner.nombre_negocio.split(' ')[0];
}

// ── Portal principal ──────────────────────────────────────────
function abrirPortalPartner() {
  if (document.getElementById('portalPartner')) {
    document.getElementById('portalPartner').remove();
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'portalPartner';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:\'DM Sans\',system-ui,sans-serif;';
  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrarPortalPartner();
  });

  if (_partner) {
    if (_partner.estado === 'pendiente') {
      modal.innerHTML = crearPanelPendiente();
    } else if (_partner.estado === 'aprobado') {
      modal.innerHTML = crearPanelAprobado();
    } else {
      modal.innerHTML = crearPanelRechazado();
    }
  } else {
    modal.innerHTML = crearPanelAuth();
  }

  document.body.appendChild(modal);
}

function cerrarPortalPartner() {
  var el = document.getElementById('portalPartner');
  if (el) el.remove();
}

// ── Panel Auth (Login / Registro) ─────────────────────────────
function crearPanelAuth() {
  return '<div style="background:#fff;border-radius:20px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:2.5rem;position:relative;">'
    + '<button onclick="cerrarPortalPartner()" style="position:absolute;top:1.25rem;right:1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;padding:.35rem .7rem;font-size:.82rem;color:#64748b;">✕ Cerrar</button>'
    + '<div style="text-align:center;margin-bottom:2rem;">'
    + '<div style="font-size:2.5rem;margin-bottom:.75rem;"></div>'
    + '<h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin-bottom:.4rem;">Portal de Partners</h2>'
    + '<p style="font-size:.85rem;color:#64748b;line-height:1.6;">Registrá tu negocio en UbiqoCR y llegá a miles de consumidores que buscan tus productos.</p>'
    + '</div>'
    + '<div style="display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:1.5rem;">'
    + '<button id="ptabLogin" onclick="switchPartnerTab(\'login\')" style="flex:1;padding:.65rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:600;color:#2563eb;border-bottom:2px solid #2563eb;margin-bottom:-2px;cursor:pointer;">Iniciar sesión</button>'
    + '<button id="ptabReg" onclick="switchPartnerTab(\'registro\')" style="flex:1;padding:.65rem;border:none;background:none;font:inherit;font-size:.875rem;font-weight:500;color:#64748b;cursor:pointer;">Registrar negocio</button>'
    + '</div>'

    // FORM LOGIN
    + '<div id="pformLogin">'
    + '<div style="display:grid;gap:.75rem;">'
    + campoPartner('pLoginCorreo', 'email', 'Correo del negocio', 'tu@negocio.com')
    + campoPartner('pLoginCedula', 'text', 'Cédula jurídica', '3-101-123456')
    + '<div id="pLoginError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div>'
    + '<button onclick="handlePartnerLogin()" style="width:100%;padding:.75rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;">Entrar</button>'
    + '</div></div>'

    // FORM REGISTRO
    + '<div id="pformReg" style="display:none;">'
    + '<div style="display:grid;gap:.65rem;">'
    + campoPartner('pRegNegocio', 'text', 'Nombre del negocio *', 'Ferretería La Esquina')
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem;">'
    + campoPartner('pRegContacto', 'text', 'Nombre del contacto *', 'Juan Arce')
    + campoPartner('pRegTelefono', 'tel', 'Teléfono *', '8888-8888')
    + '</div>'
    + campoPartner('pRegCorreo', 'email', 'Correo electrónico *', 'tu@negocio.com')
    + campoPartner('pRegCedula', 'text', 'Cédula jurídica *', '3-101-123456')
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem;">'
    + campoPartnerSelect('pRegTipo', 'Tipo de negocio *', ['Ferretería','Supermercado','Mini súper / Pulpería','Farmacia','Hogar y decoración','Electrónica','Ropa y calzado','Otro'])
    + campoPartner('pRegProvincia', 'text', 'Provincia *', 'San José')
    + '</div>'
    + campoPartner('pRegCanton', 'text', 'Cantón *', 'Escazú')
    + '<div id="pRegError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;"></div>'
    + '<button onclick="handlePartnerRegistro()" style="width:100%;padding:.75rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;">Solicitar registro</button>'
    + '<p style="font-size:.72rem;color:#94a3b8;text-align:center;">Tu solicitud será revisada en menos de 48 horas.</p>'
    + '</div></div>'
    + '</div>';
}

function campoPartner(id, type, label, placeholder) {
  return '<div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">' + label + '</label>'
    + '<input id="' + id + '" type="' + type + '" placeholder="' + placeholder + '" style="width:100%;margin-top:.25rem;padding:.6rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.875rem;outline:none;"></div>';
}

function campoPartnerSelect(id, label, opciones) {
  return '<div><label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">' + label + '</label>'
    + '<select id="' + id + '" style="width:100%;margin-top:.25rem;padding:.6rem .875rem;border:1.5px solid #e2e8f0;border-radius:8px;font:inherit;font-size:.875rem;outline:none;background:#fff;">'
    + '<option value="">Elegí...</option>'
    + opciones.map(function(o) { return '<option>' + o + '</option>'; }).join('')
    + '</select></div>';
}

// ── Panel pendiente ───────────────────────────────────────────
function crearPanelPendiente() {
  return '<div style="background:#fff;border-radius:20px;width:100%;max-width:440px;padding:2.5rem;text-align:center;position:relative;">'
    + '<button onclick="cerrarPortalPartner()" style="position:absolute;top:1.25rem;right:1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;padding:.35rem .7rem;font-size:.82rem;color:#64748b;">✕</button>'
    + '<div style="font-size:3rem;margin-bottom:1rem;"></div>'
    + '<h2 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin-bottom:.5rem;">Solicitud en revisión</h2>'
    + '<p style="font-size:.875rem;color:#64748b;line-height:1.7;margin-bottom:1.5rem;">Tu negocio <strong>' + _partner.nombre_negocio + '</strong> está siendo revisado por nuestro equipo. Te contactaremos a <strong>' + _partner.correo + '</strong> en menos de 48 horas.</p>'
    + '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:1rem;font-size:.82rem;color:#92400e;">⭐ Mientras esperás, podés explorar ubiqocr.com y ver cómo aparecerán tus productos una vez aprobado.</div>'
    + '<button onclick="cerrarSesionPartner()" style="margin-top:1.25rem;background:none;border:none;font:inherit;font-size:.78rem;color:#94a3b8;cursor:pointer;text-decoration:underline;">Cerrar sesión</button>'
    + '</div>';
}

// ── Panel rechazado ───────────────────────────────────────────
function crearPanelRechazado() {
  return '<div style="background:#fff;border-radius:20px;width:100%;max-width:440px;padding:2.5rem;text-align:center;position:relative;">'
    + '<button onclick="cerrarPortalPartner()" style="position:absolute;top:1.25rem;right:1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;padding:.35rem .7rem;font-size:.82rem;color:#64748b;">✕</button>'
    + '<div style="font-size:3rem;margin-bottom:1rem;">❌</div>'
    + '<h2 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin-bottom:.5rem;">Solicitud no aprobada</h2>'
    + '<p style="font-size:.875rem;color:#64748b;line-height:1.7;">Tu solicitud no pudo ser aprobada. Escribinos a <a href="mailto:ubiqocr@gmail.com" style="color:#2563eb;">ubiqocr@gmail.com</a> para más información.</p>'
    + '<button onclick="cerrarSesionPartner()" style="margin-top:1.25rem;background:none;border:none;font:inherit;font-size:.78rem;color:#94a3b8;cursor:pointer;text-decoration:underline;">Cerrar sesión</button>'
    + '</div>';
}

// ── Panel aprobado (subir Excel) ──────────────────────────────
function crearPanelAprobado() {
  return '<div style="background:#fff;border-radius:20px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;padding:2.5rem;position:relative;">'
    + '<button onclick="cerrarPortalPartner()" style="position:absolute;top:1.25rem;right:1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;padding:.35rem .7rem;font-size:.82rem;color:#64748b;">✕ Cerrar</button>'
    + '<div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">'
    + '<div style="width:48px;height:48px;background:#ecfdf5;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">✅</div>'
    + '<div><h2 style="font-size:1.1rem;font-weight:700;color:#0f172a;">' + _partner.nombre_negocio + '</h2><div style="font-size:.78rem;color:#16a34a;font-weight:600;">Partner activo</div></div>'
    + '</div>'

    // Subir Excel
    + '<div style="border:2px dashed #e2e8f0;border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all .15s;margin-bottom:1.25rem;" id="pDropzone" onclick="document.getElementById(\'pFileInput\').click()" ondragover="event.preventDefault();this.style.borderColor=\'#2563eb\'" ondragleave="this.style.borderColor=\'#e2e8f0\'" ondrop="handlePartnerDrop(event)">'
    + '<input type="file" id="pFileInput" accept=".xlsx,.xls,.csv" style="display:none;" onchange="handlePartnerFile(this.files[0])">'
    + '<div style="font-size:2rem;margin-bottom:.5rem;">📊</div>'
    + '<div style="font-weight:600;font-size:.95rem;color:#0f172a;margin-bottom:.25rem;">Subí tu Excel de productos</div>'
    + '<div style="font-size:.8rem;color:#94a3b8;">Columnas: Nombre del producto | Precio | Moneda (opcional)</div>'
    + '</div>'

    + '<div id="pPreviewArea" style="display:none;">'
    + '<div id="pStats" style="display:flex;gap:1.5rem;margin-bottom:1rem;padding:.875rem 1rem;background:#f8fafc;border-radius:10px;"></div>'
    + '<div style="max-height:220px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;">'
    + '<table style="width:100%;border-collapse:collapse;font-size:.82rem;">'
    + '<thead><tr style="background:#f8fafc;"><th style="padding:.5rem .75rem;text-align:left;color:#64748b;font-weight:600;font-size:.72rem;text-transform:uppercase;">Producto</th><th style="padding:.5rem .75rem;text-align:right;color:#64748b;font-weight:600;font-size:.72rem;text-transform:uppercase;">Precio</th><th style="padding:.5rem .75rem;color:#64748b;font-weight:600;font-size:.72rem;text-transform:uppercase;">Imagen</th></tr></thead>'
    + '<tbody id="pPreviewBody"></tbody>'
    + '</table></div>'
    + '<div id="pSubirError" style="display:none;background:#fef2f2;color:#991b1b;padding:.6rem .875rem;border-radius:8px;font-size:.82rem;margin-bottom:.75rem;"></div>'
    + '<button onclick="subirProductosPartner()" style="width:100%;padding:.75rem;background:#16a34a;color:#fff;border:none;border-radius:8px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;">📤 Publicar productos en UbiqoCR</button>'
    + '</div>'

    + '<button onclick="cerrarSesionPartner()" style="margin-top:1.25rem;display:block;background:none;border:none;font:inherit;font-size:.78rem;color:#94a3b8;cursor:pointer;text-decoration:underline;">Cerrar sesión</button>'
    + '</div>';
}

// ── Tabs ──────────────────────────────────────────────────────
function switchPartnerTab(tab) {
  var isLogin = tab === 'login';
  var fl = document.getElementById('pformLogin');
  var fr = document.getElementById('pformReg');
  var tl = document.getElementById('ptabLogin');
  var tr = document.getElementById('ptabReg');
  if (!fl) return;
  fl.style.display = isLogin ? '' : 'none';
  fr.style.display = isLogin ? 'none' : '';
  tl.style.fontWeight = isLogin ? '600' : '500';
  tl.style.color = isLogin ? '#2563eb' : '#64748b';
  tl.style.borderBottom = isLogin ? '2px solid #2563eb' : 'none';
  tr.style.fontWeight = isLogin ? '500' : '600';
  tr.style.color = isLogin ? '#64748b' : '#2563eb';
  tr.style.borderBottom = isLogin ? 'none' : '2px solid #2563eb';
}

// ── Login ─────────────────────────────────────────────────────
async function handlePartnerLogin() {
  var correo = document.getElementById('pLoginCorreo').value.trim();
  var cedula = document.getElementById('pLoginCedula').value.trim();
  var errEl  = document.getElementById('pLoginError');
  if (!correo || !cedula) { errEl.style.display = ''; errEl.textContent = 'Completá todos los campos.'; return; }
  try {
    errEl.style.display = 'none';
    var rows = await sbp.select('partners', '?correo=eq.' + encodeURIComponent(correo) + '&cedula_juridica=eq.' + encodeURIComponent(cedula));
    if (!rows || !rows.length) throw new Error('Correo o cédula jurídica incorrectos.');
    _partner = rows[0];
    localStorage.setItem('ubiqo_partner_id', _partner.id);
    actualizarBotonPartner();
    cerrarPortalPartner();
    setTimeout(abrirPortalPartner, 100);
  } catch(e) {
    errEl.style.display = ''; errEl.textContent = e.message;
  }
}

// ── Registro ──────────────────────────────────────────────────
async function handlePartnerRegistro() {
  var negocio  = document.getElementById('pRegNegocio').value.trim();
  var contacto = document.getElementById('pRegContacto').value.trim();
  var telefono = document.getElementById('pRegTelefono').value.trim();
  var correo   = document.getElementById('pRegCorreo').value.trim();
  var cedula   = document.getElementById('pRegCedula').value.trim();
  var tipo     = document.getElementById('pRegTipo').value.trim();
  var provincia= document.getElementById('pRegProvincia').value.trim();
  var canton   = document.getElementById('pRegCanton').value.trim();
  var errEl    = document.getElementById('pRegError');

  if (!negocio || !contacto || !telefono || !correo || !cedula || !tipo || !provincia || !canton) {
    errEl.style.display = ''; errEl.textContent = 'Completá todos los campos obligatorios.'; return;
  }

  try {
    errEl.style.display = 'none';
    var existe = await sbp.select('partners', '?correo=eq.' + encodeURIComponent(correo));
    if (existe && existe.length) throw new Error('Ya existe una cuenta con ese correo.');
    var existeCedula = await sbp.select('partners', '?cedula_juridica=eq.' + encodeURIComponent(cedula));
    if (existeCedula && existeCedula.length) throw new Error('Ya existe una cuenta con esa cédula jurídica.');

    var nuevo = await sbp.insert('partners', {
      nombre_negocio: negocio, nombre_contacto: contacto,
      telefono: telefono, correo: correo, cedula_juridica: cedula,
      tipo_negocio: tipo, provincia: provincia, canton: canton,
      estado: 'pendiente'
    });
    _partner = nuevo[0];
    localStorage.setItem('ubiqo_partner_id', _partner.id);
    actualizarBotonPartner();
    cerrarPortalPartner();
    setTimeout(abrirPortalPartner, 100);
  } catch(e) {
    errEl.style.display = ''; errEl.textContent = e.message;
  }
}

// ── Cerrar sesión ─────────────────────────────────────────────
function cerrarSesionPartner() {
  _partner = null;
  localStorage.removeItem('ubiqo_partner_id');
  var btn = document.getElementById('btnPartner');
  if (btn) btn.innerHTML = 'Partners';
  cerrarPortalPartner();
}

// ── Manejo de Excel ───────────────────────────────────────────
function handlePartnerDrop(e) {
  e.preventDefault();
  document.getElementById('pDropzone').style.borderColor = '#e2e8f0';
  if (e.dataTransfer.files[0]) handlePartnerFile(e.dataTransfer.files[0]);
}

function handlePartnerFile(file) {
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    alert('Cargando librería Excel, intentá de nuevo en un momento.');
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(s);
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var wb = XLSX.read(e.target.result, { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!raw || raw.length < 2) throw new Error('El archivo está vacío.');

      var primera = raw[0].map(function(c) { return String(c).toLowerCase().trim(); });
      var esEnc = primera.some(function(c) { return ['nombre','producto','precio','price','name'].indexOf(c) !== -1; });
      var filas = esEnc ? raw.slice(1) : raw;

      _partnerProductos = [];
      filas.forEach(function(fila) {
        var nombre = String(fila[0] || '').trim();
        if (!nombre) return;
        var precio = parseFloat(String(fila[1] || '').replace(/[₡$,\s]/g, '')) || null;
        var moneda = String(fila[2] || '').trim().toUpperCase();
        if (moneda !== 'USD') moneda = 'CRC';
        var categoria = String(fila[3] || '').trim();
        _partnerProductos.push({ nombre: nombre, precio: precio, moneda: moneda, categoria: categoria });
      });

      mostrarPreviewPartner();
    } catch(err) {
      alert('Error: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

async function mostrarPreviewPartner() {
  var area = document.getElementById('pPreviewArea');
  var body = document.getElementById('pPreviewBody');
  if (!area || !body) return;

  area.style.display = '';

  // Buscar imágenes en los JSONs existentes
  var todos = [];
  if (typeof cargarProductosEstaticos === 'function') {
    try { todos = await cargarProductosEstaticos(); } catch(e) {}
  }

  function buscarImagen(nombre) {
    var qn = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var palabras = qn.split(/\s+/).filter(function(w) { return w.length > 2; });
    for (var i = 0; i < todos.length; i++) {
      var pn = (todos[i].nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var coincide = palabras.filter(function(w) { return pn.includes(w); }).length;
      if (coincide / palabras.length >= 0.5 && todos[i].imagen) return todos[i].imagen;
    }
    return '';
  }

  var conPrecio = _partnerProductos.filter(function(p) { return p.precio; }).length;
  document.getElementById('pStats').innerHTML = '<div><div style="font-size:1.4rem;font-weight:700;">' + _partnerProductos.length + '</div><div style="font-size:.72rem;color:#64748b;">productos</div></div>'
    + '<div><div style="font-size:1.4rem;font-weight:700;color:#16a34a;">' + conPrecio + '</div><div style="font-size:.72rem;color:#64748b;">con precio</div></div>';

  body.innerHTML = _partnerProductos.slice(0, 50).map(function(p) {
    var img = buscarImagen(p.nombre);
    var imgHtml = img ? '<img src="' + img + '" style="width:28px;height:28px;object-fit:contain;border-radius:4px;" onerror="this.style.display=\'none\'">' : '<span style="color:#94a3b8;font-size:.72rem;">Sin foto</span>';
    return '<tr style="border-bottom:1px solid #f1f5f9;">'
      + '<td style="padding:.4rem .75rem;color:#0f172a;">' + p.nombre + '</td>'
      + '<td style="padding:.4rem .75rem;text-align:right;font-weight:600;color:#1d4ed8;">' + (p.precio ? '₡' + p.precio.toLocaleString('es-CR') : '<span style="color:#94a3b8;">—</span>') + '</td>'
      + '<td style="padding:.4rem .75rem;text-align:center;">' + imgHtml + '</td>'
      + '</tr>';
  }).join('');

  if (_partnerProductos.length > 50) {
    body.innerHTML += '<tr><td colspan="3" style="padding:.5rem .75rem;color:#94a3b8;font-size:.78rem;text-align:center;">... y ' + (_partnerProductos.length - 50) + ' productos más</td></tr>';
  }
}

async function subirProductosPartner() {
  if (!_partner || !_partnerProductos.length) return;
  var errEl = document.getElementById('pSubirError');
  var btn = document.querySelector('#portalPartner button[onclick="subirProductosPartner()"]');
  if (btn) { btn.textContent = 'Subiendo...'; btn.disabled = true; }

  try {
    var todos = [];
    if (typeof cargarProductosEstaticos === 'function') {
      try { todos = await cargarProductosEstaticos(); } catch(e) {}
    }

    function buscarImagen(nombre) {
      var qn = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var palabras = qn.split(/\s+/).filter(function(w) { return w.length > 2; });
      for (var i = 0; i < todos.length; i++) {
        var pn = (todos[i].nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        var coincide = palabras.filter(function(w) { return pn.includes(w); }).length;
        if (coincide / palabras.length >= 0.5 && todos[i].imagen) return todos[i].imagen;
      }
      return '';
    }

    // Subir en lotes de 50
    var lote = 50;
    for (var i = 0; i < _partnerProductos.length; i += lote) {
      var batch = _partnerProductos.slice(i, i + lote).map(function(p) {
        return {
          partner_id: _partner.id,
          nombre: p.nombre,
          precio: p.precio,
          moneda: p.moneda || 'CRC',
          categoria: p.categoria || '',
          imagen: buscarImagen(p.nombre),
          estado: 'pendiente'
        };
      });
      await sbp.insert('partner_productos', batch);
    }

    cerrarPortalPartner();
    mostrarToastPartner(_partnerProductos.length + ' productos enviados para revisión');
  } catch(e) {
    if (errEl) { errEl.style.display = ''; errEl.textContent = 'Error al subir: ' + e.message; }
    if (btn) { btn.textContent = 'Publicar productos en UbiqoCR'; btn.disabled = false; }
  }
}

function mostrarToastPartner(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:.65rem 1.25rem;border-radius:999px;font-size:.85rem;font-weight:500;z-index:3000;box-shadow:0 4px 16px rgba(0,0,0,.2);font-family:inherit;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 4000);
}

// ── Init al cargar ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  // Cargar XLSX si no está
  if (typeof XLSX === 'undefined') {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(s);
  }
  initPartner();
});
