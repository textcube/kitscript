import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  await page.waitForTimeout(100);
  const initial=await page.evaluate(()=>document.documentElement.style.getPropertyValue('--game-width'));
  await page.evaluate(()=>{
    game.wave=5;game.updateUI();game.spawnBoss();game.draw();
    document.getElementById('stage-notice').textContent='Boss appears · Red Sand Marshal';
  });
  await page.waitForTimeout(500);
  await page.locator('#language-btn').click();
  const samples=await page.evaluate(async()=>{
    const values=[];
    for(let i=0;i<50;i++){
      values.push(document.documentElement.style.getPropertyValue('--game-width'));
      if(i===10){game.enemies=[];game.draw();document.getElementById('stage-notice').textContent='';}
      if(i===20){game.bossSpawned=false;game.spawnBoss();game.draw();}
      if(i===30)document.getElementById('language-btn').click();
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    return values;
  });
  assert.ok(samples.length>=40);
  assert.deepEqual(new Set(samples),new Set([initial]),'arena width must remain fixed while boss/status rows and locale change');
  await page.setViewportSize({width:900,height:700});
  await page.waitForTimeout(100);
  const afterResize=await page.evaluate(()=>document.documentElement.style.getPropertyValue('--game-width'));
  assert.notEqual(afterResize,initial,'viewport changes should recalculate the fit');
  assert.deepEqual(errors,[]);
  console.log('PASS: arena width stays stable through five seconds of boss/status/locale changes and recalculates on viewport resize.');
} finally {await browser.close();}
