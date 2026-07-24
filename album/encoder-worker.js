let output = null;
let videoSource = null;
let audioSource = null;
let target = null;
let canvas = null;
let context = null;
let cancelled = false;

const reply = (id, type, data = {}, transfer = []) => self.postMessage({ id, type, ...data }, transfer);

async function startEncoding(message) {
  const media = await import(message.mediaUrl);
  if (message.audio && !(await media.canEncodeAudio('aac'))) {
    const extension = await import(message.aacUrl);
    extension.registerAacEncoder();
  }
  const format = new media.Mp4OutputFormat();
  const codec = await media.getFirstEncodableVideoCodec(format.getSupportedVideoCodecs(), {
    width: message.width,
    height: message.height,
    bitrate: message.videoBitrate
  });
  if (!codec) throw new Error('This browser has no MP4-compatible video encoder in workers.');
  canvas = new OffscreenCanvas(message.width, message.height);
  context = canvas.getContext('2d', { alpha: false });
  target = new media.BufferTarget();
  output = new media.Output({ format, target });
  videoSource = new media.CanvasSource(canvas, { codec, bitrate: message.videoBitrate });
  output.addVideoTrack(videoSource, { frameRate: message.fps });
  if (message.audio) {
    audioSource = new media.AudioSampleSource({ codec: 'aac', bitrate: 160_000 });
    output.addAudioTrack(audioSource);
  }
  await output.start();
  if (message.audio) {
    const { channels, sampleRate, numberOfChannels, length } = message.audio;
    const channelData = channels.map((buffer) => new Float32Array(buffer));
    const chunkFrames = Math.max(1, Math.floor(sampleRate * 10));
    for (let start = 0; start < length; start += chunkFrames) {
      if (cancelled) throw new DOMException('Export cancelled.', 'AbortError');
      const frames = Math.min(chunkFrames, length - start);
      const planar = new Float32Array(frames * numberOfChannels);
      for (let channel = 0; channel < numberOfChannels; channel++) {
        planar.set(channelData[channel].subarray(start, start + frames), channel * frames);
      }
      const sample = new media.AudioSample({
        data: planar,
        format: 'f32-planar',
        numberOfChannels,
        sampleRate,
        timestamp: start / sampleRate
      });
      await audioSource.add(sample);
      sample.close();
      reply(message.id, 'audio-progress', { progress: (start + frames) / length });
    }
  }
  reply(message.id, 'ready', { codec });
}

async function addFrame(message) {
  if (cancelled) throw new DOMException('Export cancelled.', 'AbortError');
  try {
    context.drawImage(message.bitmap, 0, 0, canvas.width, canvas.height);
  } finally {
    message.bitmap.close();
  }
  await videoSource.add(message.time, message.duration, { keyFrame: message.keyFrame });
  reply(message.id, 'frame-done');
}

async function finishEncoding(message) {
  videoSource.close();
  audioSource?.close();
  await output.finalize();
  const buffer = target.buffer;
  reply(message.id, 'complete', { buffer }, [buffer]);
}

self.onmessage = async ({ data: message }) => {
  try {
    if (message.type === 'cancel') {
      cancelled = true;
      try { await output?.cancel(); } catch (error) {}
      return;
    }
    if (message.type === 'start') await startEncoding(message);
    else if (message.type === 'frame') await addFrame(message);
    else if (message.type === 'finish') await finishEncoding(message);
  } catch (error) {
    reply(message.id, 'error', {
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack || ''
    });
  }
};
