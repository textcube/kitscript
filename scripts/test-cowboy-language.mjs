import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const context=await browser.newContext({viewport:{width:1200,height:900}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL('../cowboy/index.html',import.meta.url).href);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('#level-name').textContent(),await page.evaluate(()=>CowboySkin.levelFor(1).nameEn));
  assert.equal(await page.locator('#hero-name').textContent(),'Sunset Sheriff');
  assert.equal(await page.locator('#pause-btn').getAttribute('aria-label'),'Pause');
  assert.equal(await page.locator('#skin-import').textContent(),'Import PNG');
  await page.locator('#language-btn').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'ko');
  assert.equal(await page.locator('#level-name').textContent(),await page.evaluate(()=>CowboySkin.levelFor(1).name));
  assert.equal(await page.locator('#level-hint').textContent(),await page.evaluate(()=>CowboySkin.levelFor(1).hint));
  assert.equal(await page.locator('#hero-name').textContent(),'해질녘 보안관');
  assert.equal(await page.locator('#slot-0 .slot-name').textContent(),'리볼버');
  assert.equal(await page.locator('#pause-btn').getAttribute('aria-label'),'일시정지');
  assert.equal(await page.locator('#skin-import').textContent(),'PNG 불러오기');
  assert.equal(await page.locator('#wave-progress').locator('..').textContent().then(v=>v.trim().startsWith('웨이브')) ,true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('cowboy_language')),'ko');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'),'ko','language choice should persist after reload');

  const bossNames=await page.evaluate(()=>{
    game.wave=5;game.updateUI();game.spawnBoss();game.draw();
    return {ko:document.getElementById('boss-name').textContent,boss:game.enemies.find(enemy=>enemy.isBoss)};
  });
  assert.ok(bossNames.ko.includes('붉은 모래 대장'));
  assert.ok((await page.locator('#stage-notice').textContent()).includes('대장 출현'));
  await page.locator('#language-btn').click();
  assert.equal(await page.locator('#level-name').textContent(),await page.evaluate(()=>CowboySkin.levelFor(5).nameEn));
  assert.ok((await page.locator('#boss-name').textContent()).includes('Red Sand Marshal'));
  assert.ok((await page.locator('#stage-notice').textContent()).includes('Boss appears'));
  assert.equal(await page.locator('#boss-hud').getAttribute('aria-label'),'Boss fight');
  await page.locator('#language-btn').click();
  assert.ok((await page.locator('#boss-name').textContent()).includes('붉은 모래 대장'));
  await page.locator('#skin-file').setInputFiles({name:'invalid.png',mimeType:'image/png',buffer:Buffer.from('bad png')});
  await page.waitForFunction(()=>document.getElementById('skin-status').textContent.includes('PNG'));
  assert.equal(await page.locator('#skin-status').textContent(),'PNG 이미지 파일을 선택하세요.');
  await page.locator('#language-btn').click();
  assert.equal(await page.locator('#skin-status').textContent(),'Choose a PNG image file.');
  await page.evaluate(()=>{game.state='gameover';game.gameOverTick=Date.now();game.lastDisplayedSec=7;});
  await page.locator('#language-btn').click();
  assert.match(await page.locator('#retry-msg').textContent(),/^재시작까지 7\.\.\.$/);
  assert.ok(errors.length===0,errors.join('\n'));
  await context.close();

  const blocked=await browser.newPage({viewport:{width:900,height:700}});
  await blocked.addInitScript(()=>{
    Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('blocked','SecurityError');}});
    Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('blocked','SecurityError');}});
  });
  await blocked.goto(new URL('../cowboy/index.html',import.meta.url).href);
  assert.equal(await blocked.locator('html').getAttribute('lang'),'en');
  await blocked.locator('#language-btn').click();
  assert.equal(await blocked.locator('html').getAttribute('lang'),'ko','language switch should work when storage is blocked');
  await blocked.close();
  console.log('PASS: English default, Korean toggle and persistence, live level and boss translation, and blocked storage.');
} finally {await browser.close();}
