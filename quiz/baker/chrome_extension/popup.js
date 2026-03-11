const state = {
  jobs: [],
  index: 0,
};

const statusEl = document.getElementById('status');
const jobsFileEl = document.getElementById('jobsFile');

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function currentJob() {
  if (!state.jobs.length) return null;
  return state.jobs[state.index];
}

function render() {
  const job = currentJob();
  if (!job) {
    setStatus('Load browser_jobs.json first.');
    return;
  }
  setStatus(
    `Job ${state.index + 1}/${state.jobs.length}\n` +
      `item=${job.item_id} (${job.item_title})\n` +
      `type=${job.type}\n` +
      `target=${job.filename}`
  );
}

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

function isConnectionError(err) {
  const msg = String(err?.message || err);
  return msg.includes('Receiving end') || msg.includes('Could not establish') || msg.includes('No tab with id');
}

async function ensureContentScriptInTab(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (e) {
    throw new Error('이 탭에 스크립트를 넣을 수 없습니다. 주소가 chatgpt.com인지 확인하고, 페이지를 새로고침한 뒤 다시 시도하세요.');
  }
}

async function sendToContent(type, payload = {}) {
  const tabId = await getActiveTabId();
  if (!tabId) throw new Error('No active tab');

  try {
    return await chrome.tabs.sendMessage(tabId, { type, ...payload });
  } catch (err) {
    if (isConnectionError(err)) {
      await ensureContentScriptInTab(tabId);
      return await chrome.tabs.sendMessage(tabId, { type, ...payload });
    }
    throw err;
  }
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

function normalizeJobsPayload(payload) {
  if (!payload) throw new Error('파일 내용이 비어 있습니다.');
  if (Array.isArray(payload)) {
    throw new Error(
      'quiz_items.json은 사용할 수 없습니다.\n' +
      '터미널에서 먼저 실행하세요:\n' +
      '  python browser_job_export.py\n' +
      '그 다음 생성된 outputs/browser_jobs.json 파일을 선택하세요.'
    );
  }
  if (!Array.isArray(payload.jobs)) {
    throw new Error('올바른 형식이 아닙니다. browser_job_export.py로 생성한 browser_jobs.json 파일을 선택하세요.');
  }
  return payload.jobs;
}

if (jobsFileEl) {
  jobsFileEl.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      state.jobs = normalizeJobsPayload(payload);
      state.index = 0;
      await chrome.storage.local.set({ qbJobs: state.jobs, qbIndex: state.index });
      render();
    } catch (err) {
      setStatus(`Failed to load jobs: ${String(err)}`);
    }
  });
}

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
if (prevBtn) prevBtn.addEventListener('click', async () => {
  if (!state.jobs.length) return;
  state.index = (state.index - 1 + state.jobs.length) % state.jobs.length;
  await chrome.storage.local.set({ qbIndex: state.index });
  render();
});
if (nextBtn) nextBtn.addEventListener('click', async () => {
  if (!state.jobs.length) return;
  state.index = (state.index + 1) % state.jobs.length;
  await chrome.storage.local.set({ qbIndex: state.index });
  render();
});

const copyBtn = document.getElementById('copyBtn');
const openOutputBtn = document.getElementById('openOutputBtn');
if (copyBtn) copyBtn.addEventListener('click', async () => {
  const job = currentJob();
  if (!job) return;
  await copyToClipboard(job.prompt);
  setStatus(`Prompt copied.\n${job.filename}`);
});
if (openOutputBtn) openOutputBtn.addEventListener('click', async () => {
  const job = currentJob();
  if (!job) return;
  await copyToClipboard(job.filename);
  setStatus(`Target filename copied: ${job.filename}`);
});

function wrapFillError(err) {
  const msg = String(err);
  if (msg.includes('Receiving end') || msg.includes('Could not establish')) {
    return 'ChatGPT 탭이 없거나 확장이 연결되지 않았습니다.\n→ chatgpt.com 탭을 활성화한 뒤, 필요하면 페이지를 새로고침하고 다시 시도하세요.';
  }
  return `Fill 실패: ${msg}`;
}

