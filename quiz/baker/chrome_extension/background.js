/**
 * Auto run: Fill+Send → wait until "이미지 생성됨" (or retry) → Download → next job.
 * Supports skip-to-next and shows wait/retry count.
 */

const MAX_WAIT_RETRIES = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadFilename(job, urlIndex, url) {
  const base = job.filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const suffix = urlIndex === 0 ? '' : `_${String(urlIndex + 1).padStart(2, '0')}`;
  const ext = url.startsWith('data:image/png') ? '.png' : url.startsWith('data:image/jpeg') ? '.jpg' : '.png';
  return `${base}${suffix}${ext}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'QB_AUTO_SKIP_CURRENT') {
    chrome.storage.local.set({ qbAutoSkipCurrent: true });
    sendResponse({ ok: true });
    return false;
  }

  if (message.type !== 'QB_START_AUTO') return;

  const { tabId, waitSeconds } = message;
  const sec = Math.max(10, Math.min(120, Number(waitSeconds) || 30));
  let responded = false;
  function reply(value) {
    if (responded) return;
    responded = true;
    try {
      sendResponse(value);
    } catch (_) {}
  }

  (async () => {
    try {
      const { qbJobs = [], qbIndex = 0 } = await chrome.storage.local.get(['qbJobs', 'qbIndex']);
      if (!Array.isArray(qbJobs) || !qbJobs.length) {
        reply({ ok: false, error: 'No jobs loaded' });
        return;
      }

      await chrome.storage.local.set({ qbAutoRunning: true, qbAutoStop: false, qbAutoSkipCurrent: false });

      for (let i = qbIndex; i < qbJobs.length; i += 1) {
        const stop = await chrome.storage.local.get('qbAutoStop');
        if (stop.qbAutoStop) {
          await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false, qbAutoSkipCurrent: false });
          chrome.action.setBadgeText({ text: '' });
          reply({ ok: true, stopped: true, at: i });
          return;
        }

        const job = qbJobs[i];
        chrome.action.setBadgeText({ text: `${i + 1}/${qbJobs.length}` });
        chrome.action.setBadgeBackgroundColor({ color: '#1f2937' });
        await chrome.storage.local.set({ qbAutoWaitTotal: 0, qbAutoRetryCount: 0 });
        await chrome.storage.local.remove(['qbAutoWaitPhaseTotal', 'qbAutoWaitPhaseElapsed']);

        let sendOk = false;
        try {
          await chrome.tabs.sendMessage(tabId, { type: 'QB_FILL_AND_SEND', prompt: job.prompt });
          sendOk = true;
        } catch (e) {
          try {
            await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
            await sleep(500);
            await chrome.tabs.sendMessage(tabId, { type: 'QB_FILL_AND_SEND', prompt: job.prompt });
            sendOk = true;
          } catch (_) {}
        }
        if (!sendOk) {
          await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false });
          chrome.action.setBadgeText({ text: '' });
          reply({
            ok: false,
            error: '탭 연결 끊김. ChatGPT 탭을 새로고침하지 말고 대화 화면을 유지한 뒤 다시 Start Auto 해 주세요.',
            at: i,
          });
          return;
        }

        await sleep(3000);
        try {
          const rl = await chrome.tabs.sendMessage(tabId, { type: 'QB_CHECK_RATE_LIMIT' });
          if (rl && rl.rateLimited) {
            await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false });
            chrome.action.setBadgeText({ text: '' });
            reply({
              ok: false,
              error: '이미지 생성 속도 제한에 걸렸습니다. 4분 정도 기다린 뒤 다시 Start Auto 해 주세요.',
              at: i,
            });
            return;
          }
        } catch (_) {}

        let totalWaitSec = 0;
        let retryCount = 0;
        let skipped = false;
        let rateLimitHit = false;

        while (retryCount < MAX_WAIT_RETRIES) {
          const skip = await chrome.storage.local.get('qbAutoSkipCurrent');
          if (skip.qbAutoSkipCurrent) {
            await chrome.storage.local.set({ qbAutoSkipCurrent: false });
            skipped = true;
            break;
          }

          await chrome.storage.local.set({ qbAutoWaitPhaseTotal: sec, qbAutoWaitPhaseElapsed: 0 });
          for (let s = 1; s <= sec; s += 1) {
            const skipAgain = await chrome.storage.local.get('qbAutoSkipCurrent');
            if (skipAgain.qbAutoSkipCurrent) {
              skipped = true;
              break;
            }
            await sleep(1000);
            totalWaitSec += 1;
            await chrome.storage.local.set({
              qbAutoWaitPhaseElapsed: s,
              qbAutoWaitTotal: totalWaitSec,
            });
          }
          if (skipped) {
            await chrome.storage.local.remove(['qbAutoWaitPhaseTotal', 'qbAutoWaitPhaseElapsed']);
            break;
          }
          retryCount += 1;
          await chrome.storage.local.set({ qbAutoWaitTotal: totalWaitSec, qbAutoRetryCount: retryCount });
          await chrome.storage.local.remove(['qbAutoWaitPhaseTotal', 'qbAutoWaitPhaseElapsed']);

          try {
            const check = await chrome.tabs.sendMessage(tabId, { type: 'QB_CHECK_IMAGE_READY' });
            if (check && check.ready) break;
          } catch (_) {}
          try {
            const rl = await chrome.tabs.sendMessage(tabId, { type: 'QB_CHECK_RATE_LIMIT' });
            if (rl && rl.rateLimited) {
              rateLimitHit = true;
              break;
            }
          } catch (_) {}
        }

        if (rateLimitHit) {
          await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false });
          chrome.action.setBadgeText({ text: '' });
          reply({
            ok: false,
            error: '이미지 생성 속도 제한에 걸렸습니다. 4분 정도 기다린 뒤 다시 Start Auto 해 주세요.',
            at: i,
          });
          return;
        }

        if (skipped) {
          await chrome.storage.local.set({ qbIndex: i + 1 });
          continue;
        }

        await sleep(3000);

        let res;
        try {
          res = await chrome.tabs.sendMessage(tabId, { type: 'QB_GET_IMAGES' });
        } catch (e) {
          try {
            await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
            await sleep(300);
            res = await chrome.tabs.sendMessage(tabId, { type: 'QB_GET_IMAGES' });
          } catch (e2) {
            await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false });
            chrome.action.setBadgeText({ text: '' });
            reply({
              ok: false,
              error: '탭 연결 끊김. 대화 화면을 유지한 뒤 다시 시도해 주세요.',
              at: i,
            });
            return;
          }
        }

        const urls = res?.urls || [];
        for (let u = 0; u < urls.length; u += 1) {
          const filename = `quiz/baker/outputs/${job.slug}/${downloadFilename(job, u, urls[u])}`;
          await chrome.downloads.download({
            url: urls[u],
            filename,
            conflictAction: 'overwrite',
            saveAs: false,
          });
        }

        await chrome.storage.local.set({ qbIndex: i + 1 });
      }

      await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false, qbAutoSkipCurrent: false });
      chrome.action.setBadgeText({ text: '' });
      reply({ ok: true, done: true, total: qbJobs.length });
    } catch (err) {
      if (!responded) reply({ ok: false, error: String(err) });
      await chrome.storage.local.set({ qbAutoRunning: false, qbAutoStop: false });
      chrome.action.setBadgeText({ text: '' });
    }
  })();

  return true;
});
