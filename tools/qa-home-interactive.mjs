import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.argv[2] ?? "http://127.0.0.1:3017";
const dir = "docs/home-interativa/qa";
await mkdir(dir, { recursive: true });
const report = { base, checks: [], errors: [], shots: [] };
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.route("https://collector.guardelio.com.br/**", (r) =>
    r.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.goto(base, { timeout: 60000 });
  await page
    .getByText("CENA 3D INTERATIVA", { exact: true })
    .waitFor({ timeout: 60000 });
  assert.equal(await page.locator(".hx-scene canvas").count(), 1);
  await page
    .getByRole("button", { name: "03 Jogos interativos" })
    .click();
  await page.getByRole("link", { name: "Experimentar o desafio" }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "03 Jogos interativos" })
      .getAttribute("aria-pressed"),
    "true",
  );
  report.checks.push(
    "WebGL inicializa; estações mudam câmera, texto e destino",
  );
  await page.getByRole("button", { name: "Adicionar Bowl da estação" }).click();
  await page.getByRole("button", { name: "Simular pedido" }).click();
  assert.match(await page.locator(".hx-demo-receipt").innerText(), /38,00/);
  await page
    .getByRole("button", { name: "Loja", exact: false })
    .filter({ hasText: "Loja" })
    .click();
  assert.match(await page.locator(".hx-product header").innerText(), /FORMA/);
  assert.equal(
    await page.getByRole("button", { name: "Simular pedido" }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Editorial", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar Luminária Arco" }).click();
  await page.getByRole("button", { name: "Simular pedido" }).click();
  assert.match(await page.locator(".hx-demo-receipt").innerText(), /289,00/);
  await page.getByRole("button", { name: "Serviço", exact: false }).click();
  await page
    .getByRole("button", { name: "Escolher Sessão individual" })
    .click();
  await page.locator(".hx-demo-checkout select").selectOption("15:30");
  await page.getByRole("button", { name: "Simular reserva" }).click();
  assert.match(await page.locator(".hx-demo-receipt").innerText(), /15:30/);
  const brief = await page
    .getByRole("link", { name: "Quero um projeto assim" })
    .getAttribute("href");
  await page.goto(base + brief);
  assert.match(
    await page.locator("textarea[name=ideia]").inputValue(),
    /serviço.*editorial/,
  );
  report.checks.push(
    "Três negócios, troca de identidade, carrinho, reserva e briefing preservado",
  );
  await page.goto(base + "/#desafio-morvelio");
  await page.getByRole("button", { name: "Iniciar expedição" }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const time = await page.locator(".hx-game-hud strong").innerText();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator(".hx-game-hud strong").innerText(), time);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const canvas = page.locator(".hx-game canvas");
  const box = await canvas.boundingBox();
  const tap = async (x, y) =>
    page.mouse.click(
      box.x + (x / 480) * box.width,
      box.y + (y / 320) * box.height,
    );
  await tap(275, 145);
  await page.waitForTimeout(1950);
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Atacar", exact: true }).click();
    await page.waitForTimeout(600);
  }
  await tap(275, 145);
  await page.waitForTimeout(200);
  assert.match(
    await page.locator(".hx-game-status").innerText(),
    /Fragmento coletado/,
  );
  await tap(425, 65);
  await page.waitForTimeout(2000);
  assert.match(
    await page.locator(".hx-game-status").innerText(),
    /Você voltou ao refúgio/,
  );
  report.checks.push(
    "Expedição completa por controles reais: pausa, combate, coleta e vitória",
  );
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map(async (i) => {
          i.loading = "eager";
          await i.decode().catch(() => {});
        }),
      );
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("main").count(), 1);
    // Force the lazy scene into view on narrow displays before capturing it.
    await page.locator(".hx-lab").scrollIntoViewIfNeeded();
    const activate = page.getByRole('button', {name:'Explorar em 3D'});
    if (await activate.isVisible()) await activate.click();
    await page.getByText("CENA 3D INTERATIVA", { exact: true }).waitFor();
    await page.evaluate(() => scrollTo(0, 0));
    const shot = `${dir}/home-${width}.png`;
    await page.screenshot({ path: shot, fullPage: true, timeout: 30000 });
    report.shots.push(shot);
    await page.getByRole("button", { name: "Celular", exact: true }).click();
    assert.ok(await page.locator(".hx-product.phone").count());
    await page
      .locator(".hx-config")
      .screenshot({ path: `${dir}/config-${width}.png` });
    console.log(`Layout ${width} passed`);
  }
  report.checks.push(
    "360/390/768/1440 px, prévia celular, uma região main e um título h1",
  );
  const reduced = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const rp = await reduced.newPage();
  await rp.goto(base);
  assert.equal(await rp.locator("html").getAttribute("data-motion"), "off");
  await reduced.close();
  const fallback = await browser.newContext({ javaScriptEnabled: false });
  const fp = await fallback.newPage();
  await fp.goto(base);
  assert.ok(
    await fp.getByRole("link", { name: "Vamos criar seu projeto" }).count(),
  );
  assert.equal(await fp.locator("h1").count(), 1);
  await fallback.close();
  report.checks.push(
    "Movimento reduzido respeitado; conteúdo e contato disponíveis sem JavaScript",
  );
  const unavailable = await browser.newContext();
  await unavailable.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.call(this, type, ...args);
    };
  });
  const up = await unavailable.newPage();
  await up.goto(base);
  await up.getByText("EXPLORE O LABORATÓRIO", { exact: true }).waitFor();
  await up.getByRole("button", { name: "02 Produtos que funcionam" }).click();
  await up.getByRole("link", { name: "Experimentar o configurador" }).waitFor();
  await unavailable.close();
  report.checks.push(
    "Sem WebGL: imagem alternativa, estações e links continuam funcionando",
  );
  assert.deepEqual(report.errors, []);
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
