import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('../ocean/index.html',import.meta.url).href);
 const result=await page.evaluate(()=>{
   const configs=LEVELS.map(l=>({...l}));const transitions=[];
   for(let n=1;n<=100;n++){
     resetGame();levelNumber=n;spawnedThisLevel=sector().quota;spawnClock=999;lastTime=1000;
     update(1100);
     if(sector().bossHp&&levelNumber===n&&currentState===GameState.PLAYING){
       const boss=enemies.find(e=>e.flagship);if(!boss)throw Error('Missing boss '+n);
       if(levelNumber!==n)throw Error('Boss gate bypassed');
       boss.hp=.1;checkExplosionDamage(boss.x,boss.y,100);update(1200);
     }
     transitions.push({stage:n,next:levelNumber,state:currentState});
   }
   resetGame();levelNumber=100;spawnFlagship();enemies[0].x=50;lastTime=1000;update(1100);const breach=currentState;
   const random=Math.random;let seed=1381;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   const combat=[];
   try {
     for(let n=1;n<=100;n++){
       resetGame();levelNumber=n;
       let steps=0;while(currentState===GameState.PLAYING&&levelNumber===n&&steps<3000){update(1000+steps*100);steps++;}
       combat.push({stage:n,clear:levelNumber===n+1||(n===100&&currentState===GameState.WIN),hp:sub.hp,base:base.hp,seconds:steps/10});
     }
   }finally{Math.random=random;resetGame();}
   return {configs,transitions,breach,combat};
 });
 assert.equal(result.configs.length,100);assert.equal(new Set(result.configs.map(l=>l.name)).size,100);assert.equal(new Set(result.configs.map(l=>l.zone)).size,10);assert.equal(result.configs.filter(l=>l.bossHp>0).length,20);
 for(const l of result.configs){assert.ok(l.interval>=.8&&l.quota>=4&&l.lanes.every(n=>n>=0&&n<3));assert.equal(l.bossHp>0,l.id%5===0);}
 for(const row of result.transitions){assert.equal(row.next,row.stage===100?100:row.stage+1);assert.equal(row.state,row.stage===100?2:1);}
 assert.equal(result.breach,3);
 const failures=result.combat.filter(row=>!row.clear);console.log('100-stage isolated combat:',JSON.stringify({failed:failures,longestSeconds:Math.max(...result.combat.map(r=>r.seconds)),finale:result.combat.at(-1)}));assert.deepEqual(failures,[]);
 for(const size of [{width:320,height:568},{width:390,height:844},{width:1100,height:850}]){
   await page.setViewportSize(size);const buttons=await page.locator('.link-zone .icon-button').evaluateAll(nodes=>nodes.map(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height,label:node.getAttribute('aria-label'),svg:!!node.querySelector('svg')})));
   assert.equal(buttons.length,4);for(const b of buttons){assert.ok(b.width>=44&&b.height>=44&&b.label&&b.svg);}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.locator('#soundToggle').click();assert.equal(await page.locator('#soundToggle svg').count(),1);assert.equal(await page.locator('#soundToggle').getAttribute('aria-pressed'),'true');await page.locator('#pauseToggle').click();assert.equal(await page.locator('#pauseToggle svg').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: 100 stages, 20 boss gates, final victory, boss breach, isolated combat and four accessible SVG controls.');
}finally{await browser.close();}
