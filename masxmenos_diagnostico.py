# Diagnostico de estructura de MasxMenos
# Corre esto primero para ver como están los links y selectores
# Uso: python masxmenos_diagnostico.py

import asyncio
from playwright.async_api import async_playwright

URL = "https://www.masxmenos.cr/abarrotes"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1440, "height": 900},
        )
        page = await context.new_page()

        print(f"Cargando {URL}...")
        await page.goto(URL, wait_until="networkidle", timeout=35000)
        await asyncio.sleep(3)

        # Cerrar popup si existe
        for sel in ['button[class*="close"]', 'button[aria-label*="close"]']:
            try:
                el = await page.query_selector(sel)
                if el:
                    await el.click()
                    await asyncio.sleep(0.5)
                    break
            except Exception:
                pass

        print("\n=== TODOS LOS LINKS EN LA PAGINA (primeros 40) ===")
        links = await page.evaluate("""() => {
            const base = 'https://www.masxmenos.cr';
            const all = Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(h => h.startsWith(base))
                .filter(h => !h.endsWith('/p') && !h.includes('/p?'));
            return [...new Set(all)].slice(0, 40);
        }""")
        for l in links:
            print(f"  {l}")

        print("\n=== CONTEO DE PRODUCTOS ===")
        selectores = [
            '[class*="productName"]',
            '[class*="product-name"]',
            '[class*="ProductCard"]',
            'h3[class*="name"]',
            '.vtex-product-summary',
            '[data-testid*="product"]',
        ]
        for sel in selectores:
            n = await page.evaluate(f'() => document.querySelectorAll("{sel}").length')
            if n > 0:
                print(f"  {sel}: {n} elementos")

        print("\n=== MUESTRA DE PRIMER PRODUCTO ===")
        muestra = await page.evaluate("""() => {
            const selectors = [
                '[class*="productName"]',
                '[class*="product-name"]',
                'h3', 'h2'
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el && el.innerText.trim().length > 3) {
                    return {
                        selector: sel,
                        text: el.innerText.trim().substring(0, 80),
                        parentClass: el.parentElement ? el.parentElement.className.substring(0, 100) : ''
                    };
                }
            }
            return null;
        }""")
        if muestra:
            print(f"  Selector: {muestra['selector']}")
            print(f"  Texto: {muestra['text']}")
            print(f"  Parent class: {muestra['parentClass']}")

        print("\n=== PRIMER PRECIO ENCONTRADO ===")
        precio = await page.evaluate("""() => {
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.children.length > 0) continue;
                const t = el.innerText ? el.innerText.trim() : '';
                if (t.includes('\u20a1') && t.length < 15) {
                    return {
                        text: t,
                        className: el.className.substring(0, 100)
                    };
                }
            }
            return null;
        }""")
        if precio:
            print(f"  Texto: {precio['text']}")
            print(f"  Clase: {precio['className']}")

        await browser.close()

asyncio.run(main())
