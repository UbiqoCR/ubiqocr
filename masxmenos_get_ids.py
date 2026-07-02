# Obtiene todos los IDs de subcategorias de MasxMenos via VTEX API
# Uso: python masxmenos_get_ids.py
# Output: masxmenos_ids.txt

import urllib.request
import urllib.error
import ssl
import json
from datetime import datetime

# Ignorar verificacion SSL (certificados de Windows)
ssl._create_default_https_context = ssl._create_unverified_context

URL = "https://www.masxmenos.cr/api/catalog_system/pub/category/tree/5"

print("Obteniendo arbol de categorias...")
req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as r:
    tree = json.loads(r.read())

print(f"Total categorias principales: {len(tree)}")

# Categorias de supermercado que nos interesan (excluir ropa, electronica, etc)
CATS_SUPERMERCADO = {
    "Jugos y Bebidas", "Cervezas, Vinos y Licores", "Carnes y Pescados",
    "Higiene y Belleza", "Bebes y Niños", "Alimentos Congelados", "Lácteos",
    "Abarrotes", "Limpieza", "Farmacia", "Frutas y Verduras",
    "Panadería y tortillería", "Mascota"
}

resultados = []

for cat in tree:
    nombre = cat.get('name', '')
    cat_id = cat.get('id', '')
    subcats = cat.get('children', [])

    # Solo categorias de supermercado
    if nombre not in CATS_SUPERMERCADO:
        continue

    print(f"\n[{nombre}] id={cat_id}")

    if not subcats:
        resultados.append((cat_id, nombre, nombre))
        print(f"  -> id={cat_id} (sin subcats)")
        continue

    for sub in subcats:
        sub_nombre = sub.get('name', '')
        sub_id = sub.get('id', '')
        subsubcats = sub.get('children', [])

        if not subsubcats:
            resultados.append((sub_id, sub_nombre, nombre))
            print(f"  [{sub_nombre}] id={sub_id}")
        else:
            for ss in subsubcats:
                ss_nombre = ss.get('name', '')
                ss_id = ss.get('id', '')
                resultados.append((ss_id, ss_nombre, nombre))
                print(f"    [{ss_nombre}] id={ss_id}")

# Guardar
with open("masxmenos_ids.txt", "w", encoding="utf-8") as f:
    f.write(f"# MasxMenos Category IDs - {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
    f.write(f"# Total: {len(resultados)} subcategorias\n\n")
    cat_actual = ""
    for cid, nombre, cat in resultados:
        if cat != cat_actual:
            f.write(f"\n# {cat}\n")
            cat_actual = cat
        f.write(f"{cid}\t{nombre}\t{cat}\n")

print(f"\nTotal: {len(resultados)} subcategorias")
print("Guardado en: masxmenos_ids.txt")
