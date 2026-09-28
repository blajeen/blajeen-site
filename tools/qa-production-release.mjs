import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base='https://www.blajeen.com.br';
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
const report={base,pages:[],errors:[],checkedAt:new Date().toISOString()};
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>report.errors.push(e.message));
 for(const route of ['/','/morvelio/wiki','/projects/morvelio','/projects/docalio','/projects/mazelio','/trabalhos','/contact']) {
  const response=await page.goto(base+route);assert.equal(response.status(),200);
  assert.equal(await page.locator('h1').count(),1);
  if(route==='/') await page.getByRole('button',{name:'03 Jogos interativos'}).waitFor();
  report.pages.push({route,status:response.status(),url:page.url()});
 }
 for(const asset of ['/projects/docalio/docalio-icon-mochila-v2.webp','/projects/mazelio/mazelio-icon-rei-v2.webp','/brand/lab-3d-poster.webp'])assert.equal((await page.request.get(base+asset)).status(),200);
 await page.goto(base);await page.getByRole('button',{name:'Explorar em 3D'}).click();
 await page.getByText('CENA 3D INTERATIVA',{exact:true}).waitFor({timeout:60000});
 assert.equal(await page.locator('.hx-scene canvas').count(),1);
 await page.screenshot({path:'docs/polimento-visual/qa/production-mobile.png'});
 assert.deepEqual(report.errors,[]);
 await writeFile('docs/polimento-visual/qa/production-report.json',JSON.stringify(report,null,2));
 console.log('Production: seven routes, icons and WebGL passed.');
}finally{await browser.close();}
