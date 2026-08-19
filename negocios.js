/**
 * UbiqoCR — Buscador de negocios cercanos con mapa
 * Instalación: <script src="negocios.js"></script> después de api.js
 */

const GOOGLE_MAPS_KEY = 'AIzaSyCDqxvYCS8VnACMjIMmlyd3kraYfeArhK8';

var _negociosData = null;
var _mapaIniciado = false;
var _mapa = null;
var _marcadores = [];
var _infoWindow = null;

// ── Cargar datos de negocios ──────────────────────────────────
async function cargarNegocios() {
  if (_negociosData) return _negociosData;
  try {
    var res = await fetch('/data/negocios.json');
    _negociosData = await res.json();
    return _negociosData;
  } catch(e) {
    console.warn('No se pudo cargar negocios.json:', e.message);
    return [];
  }
}

// ── Normalizar texto ──────────────────────────────────────────
function normN(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// ── Buscar negocios por texto ─────────────────────────────────
function filtrarNegocios(query, todos) {
  var q = normN(query);
  if (!q) return todos;
  return todos.filter(function(n) {
    return normN(n.nombre).includes(q)
      || normN(n.categoria).includes(q)
      || normN(n.direccion).includes(q)
      || normN(n.ciudad).includes(q);
  });
}

// ── Calcular distancia ────────────────────────────────────────
function distanciaKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Agregar botón en el header ────────────────────────────────
function initNegocios() {
  if (document.getElementById('btnNegocios')) return;
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var li = document.createElement('li');
  li.innerHTML = '<a href="#" id="btnNegocios" onclick="abrirBuscadorNegocios();return false;" style="display:flex;align-items:center;gap:.35rem;padding:.45rem .85rem;border-radius:999px;font-size:.875rem;font-weight:500;color:#64748b;transition:all 180ms;">Negocios</a>';
  menu.appendChild(li);
}

// ── Modal principal ───────────────────────────────────────────
function abrirBuscadorNegocios() {
  if (document.getElementById('modalNegocios')) {
    document.getElementById('modalNegocios').remove();
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'modalNegocios';
  modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:2000;display:flex;flex-direction:column;font-family:\'DM Sans\',system-ui,sans-serif;';

  modal.innerHTML =
    // Header
    '<div style="padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:1rem;flex-shrink:0;">'
    + '<button onclick="document.getElementById(\'modalNegocios\').remove()" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:.4rem .875rem;font:inherit;font-size:.875rem;cursor:pointer;color:#64748b;">← Volver</button>'
    + '<div style="font-weight:700;font-size:1rem;color:#0f172a;">Encontrá negocios cercanos</div>'
    + '</div>'

    // Buscador
    + '<div style="padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;flex-shrink:0;background:#f8fafc;">'
    + '<div style="display:flex;gap:.75rem;flex-wrap:wrap;">'
    + '<input id="negocioQuery" type="search" placeholder="Buscá: supermercado, ferretería, farmacia..." style="flex:1;min-width:200px;padding:.65rem 1rem;border:1.5px solid #e2e8f0;border-radius:10px;font:inherit;font-size:.9rem;outline:none;" oninput="buscarNegociosUI()">'
    + '<button onclick="usarUbicacion()" style="padding:.65rem 1rem;background:#2563eb;color:#fff;border:none;border-radius:10px;font:inherit;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap;">Usar mi ubicación</button>'
    + '</div>'
    + '<div id="negociosFiltros" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;">'
    + ['Supermercado','Ferretería','Farmacia','Panadería','Mascotas','Electrónica','Ropa y Calzado','Mueblería'].map(function(c) {
        return '<button onclick="filtrarCategoria(\'' + c + '\')" class="chip-cat" style="padding:.3rem .75rem;border:1px solid #e2e8f0;border-radius:999px;font:inherit;font-size:.78rem;cursor:pointer;background:#fff;color:#64748b;transition:all .15s;">' + c + '</button>';
      }).join('')
    + '</div>'
    + '<div id="negociosStatus" style="font-size:.78rem;color:#64748b;margin-top:.5rem;"></div>'
    + '</div>'

    // Contenido: lista + mapa
    + '<div style="display:grid;grid-template-columns:380px 1fr;flex:1;overflow:hidden;" id="negociosGrid">'
    + '<div id="negociosList" style="overflow-y:auto;border-right:1px solid #e2e8f0;"></div>'
    + '<div id="negociosMap" style="width:100%;height:100%;"></div>'
    + '</div>';

  document.body.appendChild(modal);

  // Responsive: en móvil mostrar solo lista
  if (window.innerWidth < 700) {
    document.getElementById('negociosGrid').style.gridTemplateColumns = '1fr';
    document.getElementById('negociosMap').style.display = 'none';
  }

  cargarNegocios().then(function(todos) {
    mostrarNegocios(todos, null, null);
    iniciarMapa(todos);
  });
}

// ── Buscar ────────────────────────────────────────────────────
var _queryDebounce;
function buscarNegociosUI() {
  clearTimeout(_queryDebounce);
  _queryDebounce = setTimeout(async function() {
    var q = document.getElementById('negocioQuery').value.trim();
    var todos = await cargarNegocios();
    var filtrados = filtrarNegocios(q, todos);
    mostrarNegocios(filtrados, null, null);
    actualizarMarcadores(filtrados, null, null);
  }, 250);
}

function filtrarCategoria(cat) {
  document.getElementById('negocioQuery').value = cat;
  buscarNegociosUI();
  // Highlight chip
  document.querySelectorAll('.chip-cat').forEach(function(c) {
    var activo = c.textContent === cat;
    c.style.background = activo ? '#2563eb' : '#fff';
    c.style.color = activo ? '#fff' : '#64748b';
    c.style.borderColor = activo ? '#2563eb' : '#e2e8f0';
  });
}

// ── Usar ubicación del usuario ────────────────────────────────
function usarUbicacion() {
  var status = document.getElementById('negociosStatus');
  if (!navigator.geolocation) {
    status.textContent = 'Tu navegador no soporta geolocalización.';
    return;
  }
  status.textContent = '📍 Obteniendo tu ubicación...';
  navigator.geolocation.getCurrentPosition(async function(pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    status.textContent = '';

    var todos = await cargarNegocios();
    var q = document.getElementById('negocioQuery').value.trim();
    var filtrados = filtrarNegocios(q, todos);

    // Ordenar por distancia
    filtrados.forEach(function(n) {
      n._dist = (n.lat && n.lng) ? distanciaKm(lat, lng, n.lat, n.lng) : 999;
    });
    filtrados.sort(function(a, b) { return a._dist - b._dist; });

    mostrarNegocios(filtrados, lat, lng);
    actualizarMarcadores(filtrados, lat, lng);

    // Centrar mapa en ubicación del usuario
    if (_mapa) {
      _mapa.setCenter({ lat: lat, lng: lng });
      _mapa.setZoom(14);
      new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: _mapa,
        title: 'Tu ubicación',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        }
      });
    }
  }, function() {
    status.textContent = 'No se pudo obtener tu ubicación.';
  });
}

