/**
 * UbiqoCR — Parche de comparación de productos
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Agregá el CSS de abajo a styles.css
 * 2. Reemplazá el bloque de sortBy en index.html con el nuevo HTML
 * 3. Agregá este script al final del index.html antes de </body>
 * 
 * CAMBIOS:
 * - Filtro precio mínimo y máximo
 * - Vista de comparación lado a lado cuando hay productos similares
 * - Ordenamiento por precio mejorado
 */

// ─── INICIALIZAR CUANDO EL DOM ESTÉ LISTO ────────────────
window.addEventListener('DOMContentLoaded', () => {

  // ── 1. AGREGAR FILTROS DE PRECIO AL DOM ─────────────────
  const sortRow = document.querySelector('.sort-row');
  if (sortRow && !document.getElementById('precioMin')) {
    const precioFiltros = document.createElement('div');
    precioFiltros.className = 'precio-filtros';
    precioFiltros.innerHTML = `
      <span class="precio-filtros-label">Precio:</span>
      <input type="number" id="precioMin" placeholder="Mín ₡" min="0" class="precio-input">
      <span class="precio-sep">—</span>
      <input type="number" id="precioMax" placeholder="Máx ₡" min="0" class="precio-input">
      <button id="btnLimpiarPrecios" class="btn-limpiar-precio" title="Limpiar filtros de precio">✕</button>
    `;
    sortRow.parentElement.insertBefore(precioFiltros, sortRow.nextSibling);

    // Eventos de precio
    let debounceP;
    const triggerSearch = () => {
      clearTimeout(debounceP);
      debounceP = setTimeout(() => {
        const q = document.getElementById('q')?.value?.trim();
        if (q) window._ubiqoRunSearch?.(q);
        else window._ubiqoShowAll?.();
      }, 400);
    };

    document.getElementById('precioMin').addEventListener('input', triggerSearch);
    document.getElementById('precioMax').addEventListener('input', triggerSearch);
    document.getElementById('btnLimpiarPrecios').addEventListener('click', () => {
      document.getElementById('precioMin').value = '';
      document.getElementById('precioMax').value = '';
      triggerSearch();
    });
  }

  // ── 2. INTERCEPTAR RENDER PARA AGREGAR COMPARACIÓN ──────
  const _waitForRender = setInterval(() => {
    if (typeof renderResults === 'function' && !renderResults._comparePatch) {
      const _origRender = renderResults;

      window.renderResults = function(list, tokens) {
        // Aplicar filtros de precio
        const minP = parseFloat(document.getElementById('precioMin')?.value) || 0;
        const maxP = parseFloat(document.getElementById('precioMax')?.value) || Infinity;

        let filtrada = list;
        if (minP > 0 || maxP < Infinity) {
          filtrada = list.map(item => {
            const prods = (item.matches || item.productos || []).filter(p => {
              if (p.precio == null) return true; // sin precio siempre mostrar
              return p.precio >= minP && p.precio <= maxP;
            });
            return prods.length ? { ...item, matches: prods, productos: prods } : null;
          }).filter(Boolean);
        }

        // Llamar render original
        _origRender.call(this, filtrada, tokens);

        // Verificar si aplica vista comparación
        requestAnimationFrame(() => {
          _intentarVistaComparacion(filtrada, tokens);
        });
      };

      window.renderResults._comparePatch = true;

      // Guardar referencias para los filtros de precio
      window._ubiqoRunSearch = (q) => {
        // Disparar búsqueda usando el mecanismo existente
        const btn = document.getElementById('btnBuscar');
        const input = document.getElementById('q');
        if (input && q) input.value = q;
        if (btn) btn.click();
      };

      clearInterval(_waitForRender);
    }
  }, 150);

  // ── 3. VISTA COMPARACIÓN LADO A LADO ────────────────────
  function _intentarVistaComparacion(list, tokens) {
    const resultsEl = document.getElementById('results');
    if (!resultsEl) return;

    // Solo mostrar comparación si hay 2+ resultados con productos similares
    if (!list || list.length < 2) return;

    // Recolectar todos los productos únicos con sus precios
    const todosLosProductos = [];
    list.forEach(item => {
      const prods = item.matches || item.productos || [];
      prods.forEach(p => {
        if (p.precio != null) {
          todosLosProductos.push({
            negocio: item.nombre,
            nombre: p.producto,
            precio: p.precio,
            moneda: p.moneda || 'CRC',
            imagen: p.imagen || '',
            url: p.url || '',
          });
        }
      });
    });

    if (todosLosProductos.length < 2) return;

    // Ordenar por precio para el panel de comparación
    const sortBy = document.getElementById('sortBy')?.value;
    let ordenados = [...todosLosProductos];
    if (sortBy === 'price_asc' || sortBy === 'relevance') {
      ordenados.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'price_desc') {
      ordenados.sort((a, b) => b.precio - a.precio);
    }

    // Crear panel de comparación
    const existente = document.getElementById('ubiqo-compare-panel');
    if (existente) existente.remove();

    const panel = document.createElement('div');
    panel.id = 'ubiqo-compare-panel';
    panel.className = 'compare-panel';

    const precioMin = Math.min(...ordenados.map(p => p.precio));
    const precioMax = Math.max(...ordenados.map(p => p.precio));
    const ahorro = precioMax - precioMin;

    panel.innerHTML = `
      <div class="compare-header">
        <div class="compare-header-left">
          <span class="compare-icon">⚖️</span>
          <div>
            <div class="compare-title">Comparación de precios</div>
            <div class="compare-sub">${ordenados.length} productos encontrados · Ahorrás hasta <strong>₡${ahorro.toLocaleString('es-CR')}</strong> eligiendo el más barato</div>
          </div>
        </div>
        <button class="compare-toggle" id="compareToggle">Ocultar ▲</button>
      </div>
      <div class="compare-body" id="compareBody">
        <div class="compare-grid">
          ${ordenados.slice(0, 8).map((p, i) => `
            <div class="compare-card ${i === 0 ? 'compare-card--best' : ''}">
              ${i === 0 ? '<div class="compare-badge">Mejor precio</div>' : ''}
              ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="compare-img" onerror="this.style.display='none'">` : '<div class="compare-img-placeholder">🖼️</div>'}
              <div class="compare-store">${p.negocio}</div>
              <div class="compare-name">${p.nombre}</div>
              <div class="compare-price">₡${p.precio.toLocaleString('es-CR')}</div>
              ${i === 0 && ahorro > 0 ? `<div class="compare-save">−₡${ahorro.toLocaleString('es-CR')} vs más caro</div>` : ''}
              ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="compare-link">Ver producto →</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Insertar ANTES de los resultados
    resultsEl.parentElement.insertBefore(panel, resultsEl);

    // Toggle
    document.getElementById('compareToggle')?.addEventListener('click', function() {
      const body = document.getElementById('compareBody');
      const oculto = body.style.display === 'none';
      body.style.display = oculto ? '' : 'none';
      this.textContent = oculto ? 'Ocultar ▲' : 'Ver comparación ▼';
    });
  }

});
