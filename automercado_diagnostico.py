import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1440, "height": 900},
        )
        page = await context.new_page()

        print("Cargando AutoMercado...")
        await page.goto("https://automercado.cr/categorias/frutas-y-verduras",
                        wait_until="domcontentloaded", timeout=60000)

        # Esperar diferentes tiempos y contar productos
        for secs in [3, 6, 10, 15]:
            await asyncio.sleep(3)
            n = await page.evaluate("() => document.querySelectorAll('.card-product').length")
            n2 = await page.evaluate("() => document.querySelectorAll('[class*=\"card\"]').length")
            n3 = await page.evaluate("() => document.querySelectorAll('[class*=\"product\"]').length")
            print(f"  t+{secs*3}s: .card-product={n} | *card*={n2} | *product*={n3}")

        # Ver que hay en el body
        print("\n--- Primeros 800 chars del body ---")
        body = await page.evaluate("() => document.body.innerHTML.substring(0, 800)")
        print(body)

        await browser.close()

asyncio.run(main())
