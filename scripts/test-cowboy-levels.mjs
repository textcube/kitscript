import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  const result=await page.evaluate(()=>{
    const levels=Array.from({length:101},(_,i)=>CowboySkin.levelFor(i+1));
    const rows=[],enemy=()=>({...ENEMIES.walker,x:500,y:380,hp:0,maxHp:100,color:'#aaa',walkTick:0,walkSpd:1,hitFlash:0});
    for(let wave=1;wave<=100;wave++) {
      game.reset();game.wave=wave;game.waveTotalCount=game.level.quota;game.hp=70;
      const level=game.level;
      for(let i=0;i<level.quota-(level.boss?1:0);i++)game.killEnemy(enemy());
      let gated=true,boss=false;
      if(level.boss) {
        const target=game.enemies.find(e=>e.isBoss);boss=!!target;
        game.killEnemy(enemy());gated=game.wave===wave;
        if(target){target.hp=0;game.killEnemy(target);}
      } else {
        game.killEnemy(enemy());
      }
      rows.push({wave,next:game.wave,boss,gated});
    }
    const hashes=[];
    for(let i=0;i<6;i++) {
      const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;
      CowboySkin.drawWorld(canvas.getContext('2d'),CowboySkin.levelFor([1,16,31,51,66,81][i]),0,true);
      hashes.push(canvas.toDataURL());
    }
    return {levels:levels.slice(0,100),loop:levels[100],rows,distinctBackgrounds:new Set(hashes).size};
  });
  assert.equal(result.levels.length,100);
  assert.equal(new Set(result.levels.map(l=>l.name)).size,100,'Korean level names must be unique');
  assert.equal(new Set(result.levels.map(l=>l.nameEn)).size,100,'English level names must be unique');
  assert.equal(new Set(result.levels.map(l=>l.hint)).size,100,'Korean tactics must be unique');
  assert.equal(new Set(result.levels.map(l=>l.hintEn)).size,100,'English tactics must be unique');
  assert.deepEqual(result.levels.map(l=>l.index),Array.from({length:100},(_,i)=>i));
  assert.equal(result.levels.filter(l=>l.boss).length,20);
  assert.deepEqual(result.levels.filter(l=>l.boss).map(l=>l.index),Array.from({length:20},(_,i)=>i*5+4));
  for(const l of result.levels) {
    assert.ok(l.chapterIndex>=0&&l.chapterIndex<6);
    assert.ok(l.quota>=7&&l.quota<=20);
    assert.ok(l.interval>=700&&l.interval<=1800);
    assert.ok(l.hp>=0.7&&l.hp<=1.4);
    assert.ok(l.weights.length===4&&l.weights.every(Number.isFinite));
    assert.ok(Math.abs(l.weights.reduce((a,b)=>a+b,0)-1)<0.001);
    assert.ok(l.lanes.length>=1&&l.lanes.length<=4&&l.lanes.every(y=>y>=300&&y<=430));
    assert.ok(Number.isFinite(l.bossHp)&&(l.boss?l.bossHp>0:l.bossHp===0));
  }
  assert.deepEqual(result.levels.map(l=>l.chapterIndex),[
    ...Array(15).fill(0),...Array(15).fill(1),...Array(20).fill(2),
    ...Array(15).fill(3),...Array(15).fill(4),...Array(20).fill(5),
  ]);
  for(const row of result.rows){assert.equal(row.next,row.wave+1);assert.equal(row.gated,true);assert.equal(row.boss,row.wave%5===0);}
  assert.equal(result.loop.index,0);assert.equal(result.loop.cycle,1);assert.equal(result.loop.name,result.levels[0].name);
  assert.equal(result.distinctBackgrounds,6);assert.deepEqual(errors,[]);
  if(process.env.COWBOY_LEVELS_SHEET)writeFileSync(process.env.COWBOY_LEVELS_SHEET,Buffer.from(result.levels.map(l=>`${l.index+1}\t${l.name}\t${l.nameEn}`).join('\n')));
  console.log('PASS: 100 authored transitions, 20 boss gates, bilingual uniqueness, finite bounds, six regions and level 101 loop.');
} finally {await browser.close();}
