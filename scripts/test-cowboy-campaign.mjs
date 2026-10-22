import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage();
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  // Exercise actual spawning, targeting and damage rather than forcing kills.
  const results=await page.evaluate(()=>{
    const originalNow=Date.now,originalRandom=Math.random;
    const results=[];
    let now=originalNow(),seed=1847;
    Date.now=()=>now;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    try {
      for(let stage=1;stage<=100;stage++){
        game.reset();game.wave=stage;game.waveTotalCount=game.level.quota;
        game.lastInteractionTime=now-31000;
        let frames=0;
        while(game.wave===stage&&game.state==='playing'&&frames<6000){
          now+=100;game.update(frames*100);frames++;
        }
        results.push({stage,cleared:game.wave===stage+1,hp:game.hp,seconds:frames/10,state:game.state});
      }
    } finally {Date.now=originalNow;Math.random=originalRandom;game.reset();}
    return results;
  });
  console.log(JSON.stringify({stages:results.length,failed:results.filter(row=>!row.cleared),longestSeconds:Math.max(...results.map(row=>row.seconds)),finale:results.at(-1)}));
  for(const row of results)assert.ok(row.cleared,`Stage ${row.stage} did not clear: ${JSON.stringify(row)}`);
  console.log('PASS: deterministic automatic combat clears all 100 stages from full health, including the finale.');
} finally {await browser.close();}
