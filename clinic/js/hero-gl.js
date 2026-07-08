/*
  hero-gl.js
  Hero breathing gradient field (spec §15.1): a full-screen Three.js
  plane running a fragment shader that blends ivory/stone/gold noise
  on a ~10s breathing cycle (~6 cycles/min). Three.js itself is only
  fetched when this scene will actually run — never on reduced-motion,
  no-WebGL, or low-capability devices, which get the CSS fallback
  gradient defined in sections.css instead.
*/

(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  var VERT = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = vec4(position, 1.0);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform float uTime;",
    "uniform vec2 uResolution;",
    "varying vec2 vUv;",

    "const vec3 ivory = vec3(0.961, 0.945, 0.918);",
    "const vec3 stone = vec3(0.894, 0.867, 0.827);",
    "const vec3 gold  = vec3(0.690, 0.553, 0.341);",

    "float hash(vec2 p) {",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",

    "float noise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
    "}",

    "float fbm(vec2 p) {",
    "  float value = 0.0;",
    "  float amp = 0.5;",
    "  for (int i = 0; i < 4; i++) {",
    "    value += amp * noise(p);",
    "    p *= 2.0;",
    "    amp *= 0.5;",
    "  }",
    "  return value;",
    "}",

    "void main() {",
    "  vec2 uv = vUv;",
    "  vec2 aspectUv = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) + 0.5;",

    /* ~6 cycles/min == period of 10s == angular speed 2*PI/10 */
    "  float breath = sin(uTime * 0.6283) * 0.5 + 0.5;",

    "  vec2 flow = aspectUv * 1.6 + vec2(uTime * 0.018, uTime * 0.012);",
    "  float n1 = fbm(flow + breath * 0.35);",
    "  float n2 = fbm(flow * 1.7 - uTime * 0.01);",

    "  float mixA = smoothstep(0.2, 0.85, n1);",
    "  float mixB = smoothstep(0.35, 0.95, n2 * (0.6 + breath * 0.4));",

    "  vec3 color = mix(ivory, stone, mixA);",
    "  color = mix(color, gold, mixB * 0.32);",

    "  float vign = smoothstep(1.15, 0.15, length(uv - 0.5));",
    "  color = mix(ivory, color, vign);",

    "  gl_FragColor = vec4(color, 1.0);",
    "}",
  ].join("\n");

  var MAX_DPR = 1.5;

  var state = {
    renderer: null,
    scene: null,
    camera: null,
    material: null,
    canvas: null,
    section: null,
    running: false,
    visible: true,
    inView: true,
    clockStart: 0,
  };

  function init(caps) {
    state.section = document.querySelector(".hero");
    state.canvas = document.querySelector("[data-hero-canvas]");
    if (!state.section || !state.canvas) return;

    var shouldRun = caps.webglSupported && !caps.reducedMotion && !caps.lowPower;
    if (!shouldRun) {
      return; // CSS fallback gradient stays visible (default state)
    }

    Clinic.loadThree()
      .then(function (THREE) {
        start(THREE);
      })
      .catch(function () {
        // Network/CDN failure — keep the CSS fallback, no error surfaced to the visitor.
      });
  }

  function start(THREE) {
    var canvas = state.canvas;
    var section = state.section;

    state.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

    state.scene = new THREE.Scene();
    state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    state.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
    });

    var geometry = new THREE.PlaneGeometry(2, 2);
    var mesh = new THREE.Mesh(geometry, state.material);
    state.scene.add(mesh);

    resize();
    window.addEventListener("resize", resize);

    document.addEventListener("visibilitychange", function () {
      state.visible = document.visibilityState === "visible";
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          state.inView = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(section);
    }

    section.classList.add("is-gl-active");
    state.clockStart = performance.now();
    state.running = true;
    requestAnimationFrame(tick);
  }

  function resize() {
    if (!state.renderer) return;
    var canvas = state.canvas;
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    state.renderer.setSize(width, height, false);
    state.material.uniforms.uResolution.value.set(width, height);
  }

  function tick(now) {
    if (!state.running) return;
    requestAnimationFrame(tick);

    if (!state.visible || !state.inView) return; // paused (spec §15)

    var t = (now - state.clockStart) / 1000;
    state.material.uniforms.uTime.value = t;
    state.renderer.render(state.scene, state.camera);
  }

  Clinic.HeroGL = { init: init };
})();
