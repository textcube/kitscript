import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const sizes = [[320,568], [375,812], [480,800], [550,805], [768,1024], [1024,600], [1440,900], [1920,1080]];
try {
  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({ deviceScaleFactor });
    await context.route('https://rogue.test/**', route => {
      const path = new URL(route.request().url()).pathname.slice(1) || 'index.html';
      return route.fulfill({ path: fileURLToPath(new URL('../rogue/' + path, import.meta.url)) });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://rogue.test/');
    await page.evaluate(() => {
      gameState.paused = true;
      startWithPlayer('flutist');
      gameState.paused = true;
      gameState.lastEnemyProfile = {trait:'dracula', anim:'ani-idle', power:123, clusterSize:12, done:false};
      render();
    });
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(100);
      const issues = await page.evaluate(() => {
        const issues = [];
        const board = document.getElementById('grid').getBoundingClientRect();
        const expected = Math.min(804, innerWidth - 16);
        if (Math.abs(board.width - expected) > 2) issues.push('board does not fill available width');
        if (board.left < -1 || board.right > innerWidth + 1) issues.push('board overflows viewport');
        for (const panel of document.querySelectorAll('.profile-panel')) {
          const portrait = panel.querySelector('.profile-portrait').getBoundingClientRect();
          const stats = panel.querySelector('.profile-stats').getBoundingClientRect();
          const bounds = panel.getBoundingClientRect();
          if (portrait.bottom > stats.top + 1) issues.push(panel.id + ': text overlaps portrait');
          if (portrait.height < 24) issues.push(panel.id + ': portrait too short');
          if (stats.bottom > bounds.bottom + 1) issues.push(panel.id + ': stats outside panel');
          const art = panel.querySelector('canvas').getBoundingClientRect();
          if (art.height > portrait.height + 1 || art.width > portrait.width + 1) issues.push(panel.id + ': cropped art ' + JSON.stringify({art:art.toJSON(),portrait:portrait.toJSON()}));
        }
        for (const tile of document.querySelectorAll('.tile-enemy')) {
          const art = tile.querySelector('.char-container').getBoundingClientRect();
          const stats = tile.querySelector('.stat-container').getBoundingClientRect();
          if (art.bottom > stats.top + 1) issues.push(tile.id + ': stats overlap sprite');
          if (stats.right > tile.getBoundingClientRect().right + 1) issues.push(tile.id + ': stats overflow');
        }
        return issues;
      });
      assert.deepEqual(issues, [], `${width}x${height} DPR ${deviceScaleFactor}`);
      if (width === 550 && deviceScaleFactor === 1 && process.env.ROGUE_SCREENSHOT) {
        await page.screenshot({ path: process.env.ROGUE_SCREENSHOT, fullPage: true });
      }
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: profile art and text, tile stats, resizing across 8 viewports and 2 pixel densities.');
} finally { await browser.close(); }
