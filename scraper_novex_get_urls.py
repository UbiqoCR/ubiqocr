# UbiqoCR - Novex URL Collector
# Recolecta todas las URLs de subcategorias con productos
# Uso: python novex_get_urls.py
# Output: novex_urls.txt

import asyncio
import re
import sys
from datetime import datetime

try:
    from playwright.async_api import async_playwright, TimeoutError as PWTimeout
except ImportError:
    print("Instala: python -m pip install playwright && python -m playwright install chromium")
    sys.exit(1)

URL_BASE = "https://www.novex.cr"

DEPARTAMENTOS = [
    ("https://www.novex.cr/catalogo/20/electrico.html",                "Electrico"),
    ("https://www.novex.cr/catalogo/30/iluminacion.html",              "Iluminacion"),
    ("https://www.novex.cr/catalogo/27/acabados-finales.html",         "Acabados Finales"),
    ("https://www.novex.cr/catalogo/35/cerrajeria.html",               "Cerrajeria"),
    ("https://www.novex.cr/catalogo/40/ferreteria.html",               "Ferreteria"),
    ("https://www.novex.cr/catalogo/41/materiales-de-construccion.html","Materiales Construccion"),
    ("https://www.novex.cr/catalogo/42/tornilleria.html",              "Tornilleria"),
    ("https://www.novex.cr/catalogo/43/seguridad-industrial.html",     "Seguridad Industrial"),
    ("https://www.novex.cr/catalogo/45/herramientas-electricas.html",  "Herramientas Electricas"),
    ("https://www.novex.cr/catalogo/46/herramientas-manuales.html",    "Herramientas Manuales"),
    ("https://www.novex.cr/catalogo/50/electrodomesticos.html",        "Electrodomesticos"),
    ("https://www.novex.cr/catalogo/51/cocina.html",                   "Cocina"),
    ("https://www.novex.cr/catalogo/52/comedor-y-bar.html",            "Comedor y Bar"),
    ("https://www.novex.cr/catalogo/53/limpieza-y-organizacion.html",  "Limpieza y Organizacion"),
    ("https://www.novex.cr/catalogo/54/decoracion.html",               "Decoracion"),
    ("https://www.novex.cr/catalogo/55/outdoors.html",                 "Outdoors"),
    ("https://www.novex.cr/catalogo/57/mascotas.html",                 "Mascotas"),
    ("https://www.novex.cr/catalogo/58/muebles.html",                  "Muebles"),
    ("https://www.novex.cr/catalogo/60/bombas-y-calentadores.html",    "Bombas y Calentadores"),
    ("https://www.novex.cr/catalogo/61/ventilacion-y-calefaccion.html","Ventilacion y Calefaccion"),
    ("https://www.novex.cr/catalogo/62/fontaneria.html",               "Fontaneria"),
    ("https://www.novex.cr/catalogo/70/banos.html",                    "Banos"),
    ("https://www.novex.cr/catalogo/80/automotriz.html",               "Automotriz"),
    ("https://www.novex.cr/catalogo/85/jardineria.html",               "Jardineria"),
    ("https://www.novex.cr/catalogo/86/maquinaria-para-jardin.html",   "Maquinaria Jardin"),
]


def normalizar_url(href):
    if not href:
        return href
    href = re.sub(r'(https?://)([^/]+)/m/', r'\1\2/', href)
    href = href.replace("https://novex.cr/", "https://www.novex.cr/")
    href = href.replace("http://novex.cr/", "https://www.novex.cr/")
    return href


def get_cat_id(url):
    m = re.search(r'/catalogo/(\d+)/', url)
    return m.group(1) if m else ""


def es_subcat_de(href, parent_url):
    parent_id = get_cat_id(parent_url)
    child_id  = get_cat_id(href)
    return (child_id.startswith(parent_id) and 
            len(child_id) > len(parent_id) and
            child_id != parent_id)


async def get_all_links(page):
    try:
        hrefs = await page.evaluate("""
            () => Array.from(document.querySelectorAll('a[href*="/catalogo/"]'))
                .map(a => a.href)
                .filter(h => h && h.includes('.html'))
        """)
        return [normalizar_url(h) for h in hrefs if h]
    except Exception:
        return []


async def tiene_productos(page):
    try:
        n = await page.evaluate("() => document.querySelectorAll('h4.pc__name').length")
        return n > 0
    except Exception:
        return False


async def explorar(page, url, parent_url, visitados, urls_con_productos, profundidad=0):
    url = normalizar_url(url)
    if url in visitados or profundidad > 5:
        return
    visitados.add(url)

    indent = "  " * profundidad
    nombre = url.split('/')[-1].replace('.html','')
    print(f"{indent}-> {nombre}", end="", flush=True)

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await asyncio.sleep(1.2)
    except Exception as e:
        print(f" [ERROR: {str(e)[:30]}]")
        return

    if await tiene_productos(page):
        cat_id = get_cat_id(url)
        print(f" [PRODUCTOS ✓]")
        urls_con_productos.append(url)
        return

    print(f" [explorando...]")

    all_links = await get_all_links(page)
    sub_links = [l for l in set(all_links) 
                 if es_subcat_de(l, url) and l not in visitados]

    for sub in sorted(sub_links):
        await explorar(page, sub, url, visitados, urls_con_productos, profundidad + 1)
        await asyncio.sleep(0.3)


async def main():
    print(f"\nNovex URL Collector")
    print(f"Inicio: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{'='*60}\n")

    todas_urls = []
    visitados  = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox",
                  "--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 900},
            locale="es-CR",
        )
        page = await context.new_page()
        await page.route(
            "**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot,ico}",
            lambda route: route.abort()
        )

        for depto_url, depto_nombre in DEPARTAMENTOS:
            print(f"\n[{depto_nombre}]")
            urls_depto = []
            await explorar(page, depto_url, depto_url, visitados, urls_depto)
            todas_urls.extend([(url, depto_nombre) for url in urls_depto])
            print(f"  -> {len(urls_depto)} URLs con productos")

        await browser.close()

    # Guardar en archivo
    with open("novex_urls.txt", "w", encoding="utf-8") as f:
        f.write(f"# Novex URLs - {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        f.write(f"# Total: {len(todas_urls)} URLs con productos\n\n")
        cat_actual = ""
        for url, cat in todas_urls:
            if cat != cat_actual:
                f.write(f"\n# {cat}\n")
                cat_actual = cat
            f.write(f"{url}\n")

    print(f"\n{'='*60}")
    print(f"Total URLs encontradas: {len(todas_urls)}")
    print(f"Guardado en: novex_urls.txt")
    print(f"Fin: {datetime.now().strftime('%H:%M:%S')}\n")


if __name__ == "__main__":
    asyncio.run(main())
