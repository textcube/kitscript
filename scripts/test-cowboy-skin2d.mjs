import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const context=await browser.newContext({viewport:{width:1100,height:850},deviceScaleFactor:2});
  await context.addInitScript(()=>localStorage.setItem('cowboy_language','ko'));
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  assert.equal(await page.evaluate(()=>CowboySkin.info.format),'SKIN2D');
  assert.equal(await page.evaluate(()=>CowboySkin.info.characters.length),7);
  await page.locator('[data-hero="huntress"]').click();
  assert.equal(await page.locator('#hero-name').textContent(),'별빛 사냥꾼');
  await page.locator('[data-hero="cowboy"]').click();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>game.state),'playing');
  for(let weapon=0;weapon<5;weapon++) {
    await page.locator(`#slot-${weapon}`).click();
    const result=await page.evaluate(()=>{
      game.enemies=[];game.bullets=[];game.lastShotTimes[game.currentWeapon]=0;
      game.aimAngle=-0.15;game.shoot({x:600,y:320});
      const expected=CowboySkin.muzzle(COWBOY_X,GROUND_Y+43,game.aimAngle,18,performance.now(),0,WEAPONS[game.currentWeapon].gunLen);
      const bullet=game.bullets[0];
      game.draw();
      return {count:game.bullets.length,distance:Math.hypot(expected.x-bullet.x,expected.y-bullet.y)};
    });
    assert.ok(result.count>0);assert.ok(result.distance<1,'bullet must start at the animated weapon bone');
  }
  const downloadEvent=page.waitForEvent('download');
  await page.locator('.skin-tools summary').click();
  await page.locator('#skin-download').click();
  const download=await downloadEvent;
  assert.equal(download.suggestedFilename(),'cowboy-skin2d.png');
  await page.locator('#skin-file').setInputFiles({name:download.suggestedFilename(),mimeType:'image/png',buffer:readFileSync(await download.path())});
  await page.waitForFunction(()=>document.getElementById('skin-status').textContent!=='스킨 적용 중…');
  assert.equal(await page.locator('#skin-status').textContent(),download.suggestedFilename());
  const skinBytes=[...readFileSync(await download.path())];
  const validation=await page.evaluate(async bytes=>{
    const png=new File([new Uint8Array(bytes)],'cowboy.png',{type:'image/png'});
    const pending=CowboySkin.importPlayer(png);CowboySkin.resetPlayer();const cancelled=await pending;
    const bitmap=window.createImageBitmap;window.createImageBitmap=undefined;
    let fallback;try{fallback=await CowboySkin.importPlayer(png);}finally{window.createImageBitmap=bitmap;}
    const header=new Uint8Array(24);header.set([137,80,78,71,13,10,26,10]);new DataView(header.buffer).setUint32(16,2048);new DataView(header.buffer).setUint32(20,2048);
    let dimensions=false,size=false;
    try{await CowboySkin.importPlayer(new File([header],'oversize.png'));}catch(e){dimensions=e.message.includes('1024');}
    try{await CowboySkin.importPlayer(new File([new Uint8Array(8*1024*1024+1)],'huge.png'));}catch(e){size=e.message.includes('8MB');}
    return {cancelled,fallback,dimensions,size};
  },skinBytes);
  assert.deepEqual(validation,{cancelled:false,fallback:true,dimensions:true,size:true});
  if(process.env.SKIN2D_TEST_PNG) {
    await page.locator('#skin-file').setInputFiles(process.env.SKIN2D_TEST_PNG);
    await page.waitForFunction(()=>document.getElementById('skin-status').textContent!=='스킨 적용 중…');
    assert.ok((await page.locator('#skin-status').textContent()).endsWith('.png'),'reference SKIN2D PNG must import');
    await page.evaluate(()=>game.draw());
  }
  await page.locator('#skin-file').setInputFiles({name:'invalid.png',mimeType:'image/png',buffer:Buffer.from('invalid')});
  await page.waitForFunction(()=>document.getElementById('skin-status').textContent!=='스킨 적용 중…');
  await page.locator('#skin-reset').click();assert.equal(await page.locator('#skin-status').textContent(),'SKIN2D');
  await page.locator('.skin-tools summary').click();
  await page.evaluate(()=>{
    game.wave=8;game.waveTotalCount=game.level.quota;game.bestWave=Math.max(8,game.bestWave);game.enemies=[];
    for(let i=0;i<12;i++){game.spawn();game.enemies.at(-1).x=340+i*36;}
    game.nextSpawn=Date.now()+4000;game.updateUI();game.draw();
  });
  for(const width of [320,375,550,1100]) {
    await page.setViewportSize({width,height:850});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.id,e.className,e.getBoundingClientRect().right]))));
    assert.ok(await page.locator('.skin-tools summary').isVisible());
    if(width===375&&process.env.COWBOY_SCREENSHOT) {
      await page.screenshot({path:process.env.COWBOY_SCREENSHOT.replace(/\.jpg$/, '-mobile.jpg'),fullPage:true});
    }
    if(width===1100&&process.env.COWBOY_SCREENSHOT) {
      await page.evaluate(()=>{
        game.wave=8;game.enemies=[];
        for(let i=0;i<12;i++){game.spawn();game.enemies.at(-1).x=350+i*40;}
        game.draw();
      });
      await page.screenshot({path:process.env.COWBOY_SCREENSHOT,fullPage:true});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: file:// startup, SKIN2D skins, five weapons, muzzle origin, PNG export/import, invalid PNG, reset, 4 responsive widths.');
}finally{await browser.close();}