// ── Mostrar lista de negocios ─────────────────────────────────
function mostrarNegocios(lista, userLat, userLng) {
  var el = document.getElementById('negociosList');
  var status = document.getElementById('negociosStatus');
  if (!el) return;

  if (status) status.textContent = lista.length + ' negocios encontrados';

  if (!lista.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:#94a3b8;"><div style="font-size:2rem;margin-bottom:.5rem;">🔍</div><div>Sin resultados</div></div>';
    return;
  }

  el.innerHTML = lista.slice(0, 100).map(function(n, i) {
    var distHtml = '';
    if (n._dist && n._dist < 999) {
      distHtml = '<span style="font-size:.72rem;color:#2563eb;font-weight:600;">' + (n._dist < 1 ? Math.round(n._dist*1000) + 'm' : n._dist.toFixed(1) + 'km') + '</span>';
    }
    var telHtml = n.telefono ? '<a href="tel:' + n.telefono + '" style="font-size:.75rem;color:#2563eb;text-decoration:none;">' + n.telefono + '</a>' : '';
    var webHtml = n.web ? '<a href="' + n.web + '" target="_blank" style="font-size:.75rem;color:#2563eb;text-decoration:none;">Web</a>' : '';
    var ratingHtml = n.rating ? '<span style="font-size:.72rem;color:#f59e0b;">★ ' + n.rating + '</span>' : '';

    return '<div onclick="centrarEnNegocio(' + i + ')" style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background .1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'#fff\'">'
      + '<div style="display:flex;justify-content:space-between;align-items:start;gap:.5rem;">'
      + '<div style="font-weight:600;font-size:.9rem;color:#0f172a;line-height:1.3;">' + n.nombre + '</div>'
      + distHtml
      + '</div>'
      + '<div style="font-size:.75rem;color:#2563eb;font-weight:500;margin-top:.15rem;">' + n.categoria + '</div>'
      + '<div style="font-size:.78rem;color:#64748b;margin-top:.2rem;line-height:1.4;">' + (n.direccion || '') + '</div>'
      + '<div style="display:flex;gap:.75rem;align-items:center;margin-top:.4rem;flex-wrap:wrap;">'
      + ratingHtml + telHtml + webHtml
      + '</div>'
      + '</div>';
  }).join('');

  // Guardar lista para centrar en mapa
  window._negociosLista = lista;
}

