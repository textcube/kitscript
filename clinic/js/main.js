/*
  main.js
  Bootstraps every module once the DOM is ready, and hosts the two
  things every other module leans on: capability detection and the
  shared, lazy, one-time Three.js loader (spec §15, §18 — "Three.js
  loaded lazily only when WebGL will run").
*/

(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  var THREE_CDN_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

  /**
   * Lazily fetches Three.js as an ES module via dynamic import — this
   * only touches the network the first time a caller actually needs a
   * WebGL scene, and the promise is cached so hero-gl and music-gl
   * share a single fetch.
   */
  Clinic.loadThree = function loadThree() {
    if (!Clinic._threePromise) {
      Clinic._threePromise = import(THREE_CDN_URL);
    }
    return Clinic._threePromise;
  };

  /**
   * A conservative, dependency-free capability check: WebGL support,
   * the visitor's stated motion preference, and a rough "is this a
   * low-power device" heuristic. Any one failure sends the hero and
   * Music Night scenes to their CSS fallbacks (spec §14, §15, §17).
   */
  function getCapabilities() {
    return {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      webglSupported: detectWebGL(),
      lowPower: detectLowPower(),
    };
  }

  function detectWebGL() {
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      return false;
    }
  }

  function detectLowPower() {
    var lowCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 3;
    var lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2;
    return Boolean(lowCores || lowMemory);
  }

  function bootstrap() {
    var caps = getCapabilities();
    Clinic.capabilities = caps;

    if (Clinic.Nav) Clinic.Nav.init();
    if (Clinic.Form) Clinic.Form.init();
    if (Clinic.Scroll) Clinic.Scroll.init();
    if (Clinic.HeroGL) Clinic.HeroGL.init(caps);
    if (Clinic.MusicGL) Clinic.MusicGL.init(caps);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
