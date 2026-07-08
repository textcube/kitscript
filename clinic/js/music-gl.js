/*
  music-gl.js
  Music Night particle field (spec §15.2): ~2,000 gold points drifting
  in a sine field over a near-black scene. Lazily initialised only once
  the section approaches the viewport, and fully disposed once it is
  scrolled far away — the same IntersectionObserver strategy the hero
  scene uses (spec §15, closing note). Also owns the optional, muted,
  user-initiated ambient drone toggle (spec §13) — synthesised with the
  Web Audio API so no external audio asset is required.
*/

(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  var MAX_DPR = 1.5;
  var PARTICLE_COUNT = 2000;
  var GOLD = [0.690, 0.553, 0.341];

  var VERT = [
    "attribute float aSeed;",
    "uniform float uTime;",
    "uniform float uAmplitude;",
    "uniform float uPixelRatio;",
    "varying float vSeed;",

    "void main() {",
    "  vSeed = aSeed;",
    "  vec3 pos = position;",
    "  float t = uTime * 0.15 + aSeed * 6.2831;",
    "  pos.x += sin(t + aSeed * 3.0) * 0.35 * uAmplitude;",
    "  pos.y += cos(t * 0.8 + aSeed * 5.0) * 0.4 * uAmplitude;",
    "  pos.z += sin(t * 0.6) * 0.2 * uAmplitude;",

    "  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);",
    /* Small, perspective-correct dot sizes (a few px on screen) — the
       point-size attenuation factor (300/-z) is a pixel-scale constant,
       so the base size must stay a small fraction of a world unit or
       the additively-blended points blow out to solid white. */
    "  float baseSize = 0.01 + aSeed * 0.018;",
    "  gl_PointSize = baseSize * uPixelRatio * (300.0 / -mvPosition.z);",
    "  gl_Position = projectionMatrix * mvPosition;",
    "}",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "varying float vSeed;",
    "uniform vec3 uColor;",

    "void main() {",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float d = length(c);",
    "  float alpha = smoothstep(0.5, 0.0, d);",
    "  gl_FragColor = vec4(uColor, alpha * (0.3 + vSeed * 0.55));",
    "}",
  ].join("\n");

  var state = {
    caps: null,
    section: null,
    pin: null,
    canvas: null,
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    material: null,
    running: false,
    visible: true,
    amplitude: 0,
    clockStart: 0,
    loading: false,
  };

  function init(caps) {
    state.caps = caps;
    state.section = document.querySelector(".music");
    state.pin = document.querySelector("[data-music-pin]");
    state.canvas = document.querySelector("[data-music-canvas]");
    if (!state.section || !state.canvas) return;

    initAmbientToggle();

    var shouldRun = caps.webglSupported && !caps.reducedMotion && !caps.lowPower;
    if (!shouldRun) return; // CSS fallback stays visible

    if (!("IntersectionObserver" in window)) {
      // No IO support — just run it, there is no cheap way to lazy-init.
      Clinic.loadThree().then(bootstrap);
      return;
    }

    var observer = new IntersectionObserver(handleApproach, {
      rootMargin: "150% 0px 150% 0px",
      threshold: 0,
    });
    observer.observe(state.section);

    document.addEventListener("visibilitychange", function () {
      state.visible = document.visibilityState === "visible";
    });
  }

  function handleApproach(entries) {
    var entry = entries[0];
    if (entry.isIntersecting) {
      if (!state.scene && !state.loading) {
        state.loading = true;
        Clinic.loadThree().then(function (THREE) {
          state.loading = false;
          bootstrap(THREE);
        });
      } else if (state.scene) {
        resume();
      }
    } else {
      dispose(); // far off-screen — release GPU resources (spec §15)
    }
  }

  function bootstrap(THREE) {
    state.THREE = THREE;
    var canvas = state.canvas;

    state.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    state.renderer.setClearColor(0x000000, 0);

    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    state.camera.position.z = 2.4;

    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var seeds = new Float32Array(PARTICLE_COUNT);
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
      seeds[i] = Math.random();
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    state.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, MAX_DPR) },
        uColor: { value: new THREE.Vector3(GOLD[0], GOLD[1], GOLD[2]) },
      },
    });

    var points = new THREE.Points(geometry, state.material);
    state.scene.add(points);

    resize();
    window.addEventListener("resize", resize);

    state.section.classList.add("is-gl-active");
    state.clockStart = performance.now();
    resume();
  }

  function resize() {
    if (!state.renderer) return;
    var canvas = state.canvas;
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
  }

  function resume() {
    if (state.running) return;
    state.running = true;
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.running) return;
    requestAnimationFrame(tick);
    if (!state.visible || !state.renderer) return;

    // Amplitude eases up as the pinned panel enters the viewport (spec §7).
    var target = amplitudeTarget();
    state.amplitude += (target - state.amplitude) * 0.05;

    var t = (now - state.clockStart) / 1000;
    state.material.uniforms.uTime.value = t;
    state.material.uniforms.uAmplitude.value = state.amplitude;
    state.renderer.render(state.scene, state.camera);
  }

  function amplitudeTarget() {
    var el = state.pin || state.section;
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var progress = 1 - Math.min(Math.abs(rect.top), vh) / vh;
    return Math.max(0, Math.min(1, progress));
  }

  function dispose() {
    state.running = false;
    if (!state.scene) return;

    state.scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    if (state.renderer) {
      state.renderer.dispose();
    }
    window.removeEventListener("resize", resize);

    state.scene = null;
    state.camera = null;
    state.material = null;
    state.renderer = null;
    state.amplitude = 0;
    if (state.section) state.section.classList.remove("is-gl-active");
  }

  /* ---------- Optional muted ambient drone (spec §13) ---------- */

  function initAmbientToggle() {
    var btn = document.querySelector("[data-ambient-toggle]");
    if (!btn) return;

    var ctx = null;
    var nodes = null;
    var playing = false;

    btn.addEventListener("click", function () {
      if (playing) {
        stop();
      } else {
        start();
      }
    });

    function start() {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!ctx) ctx = new AudioCtor();
      if (ctx.state === "suspended") ctx.resume();

      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var filter = ctx.createBiquadFilter();
      var gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.value = 110; // low A — a quiet, cello-adjacent drone
      osc2.type = "sine";
      osc2.frequency.value = 164.81; // fifth above — consonant, unobtrusive

      filter.type = "lowpass";
      filter.frequency.value = 900;

      gain.gain.value = 0;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);

      nodes = { osc1: osc1, osc2: osc2, gain: gain };
      playing = true;
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Ambient · On";
    }

    function stop() {
      if (!nodes || !ctx) return;
      var current = nodes;
      current.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(function () {
        current.osc1.stop();
        current.osc2.stop();
      }, 850);
      nodes = null;
      playing = false;
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "Ambient · Off";
    }
  }

  Clinic.MusicGL = { init: init };
})();
