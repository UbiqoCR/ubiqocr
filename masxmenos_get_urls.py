# UbiqoCR - MasxMenos URL Collector via VTEX API
# Uso: python masxmenos_get_urls.py
# Output: masxmenos_urls.txt

import asyncio
import json
import sys
from datetime import datetime

try:
    import aiohttp
except ImportError:
    print("Instala: python -m pip install aiohttp")
    sys.exit(1)

URL_BASE = "https://www.masxmenos.cr"

# Categorias principales confirmadas del menu
CATEGORIAS = [
    ("abarrotes",                "Abarrotes"),
    ("jugos-y-bebidas",          "Jugos y Bebidas"),
    ("lacteos-y-huevos",         "Lacteos y Huevos"),
    ("higiene-y-belleza",        "Higiene y Belleza"),
    ("bebes-y-ninos",            "Bebes y Ninos"),
    ("limpieza",                 "Limpieza"),
    ("cervezas-vinos-y-licores", "Cervezas Vinos y Licores"),
    ("farmacia",                 "Farmacia"),
    ("carnes-y-pescados",        "Carnes y Pescados"),
    ("alimentos-congelados",     "Alimentos Congelados"),
    ("panaderia-y-tortilleria",  "Panaderia y Tortilleria"),
    ("embutidos",                "Embutidos"),
    ("mascotas",                 "Mascotas"),
    ("frutas-y-verduras",        "Frutas y Verduras"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}


async def get_categoria_tree(session, dept_slug):
    """Obtiene el arbol de categorias via VTEX catalog API."""
    url = f"{URL_BASE}/api/catalog_system/pub/category/tree/3"
    try:
        async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as r:
            if r.status == 200:
                data = await r.json()
                return data
    except Exception as e:
        print(f"  Error API tree: {e}")
    return []


async def get_subcats_de_categoria(session, dept_slug):
    """Usa la API de VTEX para buscar subcategorias."""
    urls_con_prods = []

    # Primero intentar obtener el arbol completo
    url_tree = f"{URL_BASE}/api/catalog_system/pub/category/tree/3"
    try:
        async with session.get(url_tree, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as r:
            if r.status == 200:
                tree = await r.json()
                # Buscar la categoria que matchea el slug
                for cat in tree:
                    cat_url = cat.get('url', '').lower()
                    if dept_slug in cat_url or dept_slug.replace('-', '') in cat_url.replace('-', ''):
                        cat_id = cat.get('id')
                        subcats = cat.get('children', [])
                        print(f"  Encontrada en arbol: id={cat_id}, {len(subcats)} subcats")

                        if subcats:
                            for sub in subcats:
                                sub_url = sub.get('url', '')
                                # Convertir URL absoluta a path relativo del sitio
                                if sub_url:
                                    path = sub_url.split('.com.br')[-1].split('.cr')[-1]
                                    full_url = f"{URL_BASE}{path}"
                                    urls_con_prods.append(full_url)
                                    # Sub-subcategorias
                                    for subsub in sub.get('children', []):
                                        subsub_url = subsub.get('url', '')
                                        if subsub_url:
                                            path2 = subsub_url.split('.com.br')[-1].split('.cr')[-1]
                                            full_url2 = f"{URL_BASE}{path2}"
                                            urls_con_prods.append(full_url2)
                        else:
                            # Sin subcategorias - usar la categoria directamente
                            urls_con_prods.append(f"{URL_BASE}/{dept_slug}")
                        return urls_con_prods
    except Exception as e:
        print(f"  Error tree API: {e}")

    # Fallback: usar busqueda por categoria con paginacion
    # VTEX permite buscar productos por departamento
    url_search = f"{URL_BASE}/api/catalog_system/pub/products/search/{dept_slug}?O=OrderByReleaseDateDESC&_from=0&_to=0"
    try:
        async with session.get(url_search, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=15)) as r:
            if r.status == 200:
                # Si responde, la categoria existe - usarla directamente
                urls_con_prods.append(f"{URL_BASE}/{dept_slug}")
    except Exception:
        pass

    return urls_con_prods


async def contar_productos_api(session, path):
    """Cuenta productos en una categoria via VTEX search API."""
    # Quitar el URL_BASE del path
    slug = path.replace(URL_BASE, '').strip('/')
    url = f"{URL_BASE}/api/catalog_system/pub/products/search/{slug}?_from=0&_to=0"
    try:
        async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=10)) as r:
            if r.status == 200:
                # VTEX retorna el total en el header
                total = r.headers.get('resources', '0/0').split('/')[-1]
                try:
                    return int(total)
                except Exception:
                    data = await r.json()
                    return len(data)
    except Exception:
        pass
    return -1


