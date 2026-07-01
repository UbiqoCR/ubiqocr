# UbiqoCR Scraper - MasxMenos
# VTEX platform - URLs exactas via API
# Uso: python scraper_masxmenos.py

import asyncio
import re
import sys
import random
from datetime import datetime
from collections import Counter

try:
    import aiohttp
except ImportError:
    print("Instala: python312 -m pip install aiohttp")
    sys.exit(1)

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
except ImportError:
    print("Instala: python312 -m pip install openpyxl")
    sys.exit(1)

NEGOCIO  = "MasxMenos"
URL_BASE = "https://www.masxmenos.cr"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

CATEGORIAS = [
    # Jugos y Bebidas
    ("agua/agua-natural","Jugos y Bebidas"),("agua/agua-saborizada","Jugos y Bebidas"),("agua/envase-agua","Jugos y Bebidas"),("agua/garrafones","Jugos y Bebidas"),("cafe-y-te-preparado/te-listo-para-beber","Jugos y Bebidas"),("energizantes-e-hidratantes/energizante","Jugos y Bebidas"),("energizantes-e-hidratantes/hidratante","Jugos y Bebidas"),("gaseosas/light-y-sin-azucar","Jugos y Bebidas"),("gaseosas/sabor-cola","Jugos y Bebidas"),("gaseosas/sabores-varios","Jugos y Bebidas"),("jugos-y-nectares/bebida-natural","Jugos y Bebidas"),("jugos-y-nectares/jugo-de-frutas","Jugos y Bebidas"),("jugos-y-nectares/jugos-naturales","Jugos y Bebidas"),("jugos-y-nectares/nectar","Jugos y Bebidas"),("jugos-y-nectares/jugo-de-verduras","Jugos y Bebidas"),("jugos-y-nectares/bebida-de-soya","Jugos y Bebidas"),("jugos-y-nectares/bebida-de-almendra","Jugos y Bebidas"),("jugos-y-nectares/bebida-de-coco","Jugos y Bebidas"),("polvo-y-liquidos-concentrados/bebidas-en-polvo","Jugos y Bebidas"),("polvo-y-liquidos-concentrados/liquido-concentrado","Jugos y Bebidas"),
    # Cervezas Vinos y Licores
    ("cervezas/artesanales-e-importadas","Cervezas Vinos y Licores"),("coolers/coolers","Cervezas Vinos y Licores"),("digestivos/rompope","Cervezas Vinos y Licores"),("licores/brandy","Cervezas Vinos y Licores"),("licores/cognac","Cervezas Vinos y Licores"),("licores/ginebra","Cervezas Vinos y Licores"),("licores/ron","Cervezas Vinos y Licores"),("licores/tequila","Cervezas Vinos y Licores"),("licores/vodka","Cervezas Vinos y Licores"),("licores/whisky","Cervezas Vinos y Licores"),("vinos/champagne-y-espumoso","Cervezas Vinos y Licores"),("vinos/sidras","Cervezas Vinos y Licores"),("vinos/vino-blanco","Cervezas Vinos y Licores"),("vinos/vino-tinto","Cervezas Vinos y Licores"),("vinos/vino-rosado","Cervezas Vinos y Licores"),
    # Carnes y Pescados
    ("cerdo/carne-de-cerdo","Carnes y Pescados"),("cerdo/chicharron","Carnes y Pescados"),("mariscos-y-pescados/camarones-y-mariscos","Carnes y Pescados"),("mariscos-y-pescados/filetes-y-enteros","Carnes y Pescados"),("mariscos-y-pescados/marinados","Carnes y Pescados"),("pollo-y-pavo/pavo","Carnes y Pescados"),("pollo-y-pavo/pollo","Carnes y Pescados"),("res/carne-de-res","Carnes y Pescados"),
    # Higiene y Belleza
    ("afeitado/cuidado-de-la-mujer","Higiene y Belleza"),("afeitado/cuidado-del-hombre","Higiene y Belleza"),("cosmeticos/accesorios-cosmeticos","Higiene y Belleza"),("cosmeticos/brillos-labiales","Higiene y Belleza"),("cosmeticos/labiales","Higiene y Belleza"),("cosmeticos/polvo-compacto","Higiene y Belleza"),("cosmeticos/sombra-para-ojos","Higiene y Belleza"),("cuidado-bucal/cepillo-dental","Higiene y Belleza"),("cuidado-bucal/enjuague-bucal","Higiene y Belleza"),("cuidado-bucal/pasta-dental","Higiene y Belleza"),("cuidado-del-cabello/acondicionadores","Higiene y Belleza"),("cuidado-del-cabello/shampoo","Higiene y Belleza"),("cuidado-del-cabello/shampoo-anticaspa","Higiene y Belleza"),("cuidado-del-cabello/shampoo-infantil","Higiene y Belleza"),("cuidado-del-cabello/tinte-femenino","Higiene y Belleza"),("cuidado-del-cabello/tratamiento-capilar","Higiene y Belleza"),("cuidado-facial/crema-facial","Higiene y Belleza"),("cuidado-facial/tratamiento-facial","Higiene y Belleza"),("cuidado-intimo/toallas-y-tampones","Higiene y Belleza"),("higiene-y-cuidado-corporal/bloqueadores-y-bronceadores","Higiene y Belleza"),("higiene-y-cuidado-corporal/crema-corporal","Higiene y Belleza"),("higiene-y-cuidado-corporal/desodorante-femenino","Higiene y Belleza"),("higiene-y-cuidado-corporal/desodorante-masculino","Higiene y Belleza"),("higiene-y-cuidado-corporal/fragancias","Higiene y Belleza"),("higiene-y-cuidado-corporal/jabon-de-tocador","Higiene y Belleza"),("higiene-y-cuidado-corporal/jabon-y-gel-corporal","Higiene y Belleza"),("higiene-y-cuidado-para-manos/crema-para-manos","Higiene y Belleza"),("higiene-y-cuidado-para-manos/esmaltes","Higiene y Belleza"),("higiene-y-cuidado-para-manos/jabon-liquido","Higiene y Belleza"),("panuelos-desechables/panuelos-desechables","Higiene y Belleza"),
    # Bebes y Ninos
    ("articulos-para-fiesta/adornos-de-fiestas","Bebes y Ninos"),("comida-para-bebe-y-lactancia/accesorios-de-lactancia","Bebes y Ninos"),("comida-para-bebe-y-lactancia/biberones-y-tetinas","Bebes y Ninos"),("comida-para-bebe-y-lactancia/cereales-y-galletas-para-bebe","Bebes y Ninos"),("comida-para-bebe-y-lactancia/colados-1ra-etapa","Bebes y Ninos"),("comida-para-bebe-y-lactancia/colados-2da-etapa","Bebes y Ninos"),("comida-para-bebe-y-lactancia/colados-3ra-etapa","Bebes y Ninos"),("comida-para-bebe-y-lactancia/colados-4ta-etapa-y-junior","Bebes y Ninos"),("comida-para-bebe-y-lactancia/formulas-lacteas","Bebes y Ninos"),("higiene-del-bebe/crema-gel-y-locion-para-bebe","Bebes y Ninos"),("higiene-del-bebe/shampoo-y-jabon-para-bebe","Bebes y Ninos"),("higiene-del-bebe/talco-y-aceite-para-bebe","Bebes y Ninos"),("panales/panales-recien-nacido-y-etapa-1","Bebes y Ninos"),("panales/panales---etapa-2","Bebes y Ninos"),("panales/panales---etapa-3","Bebes y Ninos"),("panales/panales---etapa-4","Bebes y Ninos"),("panales/panales---etapa-5","Bebes y Ninos"),("panales/panales---etapa-6","Bebes y Ninos"),("panales/panales---etapa-7","Bebes y Ninos"),("bebes-y-ninos/toallitas-humedas","Bebes y Ninos"),
    # Alimentos Congelados
    ("comida-facil/comida-congelada","Alimentos Congelados"),("comida-facil/comida-infantil","Alimentos Congelados"),("comida-facil/papas-congeladas","Alimentos Congelados"),("comida-facil/pescados-y-mariscos","Alimentos Congelados"),("comida-facil/pollo-preparado","Alimentos Congelados"),("comida-facil/tacos-pizzas-y-pastas","Alimentos Congelados"),("frutas-y-verdura-congelada/frutas-congeladas","Alimentos Congelados"),("frutas-y-verdura-congelada/verduras-congeladas","Alimentos Congelados"),("postres-congelados/helados","Alimentos Congelados"),("postres-congelados/hot-cakes-y-wafles","Alimentos Congelados"),("postres-congelados/pay-y-pasteles","Alimentos Congelados"),
    # Lacteos
    ("crema-o-natilla/regular","Lacteos"),("huevo/blanco","Lacteos"),("huevo/marron","Lacteos"),("leche/condensada","Lacteos"),("leche/en-polvo","Lacteos"),("leche/evaporada","Lacteos"),("leche/leche-deslactosada","Lacteos"),("leche/leche-entera","Lacteos"),("leche/leche-light","Lacteos"),("leche/leche-saborizada","Lacteos"),("leche/leche-semi-y-descremada","Lacteos"),("mantequillas-y-margarinas/mantequillas","Lacteos"),("mantequillas-y-margarinas/margarinas","Lacteos"),("queso/queso-cottage","Lacteos"),("queso/queso-fresco","Lacteos"),("queso/queso-mozzarella","Lacteos"),("queso/queso-crema","Lacteos"),("queso-gourmet/queso-brie","Lacteos"),("queso-gourmet/queso-edam","Lacteos"),("yogurt/yogurt-batido","Lacteos"),("yogurt/yogurt-bebible","Lacteos"),("yogurt/yogurt-natural","Lacteos"),
    # Abarrotes
    ("aceites-de-cocina/aceite-de-canola","Abarrotes"),("aceites-de-cocina/aceite-de-maiz","Abarrotes"),("aceites-de-cocina/aceite-de-oliva","Abarrotes"),("aceites-de-cocina/aceite-de-semillas-y-vegetal","Abarrotes"),("aceites-de-cocina/manteca","Abarrotes"),("alimentos-instantaneos/comida-rapida","Abarrotes"),("alimentos-instantaneos/pasta-y-sopa-instantanea","Abarrotes"),("arroz-frijol-y-semillas/arroz","Abarrotes"),("arroz-frijol-y-semillas/frijol","Abarrotes"),("arroz-frijol-y-semillas/semillas","Abarrotes"),("azucar-y-postres/azucar","Abarrotes"),("azucar-y-postres/gelatinas-y-flan","Abarrotes"),("azucar-y-postres/sustituto-de-azucar","Abarrotes"),("cafe-te-y-sustitutos/cafe-molido","Abarrotes"),("cafe-te-y-sustitutos/cafe-en-grano","Abarrotes"),("cafe-te-y-sustitutos/capsulas-de-cafe","Abarrotes"),("cafe-te-y-sustitutos/te-medicinales","Abarrotes"),("cereales-y-barras/avena-y-granola","Abarrotes"),("cereales-y-barras/barras-de-cereal","Abarrotes"),("cereales-y-barras/cereal-dulce","Abarrotes"),("dulces-y-chocolates/caramelos","Abarrotes"),("dulces-y-chocolates/chocolates","Abarrotes"),("dulces-y-chocolates/gomitas","Abarrotes"),("enlatados-y-conservas/atun-y-pescado","Abarrotes"),("enlatados-y-conservas/carnes-enlatadas","Abarrotes"),("enlatados-y-conservas/frutas-en-almibar","Abarrotes"),("enlatados-y-conservas/sopas-y-cremas","Abarrotes"),("enlatados-y-conservas/vegetales-enlatados","Abarrotes"),("especiales-y-sazonadores/especias","Abarrotes"),("especiales-y-sazonadores/sal-y-condimentos","Abarrotes"),("especiales-y-sazonadores/sazonadores","Abarrotes"),("galletas/galletas-dulces","Abarrotes"),("galletas/galletas-saladas","Abarrotes"),("galletas/galletas-integrales","Abarrotes"),("harinas-y-reposteria/harina-de-trigo-y-maiz","Abarrotes"),("harinas-y-reposteria/reposteria","Abarrotes"),("mermeladas-y-miel/cajeta-y-dulce-de-leche","Abarrotes"),("mermeladas-y-miel/mermelada","Abarrotes"),("mermeladas-y-miel/miel","Abarrotes"),("pastas/spaghetti","Abarrotes"),("pastas/fusilli","Abarrotes"),("pastas/salsa-para-pasta-y-pizza","Abarrotes"),("salsa-aderezos-y-vinagre/aderezos-y-vinagretas","Abarrotes"),("salsa-aderezos-y-vinagre/catsup-y-mostaza","Abarrotes"),("salsa-aderezos-y-vinagre/mayonesa","Abarrotes"),("salsa-aderezos-y-vinagre/salsa-picante","Abarrotes"),("salsa-aderezos-y-vinagre/salsas-caseras","Abarrotes"),("snacks-y-fruta-seca/chicharrones","Abarrotes"),("snacks-y-fruta-seca/frutas-secas","Abarrotes"),("snacks-y-fruta-seca/mani-y-otras-semillas","Abarrotes"),("snacks-y-fruta-seca/papas-y-frituras","Abarrotes"),("snacks-y-fruta-seca/snacks","Abarrotes"),
    # Limpieza
    ("accesorios-para-limpieza/escobas-cepillos-y-escurridores-de-piso","Limpieza"),("accesorios-para-limpieza/fibras-y-esponjas","Limpieza"),("accesorios-para-limpieza/guantes","Limpieza"),("accesorios-para-limpieza/trapeadores-y-quitapelusas","Limpieza"),("aromatizantes/aromatizante-ambiental","Limpieza"),("desechables/bolsas-para-basura","Limpieza"),("desechables/bolsas-para-cocina","Limpieza"),("desechables/papel-aluminio-y-adherente","Limpieza"),("desechables/servilletas","Limpieza"),("desechables/toallas-de-cocina","Limpieza"),("desechables/vasos-y-platos","Limpieza"),("detergente/detergente-en-polvo","Limpieza"),("detergente/detergente-liquido","Limpieza"),("jabon-de-lavanderia/jabon-de-barra","Limpieza"),("lavaplatos/lavaplatos-en-polvo-y-en-pasta","Limpieza"),("lavaplatos/lavaplatos-liquido","Limpieza"),("limpieza-del-hogar/cloro","Limpieza"),("limpieza-del-hogar/desinfectantes","Limpieza"),("limpieza-del-hogar/insecticidas-y-trampas","Limpieza"),("limpieza-del-hogar/limpiadores-multiusos","Limpieza"),("papel-higienico/empaques-de-18-y-12-rollos","Limpieza"),("papel-higienico/empaques-de-6-y-4-rollos","Limpieza"),("papel-higienico/empaques-de-32-y-24-rollos","Limpieza"),("quitamanchas-para-ropa/quitamanchas-liquido","Limpieza"),("suavizante/suavizante-regular","Limpieza"),
    # Farmacia
    ("analgesicos/dolor","Farmacia"),("analgesicos/musculares-e-inflamacion","Farmacia"),("estomacales/antiacidos","Farmacia"),("estomacales/antidiarreicos","Farmacia"),("respiratorios/alergias","Farmacia"),("respiratorios/congestion-nasal","Farmacia"),("respiratorios/tos","Farmacia"),("vitaminas-y-suplementos/multivitaminicos","Farmacia"),("vitaminas-y-suplementos/suplementos-nutricionales","Farmacia"),("vitaminas-y-suplementos/vitaminas","Farmacia"),("primeros-auxilios/alcohol-y-antisepticos","Farmacia"),("primeros-auxilios/primeros-auxilios","Farmacia"),
    # Mascotas
    ("mascota/accesorios-para-perros","Mascotas"),("mascota/alimento-seco-para-gatos","Mascotas"),("mascota/alimento-seco-para-perros","Mascotas"),("mascota/arena-y-accesorios-para-gatos","Mascotas"),("mascota/limpieza-y-cuidado","Mascotas"),("mascota/premios-y-carnazas","Mascotas"),("mascota/alimento-humedo-para-perros","Mascotas"),("mascota/alimento-humedo-para-gatos","Mascotas"),
    # Frutas y Verduras
    ("frutas/bananos-papayas-y-tropicales","Frutas y Verduras"),("frutas/fresa-frambuesa-y-moras","Frutas y Verduras"),("frutas/manzanas-y-peras","Frutas y Verduras"),("frutas/naranja-limon-y-citricos","Frutas y Verduras"),("frutas/uvas-duraznos-y-ciruelas","Frutas y Verduras"),("verduras/cebollas-papas-y-verduras-de-raiz","Frutas y Verduras"),("verduras/chiles-ajos-y-pimientos","Frutas y Verduras"),("verduras/ensaladas-y-empacados","Frutas y Verduras"),("verduras/tomates-aguacates-y-basicos","Frutas y Verduras"),("verduras/lechugas-espinacas-y-hojas-verdes","Frutas y Verduras"),
    # Panaderia
    ("pan-dulce/bizcochos","Panaderia y Tortilleria"),("pan-dulce/empacados","Panaderia y Tortilleria"),("pan-salado/bollos-y-hot-dog","Panaderia y Tortilleria"),("pan-salado/pan-de-caja","Panaderia y Tortilleria"),("pan-salado/pan-tostado","Panaderia y Tortilleria"),("tortilleria/tortillas-de-harina","Panaderia y Tortilleria"),("tortilleria/tortillas-de-maiz","Panaderia y Tortilleria"),
    # Embutidos
    ("carnes-y-pescados/embutidos","Embutidos"),
]


