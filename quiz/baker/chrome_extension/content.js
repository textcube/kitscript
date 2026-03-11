(() => {
  function findPromptInput() {
    const byId = document.getElementById('prompt-textarea');
    if (byId) return byId;
    const textarea = document.querySelector('textarea[placeholder], textarea');
    if (textarea) return textarea;
    const contentEditable = document.querySelector('#prompt-textarea[contenteditable], [contenteditable="true"][data-id="root"] ~ div [contenteditable="true"], form [contenteditable="true"]');
    return contentEditable || null;
  }

  function setPromptText(prompt) {
    const el = findPromptInput();
    if (!el) return { ok: false, message: 'Prompt input not found (ChatGPT may have changed the page)' };

    el.focus();
    el.click();

    const isTextarea = el.tagName === 'TEXTAREA';
    if (isTextarea) {
      el.value = prompt;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, message: 'Prompt filled' };
    }

    if (el.isContentEditable) {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
      return { ok: true, message: 'Prompt filled' };
    }

    el.textContent = prompt;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
    return { ok: true, message: 'Prompt filled' };
  }

  function clickSend() {
    const byTestId = document.querySelector('button[data-testid="send-button"]');
    if (byTestId) {
      byTestId.click();
      return { ok: true, message: 'Prompt sent' };
    }
    const buttons = Array.from(document.querySelectorAll('button'));
    const sendBtn = buttons.find((b) => {
      const label = (b.getAttribute('aria-label') || b.textContent || '').toLowerCase();
      return label.includes('send') || label.includes('전송');
    });
    if (!sendBtn) return { ok: false, message: 'Send button not found' };
    sendBtn.click();
    return { ok: true, message: 'Prompt sent' };
  }

  const IMAGE_READY_MARKERS = [
    '이미지 생성됨',
    '이미지를 생성',
    'Image generated',
    'generated the image',
    "Here's the image",
  ];

  function findBlockWithMarkerAndImages() {
    const main = document.querySelector('main') || document.body;
    let lastMatch = null;
    function walk(el) {
      const text = (el.textContent || '').trim();
      const hasMarker = IMAGE_READY_MARKERS.some((m) => text.includes(m));
      const hasImg = el.querySelector && el.querySelector('img');
      if (hasMarker && hasImg) lastMatch = el;
      for (const child of el.children || []) walk(child);
    }
    walk(main);
    return lastMatch;
  }

  function findImageElementsIn(container) {
    if (!container) return [];
    const imgs = container.querySelectorAll('img');
    return Array.from(imgs).filter((img) => {
      const src = img.currentSrc || img.src || '';
      return src && (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http'));
    });
  }

  function getRawImageUrls() {
    const block = findBlockWithMarkerAndImages();
    if (!block) return [];
    const imgs = findImageElementsIn(block);
    const urls = [];
    const seen = new Set();
    for (const img of imgs) {
      const src = img.currentSrc || img.src || '';
      if (!src || seen.has(src)) continue;
      seen.add(src);
      urls.push(src);
    }
    return urls;
  }

  function blobToDataURL(blobUrl) {
    return fetch(blobUrl)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  async function getAssistantImages() {
    const raw = getRawImageUrls();
    const urls = [];
    for (const src of raw) {
      if (src.startsWith('data:')) {
        urls.push(src);
        continue;
      }
      if (src.startsWith('blob:')) {
        try {
          const dataUrl = await blobToDataURL(src);
          urls.push(dataUrl);
        } catch (_) {
          urls.push(src);
        }
        continue;
      }
      if (src.startsWith('http')) {
        urls.push(src);
      }
    }
    return urls;
  }

  function checkLastMessageImageReady() {
    const markers = [
      '이미지 생성됨',
      '이미지를 생성',
      'Image generated',
      'generated the image',
      "Here's the image",
      'Here are the images',
    ];
    const main = document.querySelector('main') || document.body;
    const pageText = (main.textContent || '').trim();
    const hasMarker = markers.some((m) => pageText.includes(m));

    const mainImgs = main.querySelectorAll('img');
    const hasLoadedImage = Array.from(mainImgs).some((img) => {
      const src = img.src || img.currentSrc || '';
      return src.startsWith('blob:') || src.startsWith('data:') || (src.startsWith('http') && src.length > 10);
    });

    if (hasMarker && hasLoadedImage) return { ready: true };
    if (hasLoadedImage && pageText.length < 1000) return { ready: true };
    return { ready: false };
  }

  function checkRateLimitMessage() {
    const main = document.querySelector('main') || document.body;
    const text = (main.textContent || '').toLowerCase();
    const markers = [
      'generating images too quickly',
      'rate limits',
      'wait for 4 minutes',
      'please wait',
      'before generating more images',
    ];
    const hit = markers.some((m) => text.includes(m.toLowerCase()));
    return { rateLimited: hit };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return;

    if (message.type === 'QB_CHECK_RATE_LIMIT') {
      sendResponse(checkRateLimitMessage());
      return true;
    }

    if (message.type === 'QB_CHECK_IMAGE_READY') {
      sendResponse(checkLastMessageImageReady());
      return true;
    }

    if (message.type === 'QB_FILL_PROMPT') {
      sendResponse(setPromptText(message.prompt || ''));
      return true;
    }

    if (message.type === 'QB_FILL_AND_SEND') {
      const fill = setPromptText(message.prompt || '');
      if (!fill.ok) {
        sendResponse(fill);
        return true;
      }
      setTimeout(() => sendResponse(clickSend()), 120);
      return true;
    }

    if (message.type === 'QB_GET_IMAGES') {
      getAssistantImages()
        .then((urls) => sendResponse({ ok: true, urls }))
        .catch((err) => sendResponse({ ok: false, urls: [], error: String(err) }));
      return true;
    }
  });
})();
