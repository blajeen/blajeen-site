import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const browser=await chromium.launch();
try {
const page=await browser.newPage({viewport:{width:1000,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.argv[2] ?? 'http://127.0.0.1:3018') + '/#desafio-morvelio');
await page.getByRole('button',{name:'Iniciar expedição'}).click();
assert.equal(await page.locator('.hx-game-hud strong').innerText(),'15s');
await page.getByRole('button',{name:'Pausar',exact:true}).click();
await page.getByRole('button',{name:'Atacar',exact:true}).click();
await page.getByRole('button',{name:'Continuar',exact:true}).click();
const bounds=await page.locator('.hx-game canvas').boundingBox();
const tap=(x,y)=>page.mouse.click(bounds.x+x/480*bounds.width,bounds.y+y/320*bounds.height);
await tap(275,145);await page.waitForTimeout(1950);
for(let i=0;i<6;i++){await page.getByRole('button',{name:'Atacar',exact:true}).click();await page.waitForTimeout(600);}
await tap(275,145);await page.waitForTimeout(250);
assert.match(await page.locator('.hx-game-status').innerText(),/Fragmento coletado/);
await tap(425,65);await page.waitForTimeout(1900);
assert.match(await page.locator('.hx-game-status').innerText(),/voltou ao refúgio/);
assert.deepEqual(errors,[]);
// Isolated render fixture using the actual renderer and combat state, frozen mid-breath.
const core=ts.transpileModule(await readFile('src/components/home/arena.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const art=ts.transpileModule(await readFile('src/components/home/arena-art.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
await page.setContent('<body style="margin:0;background:#13221d"><canvas width="960" height="640" style="width:960px;height:640px"></canvas></body>');
await page.addScriptTag({content:`(()=>{const model={};(function(exports){${core}})(model);const art={};(function(exports,require){${art}})(art,()=>model);const c=document.querySelector('canvas').getContext('2d');c.scale(2,2);const s=model.freshArena();s.phase=1.8;s.status='playing';art.drawCourtyard(c);art.drawDragon(c,s);art.drawKnight(c,s);})()`});
await page.locator('canvas').screenshot({path:'docs/polimento-visual/qa/dragon-breath-fixture.png'});
console.log('15s, pause, six-hit boss, fragment, victory and breath rendering passed.');
}finally{await browser.close();}
