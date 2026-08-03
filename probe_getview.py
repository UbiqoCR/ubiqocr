import requests, json

url = "https://automercado.azure-api.net/prod-front/collectibles/getView"

headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-CR,es;q=0.9,en-US;q=0.8,en;q=0.7",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVTVUFSSU8gSU5WSVRBRE8iLCJzdWIiOiJjNjY5MDc0MS01Mjk2LWViMTEtYjFhYy0wMDBkM2EzNzY4MGIiLCJlbWFpbCI6Imludml0YWRvQGF1dG9tZXJjYWRvLmJpeiIsImlhdCI6MTYyNjM1ODQ3OX0.sR8zc4wIdfITf8WvKR26wPz8M79Xn_I4UKd-VXJXD9o",
    "Origin": "https://automercado.cr",
    "Platform": "WEB",
    "Referer": "https://automercado.cr/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
}

resp = requests.get(url, headers=headers, timeout=20)
print("STATUS:", resp.status_code)
print("HEADERS:", dict(resp.headers))

data = resp.json()

# Guardar todo para inspeccionar
with open("getview_raw.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Intentar mapear la estructura de alto nivel
def summarize(obj, path="root", depth=0, max_depth=3):
    if depth > max_depth:
        return
    if isinstance(obj, dict):
        print("  "*depth, f"{path} (dict, keys={list(obj.keys())[:15]})")
        for k, v in list(obj.items())[:8]:
            summarize(v, f"{path}.{k}", depth+1, max_depth)
    elif isinstance(obj, list):
        print("  "*depth, f"{path} (list, len={len(obj)})")
        if obj:
            summarize(obj[0], f"{path}[0]", depth+1, max_depth)

summarize(data)