const fillBtn = document.getElementById('fillBtn');
const sendBtn = document.getElementById('sendBtn');
const downloadBtn = document.getElementById('downloadBtn');
if (fillBtn) fillBtn.addEventListener('click', async () => {
  const job = currentJob();
  if (!job) return;
  try {
    const res = await sendToContent('QB_FILL_PROMPT', { prompt: job.prompt });
    if (res && res.ok === false) {
      setStatus(res.message || 'Fill 실패');
      return;
    }
    setStatus(`${res?.message || 'Done'}\n${job.filename}`);
  } catch (err) {
    setStatus(wrapFillError(err));
  }
});
if (sendBtn) sendBtn.addEventListener('click', async () => {
  const job = currentJob();
  if (!job) return;
  try {
    const res = await sendToContent('QB_FILL_AND_SEND', { prompt: job.prompt });
    if (res && res.ok === false) {
      setStatus(res.message || 'Send 실패');
      return;
    }
    setStatus(
      `전송됨: ${job.filename}\n\n` +
      '이미지 생성에 10~30초 걸릴 수 있습니다.\n' +
      '채팅에 이미지가 보인 뒤에 Download Images를 누르세요.'
    );
  } catch (err) {
    setStatus(wrapFillError(err));
  }
});
if (downloadBtn) downloadBtn.addEventListener('click', async () => {
  const job = currentJob();
  if (!job) return;

  try {
    const res = await sendToContent('QB_GET_IMAGES');
    const urls = res?.urls || [];
    if (!urls.length) {
      setStatus(
        '현재 채팅에서 이미지를 찾지 못했습니다.\n\n' +
        '이미지가 아직 생성 중일 수 있습니다. 화면에 이미지가 보일 때까지 기다린 뒤, 다시 Download Images를 눌러주세요.'
      );
      return;
    }

    let count = 0;
    for (let i = 0; i < urls.length; i += 1) {
      const suffix = i === 0 ? '' : `_${String(i + 1).padStart(2, '0')}`;
      const ext = urls[i].startsWith('data:image/png') ? '.png' : '.png';
      const filename = job.filename.replace(/\.png$/i, '') + suffix + ext;

      await chrome.downloads.download({
        url: urls[i],
        filename: `quiz/baker/outputs/${job.slug}/${filename}`,
        conflictAction: 'overwrite',
        saveAs: false,
      });
      count += 1;
    }

    setStatus(`다운로드 ${count}개 완료.\n저장: 다운로드 폴더\\quiz\\baker\\outputs\\${job.slug}\n→ 프로젝트로 가져오기: python copy_downloaded_images.py`);
  } catch (err) {
    setStatus(`Download failed: ${String(err)}`);
  }
});

const waitSecondsEl = document.getElementById('waitSeconds');
const autoCheckEl = document.getElementById('autoCheck');
const startAutoBtn = document.getElementById('startAutoBtn');
const stopAutoBtn = document.getElementById('stopAutoBtn');
const autoStatusEl = document.getElementById('autoStatus');
const autoSkipRow = document.getElementById('autoSkipRow');
const skipToNextBtn = document.getElementById('skipToNextBtn');

function formatAutoStatus(running, index, total, waitTotal, retryCount, phaseElapsed, phaseTotal) {
  if (!running) return '';
  let s = `현재 ${index}/${total}`;
  if (typeof retryCount === 'number' && retryCount > 0) {
    s += ` · 대기 ${retryCount}회 (${waitTotal}초)`;
  }
  if (typeof phaseTotal === 'number' && phaseTotal > 0 && typeof phaseElapsed === 'number') {
    s += ` · ${phaseElapsed}/${phaseTotal}초`;
  }
  s += ' · 중지: Stop Auto';
  return s;
}

function updateAutoUI(running, index, total, waitTotal, retryCount, phaseElapsed, phaseTotal) {
  if (!startAutoBtn || !stopAutoBtn || !autoStatusEl) return;
  if (running) {
    startAutoBtn.disabled = true;
    stopAutoBtn.disabled = false;
    if (autoCheckEl) autoCheckEl.checked = true;
    if (autoSkipRow) autoSkipRow.style.display = 'block';
    autoStatusEl.textContent = formatAutoStatus(
      running,
      index,
      total,
      waitTotal ?? 0,
      retryCount ?? 0,
      phaseElapsed,
      phaseTotal
    );
  } else {
    startAutoBtn.disabled = !state.jobs.length || !(autoCheckEl && autoCheckEl.checked);
    stopAutoBtn.disabled = true;
    if (autoSkipRow) autoSkipRow.style.display = 'none';
    autoStatusEl.textContent = '';
  }
}

