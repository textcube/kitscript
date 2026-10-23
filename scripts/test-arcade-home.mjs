import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const staticPage=await browser.newPage({javaScriptEnabled:false});
 await staticPage.goto(new URL('../index.html',import.meta.url).href);
 assert.equal(await staticPage.locator('.module-btn[href]').count(),24,'all menu links must exist without JavaScript');
 await staticPage.close();
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(/^https?:/.test(req.url()))remote.push(req.url());});
 await page.goto(new URL('../index.html',import.meta.url).href);await page.waitForTimeout(150);
 assert.equal(await page.locator('.module-btn').count(),24);assert.equal(await page.locator('.module-btn svg').count(),24);assert.ok(await page.locator('#aoe-button').isDisabled());assert.deepEqual(remote,[],'initial scene must work without fonts or video requests');
 for(const [width,height] of [[320,568],[390,844],[768,1024],[844,390],[1440,1100]]){
   await page.setViewportSize({width,height});await page.waitForFunction(()=>viewW===document.getElementById('arena').clientWidth&&viewH===document.getElementById('arena').clientHeight);
   const layout=await page.evaluate(()=>{
     const arena=document.getElementById('arena').getBoundingClientRect(),canvas=document.getElementById('gameCanvas').getBoundingClientRect(),library=document.getElementById('game-library').getBoundingClientRect(),controls=document.getElementById('bottom-controls').getBoundingClientRect();
     return {width:document.documentElement.scrollWidth,canvasWidth:canvas.width,arenaWidth:arena.width,separated:(matchMedia("(orientation:landscape) and (min-width:600px)").matches?library.left>=arena.right:library.top>=controls.bottom)&&controls.top>=arena.bottom,finite:fairies.every(f=>Number.isFinite(f.x)&&f.x>=0&&f.x<=viewW&&f.y>=0&&f.y<=viewH),logical:viewW,aoeHeight:document.getElementById('aoe-button').getBoundingClientRect().height};
   });
   assert.ok(layout.width<=width,JSON.stringify(layout));assert.ok(layout.separated);assert.ok(layout.finite);assert.equal(layout.canvasWidth,layout.arenaWidth);assert.ok(layout.aoeHeight>=44);
 }
 await page.evaluate(()=>{state.tickets=3;updateHUD();for(let i=0;i<5;i++)spawnEnemy();});
 await page.locator('#aoe-button').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>state.tickets),0);assert.equal(await page.evaluate(()=>enemies.length),0);
 await page.evaluate(()=>{state.level=8;renderModules();});assert.equal(await page.locator('[aria-label="Play WORLD"]').count(),1);
 const safety=await page.evaluate(()=>{enemies=[{...CONFIG.ENEMY_TYPES[0],x:playerPos.x,y:playerPos.y,tick:0}];update(performance.now(),1);return enemies.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y));});assert.ok(safety);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{gameOver();document.getElementById('game-library').scrollIntoView();});await page.waitForTimeout(3200);assert.equal(await page.evaluate(()=>state.active),true);assert.ok(await page.evaluate(()=>scrollY>0),'restart must preserve library reading position');
 await page.route('**/iframe_api',route=>route.abort());
 await page.locator('#video-toggle').click();await page.waitForFunction(()=>!videoBackgroundEnabled);
 assert.equal(await page.locator('#video-toggle').getAttribute('aria-pressed'),'false');
 assert.equal(await page.locator('#sound-toggle svg').count(),1);
 if(process.env.ARCADE_SCREENSHOT_DIR){
   for(const [name,width,height] of [['desktop',1440,1100],['mobile',390,844]]){
     await page.setViewportSize({width,height});await page.waitForTimeout(100);await page.evaluate(()=>{window.scrollTo(0,0);state.hp=100;state.score=12850;state.tickets=2;for(let i=0;i<12;i++){const a=i*Math.PI/6;enemies.push({...CONFIG.ENEMY_TYPES[i%5],x:playerPos.x+Math.cos(a)*viewW*.36,y:playerPos.y+Math.sin(a)*viewH*.36,tick:0});}draw();updateHUD();});
     await page.screenshot({path:`${process.env.ARCADE_SCREENSHOT_DIR}/arcade-${name}.png`,fullPage:true});
   }
 }
 assert.deepEqual(errors,[]);console.log('PASS: 24 static hyperlinks without JavaScript, offline startup, five layouts, non-overlapping arena/controls/library, keyboard burst, finite collision and in-place restart.');
}finally{await browser.close();}

