/* 스크롤 진행 막대 + 등장 연출 + 현재 섹션 표시 */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 진행 막대 ---------- */
  var bar = document.querySelector("[data-scroll-progress]");
  if (bar && !reduced) {
    var ticking = false;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 등장 연출 ---------- */
  var targets = document.querySelectorAll("[data-reveal], [data-reveal-group], [data-reveal-wipe]");

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);   // 한 번 들어오면 그대로 둔다
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    targets.forEach(function (el) { io.observe(el); });

    // 안전장치: 등장 연출은 opacity:0 에서 시작하므로, 관찰자가 어떤 이유로든
    // 콜백을 주지 않으면 본문이 영영 보이지 않는다. 첫 화면 몫만 시간으로 보장한다.
    setTimeout(function () {
      targets.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    }, 1200);
  }

  /* ---------- 현재 섹션 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(function (s) { spy.observe(s); });
})();
