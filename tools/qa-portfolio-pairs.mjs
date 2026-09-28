import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.argv[2]??'http://127.0.0.1:3017';
const browser=await chromium.launch();
const results=[];
await fs.mkdir('.codex-qa/portfolio',{recursive:true});
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const slug of ['dom-guima','spot-hotel','dona-lia','agro-weld','lina-art-pet']) {
   const response=await page.goto(`${base}/trabalhos/${slug}`);assert.equal(response.status(),200);
   if(slug!=='lina-art-pet') {
    const section=page.locator('section').filter({has:page.locator('#duas-experiencias')});
    await section.scrollIntoViewIfNeeded();
    await section.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    assert.equal(await section.getByText('01 / SITE PARA O CLIENTE',{exact:true}).count(),1);
    assert.equal(await section.getByText(slug==='agro-weld'?'02 / DEMONSTRATIVO DO PAINEL':'02 / PAINEL PARA A EQUIPE',{exact:true}).count(),1);
    await section.screenshot({path:`.codex-qa/portfolio/${slug}-${width}.png`});
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   results.push({slug,width,status:response.status()});
  }
  await page.goto(`${base}/trabalhos`);
  assert.equal(await page.getByText('SITE + PAINEL · VER AS DUAS EXPERIÊNCIAS',{exact:true}).count(),3);
  assert.equal(await page.getByText('SITE + PROPOSTA DO PAINEL',{exact:true}).count(),1);
  assert.deepEqual(errors,[]);
  await page.close();
 }
 await fs.writeFile('.codex-qa/portfolio/results.json',JSON.stringify(results,null,2));
 console.log('PASS: five projects, mobile and desktop, pair labels, image decode, overflow and runtime errors.');
} finally {await browser.close();}
