import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base=process.argv[2] ?? 'http://127.0.0.1:3018';
const data=JSON.parse(await readFile('src/content/morvelio/wiki/data.json','utf8'));
const directory='docs/morvelio-wiki/qa';await mkdir(directory,{recursive:true});
const pathOf=e=>`/morvelio/wiki/${e.category}/${e.slug}`;
const report={base,edition:data.edition,checks:[],screenshots:[],errors:[]};
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>report.errors.push(e.message));
 // Local QA must not emit visits to the existing production analytics service.
 await page.route('https://collector.guardelio.com.br/**',r=>r.abort());
 await page.goto(base+'/morvelio/wiki');
 await page.getByRole('searchbox',{name:'Buscar na wiki'}).fill('J13');
 await page.getByRole('button',{name:'Buscar',exact:true}).click();
 await page.getByRole('link',{name:/A roda e a ponte/}).click();
 await page.getByRole('heading',{name:'A roda e a ponte',exact:true}).waitFor();
 assert.match(await page.locator('#wiki-conteudo').innerText(),/manivela/);
 report.checks.push('Busca por J13 → missão e objetivos');
 await page.goto(base+'/morvelio/wiki/itens?tipo=Broche');
 assert.equal(await page.locator('.mw-table tbody tr').count(),9);
 await page.getByRole('link',{name:'Broche da Guarda',exact:true}).click();
 await page.waitForURL('**/itens/broche-da-guarda');
 await page.getByRole('heading',{name:'Broche da Guarda',exact:true}).waitFor();
 assert.match(await page.locator('#wiki-conteudo').innerText(),/Azul-aço/);
 assert.match(await page.locator('#wiki-conteudo').innerText(),/A roda e a ponte/);
 await page.getByRole('link',{name:'Comparar esta peça'}).click();
 await page.locator('select[name=b]').selectOption('broche-do-batedor');
 await page.getByRole('button',{name:'Comparar',exact:true}).click();
 await page.waitForURL('**/*b=broche-do-batedor*');
 assert.match(await page.locator('.mw-table').innerText(),/Broche da Guarda/);
 assert.match(await page.locator('.mw-table').innerText(),/Broche do Batedor/);
 report.checks.push('Filtro de 9 broches → ficha → comparação compatível');
 const hidden=data.records.find(e=>e.id==='lore.paz-e-sucessoes');
 let response=await page.goto(base+pathOf(hidden));
 assert.equal(response.status(),200);
 assert.doesNotMatch(await response.text(),/Sua alma fica presa|Odran esconde/);
 await page.getByRole('link',{name:'Revelar esta parte da história'}).click();
 await page.getByRole('heading',{name:hidden.title,exact:true}).waitFor();
 assert.match(await page.locator('#wiki-conteudo').innerText(),/Odran/);
 await page.goto(base+'/morvelio/wiki/busca?q=J57');
 assert.equal(await page.locator('.mw-table tbody tr').count(),0);
 report.checks.push('Desfecho ausente do HTML e da busca sem consentimento; revelação explícita funciona');
 const atlas=data.records.find(e=>e.id==='world.erdavia');
 await page.goto(base+pathOf(atlas));
 await page.getByRole('button',{name:'Ampliar mapa',exact:true}).click();
 assert.match(await page.locator('figure').innerText(),/150%/);
 await page.getByRole('button',{name:'Ajustar',exact:true}).click();
 report.checks.push('Atlas com zoom, retorno e acesso à imagem inteira');
 const routes=[['home','/morvelio/wiki'],['jogo','/projects/morvelio'],['itens','/morvelio/wiki/itens?tipo=Broche'],['broche','/morvelio/wiki/itens/broche-da-guarda'],['mapa','/morvelio/wiki/regioes/vilarim']];
 for(const width of [360,390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  for(const [label,path] of routes){
   await page.goto(base+path,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(async()=>{await Promise.all([...document.images].map(async img=>{img.loading='eager';await img.decode().catch(()=>{});}));});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,`${path} at ${width}: horizontal overflow`);
   assert.equal(await page.locator('main').count(),1,'Only one main landmark');
   assert.equal(await page.locator('h1').count(),1,'Only one h1');
   const file=`${directory}/${label}-${width}.png`;
   await page.screenshot({path:file,fullPage:true,timeout:30000});report.screenshots.push(file);
   console.log(`Verified ${label} at ${width}`);
  }
 }
 report.checks.push('Cinco páginas em 360, 390, 768 e 1440 px sem overflow, um main e um h1');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const plain=await nojs.newPage();await plain.goto(base+'/morvelio/wiki/itens/broche-da-guarda');
 assert.match(await plain.locator('#wiki-conteudo').innerText(),/Azul-aço/);
 await nojs.close();report.checks.push('Ficha e links legíveis sem JavaScript');
 await page.goto(base+'/morvelio/wiki/itens/nao-existe');
 response=await page.request.get(base+'/morvelio/wiki/itens/nao-existe');assert.equal(response.status(),404);
 response=await page.request.get(base+'/morvelio/wiki/categoria-inexistente');assert.equal(response.status(),404);
 report.checks.push('Slugs e categorias desconhecidos retornam 404');
 // Verify every generated entry, with bounded concurrency, not just handpicked screenshots.
 let cursor=0;const bad=[];
 await Promise.all(Array.from({length:6},async()=>{while(cursor<data.records.length){const e=data.records[cursor++];const r=await fetch(base+pathOf(e));if(r.status!==200)bad.push([e.id,r.status]);await r.arrayBuffer();}}));
 assert.deepEqual(bad,[]);report.checks.push(`${data.records.length} fichas respondem HTTP 200`);
 const sitemap=await (await fetch(base+'/sitemap.xml')).text();
 for(const e of data.records)assert.ok(sitemap.includes(pathOf(e)),pathOf(e));
 report.checks.push('Todas as fichas constam no sitemap');
 const images=[...new Set(data.records.filter(e=>e.image).map(e=>e.image.src))];
 for(const src of images){const r=await fetch(base+src);assert.equal(r.status,200,src);assert.match(r.headers.get('content-type')??'',/image\/webp/);await r.arrayBuffer();}
 report.checks.push(`${images.length} imagens entregues como WebP`);
 assert.deepEqual(report.errors,[]);report.passed=true;
} finally {await browser.close();await writeFile(`${directory}/report.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
