import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const context=await browser.newContext();const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  const results=await page.evaluate(()=>{
    const enemy=(x,hp=1000)=>({...ENEMIES.walker,x,y:320,hp,maxHp:hp,spd:0,walkSpd:0,walkTick:0,hitFlash:0,color:'#aaa'});
    const setup=()=>{game.reset();game.nextSpawn=Infinity;game.lastTime=1000;game.lastShotTimes.fill(Infinity);game.enemies=[];game.bullets=[];};
    const bullet=(extra={})=>({x:200,y:320,vx:100,vy:0,dmg:45,pen:1,type:'bullet',hitList:[],...extra});
    setup();let near=enemy(300),far=enemy(450);game.enemies=[far,near];game.bullets=[bullet()];game.update(1100);
    const nearest=[near.hp,far.hp];
    setup();near=enemy(300);game.enemies=[near];game.bullets=[bullet({vx:200})];game.update(1100);const sweep=near.hp;
    setup();near=enemy(300);game.enemies=[near];game.bullets=[bullet({type:'bomb',dmg:180,radius:120})];game.update(1100);const bomb=near.hp;
    setup();near=enemy(300);far=enemy(450);game.enemies=[near,far];game.bullets=[bullet({pen:6,dmg:95,hitList:[near]})];game.update(1100);const penetration=[near.hp,far.hp];
    setup();game.waveTotalCount=2;game.enemies=[enemy(300,100),enemy(320,100)];game.bullets=[bullet({type:'bomb',dmg:180,radius:120})];game.update(1100);const wave=[game.wave,game.kills,game.waveKillCount];
    setup();game.hp=5;near=enemy(50);near.typeKey='brute';game.enemies=[near];game.update(1100);const death=[game.hp,game.state];
    game.gameOverTick=Date.now()-7100;game.update(1200);const restart=[game.state,game.hp,game.cowboyRecoil];
    const distance=hz=>{setup();near=enemy(700);near.spd=0.4;game.enemies=[near];for(let i=1;i<=hz;i++)game.update(1000+i*1000/hz);return near.x;};
    const refresh=[distance(60),distance(144)];
    setup();game.lastInteractionTime=Date.now()-31000;game.update(1100);const auto=game.isAutoMode;
    setup();for(let i=0;i<1000;i++)game.createParticles(300,320,'#fff',3);game.update(1100);const particles=game.particles.length;
    setup();game.wave=8;for(let i=0;i<200;i++)game.spawn();const enemies=game.enemies.length;
    setup();game.enemies=[enemy(500)];return {nearest,sweep,bomb,penetration,wave,death,restart,refresh,auto,particles,enemies};
  });
  assert.deepEqual(results.nearest,[955,1000]);assert.equal(results.sweep,955);
  assert.equal(results.bomb,820);assert.deepEqual(results.penetration,[1000,905]);
  assert.deepEqual(results.wave,[2,2,0]);assert.deepEqual(results.death,[0,'gameover']);
  assert.deepEqual(results.restart,['playing',100,0]);assert.ok(Math.abs(results.refresh[0]-results.refresh[1])<0.001);
  assert.equal(results.auto,true);assert.ok(results.particles<=400);assert.ok(results.enemies<=80);
  await page.locator('#pause-btn').click();
  const x=await page.evaluate(()=>game.enemies[0].x);
  await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>game.enemies[0].x),x);
  await page.locator('#pause-btn').click();
  await page.locator('#slot-1').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#slot-1').getAttribute('aria-pressed'),'true');
  const soak=await page.evaluate(()=>{
    const realNow=Date.now;let now=realNow();Date.now=()=>now;
    const maximum={enemies:0,particles:0,bullets:0,fallen:0};let restarts=0,maxWave=1;
    try {
      game.reset();
      for(let frame=0;frame<18000;frame++) {
        now+=1000/30;const before=game.state;game.update(frame*1000/30);
        if(before==='gameover'&&game.state==='playing')restarts++;
        maxWave=Math.max(maxWave,game.wave);
        for(const key of Object.keys(maximum))maximum[key]=Math.max(maximum[key],game[key].length);
        if(frame%30===0)game.draw();
      }
      return {maximum,restarts,maxWave,finite:Number.isFinite(game.hp)&&Number.isFinite(game.wave)};
    }finally{Date.now=realNow;game.reset();}
  });
  assert.ok(soak.finite);assert.ok(soak.maximum.enemies<=80);assert.ok(soak.maximum.particles<=400);assert.ok(soak.maximum.bullets<=250);assert.ok(soak.maximum.fallen<=24);
  console.log(`10-minute simulation: max wave ${soak.maxWave}, restarts ${soak.restarts}.`);
  // A touch viewport uses the real mobile input path, including tap targets.
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const phone=await mobile.newPage();
  await phone.goto(new URL('../cowboy/index.html',import.meta.url).href);
  await phone.locator('#slot-2').tap();assert.equal(await phone.locator('#slot-2').getAttribute('aria-pressed'),'true');
  await phone.locator('.skin-tools summary').tap();assert.ok(await phone.locator('#skin-import').isVisible());
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await mobile.close();
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
  const fallback=await blocked.newPage();const fallbackErrors=[];fallback.on('pageerror',e=>fallbackErrors.push(e.message));
  await fallback.goto(new URL('../cowboy/index.html',import.meta.url).href);
  assert.equal(await fallback.evaluate(()=>game.state),'playing');assert.deepEqual(fallbackErrors,[]);
  assert.deepEqual(errors,[]);
  console.log('PASS: swept/nearest collision, single bomb damage, penetration, wave advancement, death/restart, 60/144Hz movement, AI, bounded effects, pause, keyboard and blocked storage.');
}finally{await browser.close();}