// ── Mapa ──────────────────────────────────────────────────────
function iniciarMapa(negocios) {
  if (_mapaIniciado) return;
  if (typeof google === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY + '&callback=_mapCallback';
    script.async = true;
    window._mapCallback = function() { _crearMapa(negocios); };
    document.head.appendChild(script);
  } else {
    _crearMapa(negocios);
  }
  _mapaIniciado = true;
}

function _crearMapa(negocios) {
  var mapEl = document.getElementById('negociosMap');
  if (!mapEl) return;
  _mapa = new google.maps.Map(mapEl, {
    center: { lat: 9.9281, lng: -84.0907 },
    zoom: 10,
    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    mapTypeControl: false,
    streetViewControl: false,
  });
  _infoWindow = new google.maps.InfoWindow();
  actualizarMarcadores(negocios, null, null);
}

function actualizarMarcadores(negocios, userLat, userLng) {
  if (!_mapa) return;
  _marcadores.forEach(function(m) { m.setMap(null); });
  _marcadores = [];

  negocios.slice(0, 200).forEach(function(n, i) {
    if (!n.lat || !n.lng) return;
    var marker = new google.maps.Marker({
      position: { lat: n.lat, lng: n.lng },
      map: _mapa,
      title: n.nombre,
    });
    marker.addListener('click', function() {
      var distHtml = n._dist && n._dist < 999 ? '<br><span style="color:#2563eb;font-weight:600;">' + (n._dist < 1 ? Math.round(n._dist*1000)+'m' : n._dist.toFixed(1)+'km') + ' de distancia</span>' : '';
      var telHtml = n.telefono ? '<br><a href="tel:' + n.telefono + '">' + n.telefono + '</a>' : '';
      var webHtml = n.web ? '<br><a href="' + n.web + '" target="_blank">Sitio web</a>' : '';
      _infoWindow.setContent(
        '<div style="font-family:\'DM Sans\',sans-serif;max-width:220px;">'
        + '<div style="font-weight:700;font-size:.9rem;">' + n.nombre + '</div>'
        + '<div style="color:#2563eb;font-size:.75rem;margin-top:.2rem;">' + n.categoria + '</div>'
        + '<div style="color:#64748b;font-size:.78rem;margin-top:.2rem;">' + (n.direccion||'') + '</div>'
        + (n.rating ? '<div style="color:#f59e0b;font-size:.75rem;margin-top:.2rem;">★ ' + n.rating + '</div>' : '')
        + distHtml + telHtml + webHtml
        + '</div>'
      );
      _infoWindow.open(_mapa, marker);
    });
    _marcadores.push(marker);
  });
}

function centrarEnNegocio(idx) {
  var n = window._negociosLista && window._negociosLista[idx];
  if (!n || !n.lat || !_mapa) return;
  _mapa.setCenter({ lat: n.lat, lng: n.lng });
  _mapa.setZoom(16);
  if (_marcadores[idx]) {
    google.maps.event.trigger(_marcadores[idx], 'click');
  }
}

window.addEventListener('DOMContentLoaded', function() {
  initNegocios();
});
