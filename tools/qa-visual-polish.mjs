import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.argv[2] ?? "http://127.0.0.1:3018";
const out = "docs/polimento-visual/qa";
await mkdir(out, { recursive: true });
const report = { base, checks: [], errors: [], screenshots: [] };
const routes = [
  ["home", "/"],
  ["trabalhos", "/trabalhos"],
  ["case", "/trabalhos/dom-guima"],
  ["loja", "/loja"],
  ["software", "/loja/barbelio"],
  ["produtos", "/produtos"],
  ["produto", "/produtos/clearlio"],
  ["morvelio", "/projects/morvelio"],
  ["wiki", "/morvelio/wiki"],
  ["contato", "/contact"],
  ["briefing", "/crie-seu-projeto"],
  ["estudio", "/about"],
  ["novidades", "/novidades"],
  ["privacidade", "/privacy"],
];
const b = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
try {
  const p = await b.newPage();
  await p.route("https://collector.guardelio.com.br/**", (r) => r.abort());
  p.on("pageerror", (e) => report.errors.push(e.message));
  for (const width of [390, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const [name, path] of routes) {
      const response = await p.goto(base + path, { timeout: 30000 });
      assert.equal(response.status(), 200, path);
      await p.evaluate(() =>
        Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]),
      );
      await p.waitForFunction(
        () =>
          [...document.images]
            .filter((i) => {
              const r = i.getBoundingClientRect();
              return r.width > 0 && r.top < innerHeight && r.bottom > 0;
            })
            .every((i) => i.complete && i.naturalWidth > 0),
        {},
        { timeout: 10000 },
      );
      assert.equal(await p.locator("h1").count(), 1, path);
      assert.equal(await p.locator("main").count(), 1, path);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `overflow ${path} ${width}`,
      );
      if (width === 390)
        assert.ok(
          (await p
            .locator("main")
            .evaluate((e) => e.getBoundingClientRect().width)) > 380,
          `mobile width ${path}`,
        );
      const image = `${out}/${name}-${width}.png`;
      await p.screenshot({
        path: image,
        timeout: 20000,
        animations: "disabled",
      });
      report.screenshots.push(image);
      console.log(`${path} ${width}: OK`);
    }
  }
  report.checks.push(
    "14 rotas em 390 e 1440 px: HTTP 200, largura mobile completa, um h1/main e sem overflow",
  );
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(base + "/morvelio/wiki");
  const menu = p.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  const dialog = p.getByRole("dialog");
  await dialog.waitFor();
  assert.equal(await p.locator("main").getAttribute("inert"), "");
  assert.equal(
    await p.locator("body").getAttribute("data-scroll-locked"),
    "true",
  );
  assert.ok(await dialog.getByRole("link", { name: /Morvelio Wiki/ }).count());
  for (let i = 0; i < 7; i++) await p.keyboard.press("Tab");
  assert.equal(
    await p.evaluate(() => !!document.activeElement?.closest("[role=dialog]")),
    true,
  );
  await p.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await menu.evaluate((e) => document.activeElement === e), true);
  await menu.click();
  await p
    .getByRole("dialog")
    .getByRole("link", { name: /Morvelio Wiki/ })
    .click();
  await dialog.waitFor({ state: "hidden" });
  report.checks.push(
    "Menu mobile: abre, prende foco, bloqueia fundo, fecha por Escape, devolve foco e navega para wiki",
  );
  await p.locator("footer").scrollIntoViewIfNeeded();
  const legal = p
    .locator(".footer-group")
    .filter({ has: p.locator("summary", { hasText: "Legal" }) });
  assert.equal(await legal.getAttribute("open"), null);
  await legal.locator("summary").click();
  assert.notEqual(await legal.getAttribute("open"), null);
  assert.ok(
    await legal
      .getByRole("link", { name: "Privacidade", exact: true })
      .isVisible(),
  );
  report.checks.push(
    "Rodapé mobile: grupo Legal expande e preserva links públicos",
  );
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto(base + "/trabalhos/dom-guima");
  assert.ok(await p.locator(".screenshot-toolbar").count());
  const original = await p
    .getByRole("link", { name: "Abrir captura completa" })
    .getAttribute("href");
  assert.equal((await p.request.get(base + original)).status(), 200);
  report.checks.push(
    "Captura completa do case acessível; moldura compartilhada aplicada",
  );
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.goto(base);
  assert.equal(
    await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  assert.ok(
    await p
      .locator("header.site-header")
      .evaluate((e) =>
        [...e.querySelectorAll("a,button")]
          .filter((n) => n.getBoundingClientRect().width > 0)
          .every((n) => n.getBoundingClientRect().right <= innerWidth + 1),
      ),
  );
  report.checks.push("Cabeçalho desktop também cabe no limite de 1280 px");
  assert.deepEqual(report.errors, []);
  report.passed = true;
} finally {
  await b.close();
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
