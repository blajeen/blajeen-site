import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
// Pass the installed Lighthouse core entrypoint explicitly; no production dependency needed.
const { default: lighthouse } = await import(pathToFileURL(process.argv[2]).href);
const browser = await chromium.launch({args:['--remote-debugging-port=9228','--enable-unsafe-swiftshader']});
try {
 const result=await lighthouse(process.argv[3]??'http://127.0.0.1:3018/',{port:9228,hostname:'127.0.0.1',output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],blockedUrlPatterns:['*collector.guardelio.com.br*']});
 await writeFile('docs/home-interativa/qa/lighthouse-mobile.json',result.report);
 console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score])),error:result.lhr.runtimeError,warnings:result.lhr.runWarnings}));
} finally {await browser.close();}