def limpiar_precio(texto):
    if not texto:
        return None
    primera = re.sub(r'[^\d.,]', '', texto.strip().split('\n')[0])
    if not primera:
        return None
    tiene_punto = '.' in primera
    tiene_coma  = ',' in primera
    if tiene_punto and tiene_coma:
        if primera.rfind('.') > primera.rfind(','):
            primera = primera.replace(',', '')
        else:
            primera = primera.replace('.', '').replace(',', '.')
    elif tiene_punto:
        partes = primera.split('.')
        if len(partes) >= 2 and len(partes[-1]) == 3:
            primera = primera.replace('.', '')
    elif tiene_coma:
        partes = primera.split(',')
        if len(partes) == 2 and len(partes[1]) == 3:
            primera = primera.replace(',', '')
        else:
            primera = primera.replace(',', '.')
    try:
        r = float(primera)
        return r if r > 0 else None
    except ValueError:
        return None


def limpiar_texto(s):
    if not isinstance(s, str):
        return s
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', s).strip()


async def get_productos_categoria(session, slug, cat_nombre, vistos):
    """Usa la API de busqueda de VTEX para obtener todos los productos."""
    nuevos = []
    desde  = 0
    paso   = 50

    while True:
        url = (
            f"{URL_BASE}/api/catalog_system/pub/products/search/{slug}"
            f"?_from={desde}&_to={desde + paso - 1}"
            f"&O=OrderByReleaseDateDESC"
        )
        try:
            async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200:
                    break
                items = await r.json()
                if not items:
                    break

                # Total disponible
                resources = r.headers.get('resources', '')
                total_str = resources.split('/')[-1] if '/' in resources else '0'
                try:
                    total = int(total_str)
                except Exception:
                    total = 0

                for item in items:
                    try:
                        nombre = limpiar_texto(item.get('productName', '') or item.get('name', ''))
                        if not nombre or len(nombre) < 3:
                            continue

                        # Precio desde items[0].sellers[0].commertialOffer
                        precio = None
                        try:
                            skus = item.get('items', [])
                            if skus:
                                sellers = skus[0].get('sellers', [])
                                if sellers:
                                    offer = sellers[0].get('commertialOffer', {})
                                    precio = offer.get('Price') or offer.get('ListPrice')
                                    if precio:
                                        precio = float(precio)
                        except Exception:
                            pass

                        href = f"{URL_BASE}/{item.get('linkText', '')}/p"
                        prod_id = str(item.get('productId', ''))

                        clave = prod_id if prod_id else nombre.lower()
                        if clave in vistos:
                            continue
                        vistos.add(clave)

                        nuevos.append({
                            "nombre":    nombre,
                            "precio":    precio,
                            "moneda":    "CRC",
                            "categoria": cat_nombre,
                            "negocio":   NEGOCIO,
                            "url":       limpiar_texto(href),
                        })
                    except Exception:
                        continue

                desde += paso
                if desde >= total or len(items) < paso:
                    break

                await asyncio.sleep(0.2)

        except Exception as e:
            print(f"      error: {str(e)[:40]}")
            break

    return nuevos