const startAutoBtnEl = document.getElementById('startAutoBtn');
if (startAutoBtnEl) {
  startAutoBtnEl.addEventListener('click', async () => {
    if (!state.jobs.length) {
      setStatus('browser_jobs.json을 먼저 로드하세요.');
      return;
    }
    const tabId = await getActiveTabId();
    if (!tabId) {
      setStatus('ChatGPT 탭을 활성화한 뒤 다시 시도하세요.');
      return;
    }
    const waitEl = document.getElementById('waitSeconds');
    const sec = Math.max(10, Math.min(120, parseInt(waitEl?.value, 10) || 30));
    if (waitEl) waitEl.value = sec;
    if (startAutoBtn) startAutoBtn.disabled = true;
    if (stopAutoBtn) stopAutoBtn.disabled = false;
    if (autoStatusEl) autoStatusEl.textContent = `Auto 시작 (대기 ${sec}초)...`;

  chrome.runtime.sendMessage(
    { type: 'QB_START_AUTO', tabId, waitSeconds: sec },
    (response) => {
      if (chrome.runtime.lastError) {
        if (autoStatusEl) autoStatusEl.textContent = '';
        if (startAutoBtn) startAutoBtn.disabled = false;
        if (stopAutoBtn) stopAutoBtn.disabled = true;
        setStatus('Auto 시작 실패: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response?.ok && response.done) {
        if (autoStatusEl) autoStatusEl.textContent = `완료: ${response.total}개`;
        if (startAutoBtn) startAutoBtn.disabled = false;
        if (stopAutoBtn) stopAutoBtn.disabled = true;
      } else if (response?.stopped) {
        if (autoStatusEl) autoStatusEl.textContent = `중지됨 (${response.at}번째에서)`;
        if (startAutoBtn) startAutoBtn.disabled = false;
        if (stopAutoBtn) stopAutoBtn.disabled = true;
      } else if (response?.error) {
        if (autoStatusEl) autoStatusEl.textContent = '오류: ' + response.error;
        if (startAutoBtn) startAutoBtn.disabled = false;
        if (stopAutoBtn) stopAutoBtn.disabled = true;
      }
    }
  );
});
}

if (autoCheckEl) autoCheckEl.addEventListener('change', () => {
  chrome.storage.local.get('qbAutoRunning', (r) => {
    if (!r.qbAutoRunning && startAutoBtn) startAutoBtn.disabled = !state.jobs.length || !autoCheckEl.checked;
  });
});

const stopAutoBtnEl = document.getElementById('stopAutoBtn');
if (stopAutoBtnEl) stopAutoBtnEl.addEventListener('click', () => {
  chrome.storage.local.set({ qbAutoStop: true });
  if (autoStatusEl) autoStatusEl.textContent = '중지 요청함...';
});

if (skipToNextBtn) {
  skipToNextBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'QB_AUTO_SKIP_CURRENT' });
    if (autoStatusEl) autoStatusEl.textContent = '다음 job으로 건너뛰기 요청함...';
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.qbIndex) state.index = changes.qbIndex.newValue ?? 0;
  const relevant =
    changes.qbAutoRunning ||
    changes.qbAutoWaitTotal ||
    changes.qbAutoRetryCount ||
    changes.qbAutoWaitPhaseElapsed ||
    changes.qbAutoWaitPhaseTotal ||
    changes.qbIndex;
  if (relevant) {
    chrome.storage.local.get(
      ['qbAutoRunning', 'qbAutoWaitTotal', 'qbAutoRetryCount', 'qbAutoWaitPhaseElapsed', 'qbAutoWaitPhaseTotal', 'qbIndex'],
      (r) => {
        if (r.qbIndex !== undefined) state.index = r.qbIndex;
        const total = state.jobs.length;
        const idx = state.index + 1;
        updateAutoUI(
          !!r.qbAutoRunning,
          idx,
          total,
          r.qbAutoWaitTotal ?? 0,
          r.qbAutoRetryCount ?? 0,
          r.qbAutoWaitPhaseElapsed,
          r.qbAutoWaitPhaseTotal
        );
      }
    );
  }
  render();
});

(async function init() {
  const saved = await chrome.storage.local.get([
    'qbJobs',
    'qbIndex',
    'qbAutoRunning',
    'qbAutoWaitTotal',
    'qbAutoRetryCount',
    'qbAutoWaitPhaseElapsed',
    'qbAutoWaitPhaseTotal',
  ]);
  if (Array.isArray(saved.qbJobs) && saved.qbJobs.length) {
    state.jobs = saved.qbJobs;
    state.index = Number.isInteger(saved.qbIndex) ? saved.qbIndex : 0;
  }
  if (saved.qbAutoRunning) {
    updateAutoUI(
      true,
      state.index + 1,
      state.jobs.length,
      saved.qbAutoWaitTotal ?? 0,
      saved.qbAutoRetryCount ?? 0,
      saved.qbAutoWaitPhaseElapsed,
      saved.qbAutoWaitPhaseTotal
    );
  } else {
    updateAutoUI(false);
  }
  render();
})();
