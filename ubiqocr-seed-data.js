// ============================================================
// UbiqoCR — Script de carga de datos semilla
// INSTRUCCIONES: Pegar TODO este código en la consola del
// navegador mientras tenés abierto index.html
// ============================================================
(function cargarDatosUbiqoCR() {
  const STORAGE_KEY = "ubiqocr_productos_negocios_v2";

  const TODOS_LOS_NEGOCIOS = [
    {
      id: "ubiqo-seed-001", nombre: "Ferretería EPA Escazú", tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Escazú", distrito: "San Rafael" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "Cadena líder en ferretería, construcción y remodelación. Más de 18,000 artículos.",
      telefono: "+506 2289-5400", whatsapp: "", maps: "https://maps.app.goo.gl/escazu-epa",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Varilla deformada 1/2\" x 6m Grado 60", moneda: "CRC", precio: 8900 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Pintura aceite exterior blanco galón SUR", moneda: "CRC", precio: 16800 },
        { producto: "Silicon transparente 280 ml Loctite", moneda: "CRC", precio: 4200 },
        { producto: "Cinta aislante negra 18mm x 20m 3M", moneda: "CRC", precio: 1800 },
        { producto: "Tornillo madera #8 x 1\" fosfatado (100 u)", moneda: "CRC", precio: 2200 },
        { producto: "Llave paso bola PVC 1/2\" Pavco", moneda: "CRC", precio: 3500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-002", nombre: "Ferretería EPA Curridabat", tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Curridabat", distrito: "Curridabat" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "Gran ferretería con departamentos de construcción, baño, cocina y decoración.",
      telefono: "+506 2271-5400", whatsapp: "", maps: "https://maps.app.goo.gl/curridabat-epa",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 540 },
        { producto: "Arena lavada m³ entrega en obra", moneda: "CRC", precio: 22000 },
        { producto: "Pintura látex premium blanco galón Protecto", moneda: "CRC", precio: 17500 },
        { producto: "Javin pomo cerradura Schlage latón", moneda: "CRC", precio: 28500 },
        { producto: "Tubo PVC presión 1/2\" x 6m SDR-17", moneda: "CRC", precio: 4200 },
        { producto: "Disco corte metal 4.5\" Norton", moneda: "CRC", precio: 1400 },
        { producto: "Taladro eléctrico 1/2\" 600W Black+Decker", moneda: "CRC", precio: 32000 },
        { producto: "Manguera jardín 15m 1/2\" reforzada", moneda: "CRC", precio: 8500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-003", nombre: "El Lagar Desamparados", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "San José", canton: "Desamparados", distrito: "Desamparados" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Tienda departamental con más de 20,000 productos: ferretería, pinturas, hogar, vivero e iluminación.",
      telefono: "+506 2250-8080", whatsapp: "50688888080", maps: "https://maps.app.goo.gl/lagar-desamparados",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7650 },
        { producto: "Concreto seco premezclado 40 kg Supermix", moneda: "CRC", precio: 6800 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5150 },
        { producto: "Varilla deformada 1/2\" x 6m Grado 60", moneda: "CRC", precio: 8750 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14200 },
        { producto: "Silicon construcción blanco 280 ml Loctite", moneda: "CRC", precio: 4100 },
        { producto: "Cinta masking tape 18mm x 25m", moneda: "CRC", precio: 950 },
        { producto: "Foco LED 9W luz cálida E27 Sylvania", moneda: "CRC", precio: 2800 },
        { producto: "Lija al agua grano 220 hoja", moneda: "CRC", precio: 450 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-004", nombre: "El Lagar Moravia", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "San José", canton: "Moravia", distrito: "San Vicente" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Ferretería con amplio catálogo de pinturas, maderas, eléctricos y materiales de construcción.",
      telefono: "+506 2236-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-moravia",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7650 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5150 },
        { producto: "Regla madera pino 1x2 x 12 pies", moneda: "CRC", precio: 3200 },
        { producto: "Tabla madera pino 1x6 x 12 pies", moneda: "CRC", precio: 7800 },
        { producto: "Pintura acrílica exterior blanco galón SUR", moneda: "CRC", precio: 15900 },
        { producto: "Imprimante blanco galón SUR", moneda: "CRC", precio: 9800 },
        { producto: "Tornillo autoperforante #14 x 2\" (100 u)", moneda: "CRC", precio: 3800 },
        { producto: "Bisagra niquelada 3\" par", moneda: "CRC", precio: 1200 },
        { producto: "Broca concreto 5/16\" x 4\" Bosch", moneda: "CRC", precio: 3500 },
        { producto: "Foco LED 12W luz blanca E27 GE", moneda: "CRC", precio: 3200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-005", nombre: "El Lagar Alajuela", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "Alajuela", canton: "Alajuela", distrito: "Alajuela" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Materiales para construcción, remodelación y hogar en el centro de Alajuela.",
      telefono: "+506 2440-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-alajuela",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7700 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 530 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14300 },
        { producto: "Tubo PVC sanitario 4\" x 3m Pavco", moneda: "CRC", precio: 8200 },
        { producto: "Codo PVC 90 grados 4\"", moneda: "CRC", precio: 1600 },
        { producto: "Cerámica piso 45x45 gris m²", moneda: "CRC", precio: 9500 },
        { producto: "Adhesivo cerámica gris 25 kg Sika", moneda: "CRC", precio: 8900 },
        { producto: "Llave de paso bola 1/2\" cromada Helvex", moneda: "CRC", precio: 4200 },
        { producto: "Cinta teflón 1/2\" rollo", moneda: "CRC", precio: 450 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-006", nombre: "Ferretería Novex Curridabat", tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Curridabat", distrito: "Sánchez" },
      horario: "L–S 7:00–19:00 / D 8:00–17:00",
      descripcion: "Home center con 22 departamentos: ferretería, herramientas Milwaukee, pinturas, baños, hogar y jardinería.",
      telefono: "+506 4030-2020", whatsapp: "50640302020", maps: "https://maps.app.goo.gl/novex-curridabat",
      productos: [
        { producto: "Martillo carpintero 16 oz mango madera Truper", moneda: "CRC", precio: 7500 },
        { producto: "Destornillador Phillips #2 x 6\" Stanley", moneda: "CRC", precio: 3800 },
        { producto: "Pintura látex interior blanco galón Lanco", moneda: "CRC", precio: 15200 },
        { producto: "Javin pomo entrada llave Kwikset latón", moneda: "CRC", precio: 22500 },
        { producto: "Llave ducha mezcladora monomando Helvex", moneda: "CRC", precio: 18500 },
        { producto: "Foco LED 9W luz cálida E27 Philips", moneda: "CRC", precio: 3100 },
        { producto: "Taladro percutor 650W 1/2\" Tactix", moneda: "CRC", precio: 29500 },
        { producto: "Sierra circular 7.25\" 1400W Milwaukee", moneda: "CRC", precio: 89000 },
        { producto: "Manguera jardín 20m 1/2\" reforzada Helvex", moneda: "CRC", precio: 10500 },
        { producto: "Cinta aislante negra 19mm x 20m 3M", moneda: "CRC", precio: 1900 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-007", nombre: "Ferretería Novex Escazú", tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "Escazú", distrito: "Escazú" },
      horario: "L–S 7:00–19:00 / D 8:00–17:00",
      descripcion: "Sucursal Escazú con herramientas eléctricas, pinturas y materiales para construcción.",
      telefono: "+506 4030-2030", whatsapp: "50640302030", maps: "https://maps.app.goo.gl/novex-escazu",
      productos: [
        { producto: "Taladro percutor 650W 1/2\" Tactix", moneda: "CRC", precio: 29500 },
        { producto: "Amoladora angular 4.5\" 850W Tactix", moneda: "CRC", precio: 21500 },
        { producto: "Pintura látex interior blanco galón Lanco", moneda: "CRC", precio: 15200 },
        { producto: "Pintura acrílica exterior blanco galón Lanco", moneda: "CRC", precio: 16800 },
        { producto: "Silicon transparente 280 ml Loctite", moneda: "CRC", precio: 4300 },
        { producto: "Tornillo madera #10 x 2\" fosfatado (100 u)", moneda: "CRC", precio: 2800 },
        { producto: "Foco LED panel 18W luz blanca embutir", moneda: "CRC", precio: 8500 },
        { producto: "Interruptor sencillo blanco Leviton", moneda: "CRC", precio: 3200 },
        { producto: "Tomacorriente doble polarizado blanco Leviton", moneda: "CRC", precio: 4100 },
        { producto: "Broca HSS 1/4\" acero rápido Bosch (2 u)", moneda: "CRC", precio: 3200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-008", nombre: "MERCASA Cartago", tipo: "Depósito de materiales / Ferretería / Pinturas",
      ubicacion: { provincia: "Cartago", canton: "Cartago", distrito: "Oriental" },
      horario: "L–V 7:30–16:30 / S 7:30–12:00",
      descripcion: "Depósito especializado en materiales de construcción y centro de pinturas Lanco, Protecto y SUR.",
      telefono: "+506 2591-1900", whatsapp: "50684867084", maps: "https://maps.app.goo.gl/mercasa-cartago",
      productos: [
        { producto: "Cemento Fortaleza gris 50 kg Holcim", moneda: "CRC", precio: 7650 },
        { producto: "Block concreto 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Block celosía 13x20x40 semicurva", moneda: "CRC", precio: 1906 },
        { producto: "Arena lavada saco 40 kg", moneda: "CRC", precio: 1370 },
        { producto: "Arena lavada m³ patio entrega", moneda: "CRC", precio: 18588 },
        { producto: "Arena tajo m³ patio entrega", moneda: "CRC", precio: 21002 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Pintura acrílica exterior blanco galón Lanco", moneda: "CRC", precio: 16500 },
        { producto: "Barniz marino brillante galón Lanco", moneda: "CRC", precio: 22000 },
        { producto: "Varilla deformada 3/8\" x 6m G60", moneda: "CRC", precio: 5100 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-009", nombre: "Ferretería y Bazar Venecia", tipo: "Ferretería / Bazar",
      ubicacion: { provincia: "San José", canton: "Vásquez de Coronado", distrito: "San Isidro" },
      horario: "L–V 7:30–17:30 / S 7:30–13:00",
      descripcion: "Especialistas en tornillería, herramientas manuales y eléctricas, eléctricos y automotriz.",
      telefono: "+506 2294-3905", whatsapp: "50684847347", maps: "https://maps.app.goo.gl/venecia-coronado",
      productos: [
        { producto: "Cemento gris 50 kg", moneda: "CRC", precio: 7500 },
        { producto: "Alambre negro #16 1.68mm kg", moneda: "CRC", precio: 800 },
        { producto: "Set llaves Allen mm con bola 7 piezas Truper", moneda: "CRC", precio: 3100 },
        { producto: "Bola remolque 1 7/8\" Truper", moneda: "CRC", precio: 6050 },
        { producto: "Tornillo madera #8 x 1.5\" fosfatado (100 u)", moneda: "CRC", precio: 1900 },
        { producto: "Tornillo hexagonal 1/4\" x 1\" grado 5 (10 u)", moneda: "CRC", precio: 850 },
        { producto: "Broca concreto 3/16\" x 4\" Truper", moneda: "CRC", precio: 1200 },
        { producto: "Probador corriente 6-12V Truper", moneda: "CRC", precio: 2400 },
        { producto: "Disco corte metal 4.5\" Truper (2 u)", moneda: "CRC", precio: 2600 },
        { producto: "Delantal cuero 7 compartimentos Truper", moneda: "CRC", precio: 5100 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-010", nombre: "El Lagar Santo Domingo Heredia", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "Heredia", canton: "Santo Domingo", distrito: "Santo Domingo" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 7:00–16:00",
      descripcion: "Tienda nueva de El Lagar (2024) en Santo Domingo, con más de 20,000 productos y vivero.",
      telefono: "+506 2244-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-santodomingo",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7700 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5200 },
        { producto: "Varilla deformada 1/2\" x 6m Grado 60", moneda: "CRC", precio: 8900 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 535 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Tubo PVC 1/2\" x 6m SDR-17 Pavco", moneda: "CRC", precio: 4200 },
        { producto: "Foco LED 9W luz cálida E27", moneda: "CRC", precio: 2900 },
        { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9800 },
        { producto: "Sellador acrílico blanco 280ml Loctite", moneda: "CRC", precio: 3800 },
        { producto: "Cortadora cerámica manual 60cm Tactix", moneda: "CRC", precio: 28000 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-011", nombre: "El Lagar Belén", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "Heredia", canton: "Belén", distrito: "La Ribera" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Ferretería departamental con materiales de construcción, iluminación, eléctricos y hogar.",
      telefono: "+506 2293-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-belen",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7700 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 535 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Silicon construcción negro 280ml Loctite", moneda: "CRC", precio: 4200 },
        { producto: "Plywood pino 4x8 pies 9mm", moneda: "CRC", precio: 18500 },
        { producto: "Cable THW #12 AWG metro", moneda: "CRC", precio: 680 },
        { producto: "Tomacorriente doble polarizado blanco", moneda: "CRC", precio: 3800 },
        { producto: "Cinta teflón 1/2\" rollo", moneda: "CRC", precio: 450 },
        { producto: "Foco LED 12W luz blanca E27", moneda: "CRC", precio: 3200 },
        { producto: "Plycem tablilla PVC 0.2x3m blanco", moneda: "CRC", precio: 4800 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-012", nombre: "El Lagar San Francisco de Dos Ríos", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "San Francisco de Dos Ríos" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Sucursal de gran formato en el sur de San José con amplio parqueo y servicio de corte de madera.",
      telefono: "+506 2226-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-sfdosrios",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7650 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5150 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14200 },
        { producto: "Puerta HDF 82x204 cm marco pino", moneda: "CRC", precio: 85000 },
        { producto: "Cerámica piso 45x45 beige m²", moneda: "CRC", precio: 9200 },
        { producto: "Adhesivo cerámica blanco 25 kg", moneda: "CRC", precio: 8800 },
        { producto: "Grout junta cerámica gris 1 kg Sika", moneda: "CRC", precio: 2400 },
        { producto: "Malla electrosoldada 1.5x2.4m refuerzo", moneda: "CRC", precio: 9600 },
        { producto: "Tubo PVC sanitario 4\" x 3m Pavco", moneda: "CRC", precio: 8200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-013", nombre: "Ferretería EPA La Uruca", tipo: "Ferretería / Home Center",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "La Uruca" },
      horario: "L–V 7:00–19:00 / S 7:00–18:00 / D 8:00–16:00",
      descripcion: "Sucursal EPA con fácil acceso desde la autopista General Cañas.",
      telefono: "+506 2242-5400", whatsapp: "", maps: "https://maps.app.goo.gl/epa-lauruca",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7800 },
        { producto: "Varilla deformada 1/2\" x 6m Grado 60", moneda: "CRC", precio: 8900 },
        { producto: "Pintura anticorrosivo rojo galón SUR", moneda: "CRC", precio: 18500 },
        { producto: "Lamina zinc ondulada cal.26 3m Novacero", moneda: "CRC", precio: 12500 },
        { producto: "Perling C 2x4 cal.20 x 6m", moneda: "CRC", precio: 15800 },
        { producto: "Malla electrosoldada 1.5x2.4m 6/6", moneda: "CRC", precio: 9800 },
        { producto: "Tubo galvanizado conduit 3/4\" x 3m", moneda: "CRC", precio: 3800 },
        { producto: "Cable THW #10 AWG metro", moneda: "CRC", precio: 950 },
        { producto: "Interruptor doble blanco Leviton", moneda: "CRC", precio: 4500 },
        { producto: "Caja breaker 2 espacios 100A Square D", moneda: "CRC", precio: 12500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-014", nombre: "Ferretería El Colono Tres Ríos", tipo: "Ferretería / Materiales de construcción",
      ubicacion: { provincia: "Cartago", canton: "La Unión", distrito: "Tres Ríos" },
      horario: "L–S 7:00–18:00 / D 8:00–13:00",
      descripcion: "Ferretería especializada en materiales para obra gris, acabados y eléctricos.",
      telefono: "+506 2279-2100", whatsapp: "50688992100", maps: "https://maps.app.goo.gl/colono-tresrios",
      productos: [
        { producto: "Cemento gris 50 kg Holcim Fuerte", moneda: "CRC", precio: 7600 },
        { producto: "Varilla deformada 3/8\" x 6m G60", moneda: "CRC", precio: 5100 },
        { producto: "Varilla deformada 1/2\" x 6m G60", moneda: "CRC", precio: 8700 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 515 },
        { producto: "Arena tajo m³", moneda: "CRC", precio: 20500 },
        { producto: "Lastre compactación m³", moneda: "CRC", precio: 16000 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14400 },
        { producto: "Tubo PVC presión 3/4\" x 6m SDR-17 Pavco", moneda: "CRC", precio: 5800 },
        { producto: "Codo PVC 90 grados 3/4\"", moneda: "CRC", precio: 350 },
        { producto: "Manguera jardín 15m 5/8\" verde", moneda: "CRC", precio: 7800 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-015", nombre: "Almacenes Unidos San José", tipo: "Ferretería / Herramientas eléctricas",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "Catedral" },
      horario: "L–V 7:30–17:00 / S 7:30–12:00",
      descripcion: "Ferretería especializada en herramientas eléctricas, aspiradoras, cortadoras y materiales de construcción.",
      telefono: "+506 2222-3300", whatsapp: "50688223300", maps: "https://maps.app.goo.gl/almacenesunidos-sj",
      productos: [
        { producto: "Cemento CEMEX UG gris 50 kg", moneda: "CRC", precio: 7700 },
        { producto: "Taladro percutor 850W SDS Black+Decker", moneda: "CRC", precio: 42000 },
        { producto: "Amoladora angular 4.5\" 900W Dewalt", moneda: "CRC", precio: 48000 },
        { producto: "Rotomartillo SDS 1000W Bosch", moneda: "CRC", precio: 95000 },
        { producto: "Sierra caladora 650W Black+Decker", moneda: "CRC", precio: 38000 },
        { producto: "Aspiradora industrial 20L Tactix", moneda: "CRC", precio: 45000 },
        { producto: "Compresor aire 25L 1.5HP Black+Decker", moneda: "CRC", precio: 55000 },
        { producto: "Soldadora inverter 160A Tactix", moneda: "CRC", precio: 58000 },
        { producto: "Pulidora 7\" 1200W Dewalt", moneda: "CRC", precio: 68000 },
        { producto: "Varilla corrugada G40 3/8\" x 6m", moneda: "CRC", precio: 5000 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-016", nombre: "Depósito Las Gravilias", tipo: "Depósito de materiales / Ferretería",
      ubicacion: { provincia: "San José", canton: "Desamparados", distrito: "Gravilias" },
      horario: "L–S 7:00–17:00",
      descripcion: "Depósito especializado en obra gris: cemento, arena, grava y acero. Entrega en GAM.",
      telefono: "+506 2254-1100", whatsapp: "50688541100", maps: "https://maps.app.goo.gl/gravilias-desamparados",
      productos: [
        { producto: "Cemento gris 50 kg Progreso UG", moneda: "CRC", precio: 7500 },
        { producto: "Varilla deformada 3/8\" x 6m", moneda: "CRC", precio: 5000 },
        { producto: "Varilla deformada 1/2\" x 6m", moneda: "CRC", precio: 8600 },
        { producto: "Varilla deformada 5/8\" x 6m", moneda: "CRC", precio: 14200 },
        { producto: "Block cemento 15x20x40 cm unidad", moneda: "CRC", precio: 500 },
        { producto: "Arena lavada m³ entrega GAM incluida", moneda: "CRC", precio: 22000 },
        { producto: "Piedra cuarta m³", moneda: "CRC", precio: 19000 },
        { producto: "Lastre m³", moneda: "CRC", precio: 15500 },
        { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9500 },
        { producto: "Alambre negro recocido kg", moneda: "CRC", precio: 1200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-017", nombre: "Ferretería El Ebanista San Pedro", tipo: "Ferretería / Maderas / Acabados",
      ubicacion: { provincia: "San José", canton: "Montes de Oca", distrito: "San Pedro" },
      horario: "L–V 7:30–17:30 / S 7:30–14:00",
      descripcion: "Especializada en maderas, acabados de construcción y herramientas para carpintería.",
      telefono: "+506 2225-1800", whatsapp: "50688251800", maps: "https://maps.app.goo.gl/ebanista-sanpedro",
      productos: [
        { producto: "Tabla pino 1x6 x 12 pies", moneda: "CRC", precio: 8200 },
        { producto: "Regla pino 1x3 x 12 pies", moneda: "CRC", precio: 4200 },
        { producto: "Plywood pino 4x8 pies 12mm", moneda: "CRC", precio: 22000 },
        { producto: "Plywood pino 4x8 pies 18mm", moneda: "CRC", precio: 31000 },
        { producto: "Melamina blanca 4x8 pies 15mm", moneda: "CRC", precio: 28000 },
        { producto: "Barniz marino brillante galón Lanco", moneda: "CRC", precio: 22500 },
        { producto: "Sellador madera galón SUR", moneda: "CRC", precio: 18000 },
        { producto: "Bisagra niquelada 3.5\" par", moneda: "CRC", precio: 1400 },
        { producto: "Tornillo madera #8 x 2\" fosfatado (100 u)", moneda: "CRC", precio: 2200 },
        { producto: "Lija madera grano 80 hoja", moneda: "CRC", precio: 500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-018", nombre: "Ferretería La Central Alajuela", tipo: "Ferretería / Cerrajería / Pinturas",
      ubicacion: { provincia: "Alajuela", canton: "Alajuela", distrito: "La Guácima" },
      horario: "L–V 7:30–17:00 / S 8:00–13:00",
      descripcion: "Ferretería local con cerrajería, pinturas y artículos para mantenimiento del hogar.",
      telefono: "+506 2433-5500", whatsapp: "50688335500", maps: "https://maps.app.goo.gl/central-alajuela",
      productos: [
        { producto: "Javin pomo cerradura entrada doble Kwikset", moneda: "CRC", precio: 21000 },
        { producto: "Candado 60mm llave estándar Forte", moneda: "CRC", precio: 8500 },
        { producto: "Candado 50mm llave de seguridad Forte", moneda: "CRC", precio: 12000 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Imprimante blanco galón SUR", moneda: "CRC", precio: 9800 },
        { producto: "Pintura anticorrosivo negro galón SUR", moneda: "CRC", precio: 17500 },
        { producto: "Silicon gris construcción 280ml", moneda: "CRC", precio: 4000 },
        { producto: "Copia de llave residencial corriente", moneda: "CRC", precio: 1500 },
        { producto: "Cinta aislante negra 18mm x 20m", moneda: "CRC", precio: 1700 },
        { producto: "Tornillo madera #8 x 1\" fosfatado (100 u)", moneda: "CRC", precio: 1900 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-019", nombre: "Ferretería San Joaquín de Flores", tipo: "Ferretería / Materiales",
      ubicacion: { provincia: "Heredia", canton: "Flores", distrito: "San Joaquín" },
      horario: "L–S 7:00–18:00",
      descripcion: "Ferretería completa para proyectos de construcción y remodelación en la zona de Flores.",
      telefono: "+506 2265-4400", whatsapp: "50688654400", maps: "https://maps.app.goo.gl/ferresanjoaquin",
      productos: [
        { producto: "Cemento gris 50 kg Progreso UG", moneda: "CRC", precio: 7700 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 530 },
        { producto: "Varilla 3/8\" x 6m", moneda: "CRC", precio: 5200 },
        { producto: "Arena tajo m³", moneda: "CRC", precio: 21000 },
        { producto: "Pintura látex blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Tubo PVC presión 1/2\" x 6m", moneda: "CRC", precio: 4200 },
        { producto: "Llave de paso bola 1/2\" PVC Pavco", moneda: "CRC", precio: 3200 },
        { producto: "Silicon blanco 280ml", moneda: "CRC", precio: 3900 },
        { producto: "Foco LED 9W luz cálida E27", moneda: "CRC", precio: 2800 },
        { producto: "Cinta teflón 1/2\"", moneda: "CRC", precio: 420 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-020", nombre: "Auto Repuestos La Rueda Tibás", tipo: "Repuestos automotrices",
      ubicacion: { provincia: "San José", canton: "Tibás", distrito: "San Juan" },
      horario: "L–V 7:30–18:00 / S 7:30–13:00",
      descripcion: "Especialistas en vehículos japoneses y americanos. Aceites, filtros, frenos y eléctrico automotriz.",
      telefono: "+506 2240-9900", whatsapp: "50688409900", maps: "https://maps.app.goo.gl/larueda-tibas",
      productos: [
        { producto: "Aceite motor 20W50 Pennzoil galón", moneda: "CRC", precio: 8500 },
        { producto: "Aceite motor 5W30 sintético Mobil 1L", moneda: "CRC", precio: 12000 },
        { producto: "Filtro aceite Toyota Corolla HF070", moneda: "CRC", precio: 4200 },
        { producto: "Filtro aire Toyota Hiace Hilux 17801", moneda: "CRC", precio: 6500 },
        { producto: "Pastillas de freno delanteras Toyota genérico", moneda: "CRC", precio: 14000 },
        { producto: "Batería 12V 45Ah libre mantenimiento Delphi", moneda: "CRC", precio: 52000 },
        { producto: "Batería 12V 65Ah libre mantenimiento Delphi", moneda: "CRC", precio: 68000 },
        { producto: "Bujia NGK iridio BKR6EIX unidad", moneda: "CRC", precio: 6800 },
        { producto: "Líquido de frenos DOT4 500ml", moneda: "CRC", precio: 4500 },
        { producto: "Refrigerante concentrado 1L verde", moneda: "CRC", precio: 3800 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-021", nombre: "Repuestos del Sur Hatillo", tipo: "Repuestos automotrices / Lubricantes",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "Hatillo" },
      horario: "L–V 7:30–18:00 / S 8:00–14:00",
      descripcion: "Distribuidora de repuestos para vehículos nacionales e importados. Entrega en GAM.",
      telefono: "+506 2254-6700", whatsapp: "50688546700", maps: "https://maps.app.goo.gl/repuestoselsur-hatillo",
      productos: [
        { producto: "Aceite motor 20W50 Havoline galón", moneda: "CRC", precio: 7800 },
        { producto: "Aceite motor 10W40 semisintético Castrol 1L", moneda: "CRC", precio: 7200 },
        { producto: "Filtro aceite Honda Civic 2012-2015", moneda: "CRC", precio: 3800 },
        { producto: "Filtro combustible universal gasolina", moneda: "CRC", precio: 5500 },
        { producto: "Batería 12V 55Ah libre mantenimiento Bosch", moneda: "CRC", precio: 60000 },
        { producto: "Pastillas de freno delanteras Honda Civic", moneda: "CRC", precio: 16000 },
        { producto: "Amortiguador delantero KYB Toyota Yaris", moneda: "USD", precio: 58 },
        { producto: "Bujia NGK BKR5E unidad", moneda: "CRC", precio: 3200 },
        { producto: "Limpia parabrisas 21\" Bosch par", moneda: "CRC", precio: 9500 },
        { producto: "Líquido dirección hidráulica 1L", moneda: "CRC", precio: 4200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-022", nombre: "Ferretería Los Ángeles San Ramón", tipo: "Ferretería / Materiales de construcción",
      ubicacion: { provincia: "Alajuela", canton: "San Ramón", distrito: "San Ramón" },
      horario: "L–S 7:00–17:30",
      descripcion: "Ferretería local que atiende proyectos de construcción en toda la zona de San Ramón.",
      telefono: "+506 2445-1200", whatsapp: "50688451200", maps: "https://maps.app.goo.gl/ferrelosangeles-sranmon",
      productos: [
        { producto: "Cemento gris 50 kg Holcim Fuerte", moneda: "CRC", precio: 7650 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Varilla deformada 3/8\" x 6m", moneda: "CRC", precio: 5200 },
        { producto: "Arena lavada m³", moneda: "CRC", precio: 23500 },
        { producto: "Pintura látex blanco galón SUR", moneda: "CRC", precio: 14800 },
        { producto: "Lamina zinc ondulada cal.26 2m", moneda: "CRC", precio: 8500 },
        { producto: "Perling C 2x4 cal.20 x 6m", moneda: "CRC", precio: 16000 },
        { producto: "Tubo PVC 3\" x 3m sanitario Pavco", moneda: "CRC", precio: 5800 },
        { producto: "Silicon construcción gris 280ml", moneda: "CRC", precio: 4100 },
        { producto: "Tornillo madera #10 x 3\" (100 u)", moneda: "CRC", precio: 3500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-023", nombre: "El Lagar Tibás", tipo: "Ferretería / Hogar formato conveniencia",
      ubicacion: { provincia: "San José", canton: "Tibás", distrito: "Tibás" },
      horario: "L–S 7:30–18:30 / D 8:00–15:00",
      descripcion: "Formato conveniencia de El Lagar. Especializado en remodelación y acabados para el hogar.",
      telefono: "+506 2240-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-tibas",
      productos: [
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Pintura acrílica exterior blanco galón SUR", moneda: "CRC", precio: 15900 },
        { producto: "Imprimante blanco galón SUR", moneda: "CRC", precio: 9800 },
        { producto: "Foco LED 9W luz cálida E27 GE", moneda: "CRC", precio: 2900 },
        { producto: "Foco LED 12W luz blanca E27 GE", moneda: "CRC", precio: 3300 },
        { producto: "Silicon blanco 280ml Loctite", moneda: "CRC", precio: 4100 },
        { producto: "Cinta masking tape 18mm x 25m", moneda: "CRC", precio: 950 },
        { producto: "Rodillo pintura 7\" felpa gruesa", moneda: "CRC", precio: 2800 },
        { producto: "Brocha cerda 3\"", moneda: "CRC", precio: 2200 },
        { producto: "Lija al agua grano 120 hoja", moneda: "CRC", precio: 480 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-024", nombre: "Ferretería Padilla Heredia", tipo: "Ferretería / Fontanería / Eléctricos",
      ubicacion: { provincia: "Heredia", canton: "Heredia", distrito: "Heredia" },
      horario: "L–V 7:30–17:30 / S 7:30–13:00",
      descripcion: "Ferretería especializada en plomería, eléctrico residencial y fontanería.",
      telefono: "+506 2262-5800", whatsapp: "50688625800", maps: "https://maps.app.goo.gl/ferrepadilla-heredia",
      productos: [
        { producto: "Tubo PVC presión 1/2\" x 6m SDR-17 Pavco", moneda: "CRC", precio: 4200 },
        { producto: "Tubo PVC presión 3/4\" x 6m SDR-17 Pavco", moneda: "CRC", precio: 5800 },
        { producto: "Tubo PVC presión 1\" x 6m SDR-17 Pavco", moneda: "CRC", precio: 8500 },
        { producto: "Tubo CPVC agua caliente 1/2\" x 3m", moneda: "CRC", precio: 5200 },
        { producto: "Llave ducha control de volumen Helvex", moneda: "CRC", precio: 15500 },
        { producto: "Llave de paso bola PVC 1/2\" Pavco", moneda: "CRC", precio: 3200 },
        { producto: "Cable THW #12 AWG metro", moneda: "CRC", precio: 680 },
        { producto: "Cable THW #10 AWG metro", moneda: "CRC", precio: 950 },
        { producto: "Interruptor sencillo blanco 15A Leviton", moneda: "CRC", precio: 3000 },
        { producto: "Cinta teflón 1/2\" rollo", moneda: "CRC", precio: 420 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-025", nombre: "PriceSmart San José", tipo: "Supermercado mayorista / Hogar",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "Pavas" },
      horario: "L–V 9:00–21:00 / S–D 8:00–21:00",
      descripcion: "Club de compras mayorista. Productos de limpieza, herramientas y hogar en formatos grandes.",
      telefono: "+506 2242-1200", whatsapp: "", maps: "https://maps.app.goo.gl/pricesmart-sj",
      productos: [
        { producto: "Detergente líquido ropa 5L Tide", moneda: "CRC", precio: 18500 },
        { producto: "Detergente en polvo 10kg Ariel", moneda: "CRC", precio: 22000 },
        { producto: "Cloro 3.78L galón Clorox", moneda: "CRC", precio: 5800 },
        { producto: "Papel higiénico 60 rollos doble hoja", moneda: "CRC", precio: 28000 },
        { producto: "Batería AA alcalina Duracell 20 unidades", moneda: "CRC", precio: 9500 },
        { producto: "Batería AAA alcalina Duracell 20 unidades", moneda: "CRC", precio: 9000 },
        { producto: "Foco LED 9W E27 GE pack 6 unidades", moneda: "CRC", precio: 12500 },
        { producto: "Escoba sintética con mango reforzado", moneda: "CRC", precio: 4800 },
        { producto: "Trapeador mopa de algodón", moneda: "CRC", precio: 6200 },
        { producto: "Caja herramientas plástica 17\" Stanley", moneda: "USD", precio: 28 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-026", nombre: "Auto Repuestos Gamboa Alajuela", tipo: "Repuestos automotrices / Lubricantes",
      ubicacion: { provincia: "Alajuela", canton: "Alajuela", distrito: "Río Segundo" },
      horario: "L–V 7:30–18:00 / S 8:00–13:00",
      descripcion: "Repuestería con inventario amplio para vehículos japoneses, americanos y europeos. Cerca del aeropuerto.",
      telefono: "+506 2441-3300", whatsapp: "50688413300", maps: "https://maps.app.goo.gl/gamboa-alajuela",
      productos: [
        { producto: "Aceite motor 20W50 Quaker State galón", moneda: "CRC", precio: 8200 },
        { producto: "Aceite motor 5W20 sintético Toyota Genuine 1L", moneda: "CRC", precio: 8500 },
        { producto: "Filtro aceite Suzuki Swift Vitara Purflux", moneda: "CRC", precio: 3600 },
        { producto: "Filtro aire Toyota Hilux 2009-2015", moneda: "CRC", precio: 7000 },
        { producto: "Batería 12V 45Ah libre mantenimiento Delphi", moneda: "CRC", precio: 52000 },
        { producto: "Pastillas freno traseras Kia Sportage", moneda: "CRC", precio: 14500 },
        { producto: "Disco de freno delantero Hyundai Tucson par", moneda: "USD", precio: 65 },
        { producto: "Bujia NGK iridio BKR6EIX unidad", moneda: "CRC", precio: 6800 },
        { producto: "Faja alternador L445 Gates", moneda: "CRC", precio: 4500 },
        { producto: "Faja AC compresor L380 Gates", moneda: "CRC", precio: 5200 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-027", nombre: "Ferretería Quesada Santa Ana", tipo: "Ferretería / Materiales de construcción",
      ubicacion: { provincia: "San José", canton: "Santa Ana", distrito: "Santa Ana" },
      horario: "L–S 7:00–17:30",
      descripcion: "Ferretería de barrio con stock de materiales básicos para reparación y remodelación.",
      telefono: "+506 2282-3300", whatsapp: "50688823300", maps: "https://maps.app.goo.gl/ferreqda-santaana",
      productos: [
        { producto: "Cemento gris 50 kg Progreso UG", moneda: "CRC", precio: 7600 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 510 },
        { producto: "Varilla 3/8\" x 6m G60", moneda: "CRC", precio: 5100 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14200 },
        { producto: "Silicon gris construcción 280ml", moneda: "CRC", precio: 3950 },
        { producto: "Cinta aislante negra 18mm x 20m", moneda: "CRC", precio: 1700 },
        { producto: "Tornillo madera #8 x 1.5\" fosfatado (100 u)", moneda: "CRC", precio: 2000 },
        { producto: "Clavo cabeza ancha 2.5\" kg", moneda: "CRC", precio: 1800 },
        { producto: "Foco LED 9W cálida E27", moneda: "CRC", precio: 2700 },
        { producto: "Tubo PVC 1/2\" x 6m presión", moneda: "CRC", precio: 4100 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-028", nombre: "El Lagar Pavas", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "San José", canton: "San José", distrito: "Pavas" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Sucursal de gran formato en Pavas con corte de madera y mezcla de pinturas.",
      telefono: "+506 2231-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-pavas",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7650 },
        { producto: "Varilla deformada 3/8\" x 6m Grado 60", moneda: "CRC", precio: 5150 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14300 },
        { producto: "Pintura de techo blanca galón SUR", moneda: "CRC", precio: 13500 },
        { producto: "Tabla pino 1x4 x 12 pies", moneda: "CRC", precio: 5800 },
        { producto: "Plywood pino 4x8 pies 9mm", moneda: "CRC", precio: 18500 },
        { producto: "Foco LED 9W cálida E27 Sylvania", moneda: "CRC", precio: 2800 },
        { producto: "Interruptor sencillo blanco", moneda: "CRC", precio: 2900 },
        { producto: "Silicon blanco 280ml Loctite", moneda: "CRC", precio: 4100 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-029", nombre: "El Lagar Santa Ana", tipo: "Ferretería / Depósito / Hogar",
      ubicacion: { provincia: "San José", canton: "Santa Ana", distrito: "Santa Ana" },
      horario: "L–S 7:00–19:00 / D 7:00–17:00",
      descripcion: "Ferretería con vivero, sección de baño, cocina y materiales de construcción.",
      telefono: "+506 2282-8080", whatsapp: "", maps: "https://maps.app.goo.gl/lagar-santaana",
      productos: [
        { producto: "Cemento gris 50 kg Progreso", moneda: "CRC", precio: 7650 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 520 },
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14300 },
        { producto: "Llave ducha monomando Helvex cromada", moneda: "CRC", precio: 18500 },
        { producto: "Sanitario blanco elongado Briggs", moneda: "CRC", precio: 68000 },
        { producto: "Lavatorio sobreponer blanco 55cm Briggs", moneda: "CRC", precio: 22500 },
        { producto: "Cerámica piso 45x45 gris antideslizante m²", moneda: "CRC", precio: 9500 },
        { producto: "Adhesivo cerámica gris 25 kg Sika", moneda: "CRC", precio: 8900 },
        { producto: "Maceta 25cm terracota jardín", moneda: "CRC", precio: 3200 },
        { producto: "Tierra abonada jardín saco 20L", moneda: "CRC", precio: 4500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-030", nombre: "Ferretería El Depósito Goicoechea", tipo: "Ferretería / Depósito de materiales",
      ubicacion: { provincia: "San José", canton: "Goicoechea", distrito: "Purral" },
      horario: "L–S 7:00–17:30",
      descripcion: "Depósito local con materiales para construcción. Entrega en Goicoechea y Coronado.",
      telefono: "+506 2234-7800", whatsapp: "50688347800", maps: "https://maps.app.goo.gl/deposito-goicoechea",
      productos: [
        { producto: "Cemento gris 50 kg Progreso UG", moneda: "CRC", precio: 7600 },
        { producto: "Varilla deformada 3/8\" x 6m", moneda: "CRC", precio: 5100 },
        { producto: "Block cemento 15x20x40 cm", moneda: "CRC", precio: 515 },
        { producto: "Arena lavada m³ entrega incluida GAM", moneda: "CRC", precio: 22500 },
        { producto: "Piedra cuarta m³", moneda: "CRC", precio: 19500 },
        { producto: "Malla electrosoldada 1.5x2.4m", moneda: "CRC", precio: 9600 },
        { producto: "Alambre recocido negro kg", moneda: "CRC", precio: 1200 },
        { producto: "Pintura látex blanco galón SUR", moneda: "CRC", precio: 14400 },
        { producto: "Clavo cemento 2.5\" kg", moneda: "CRC", precio: 2200 },
        { producto: "Tubo PVC sanitario 4\" x 3m Pavco", moneda: "CRC", precio: 8300 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-031", nombre: "Repuestos Cartagineses", tipo: "Repuestos automotrices / Lubricantes",
      ubicacion: { provincia: "Cartago", canton: "Cartago", distrito: "Occidental" },
      horario: "L–V 7:30–17:30 / S 8:00–13:00",
      descripcion: "Repuestería con más de 30 años en Cartago. Marcas japonesas, americanas y europeas.",
      telefono: "+506 2552-4400", whatsapp: "50688524400", maps: "https://maps.app.goo.gl/repuestoscart",
      productos: [
        { producto: "Aceite motor 20W50 Havoline galón", moneda: "CRC", precio: 8000 },
        { producto: "Aceite motor 5W30 sintético Castrol 1L", moneda: "CRC", precio: 8200 },
        { producto: "Filtro aceite Toyota Corolla 1ZZ-FE", moneda: "CRC", precio: 4000 },
        { producto: "Filtro aire Toyota Rav4 2006-2012", moneda: "CRC", precio: 7200 },
        { producto: "Batería 12V 60Ah libre mantenimiento ACDelco", moneda: "CRC", precio: 62000 },
        { producto: "Pastillas freno delanteras Mitsubishi Montero", moneda: "CRC", precio: 18000 },
        { producto: "Amortiguador trasero KYB Mitsubishi L200", moneda: "USD", precio: 52 },
        { producto: "Faja distribución Toyota 2.4 kit completo", moneda: "USD", precio: 85 },
        { producto: "Bujia NGK BPR6ES unidad", moneda: "CRC", precio: 2800 },
        { producto: "Termostato Toyota Hilux 90°C Wahler", moneda: "CRC", precio: 8500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    },
    {
      id: "ubiqo-seed-032", nombre: "Ferretería El Constructor Heredia", tipo: "Ferretería / Centro de pinturas",
      ubicacion: { provincia: "Heredia", canton: "Heredia", distrito: "Mercedes" },
      horario: "L–S 7:30–18:00",
      descripcion: "Centro de pinturas Protecto y SUR, especialistas en mezcla de colores y acabados decorativos.",
      telefono: "+506 2261-8800", whatsapp: "50688618800", maps: "https://maps.app.goo.gl/constructor-heredia",
      productos: [
        { producto: "Pintura látex interior blanco galón SUR", moneda: "CRC", precio: 14500 },
        { producto: "Pintura látex interior color galón SUR mezcla", moneda: "CRC", precio: 15800 },
        { producto: "Pintura acrílica exterior blanco galón SUR", moneda: "CRC", precio: 15900 },
        { producto: "Pintura anticorrosivo gris galón Protecto", moneda: "CRC", precio: 19500 },
        { producto: "Barniz marino brillante galón Protecto", moneda: "CRC", precio: 23000 },
        { producto: "Impermeabilizante techo blanco galón SUR", moneda: "CRC", precio: 24000 },
        { producto: "Imprimante blanco galón SUR", moneda: "CRC", precio: 9800 },
        { producto: "Rodillo felpa 9\" mango metálico", moneda: "CRC", precio: 4200 },
        { producto: "Brocha cerda natural 4\"", moneda: "CRC", precio: 3500 },
        { producto: "Lija al agua grano 80 hoja", moneda: "CRC", precio: 500 }
      ], createdAt: "2025-03-01T08:00:00.000Z"
    }
  ];

  // ── Cargar y hacer merge sin duplicar ─────────────────────
  let existentes = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    existentes = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(existentes)) existentes = [];
  } catch(e) { existentes = []; }

  const idsExistentes = new Set(existentes.map(b => b.id));
  const nuevos = TODOS_LOS_NEGOCIOS.filter(b => !idsExistentes.has(b.id));
  const merged = [...existentes, ...nuevos];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  console.log("✅ ¡Listo! Datos cargados correctamente:");
  console.log("   Negocios nuevos agregados: " + nuevos.length);
  console.log("   Total en la página: " + merged.length);
  console.log("   Recargá la página (F5) y buscá: cemento, pintura, javin, aceite...");
  alert("✅ ¡" + nuevos.length + " negocios cargados!\n\nAhora recargá la página (F5)\ny probá buscar: cemento, pintura, javín, aceite...");
})();