import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('../ocean/index.html',import.meta.url).href);
 const checks=await page.evaluate(()=>{
   resetGame();const setup=()=>{resetGame();spawnClock=999;escorts=[];sub.autoCooldown=999;lastTime=1000;};
   setup();const first=new Enemy('surface',0),second=new Enemy('surface',0);first.x=350;second.x=400;first.y=second.y=230;first.hp=second.hp=10;first.baseSpeed=second.baseSpeed=0;enemies=[second,first];
   const m=new Missile(250,230,second,false);m.speed=35;m.turnSpeed=0;missiles=[m];update(1100);const single=[first.hp,second.hp];
   setup();const bomb=new Bomb(sub.x,sub.y,'depth');bomb.explode();const damaged=sub.hp;new Bomb(sub.x,sub.y,'depth').explode();const invulnerable=sub.hp;checkExplosionDamage(sub.x,sub.y,85);const friendly=sub.hp;
   setup();sub.hp=0;gameTime=300;update(1100);const precedence=currentState;
   setup();idleTime=6;const before=sub.x;update(1100);const patrolStep=Math.abs(sub.x-before);
   const move=hz=>{setup();keys.ArrowRight=true;for(let i=1;i<=hz;i++)update(1000+i*1000/hz);return sub.x;};const rates=[move(60),move(144)];
   setup();levelNumber=5;spawnedThisLevel=sector().quota;update(1100);const flagships=enemies.filter(e=>e.flagship).length;
   setup();const air=new Bomb(500,SURFACE_LAYER-1,'air');air.update(.1);const airDetonated=!air.active;
   setup();levelNumber=5;spawnedThisLevel=sector().quota;flagshipSpawned=true;bossDefeated=true;sub.hp=40;base.hp=70;update(1100);const repaired=[sub.hp,base.hp];
   setup();finishMission(false);restartTimer=.05;update(1100);const autoRestart=currentState;
   setup();Object.defineProperty(document,'hidden',{value:true,configurable:true});update(10000);const hiddenTime=gameTime;delete document.hidden;lastTime=0;
   resetGame();return {single,damaged,invulnerable,friendly,precedence,patrolStep,rates,flagships,airDetonated,repaired,autoRestart,hiddenTime};
 });
 assert.deepEqual(checks.single,[9,10]);assert.equal(checks.damaged,95);assert.equal(checks.invulnerable,95);assert.equal(checks.friendly,95);assert.equal(checks.precedence,3);assert.ok(checks.patrolStep<=7.01);assert.ok(Math.abs(checks.rates[0]-checks.rates[1])<.01);assert.equal(checks.flagships,1);assert.ok(checks.airDetonated);
 assert.deepEqual(checks.repaired,[65,80]);assert.equal(checks.autoRestart,1);assert.equal(checks.hiddenTime,0);
 await page.locator('#pauseToggle').click();const frozen=await page.evaluate(()=>gameTime);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>gameTime),frozen);await page.locator('#pauseToggle').click();
 const soak=await page.evaluate(()=>{
   const random=Math.random;let seed=42;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   const runs=[];
   try{for(let run=0;run<3;run++){resetGame();for(let i=0;i<19000&&currentState===GameState.PLAYING;i++){update(1000+i*1000/60);if(i%600===0)draw();}runs.push({state:currentState,stage:levelNumber,time:gameTime,hp:sub.hp,base:base.hp,score,enemies:enemies.length,particles:particles.length});}}finally{Math.random=random;resetGame();}
   return runs;
 });
 for(const run of soak){assert.ok(run.stage>1);assert.ok(Number.isFinite(run.score));assert.ok(run.hp>=0&&run.base>=0);assert.ok(run.enemies<=60&&run.particles<=350);}
 console.log('Five-minute campaign samples:',JSON.stringify(soak));
 assert.ok(soak.some(run=>run.stage>=5),'Unattended combat must reach a boss stage.');
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,900]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('.launch').scrollIntoViewIfNeeded();assert.ok(await page.locator('.launch').isVisible());}
 await page.evaluate(()=>finishMission(false));await page.locator('#restartButton').click();assert.equal(await page.evaluate(()=>currentState),1);
 const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await phone.goto(new URL('../ocean/index.html',import.meta.url).href);
 await phone.locator('[data-key="ArrowRight"]').dispatchEvent('pointerdown',{pointerId:1});await phone.waitForTimeout(200);assert.ok(await phone.evaluate(()=>sub.x>250));await phone.locator('[data-key="ArrowRight"]').dispatchEvent('pointercancel',{pointerId:1});assert.equal(await phone.evaluate(()=>!!keys.ArrowRight),false);
 await phone.close();
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});window.AudioContext=undefined;window.webkitAudioContext=undefined;});await blocked.goto(new URL('../ocean/index.html',import.meta.url).href);await blocked.locator('#soundToggle').click();assert.equal(await blocked.evaluate(()=>currentState),1);await blocked.close();
 assert.deepEqual(errors,[]);
 if(process.env.OCEAN_SCREENSHOT){await page.setViewportSize({width:1100,height:900});await page.evaluate(()=>{resetGame();gameTime=130;for(let i=0;i<12;i++){const e=new Enemy(i%2?'air':'surface',i%3);e.x=450+i*35;enemies.push(e);}draw();syncHUD();});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:process.env.OCEAN_SCREENSHOT});}
 console.log('PASS: collision, damage ownership, defeat precedence, frame-rate movement, smooth patrol, flagship, pause, touch cancellation, responsive layout, restart and unavailable storage/audio.');
}finally{await browser.close();}