async def main():
    print(f"\nMasxMenos URL Collector (VTEX API)")
    print(f"Inicio: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{'='*60}\n")

    todas_urls = []

    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:

        # Intentar obtener el arbol completo una sola vez
        print("  Obteniendo arbol de categorias VTEX...")
        url_tree = f"{URL_BASE}/api/catalog_system/pub/category/tree/3"
        tree = []
        try:
            async with session.get(url_tree, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=20)) as r:
                print(f"  Status: {r.status}")
                if r.status == 200:
                    tree = await r.json()
                    print(f"  {len(tree)} categorias en el arbol")
                else:
                    text = await r.text()
                    print(f"  Respuesta: {text[:200]}")
        except Exception as e:
            print(f"  Error: {e}")

        if tree:
            # Procesar el arbol
            for cat in tree:
                nombre = cat.get('name', '')
                cat_id = cat.get('id', '')
                subcats = cat.get('children', [])
                print(f"\n  [{nombre}] id={cat_id}, {len(subcats)} subcats")

                if not subcats:
                    cat_url = cat.get('url', '').split('/')[-1]
                    todas_urls.append((f"{URL_BASE}/{cat_url}", nombre))
                    continue

                for sub in subcats:
                    sub_nombre = sub.get('name', '')
                    sub_url_raw = sub.get('url', '')
                    subsubcats = sub.get('children', [])

                    if not subsubcats:
                        # Convertir URL a formato masxmenos.cr
                        if sub_url_raw:
                            slug = sub_url_raw.rstrip('/').split('/')[-1]
                            parent = sub_url_raw.rstrip('/').split('/')[-2]
                            full = f"{URL_BASE}/{parent}/{slug}"
                            print(f"    -> {sub_nombre}: {full}")
                            todas_urls.append((full, nombre))
                    else:
                        for subsub in subsubcats:
                            ss_nombre = subsub.get('name', '')
                            ss_url_raw = subsub.get('url', '')
                            if ss_url_raw:
                                parts = ss_url_raw.rstrip('/').split('/')
                                slug = '/'.join(parts[-2:]) if len(parts) >= 2 else parts[-1]
                                full = f"{URL_BASE}/{slug}"
                                print(f"    -> {ss_nombre}: {full}")
                                todas_urls.append((full, nombre))

        else:
            # VTEX API no disponible - usar categorias directas
            print("\n  API no disponible - usando categorias principales directamente")
            for slug, nombre in CATEGORIAS:
                url = f"{URL_BASE}/{slug}"
                todas_urls.append((url, nombre))
                print(f"  [{nombre}]: {url}")

    # Guardar
    with open("masxmenos_urls.txt", "w", encoding="utf-8") as f:
        f.write(f"# MasxMenos URLs - {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        f.write(f"# Total: {len(todas_urls)} URLs\n\n")
        cat_actual = ""
        for url, cat in todas_urls:
            if cat != cat_actual:
                f.write(f"\n# {cat}\n")
                cat_actual = cat
            f.write(f"{url}\n")

    print(f"\n{'='*60}")
    print(f"Total URLs: {len(todas_urls)}")
    print(f"Guardado en: masxmenos_urls.txt")
    print(f"Fin: {datetime.now().strftime('%H:%M:%S')}\n")


if __name__ == "__main__":
    asyncio.run(main())