async def scrapear():
    productos = []
    vistos    = set()
    SEP = "=" * 60

    print(f"\n{SEP}")
    print(f"  {NEGOCIO} - VTEX API - {len(CATEGORIAS)} subcategorias")
    print(f"{SEP}")

    connector = aiohttp.TCPConnector(ssl=False, limit=5)
    async with aiohttp.ClientSession(connector=connector) as session:

        cat_actual = ""
        for slug, cat_nombre in CATEGORIAS:
            if cat_nombre != cat_actual:
                print(f"\n[{cat_nombre}]")
                cat_actual = cat_nombre

            subcat = slug.split('/')[-1].replace('-', ' ').title()
            print(f"  [{subcat}]", end="", flush=True)

            nuevos = await get_productos_categoria(session, slug, cat_nombre, vistos)
            productos.extend(nuevos)
            print(f" {len(nuevos)} | total: {len(productos)}")

            await asyncio.sleep(random.uniform(0.3, 0.6))

    sin_p = sum(1 for p in productos if p["precio"] is None)
    print(f"\n  TOTAL {NEGOCIO}: {len(productos)} productos ({sin_p} sin precio)")
    return productos


def exportar_excel(productos):
    fecha    = datetime.now().strftime("%Y%m%d_%H%M")
    nombre_f = f"productos_{NEGOCIO}_{fecha}.xlsx"

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Productos"

    COLOR  = "FF6B00"
    CLARO  = "FFF3E0"
    GRIS   = "F8FAFC"

    hf = Font(name="Calibri", bold=True, color="FFFFFF", size=10)
    hx = PatternFill("solid", fgColor=COLOR)
    ha = Alignment(horizontal="center", vertical="center")
    ax = PatternFill("solid", fgColor=CLARO)
    gx = PatternFill("solid", fgColor=GRIS)
    na = Alignment(vertical="center")
    ra = Alignment(horizontal="right", vertical="center")
    thin = Side(border_style="thin", color="E2E8F0")
    brd  = Border(left=thin, right=thin, top=thin, bottom=thin)

    cols   = ["Nombre del producto", "Precio", "Moneda", "Categoria", "Negocio", "URL"]
    widths = [55, 14, 9, 25, 12, 60]

    for ci, (c, w) in enumerate(zip(cols, widths), 1):
        cell = ws.cell(row=1, column=ci, value=c)
        cell.font = hf; cell.fill = hx
        cell.alignment = ha; cell.border = brd
        ws.column_dimensions[cell.column_letter].width = w

    ws.row_dimensions[1].height = 26
    ws.freeze_panes = "A2"

    for i, prod in enumerate(productos, 1):
        fila = i + 1
        fill = ax if i % 2 == 0 else gx
        vals = [prod.get("nombre",""), prod.get("precio"),
                prod.get("moneda","CRC"), prod.get("categoria",""),
                prod.get("negocio",""), prod.get("url","")]
        for ci, v in enumerate(vals, 1):
            if isinstance(v, str):
                v = limpiar_texto(v)
            cell = ws.cell(row=fila, column=ci, value=v)
            cell.border = brd; cell.fill = fill
            if ci == 2 and isinstance(v, float):
                cell.number_format = "#,##0.00"; cell.alignment = ra
            else:
                cell.alignment = na
        ws.row_dimensions[fila].height = 16

    ws2 = wb.create_sheet("Resumen")
    ws2["A1"] = f"{NEGOCIO} - {len(productos)} productos"
    ws2["A1"].font = Font(bold=True, size=13, color=COLOR)
    ws2["A2"] = f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}"

    for ci, t in enumerate(["Categoria", "Productos", "Con precio"], 1):
        c = ws2.cell(row=4, column=ci, value=t)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=COLOR)

    cnt = Counter(p["categoria"] for p in productos)
    cpr = Counter(p["categoria"] for p in productos if p["precio"] is not None)
    for ri, (cat, n) in enumerate(sorted(cnt.items()), 5):
        ws2.cell(row=ri, column=1, value=cat)
        ws2.cell(row=ri, column=2, value=n)
        ws2.cell(row=ri, column=3, value=cpr.get(cat, 0))

    tf = 5 + len(cnt)
    ws2.cell(row=tf, column=1, value="TOTAL").font = Font(bold=True)
    ws2.cell(row=tf, column=2, value=len(productos)).font = Font(bold=True)
    ws2.column_dimensions["A"].width = 30
    ws2.column_dimensions["B"].width = 14
    ws2.column_dimensions["C"].width = 14

    wb.save(nombre_f)
    print(f"  Excel: {nombre_f}")
    return nombre_f


async def main():
    print(f"\nUbiqoCR Scraper - {NEGOCIO}")
    print(f"Inicio: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")

    prods = await scrapear()
    if prods:
        exportar_excel(prods)
    else:
        print("Sin productos")

    print(f"\nFin: {datetime.now().strftime('%H:%M:%S')}\n")


if __name__ == "__main__":
    asyncio.run(main())
