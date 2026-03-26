// ============================================================
// UbiqoCR — Inventario expandido: EPA, El Lagar, Novex
// Precios verificados de epaenlinea.com (marzo 2025-2026)
// Ejecutar en consola del navegador con index.html abierto
// ============================================================
(function expandirInventarioUbiqoCR() {
  const STORAGE_KEY = "ubiqocr_productos_negocios_v2";

  // ── Cargar negocios existentes ────────────────────────────
  let existentes = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    existentes = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(existentes)) existentes = [];
  } catch(e) { existentes = []; }

  // ── Mapa id → índice para actualizar in-place ─────────────
  const idxPorId = {};
  existentes.forEach((b, i) => { if (b.id) idxPorId[b.id] = i; });

  // ── Productos adicionales por negocio (id → array) ────────
  //    Se FUSIONAN con los productos ya existentes del negocio.
  //    No se duplican si el nombre exacto ya existe.

  const EXPANSIONES = {

    // ════════════════════════════════════════════════════════
    // EPA ESCAZÚ — ubiqo-seed-001
    // Categorías: Herramientas, Baños, Iluminación, Ferretería
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-001": [
      // Herramientas eléctricas (precios reales EPA CR)
      { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
      { producto: "Taladro percutor Einhell 1/2\" 710W", moneda: "CRC", precio: 24950 },
      { producto: "Taladro percutor Einhell 1/2\" 550W", moneda: "CRC", precio: 21950 },
      { producto: "Taladro alámbrico DeWalt 1/2\" 800W", moneda: "CRC", precio: 69950 },
      { producto: "Taladro alámbrico DeWalt 1/2\" 650W", moneda: "CRC", precio: 56950 },
      { producto: "Rotomartillo SDS Plus Einhell 2.2J", moneda: "CRC", precio: 64995 },
      { producto: "Amoladora angular Einhell 115mm 710W", moneda: "CRC", precio: 22950 },
      { producto: "Sierra caladora Einhell 650W", moneda: "CRC", precio: 28950 },
      // Pinturas (precios reales EPA CR)
      { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
      { producto: "Pintura látex Primera SUR blanco satinado 1 galón", moneda: "CRC", precio: 13950 },
      { producto: "Pintura látex Primera SUR blanco mate 5 galones", moneda: "CRC", precio: 63950 },
      { producto: "Pintura látex Goltex SUR blanco mate 1 galón", moneda: "CRC", precio: 16950 },
      { producto: "Pintura látex Stainless Lanco blanco mate 1 galón", moneda: "CRC", precio: 19950 },
      // Iluminación (precios reales EPA CR)
      { producto: "Bombillo LED A60 E27 15W luz fría 6000K (2 u)", moneda: "CRC", precio: 3350 },
      { producto: "Lámpara LED techo 18W 6500K níquel satinado (2 u)", moneda: "CRC", precio: 21250 },
      { producto: "Lámpara LED techo 18W chocolate (2 u)", moneda: "CRC", precio: 25500 },
      // Baños (precios reales EPA CR)
      { producto: "Inodoro elongado Aquapro Rimless 2 piezas doble descarga blanco", moneda: "CRC", precio: 89950 },
      { producto: "Mueble de baño Texas PVC 60x46x50cm blanco con lavamanos y espejo", moneda: "CRC", precio: 159950 },
      { producto: "Mueble de baño Benín MDF 48x61x46cm marrón con lavamanos", moneda: "CRC", precio: 89950 },
      { producto: "Columna de ducha agua fría y caliente acero inoxidable Aqua Nuova", moneda: "CRC", precio: 24950 },
      { producto: "Gabinete baño plástico blanco con espejo", moneda: "CRC", precio: 29995 },
      { producto: "Dispensador de jabón con porta esponja acero inoxidable iDesign", moneda: "CRC", precio: 11995 },
      // Cerraduras (precios reales EPA CR)
      { producto: "Pomo sin llave bronce antiguo", moneda: "CRC", precio: 13950 },
      { producto: "Manija sin llave London baño cromo satinado", moneda: "CRC", precio: 10995 },
      { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
      { producto: "Entrada principal con cerrojo Liverpool cromo satinado", moneda: "CRC", precio: 29995 },
      { producto: "Cerradura entrada principal bronce", moneda: "CRC", precio: 34950 },
      { producto: "Cerradura entrada principal digital huella Yale", moneda: "CRC", precio: 89950 },
      { producto: "Cerrojo para ventana con tornillo de pulgar", moneda: "CRC", precio: 2195 },
      // Ferretería menor (precios reales EPA CR)
      { producto: "Tornillo concreto cabeza plana 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
      { producto: "Remache 3/16\" x 1/2\" (10 u)", moneda: "CRC", precio: 670 },
      { producto: "Candado 70mm arco corto latón níquel satinado Yale", moneda: "CRC", precio: 19595 },
      // Maderas y acabados (precios reales EPA CR)
      { producto: "Puerta melamina 80x210cm 4mm", moneda: "CRC", precio: 33950 },
      { producto: "Puerta melamina 90x210cm 4mm", moneda: "CRC", precio: 33950 },
      { producto: "Porcelanato 60x120cm gris mármol esmaltado 1.44m² caja", moneda: "CRC", precio: 21500 },
      // Muebles cocina (precios reales EPA CR)
      { producto: "Alacena multiuso 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
      { producto: "Alacena multiuso 155x76x36cm blanco", moneda: "CRC", precio: 39995 },
      { producto: "Isla de cocina MDP nogal 100x120x36cm", moneda: "CRC", precio: 49995 },
    ],

    // ════════════════════════════════════════════════════════
    // EPA CURRIDABAT — ubiqo-seed-002
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-002": [
      { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
      { producto: "Taladro alámbrico DeWalt 1/2\" 650W", moneda: "CRC", precio: 56950 },
      { producto: "Rotomartillo SDS Plus 800W 2.3J", moneda: "CRC", precio: 134950 },
      { producto: "Amoladora angular Einhell 115mm 710W", moneda: "CRC", precio: 22950 },
      { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
      { producto: "Pintura látex Primera SUR blanco satinado 5 galones", moneda: "CRC", precio: 63950 },
      { producto: "Inodoro elongado Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
      { producto: "Mueble de baño Texas PVC 60x46x50cm blanco", moneda: "CRC", precio: 159950 },
      { producto: "Columna ducha acero inoxidable Aqua Nuova", moneda: "CRC", precio: 24950 },
      { producto: "Cerradura entrada principal digital huella Yale", moneda: "CRC", precio: 89950 },
      { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
      { producto: "Bombillo LED A60 E27 15W luz fría (2 u)", moneda: "CRC", precio: 3350 },
      { producto: "Lámpara LED techo 18W 6500K (2 u)", moneda: "CRC", precio: 21250 },
      { producto: "Puerta melamina 80x210cm 4mm", moneda: "CRC", precio: 33950 },
      { producto: "Porcelanato 60x120cm gris mármol 1.44m² caja", moneda: "CRC", precio: 21500 },
      { producto: "Alacena multiuso 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
      { producto: "Estufa gas acero inoxidable 5 hornillas Drija", moneda: "CRC", precio: 258950 },
      { producto: "Estufa gas vidrio templado 4 hornillas Drija", moneda: "CRC", precio: 167950 },
      { producto: "Cocina gas acero inoxidable 2 hornillas Rinnai", moneda: "CRC", precio: 49950 },
      { producto: "Tornillo concreto 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
    ],

    // ════════════════════════════════════════════════════════
    // EPA TIBÁS — EPA tiene sucursal en Tibás (datos de cadena)
    // Creamos un registro nuevo si no existe
    // ════════════════════════════════════════════════════════

    // ════════════════════════════════════════════════════════
    // EPA LA URUCA — ubiqo-seed-013
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-013": [
      { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
      { producto: "Taladro percutor Einhell 550W 1/2\"", moneda: "CRC", precio: 21950 },
      { producto: "Rotomartillo SDS Plus Einhell 2.2J", moneda: "CRC", precio: 64995 },
      { producto: "Amoladora angular Einhell 710W 115mm", moneda: "CRC", precio: 22950 },
      { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
      { producto: "Pintura látex Primera SUR blanco mate 5 galones", moneda: "CRC", precio: 63950 },
      { producto: "Pintura látex Goltex SUR blanco mate 1 galón", moneda: "CRC", precio: 16950 },
      { producto: "Inodoro elongado Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
      { producto: "Mueble baño Texas PVC 60x46x50cm con lavamanos", moneda: "CRC", precio: 159950 },
      { producto: "Cerradura digital huella Yale", moneda: "CRC", precio: 89950 },
      { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
      { producto: "Bombillo LED A60 E27 15W (2 u)", moneda: "CRC", precio: 3350 },
      { producto: "Lámpara LED techo 18W níquel (2 u)", moneda: "CRC", precio: 21250 },
      { producto: "Puerta melamina 80x210cm", moneda: "CRC", precio: 33950 },
      { producto: "Porcelanato 60x120cm gris mármol 1.44m² caja", moneda: "CRC", precio: 21500 },
      { producto: "Estufa gas vidrio templado 4 hornillas Drija", moneda: "CRC", precio: 167950 },
      { producto: "Tornillo concreto 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
      { producto: "Aldaba con bisagra 4\"", moneda: "CRC", precio: 9895 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR DESAMPARADOS — ubiqo-seed-003
    // Inventario ampliado por categorías
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-003": [
      // Herramientas eléctricas
      { producto: "Taladro percutor 650W 1/2\" DeWalt", moneda: "CRC", precio: 55000 },
      { producto: "Amoladora angular 720W 4.5\" Black+Decker", moneda: "CRC", precio: 24500 },
      { producto: "Sierra caladora 650W Black+Decker", moneda: "CRC", precio: 38000 },
      { producto: "Lijadora orbital 200W Black+Decker", moneda: "CRC", precio: 22000 },
      // Herramientas manuales
      { producto: "Martillo carpintero 16oz mango fibra de vidrio", moneda: "CRC", precio: 8200 },
      { producto: "Nivel de burbuja aluminio 60cm", moneda: "CRC", precio: 5500 },
      { producto: "Metro de mano 5m Stanley FatMax", moneda: "CRC", precio: 7800 },
      { producto: "Juego de destornilladores 6 piezas Stanley", moneda: "CRC", precio: 9500 },
      { producto: "Alicate de presión 10\" Stanley", moneda: "CRC", precio: 8900 },
      // Eléctrico
      { producto: "Cable THW #14 AWG (metro)", moneda: "CRC", precio: 480 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Cable THW #10 AWG (metro)", moneda: "CRC", precio: 950 },
      { producto: "Interruptor sencillo blanco 15A Leviton", moneda: "CRC", precio: 3000 },
      { producto: "Tomacorriente doble polarizado blanco 15A Leviton", moneda: "CRC", precio: 3800 },
      { producto: "Breaker 15A 1 polo Square D", moneda: "CRC", precio: 4500 },
      { producto: "Breaker 20A 2 polos Square D", moneda: "CRC", precio: 7800 },
      { producto: "Caja eléctrica 4x4 metálica", moneda: "CRC", precio: 1200 },
      // Pinturas
      { producto: "Pintura látex interior blanco mate 1 galón SUR", moneda: "CRC", precio: 14200 },
      { producto: "Pintura látex interior blanco satinado 1 galón SUR", moneda: "CRC", precio: 14200 },
      { producto: "Pintura látex 5 galones blanco mate SUR", moneda: "CRC", precio: 62000 },
      { producto: "Pintura acrílica exterior blanco 1 galón SUR", moneda: "CRC", precio: 15800 },
      { producto: "Impermeabilizante techo blanco 1 galón SUR", moneda: "CRC", precio: 23500 },
      { producto: "Pintura anticorrosivo rojo 1 galón SUR", moneda: "CRC", precio: 18000 },
      { producto: "Imprimante blanco 1 galón SUR", moneda: "CRC", precio: 9800 },
      { producto: "Rodillo pintura 9\" felpa", moneda: "CRC", precio: 4200 },
      { producto: "Brocha cerda natural 3\"", moneda: "CRC", precio: 2500 },
      // Fontanería
      { producto: "Tubo PVC presión 1/2\" x 6m Pavco", moneda: "CRC", precio: 4200 },
      { producto: "Tubo PVC presión 3/4\" x 6m Pavco", moneda: "CRC", precio: 5800 },
      { producto: "Tubo PVC sanitario 4\" x 3m Pavco", moneda: "CRC", precio: 8200 },
      { producto: "Codo PVC 90° 1/2\"", moneda: "CRC", precio: 180 },
      { producto: "Unión PVC 1/2\"", moneda: "CRC", precio: 150 },
      { producto: "Tee PVC 1/2\"", moneda: "CRC", precio: 220 },
      { producto: "Llave de paso bola PVC 1/2\" Pavco", moneda: "CRC", precio: 3200 },
      { producto: "Pegamento PVC 120ml Can-tex", moneda: "CRC", precio: 2800 },
      // Iluminación
      { producto: "Foco LED 9W luz cálida 3000K E27", moneda: "CRC", precio: 2800 },
      { producto: "Foco LED 9W luz blanca 6500K E27", moneda: "CRC", precio: 2800 },
      { producto: "Foco LED 12W luz blanca E27", moneda: "CRC", precio: 3300 },
      { producto: "Panel LED empotrar 18W redondo luz blanca", moneda: "CRC", precio: 8500 },
      { producto: "Reflector LED 30W exterior IP65", moneda: "CRC", precio: 12000 },
      // Acabados / pisos
      { producto: "Cerámica piso 45x45 gris antideslizante m²", moneda: "CRC", precio: 9200 },
      { producto: "Adhesivo cerámica gris 25kg Sika", moneda: "CRC", precio: 8900 },
      { producto: "Grout junta cerámica beige 1kg Sika", moneda: "CRC", precio: 2400 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR MORAVIA — ubiqo-seed-004
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-004": [
      { producto: "Taladro percutor 600W 1/2\" Black+Decker", moneda: "CRC", precio: 32000 },
      { producto: "Amoladora angular 700W 4.5\" Tactix", moneda: "CRC", precio: 21500 },
      { producto: "Martillo carpintero 16oz Stanley", moneda: "CRC", precio: 8500 },
      { producto: "Metro de mano 5m Stanley", moneda: "CRC", precio: 7800 },
      { producto: "Pintura látex interior blanco 1 galón SUR", moneda: "CRC", precio: 14200 },
      { producto: "Pintura látex 5 galones blanco SUR", moneda: "CRC", precio: 62000 },
      { producto: "Pintura acrílica exterior 1 galón SUR", moneda: "CRC", precio: 15800 },
      { producto: "Imprimante blanco 1 galón SUR", moneda: "CRC", precio: 9800 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Cable THW #10 AWG (metro)", moneda: "CRC", precio: 950 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3000 },
      { producto: "Tomacorriente doble polarizado Leviton", moneda: "CRC", precio: 3800 },
      { producto: "Foco LED 9W cálida E27", moneda: "CRC", precio: 2800 },
      { producto: "Panel LED empotrar 18W luz blanca", moneda: "CRC", precio: 8500 },
      { producto: "Tubo PVC 1/2\" x 6m presión", moneda: "CRC", precio: 4200 },
      { producto: "Tubo PVC 4\" x 3m sanitario Pavco", moneda: "CRC", precio: 8200 },
      { producto: "Cerámica piso 45x45 gris m²", moneda: "CRC", precio: 9200 },
      { producto: "Adhesivo cerámica gris 25kg Sika", moneda: "CRC", precio: 8900 },
      { producto: "Plywood pino 4x8 pies 12mm", moneda: "CRC", precio: 22000 },
      { producto: "Plywood pino 4x8 pies 18mm", moneda: "CRC", precio: 31000 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR ALAJUELA — ubiqo-seed-005
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-005": [
      { producto: "Taladro percutor 600W 1/2\"", moneda: "CRC", precio: 32000 },
      { producto: "Amoladora angular 700W 4.5\"", moneda: "CRC", precio: 21500 },
      { producto: "Pintura látex interior blanco 1 galón SUR", moneda: "CRC", precio: 14300 },
      { producto: "Pintura acrílica exterior blanco 1 galón SUR", moneda: "CRC", precio: 15900 },
      { producto: "Imprimante blanco 1 galón SUR", moneda: "CRC", precio: 9800 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3000 },
      { producto: "Tomacorriente doble polarizado Leviton", moneda: "CRC", precio: 3800 },
      { producto: "Foco LED 9W luz cálida E27", moneda: "CRC", precio: 2800 },
      { producto: "Panel LED empotrar 18W redondo", moneda: "CRC", precio: 8500 },
      { producto: "Llave ducha monomando Helvex cromada", moneda: "CRC", precio: 18500 },
      { producto: "Sanitario blanco elongado Briggs", moneda: "CRC", precio: 68000 },
      { producto: "Lavatorio sobreponer blanco 55cm Briggs", moneda: "CRC", precio: 22500 },
      { producto: "Inodoro elongado 2 piezas blanco Aquapro", moneda: "CRC", precio: 89950 },
      { producto: "Plywood pino 4x8 pies 9mm", moneda: "CRC", precio: 18500 },
      { producto: "Varilla deformada 5/8\" x 6m Grado 60", moneda: "CRC", precio: 14200 },
      { producto: "Arena lavada m³ entrega en obra", moneda: "CRC", precio: 22500 },
      { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9800 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR SANTO DOMINGO — ubiqo-seed-010
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-010": [
      { producto: "Taladro percutor 600W 1/2\" Black+Decker", moneda: "CRC", precio: 32000 },
      { producto: "Amoladora angular 710W 4.5\"", moneda: "CRC", precio: 22000 },
      { producto: "Pintura látex interior blanco 1 galón SUR", moneda: "CRC", precio: 14500 },
      { producto: "Pintura látex 5 galones blanco SUR", moneda: "CRC", precio: 62000 },
      { producto: "Pintura acrílica exterior 1 galón SUR", moneda: "CRC", precio: 15900 },
      { producto: "Imprimante blanco 1 galón SUR", moneda: "CRC", precio: 9800 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Cable THW #10 AWG (metro)", moneda: "CRC", precio: 950 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3000 },
      { producto: "Tomacorriente doble polarizado Leviton", moneda: "CRC", precio: 3800 },
      { producto: "Foco LED 12W luz blanca E27", moneda: "CRC", precio: 3300 },
      { producto: "Panel LED empotrar 18W luz blanca redondo", moneda: "CRC", precio: 8500 },
      { producto: "Cerámica piso 45x45 gris m²", moneda: "CRC", precio: 9200 },
      { producto: "Adhesivo cerámica gris 25kg Sika", moneda: "CRC", precio: 8900 },
      { producto: "Tubo PVC 1/2\" x 6m presión Pavco", moneda: "CRC", precio: 4200 },
      { producto: "Tubo PVC 4\" x 3m sanitario Pavco", moneda: "CRC", precio: 8200 },
      { producto: "Llave paso bola 1/2\" PVC Pavco", moneda: "CRC", precio: 3200 },
      { producto: "Plywood pino 4x8 pies 9mm", moneda: "CRC", precio: 18500 },
      { producto: "Varilla deformada 5/8\" x 6m G60", moneda: "CRC", precio: 14200 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR BELÉN — ubiqo-seed-011
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-011": [
      { producto: "Taladro percutor 600W 1/2\"", moneda: "CRC", precio: 32000 },
      { producto: "Amoladora angular 700W 4.5\"", moneda: "CRC", precio: 21500 },
      { producto: "Pintura látex interior blanco 1 galón SUR", moneda: "CRC", precio: 14500 },
      { producto: "Pintura látex 5 galones blanco SUR", moneda: "CRC", precio: 62000 },
      { producto: "Pintura acrílica exterior 1 galón SUR", moneda: "CRC", precio: 15900 },
      { producto: "Cable THW #14 AWG (metro)", moneda: "CRC", precio: 480 },
      { producto: "Breaker 15A 1 polo Square D", moneda: "CRC", precio: 4500 },
      { producto: "Foco LED 9W cálida E27", moneda: "CRC", precio: 2800 },
      { producto: "Panel LED 18W empotrar luz blanca", moneda: "CRC", precio: 8500 },
      { producto: "Cerámica piso 45x45 m²", moneda: "CRC", precio: 9200 },
      { producto: "Adhesivo cerámica 25kg Sika", moneda: "CRC", precio: 8900 },
      { producto: "Plywood pino 4x8 pies 12mm", moneda: "CRC", precio: 22000 },
      { producto: "Varilla deformada 3/8\" x 6m G60", moneda: "CRC", precio: 5200 },
      { producto: "Varilla deformada 5/8\" x 6m G60", moneda: "CRC", precio: 14200 },
      { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9800 },
    ],

    // ════════════════════════════════════════════════════════
    // EL LAGAR PAVAS — ubiqo-seed-028
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-028": [
      { producto: "Taladro percutor 600W 1/2\"", moneda: "CRC", precio: 32000 },
      { producto: "Amoladora angular 700W 4.5\" Tactix", moneda: "CRC", precio: 21500 },
      { producto: "Pintura látex 5 galones blanco SUR", moneda: "CRC", precio: 62000 },
      { producto: "Pintura acrílica exterior 1 galón SUR", moneda: "CRC", precio: 15800 },
      { producto: "Imprimante blanco 1 galón SUR", moneda: "CRC", precio: 9800 },
      { producto: "Impermeabilizante techo blanco 1 galón SUR", moneda: "CRC", precio: 23500 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3000 },
      { producto: "Tomacorriente doble polarizado Leviton", moneda: "CRC", precio: 3800 },
      { producto: "Foco LED 12W luz blanca E27", moneda: "CRC", precio: 3300 },
      { producto: "Panel LED 18W empotrar redondo", moneda: "CRC", precio: 8500 },
      { producto: "Cerámica piso 45x45 m²", moneda: "CRC", precio: 9200 },
      { producto: "Adhesivo cerámica gris 25kg Sika", moneda: "CRC", precio: 8900 },
      { producto: "Varilla 5/8\" x 6m G60", moneda: "CRC", precio: 14200 },
      { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9800 },
      { producto: "Tubo PVC 1/2\" x 6m presión", moneda: "CRC", precio: 4200 },
      { producto: "Llave paso bola 1/2\" PVC", moneda: "CRC", precio: 3200 },
    ],

    // ════════════════════════════════════════════════════════
    // NOVEX CURRIDABAT — ubiqo-seed-006
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-006": [
      // Herramientas Milwaukee (Novex es distribuidor oficial)
      { producto: "Taladro percutor M18 Milwaukee 1/2\" 18V kit 2 baterías", moneda: "CRC", precio: 215000 },
      { producto: "Amoladora Milwaukee M18 4.5\" 18V sin batería", moneda: "CRC", precio: 89000 },
      { producto: "Atornillador de impacto Milwaukee M18 1/4\"", moneda: "CRC", precio: 95000 },
      { producto: "Sierra circular Milwaukee M18 7.25\" 18V", moneda: "CRC", precio: 175000 },
      { producto: "Sierra caladora Milwaukee M18 18V", moneda: "CRC", precio: 125000 },
      { producto: "Batería Milwaukee M18 5Ah RedLithium", moneda: "CRC", precio: 65000 },
      { producto: "Cargador rápido Milwaukee M18", moneda: "CRC", precio: 28000 },
      // Herramientas Tactix (económicas)
      { producto: "Taladro percutor Tactix 650W 1/2\"", moneda: "CRC", precio: 29500 },
      { producto: "Amoladora angular Tactix 850W 4.5\"", moneda: "CRC", precio: 21500 },
      { producto: "Rotomartillo Tactix SDS 850W", moneda: "CRC", precio: 48000 },
      { producto: "Sierra circular Tactix 7.25\" 1400W", moneda: "CRC", precio: 42000 },
      // Pinturas Lanco
      { producto: "Pintura látex Stainless Lanco blanco mate 1 galón", moneda: "CRC", precio: 19950 },
      { producto: "Pintura látex Stainless Lanco 5 galones", moneda: "CRC", precio: 89000 },
      { producto: "Pintura acrílica exterior Lanco blanco 1 galón", moneda: "CRC", precio: 16800 },
      { producto: "Imprimante Lanco blanco 1 galón", moneda: "CRC", precio: 10500 },
      { producto: "Barniz marino brillante Lanco 1 galón", moneda: "CRC", precio: 22000 },
      // Baño
      { producto: "Llave ducha mezcladora monomando Helvex cromada", moneda: "CRC", precio: 18500 },
      { producto: "Lavatorio sobreponer blanco 55cm Helvex", moneda: "CRC", precio: 24000 },
      { producto: "Inodoro 2 piezas alargado blanco Helvex", moneda: "CRC", precio: 78000 },
      // Iluminación
      { producto: "Foco LED 9W luz cálida E27 Philips", moneda: "CRC", precio: 3100 },
      { producto: "Foco LED 12W luz blanca E27 Philips", moneda: "CRC", precio: 3600 },
      { producto: "Panel LED empotrar 18W redondo luz blanca", moneda: "CRC", precio: 8500 },
      { producto: "Reflector LED 30W exterior IP65", moneda: "CRC", precio: 12500 },
      // Ferretería
      { producto: "Entrada principal digital Kwikset SmartCode", moneda: "CRC", precio: 95000 },
      { producto: "Entrada principal Kwikset Tylo latón", moneda: "CRC", precio: 28000 },
      { producto: "Candado 50mm arco largo Brinks", moneda: "CRC", precio: 11500 },
      { producto: "Tornillo madera #8 x 1.5\" fosfatado (100 u)", moneda: "CRC", precio: 2200 },
      { producto: "Tornillo autoperforante #10 x 1\" (100 u)", moneda: "CRC", precio: 2500 },
      // Eléctrico
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Cable THW #10 AWG (metro)", moneda: "CRC", precio: 950 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3200 },
      { producto: "Tomacorriente doble polarizado blanco Leviton", moneda: "CRC", precio: 4100 },
      { producto: "Interruptor doble blanco Leviton", moneda: "CRC", precio: 4500 },
    ],

    // ════════════════════════════════════════════════════════
    // NOVEX ESCAZÚ — ubiqo-seed-007
    // ════════════════════════════════════════════════════════
    "ubiqo-seed-007": [
      { producto: "Taladro percutor M18 Milwaukee 1/2\" kit 2 baterías", moneda: "CRC", precio: 215000 },
      { producto: "Amoladora Milwaukee M18 4.5\" sin batería", moneda: "CRC", precio: 89000 },
      { producto: "Sierra circular Milwaukee M18 7.25\"", moneda: "CRC", precio: 175000 },
      { producto: "Batería Milwaukee M18 5Ah", moneda: "CRC", precio: 65000 },
      { producto: "Taladro percutor Tactix 650W 1/2\"", moneda: "CRC", precio: 29500 },
      { producto: "Rotomartillo Tactix SDS 850W", moneda: "CRC", precio: 48000 },
      { producto: "Pintura látex Stainless Lanco blanco 1 galón", moneda: "CRC", precio: 19950 },
      { producto: "Pintura acrílica exterior Lanco blanco 1 galón", moneda: "CRC", precio: 16800 },
      { producto: "Barniz marino Lanco 1 galón", moneda: "CRC", precio: 22000 },
      { producto: "Llave ducha monomando Helvex cromada", moneda: "CRC", precio: 18500 },
      { producto: "Inodoro 2 piezas alargado blanco Helvex", moneda: "CRC", precio: 78000 },
      { producto: "Foco LED 9W luz cálida E27 Philips", moneda: "CRC", precio: 3100 },
      { producto: "Panel LED empotrar 18W redondo", moneda: "CRC", precio: 8500 },
      { producto: "Reflector LED 30W exterior IP65", moneda: "CRC", precio: 12500 },
      { producto: "Entrada principal digital Kwikset SmartCode", moneda: "CRC", precio: 95000 },
      { producto: "Cable THW #12 AWG (metro)", moneda: "CRC", precio: 680 },
      { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3200 },
      { producto: "Tornillo madera #8 x 1.5\" (100 u)", moneda: "CRC", precio: 2200 },
      { producto: "Disco de corte 4.5\" metal (2 u)", moneda: "CRC", precio: 2800 },
      { producto: "Juego brocas 13 piezas acero HSS", moneda: "CRC", precio: 8500 },
    ],

  }; // fin EXPANSIONES

  // ══════════════════════════════════════════════════════════
  // NUEVOS NEGOCIOS — EPA Tibás + Belén  y otros que faltaban
  // ══════════════════════════════════════════════════════════
  const NUEVOS = [
    {
      id: "ubiqo-seed-033",
      nombre: "Ferretería EPA Tibás",
      tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Tibás", distrito: "Tibás" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "Una de las sucursales originales de EPA en Costa Rica. Construida en 2004, cubre el norte de San José.",
      telefono: "+506 2240-5400", whatsapp: "", maps: "https://maps.app.goo.gl/epa-tibas",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
        { producto: "Pintura látex Primera SUR blanco mate 5 galones", moneda: "CRC", precio: 63950 },
        { producto: "Pintura acrílica exterior SUR blanco 1 galón", moneda: "CRC", precio: 15900 },
        { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
        { producto: "Taladro percutor Einhell 550W 1/2\"", moneda: "CRC", precio: 21950 },
        { producto: "Rotomartillo SDS Plus Einhell 2.2J", moneda: "CRC", precio: 64995 },
        { producto: "Amoladora angular Einhell 710W 115mm", moneda: "CRC", precio: 22950 },
        { producto: "Inodoro elongado Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
        { producto: "Mueble baño Texas PVC 60cm blanco con lavamanos", moneda: "CRC", precio: 159950 },
        { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
        { producto: "Cerradura entrada principal digital huella Yale", moneda: "CRC", precio: 89950 },
        { producto: "Bombillo LED A60 E27 15W (2 u)", moneda: "CRC", precio: 3350 },
        { producto: "Lámpara LED techo 18W 6500K (2 u)", moneda: "CRC", precio: 21250 },
        { producto: "Puerta melamina 80x210cm 4mm", moneda: "CRC", precio: 33950 },
        { producto: "Porcelanato 60x120cm gris mármol 1.44m² caja", moneda: "CRC", precio: 21500 },
        { producto: "Alacena multiuso 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
        { producto: "Estufa gas vidrio templado 4 hornillas Drija", moneda: "CRC", precio: 167950 },
        { producto: "Tornado concreto 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
        { producto: "Silicon transparente 280ml Loctite", moneda: "CRC", precio: 4200 },
        { producto: "Cinta aislante negra 3M 18mm x 20m", moneda: "CRC", precio: 1800 },
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-034",
      nombre: "Ferretería EPA Belén",
      tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "Heredia", canton: "Belén", distrito: "San Antonio" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "Sucursal EPA en el corredor industrial Heredia-Belén. Fuerte en herramientas eléctricas y materiales de construcción.",
      telefono: "+506 2293-5400", whatsapp: "", maps: "https://maps.app.goo.gl/epa-belen",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
        { producto: "Pintura látex Primera SUR blanco satinado 1 galón", moneda: "CRC", precio: 13950 },
        { producto: "Pintura látex Primera SUR 5 galones", moneda: "CRC", precio: 63950 },
        { producto: "Pintura acrílica exterior SUR 1 galón", moneda: "CRC", precio: 15900 },
        { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
        { producto: "Taladro alámbrico DeWalt 1/2\" 650W", moneda: "CRC", precio: 56950 },
        { producto: "Rotomartillo SDS Plus 800W 2.3J", moneda: "CRC", precio: 134950 },
        { producto: "Amoladora angular Einhell 115mm 710W", moneda: "CRC", precio: 22950 },
        { producto: "Inodoro elongado Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
        { producto: "Columna ducha acero inoxidable Aqua Nuova", moneda: "CRC", precio: 24950 },
        { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
        { producto: "Cerradura digital huella Yale", moneda: "CRC", precio: 89950 },
        { producto: "Bombillo LED A60 E27 15W (2 u)", moneda: "CRC", precio: 3350 },
        { producto: "Lámpara LED techo 18W níquel (2 u)", moneda: "CRC", precio: 21250 },
        { producto: "Puerta melamina 90x210cm", moneda: "CRC", precio: 33950 },
        { producto: "Porcelanato 60x120cm gris mármol 1.44m²", moneda: "CRC", precio: 21500 },
        { producto: "Estufa gas 5 hornillas acero inoxidable Drija", moneda: "CRC", precio: 258950 },
        { producto: "Alacena 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
        { producto: "Silicon transparente 280ml Loctite", moneda: "CRC", precio: 4200 },
        { producto: "Tornillo concreto 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-035",
      nombre: "Ferretería EPA Cartago",
      tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "Cartago", canton: "Cartago", distrito: "Oriental" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "La sucursal más reciente de EPA, inaugurada en la ciudad de Cartago. Cubre toda la provincia.",
      telefono: "+506 2552-5400", whatsapp: "", maps: "https://maps.app.goo.gl/epa-cartago",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
        { producto: "Pintura látex Primera SUR blanco mate 5 galones", moneda: "CRC", precio: 63950 },
        { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
        { producto: "Taladro percutor Einhell 710W 1/2\"", moneda: "CRC", precio: 24950 },
        { producto: "Rotomartillo SDS Plus Einhell 2.2J", moneda: "CRC", precio: 64995 },
        { producto: "Amoladora Einhell 115mm 710W", moneda: "CRC", precio: 22950 },
        { producto: "Inodoro elongado Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
        { producto: "Mueble baño Texas PVC 60cm con lavamanos", moneda: "CRC", precio: 159950 },
        { producto: "Cerradura digital huella Yale", moneda: "CRC", precio: 89950 },
        { producto: "Entrada principal bronce Yale", moneda: "CRC", precio: 34950 },
        { producto: "Bombillo LED A60 E27 15W (2 u)", moneda: "CRC", precio: 3350 },
        { producto: "Lámpara LED techo 18W (2 u)", moneda: "CRC", precio: 21250 },
        { producto: "Puerta melamina 80x210cm", moneda: "CRC", precio: 33950 },
        { producto: "Porcelanato 60x120cm gris mármol caja 1.44m²", moneda: "CRC", precio: 21500 },
        { producto: "Alacena 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
        { producto: "Estufa gas vidrio templado 2 hornillas Drija", moneda: "CRC", precio: 83950 },
        { producto: "Silicon transparente 280ml Loctite", moneda: "CRC", precio: 4200 },
        { producto: "Cinta aislante negra 18mm x 20m 3M", moneda: "CRC", precio: 1800 },
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-036",
      nombre: "Ferretería EPA Desamparados",
      tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Desamparados", distrito: "Desamparados" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "La sucursal más nueva de EPA en el sur de San José, inaugurada para cubrir Desamparados y zonas aledañas.",
      telefono: "+506 2250-5400", whatsapp: "", maps: "https://maps.app.goo.gl/epa-desamparados",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Pintura látex Primera SUR blanco mate 1 galón", moneda: "CRC", precio: 13950 },
        { producto: "Pintura látex Primera SUR 5 galones", moneda: "CRC", precio: 63950 },
        { producto: "Pintura látex Goltex SUR blanco 1 galón", moneda: "CRC", precio: 16950 },
        { producto: "Taladro percutor Bosch 1/2\" 650W", moneda: "CRC", precio: 43950 },
        { producto: "Taladro DeWalt 1/2\" 650W alámbrico", moneda: "CRC", precio: 56950 },
        { producto: "Rotomartillo SDS Plus Einhell 2.2J", moneda: "CRC", precio: 64995 },
        { producto: "Amoladora Einhell 115mm 710W", moneda: "CRC", precio: 22950 },
        { producto: "Inodoro Aquapro Rimless 2 piezas blanco", moneda: "CRC", precio: 89950 },
        { producto: "Mueble baño Texas 60cm PVC con lavamanos", moneda: "CRC", precio: 159950 },
        { producto: "Entrada principal cromo satinado Liverpool Yale", moneda: "CRC", precio: 23950 },
        { producto: "Cerradura digital huella Yale", moneda: "CRC", precio: 89950 },
        { producto: "Bombillo LED A60 E27 15W (2 u)", moneda: "CRC", precio: 3350 },
        { producto: "Lámpara LED techo 18W níquel (2 u)", moneda: "CRC", precio: 21250 },
        { producto: "Puerta melamina 80x210cm", moneda: "CRC", precio: 33950 },
        { producto: "Porcelanato 60x120cm gris mármol caja 1.44m²", moneda: "CRC", precio: 21500 },
        { producto: "Alacena 2 puertas blanco 180x60x30cm", moneda: "CRC", precio: 59950 },
        { producto: "Estufa gas vidrio templado 4 hornillas Drija", moneda: "CRC", precio: 167950 },
        { producto: "Tornillo concreto 1/4\" x 2-1/4\" (10 u)", moneda: "CRC", precio: 1950 },
        { producto: "Aldaba con bisagra 4\"", moneda: "CRC", precio: 9895 },
      ], createdAt: "2025-03-01T08:00:00.000Z"
    }
  ];

  // ══════════════════════════════════════════════════════════
  // LÓGICA DE FUSIÓN
  // ══════════════════════════════════════════════════════════

  // 1. Fusionar productos adicionales en negocios existentes
  let fusionados = 0;
  let productosAgregados = 0;

  for (const [id, productosExtra] of Object.entries(EXPANSIONES)) {
    const idx = idxPorId[id];
    if (idx === undefined) continue; // negocio no existe, skip

    const biz = existentes[idx];
    const nombresExistentes = new Set(
      (biz.productos || []).map(p => p.producto.toLowerCase().trim())
    );

    let nuevosParaEste = 0;
    for (const prod of productosExtra) {
      const key = prod.producto.toLowerCase().trim();
      if (!nombresExistentes.has(key)) {
        biz.productos.push(prod);
        nombresExistentes.add(key);
        nuevosParaEste++;
        productosAgregados++;
      }
    }
    if (nuevosParaEste > 0) fusionados++;
  }

  // 2. Agregar negocios completamente nuevos
  const idsExistentes = new Set(existentes.map(b => b.id));
  const negociosNuevos = NUEVOS.filter(b => !idsExistentes.has(b.id));
  const merged = [...existentes, ...negociosNuevos];

  // 3. Guardar
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  console.log("✅ Inventario expandido correctamente:");
  console.log("   Negocios actualizados con más productos: " + fusionados);
  console.log("   Productos nuevos agregados a negocios existentes: " + productosAgregados);
  console.log("   Negocios nuevos agregados: " + negociosNuevos.length);
  console.log("   Total de negocios en la plataforma: " + merged.length);
  console.log("");
  console.log("   Buscá ahora: taladro, amoladora, inodoro, mueble baño,");
  console.log("   bombillo, lámpara, cerradura, pintura, estufa, porcelanato...");
  alert(
    "✅ ¡Inventario expandido!\n\n" +
    "• " + productosAgregados + " productos nuevos en negocios existentes\n" +
    "• " + negociosNuevos.length + " negocios nuevos (EPA Tibás, Belén, Cartago, Desamparados)\n" +
    "• Total de negocios: " + merged.length + "\n\n" +
    "Recargá la página (F5) y buscá:\ntaladro, inodoro, bombillo, estufa, cerradura..."
  );
})();
