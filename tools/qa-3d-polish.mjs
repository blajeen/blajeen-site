import { chromium } from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
const browser = await chromium.launch({args:['--enable-unsafe-swiftshader']});
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2] ?? 'http://127.0.0.1:3018');
 await page.getByText('CENA 3D INTERATIVA',{exact:true}).waitFor({timeout:60000});
 await page.waitForTimeout(2000);
 await page.locator('.hx-lab').screenshot({path:'docs/polimento-visual/qa/3d-after.png'});
 const poster=await page.locator('.hx-scene').screenshot();
 await sharp(poster).webp({quality:88}).toFile('public/brand/lab-3d-poster.webp');
 for(const name of ['02 Produtos que funcionam','03 Jogos interativos']) {
  const button=page.getByRole('button',{name});await button.click();
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  await page.waitForTimeout(1200);
  await page.locator('.hx-lab').screenshot({path:`docs/polimento-visual/qa/3d-${name.slice(0,2)}.png`});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 const canvas=page.locator('.hx-scene canvas');
 const bounds=await canvas.boundingBox();
 assert.ok(bounds);
 await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 await page.mouse.down();
 await page.mouse.move(bounds.x+bounds.width/2+70,bounds.y+bounds.height/2,{steps:8});
 await page.mouse.up();
 assert.equal(await page.getByRole('button',{name:'03 Jogos interativos'}).getAttribute('aria-pressed'),'true');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:844});
 await page.reload();
 await page.getByRole('button',{name:'Explorar em 3D'}).click();
 await page.getByText('CENA 3D INTERATIVA',{exact:true}).waitFor({timeout:60000});
 await page.waitForTimeout(1500);
 await page.locator('.hx-lab').screenshot({path:'docs/polimento-visual/qa/3d-mobile.png'});
 assert.deepEqual(errors,[]);console.log('3D: desktop, three stations, mobile activation and console passed. Poster updated.');
} finally {await browser.close();}
