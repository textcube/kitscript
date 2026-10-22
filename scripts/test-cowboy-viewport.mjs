import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
 for(const [width,height] of [[320,568],[375,667],[390,844],[768,600],[1100,850],[1440,900]]){
   await page.setViewportSize({width,height});
   for(const boss of [false,true]){
     await page.evaluate(boss=>{game.reset();if(boss){game.wave=5;game.spawnBoss();game.draw();}},boss);
     await page.waitForTimeout(180);
     const bounds=await page.evaluate(()=>{
       const dock=document.getElementById('weapon-dock').getBoundingClientRect();
       const controls=document.getElementById('top-bar').getBoundingClientRect();
       const field=document.querySelector('.battlefield').getBoundingClientRect();
       return {bottom:dock.bottom,inside:controls.top>=field.top&&controls.bottom<field.bottom,width:document.documentElement.scrollWidth,gameWidth:document.documentElement.style.getPropertyValue('--game-width'),field:field.toJSON(),hud:document.getElementById('hud-overlay').offsetHeight};
     });
     assert.ok(bounds.bottom<=height,`${width}×${height}: ${JSON.stringify(bounds)}, boss=${boss}`);
     assert.ok(bounds.inside);assert.ok(bounds.width<=width);
   }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: controls inside battlefield and weapon dock visible without scrolling at 6 viewport sizes, including boss rows.');
}finally{await browser.close();}
