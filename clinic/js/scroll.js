(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  function init() {
    var progress = document.querySelector("[data-scroll-progress]");
    var revealItems = document.querySelectorAll(".section-pad, .program-card, .tier");

    updateProgress(progress);
    window.addEventListener("scroll", function () {
      updateProgress(progress);
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      revealItems.forEach(function (item) {
        item.classList.add("reveal-ready");
        observer.observe(item);
      });
    }
  }

  function updateProgress(progress) {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
  }

  Clinic.Scroll = { init: init };
})();
