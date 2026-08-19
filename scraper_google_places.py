# UbiqoCR — Scraper de negocios con Google Places API (New)
# Uso: python scraper_google_places.py
# Output: negocios_cr_FECHA.json

import urllib.request
import urllib.parse
import json
import time
import ssl
from datetime import datetime

API_KEY = "AIzaSyCDqxvYCS8VnACMjIMmlyd3kraYfeArhK8"
CTX = ssl._create_unverified_context()

CATEGORIAS = [
    ("supermarket",        "Supermercado"),
    ("hardware_store",     "Ferretería"),
    ("pharmacy",           "Farmacia"),
    ("grocery_store",      "Mini Súper / Pulpería"),
    ("home_goods_store",   "Hogar y Decoración"),
    ("electronics_store",  "Electrónica"),
    ("clothing_store",     "Ropa y Calzado"),
    ("furniture_store",    "Mueblería"),
    ("bakery",             "Panadería"),
    ("pet_store",          "Mascotas"),
    ("convenience_store",  "Tienda de Conveniencia"),
    ("department_store",   "Tienda por Departamentos"),
]

CIUDADES = [
    ("San José",       9.9281, -84.0907),
    ("Alajuela",       10.0162, -84.2144),
    ("Cartago",        9.8641, -83.9197),
    ("Heredia",        10.0003, -84.1170),
    ("Liberia",        10.6339, -85.4408),
    ("Puntarenas",     9.9767, -84.8300),
    ("Limón",          9.9923, -83.0367),
    ("San Carlos",     10.3269, -84.5143),
    ("Pérez Zeledón",  9.3647, -83.6614),
    ("Nicoya",         10.1488, -85.4520),
    ("Quepos",         9.4316, -84.1627),
    ("Palmares",       10.0583, -84.4325),
    ("Grecia",         10.0694, -84.3178),
    ("Turrialba",      9.9004, -83.6816),
    ("Desamparados",   9.8897, -84.0693),
    ("Curridabat",     9.9186, -84.0418),
    ("Escazú",         9.9185, -84.1416),
    ("Santa Ana",      9.9338, -84.1834),
]

def buscar_negocios_new(lat, lng, tipo, radio=5000):
    url = "https://places.googleapis.com/v1/places:searchNearby"
    body = json.dumps({
        "includedTypes": [tipo],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radio
            }
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.types"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=15) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"    Error: {e}")
        return {}

def main():
    print(f"\nUbiqoCR — Scraper Google Places API (New)")
    print(f"Inicio: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"Ciudades: {len(CIUDADES)} | Categorías: {len(CATEGORIAS)}")
    print("=" * 60)

    todos = {}

    for ciudad, lat, lng in CIUDADES:
        print(f"\n📍 {ciudad}")
        for tipo, nombre_cat in CATEGORIAS:
            print(f"  [{nombre_cat}]", end="", flush=True)

            data = buscar_negocios_new(lat, lng, tipo)
            places = data.get("places", [])
            nuevos = 0

            for place in places:
                pid = place.get("id")
                if not pid or pid in todos:
                    continue

                loc = place.get("location", {})
                nombre = place.get("displayName", {}).get("text", "")
                horario = ""
                if place.get("regularOpeningHours"):
                    periodos = place["regularOpeningHours"].get("weekdayDescriptions", [])
                    horario = " | ".join(periodos[:2]) if periodos else ""

                todos[pid] = {
                    "place_id":  pid,
                    "nombre":    nombre,
                    "direccion": place.get("formattedAddress", ""),
                    "categoria": nombre_cat,
                    "lat":       loc.get("latitude"),
                    "lng":       loc.get("longitude"),
                    "rating":    place.get("rating"),
                    "telefono":  place.get("nationalPhoneNumber", ""),
                    "web":       place.get("websiteUri", ""),
                    "horario":   horario,
                    "ciudad":    ciudad,
                    "tipos":     place.get("types", []),
                }
                nuevos += 1

            print(f" {nuevos} | total: {len(todos)}")
            time.sleep(0.3)

    lista = list(todos.values())
    nombre_f = f"negocios_cr_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    with open(nombre_f, "w", encoding="utf-8") as f:
        json.dump(lista, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"TOTAL negocios únicos: {len(lista)}")
    print(f"Guardado en: {nombre_f}")
    print(f"Fin: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
