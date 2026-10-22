import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:844,height:390}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);

  const summary=page.locator('.skin-tools summary');
  await summary.click();
  const panel=page.locator('.skin-tools-panel');
  await panel.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.skin-tools-panel').style.width!=='');
  const bounds=await page.evaluate(()=>{
    const panel=document.querySelector('.skin-tools-panel').getBoundingClientRect();
    const viewport=document.getElementById('viewport').getBoundingClientRect();
    const hit=document.elementFromPoint(panel.left+Math.min(12,panel.width/2),panel.top+Math.min(12,panel.height/2));
    return {panel:panel.toJSON(),viewport:viewport.toJSON(),window:[innerWidth,innerHeight],hit:!!hit&&document.querySelector('.skin-tools-panel').contains(hit)};
  });
  assert.ok(bounds.panel.left>=0&&bounds.panel.right<=bounds.window[0],JSON.stringify(bounds));
  assert.ok(bounds.panel.top>=0&&bounds.panel.bottom<=bounds.window[1],JSON.stringify(bounds));
  assert.ok(bounds.panel.left>=bounds.viewport.left&&bounds.panel.right<=bounds.viewport.right,JSON.stringify(bounds));
  assert.ok(bounds.panel.top>=bounds.viewport.top&&bounds.panel.bottom<=bounds.viewport.bottom,JSON.stringify(bounds));
  assert.equal(bounds.hit,true,JSON.stringify(bounds));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.skin-tools').getAttribute('open'),null);
  assert.equal(await page.evaluate(()=>document.activeElement.matches('.skin-tools summary')),true);

  await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  await summary.click();
  await page.waitForFunction(()=>{
    const panel=document.querySelector('.skin-tools-panel').getBoundingClientRect();
    return panel.left>=0&&panel.right<=innerWidth&&panel.top>=0&&panel.bottom<=innerHeight;
  });
  const scrolled=await page.evaluate(()=>{
    const panel=document.querySelector('.skin-tools-panel').getBoundingClientRect();
    const viewport=document.getElementById('viewport').getBoundingClientRect();
    return {panel:panel.toJSON(),viewport:viewport.toJSON(),window:[innerWidth,innerHeight]};
  });
  assert.ok(scrolled.panel.left>=0&&scrolled.panel.right<=scrolled.window[0],JSON.stringify(scrolled));
  assert.ok(scrolled.panel.top>=0&&scrolled.panel.bottom<=scrolled.window[1],JSON.stringify(scrolled));
  assert.ok(scrolled.panel.left>=scrolled.viewport.left&&scrolled.panel.right<=scrolled.viewport.right,JSON.stringify(scrolled));
  assert.ok(scrolled.panel.top>=scrolled.viewport.top&&scrolled.panel.bottom<=scrolled.viewport.bottom,JSON.stringify(scrolled));
  await page.keyboard.press('Escape');

  await page.evaluate(()=>{
    const now=Date.now();const realNow=Date.now;let clock=now;Date.now=()=>clock;
    game.noticeUntil=clock+5000;game.paused=true;game.syncPause();clock+=7000;game.paused=false;game.syncPause();
    const remains=game.noticeUntil-clock;Date.now=realNow;window.noticePauseRemainder=remains;
  });
  assert.equal(await page.evaluate(()=>window.noticePauseRemainder),5000);

  await page.evaluate(()=>{
    window.resumeRejections=0;window.addEventListener('unhandledrejection',()=>window.resumeRejections++);
    AudioEngine.ctx={state:'suspended',resume:()=>Promise.reject(new Error('resume blocked'))};
    AudioEngine.init();
  });
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.resumeRejections),0);

  await page.locator('#pause-btn').click();
  await page.evaluate(()=>{game.state='gameover';game.paused=false;game.hp=0;game.enemies=[];document.querySelector('.skin-tools').open=true;game.updateUI();});
  await page.evaluate(()=>{
    game.state='playing';game.hp=1;game.enemies=[{...ENEMIES.walker,x:COWBOY_X+24,y:320,hp:100,maxHp:100,spd:0,size:40,typeKey:'walker',dead:false}];
    game.update(performance.now()+100);
  });
  assert.equal(await page.locator('.skin-tools').getAttribute('open'),null);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'restart-btn');
  await page.locator('#restart-btn').click();
  assert.equal(await page.evaluate(()=>game.state),'playing');
  assert.equal(await page.locator('#pause-btn').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);
  console.log('PASS: compact landscape menu bounds, Escape focus restoration, paused notice timing, rejected audio resume, and game-over/restart focus state.');
} finally {
  await browser.close();
}
