import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({headless:true, channel: 'msedge'});
const html = readFileSync('pickme/index.html','utf8');
const url = 'https://kitscript.com/pickme/';
async function pageFor(options={}) {
 const context = await browser.newContext(options);
 await context.route('**/*', route => {
  const requestUrl = route.request().url();
  if (route.request().isNavigationRequest() && requestUrl.startsWith(url)) return route.fulfill({body:html,contentType:'text/html'});
  if (requestUrl.startsWith(url+'images/thumbnails/')) return route.fulfill({path: fileURLToPath(new URL('../pickme/'+requestUrl.slice(url.length), import.meta.url)),contentType:'image/webp'});
  return route.abort();
 });
 const page = await context.newPage();
 return {context,page};
}
try {
 const {context,page} = await pageFor({javaScriptEnabled:false});
 await page.goto(url);
 assert.equal(await page.locator('#pick-grid a[href]').count(),43);
 assert.equal(await page.locator('#pick-grid img[width="256"]').count(),43);
 assert.equal(await page.locator('#stop-btn').isVisible(),false);
 await context.close();
 const live=await pageFor();
 const errors=[];live.page.on('pageerror', e=>errors.push(e.message));
 await live.page.goto(url);
 await live.page.locator('#stop-btn').click();
 assert.equal(await live.page.locator('#status').innerText(),'MANUAL MODE');
 assert.equal(await live.page.locator('#pick-grid a').count(),43);
 await live.page.locator('#pick-grid a').last().scrollIntoViewIfNeeded();
 await live.page.waitForFunction(()=>Array.from(document.querySelectorAll('#pick-grid img')).every(img=>img.complete && img.naturalWidth===256));
 await live.page.locator('#pick-grid a').first().focus();
 await live.page.keyboard.press('Enter');
 assert.equal(await live.page.locator('#pick-grid .winner').count(),1);
 assert.equal(await live.page.locator('#stop-btn').isVisible(),false);
 assert.deepEqual(errors,[]);
 await live.context.close();
 for (const width of [360,1280]) {
  const test=await pageFor({viewport:{width,height:900}});
  await test.page.goto(url+'?theme=space');
  await test.page.locator('#stop-btn').click();
  assert.equal(await test.page.locator('#pick-grid a').count(),5);
  assert.equal(await test.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await test.context.close();
 }
 const storage=await pageFor();
 await storage.context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}})});
 await storage.page.goto(url+'?theme=unknown');
 await storage.page.locator('#stop-btn').click();
 assert.equal(await storage.page.locator('#pick-grid a').count(),43);
 await storage.context.close();
 console.log('PASS: 43 links without JavaScript, keyboard selection, STOP, theme filter, invalid theme, blocked storage, mobile/desktop overflow.');
} finally { await browser.close(); }
