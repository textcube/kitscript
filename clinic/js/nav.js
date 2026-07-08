/*
  nav.js
  Fixed nav: frosted-glass state after 100vh scroll, and the mobile
  "Menu" full-screen overlay (spec §7, §14, §17). No dependency on the
  motion stack — works even if GSAP/Lenis fail to load from the CDN.
*/

(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  function init() {
    var header = document.querySelector("[data-nav]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var overlay = document.querySelector("[data-menu-overlay]");
    var closeBtn = overlay ? overlay.querySelector("[data-menu-close]") : null;

    if (!header) return;

    initFrostedGlass(header);
    if (toggle && overlay) {
      initMobileMenu(toggle, overlay, closeBtn);
    }
  }

  function initFrostedGlass(header) {
    var threshold = window.innerHeight;
    var ticking = false;

    function apply() {
      var frosted = window.scrollY > threshold;
      header.classList.toggle("is-frosted", frosted);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      threshold = window.innerHeight;
    });

    apply();
  }

  function initMobileMenu(toggle, overlay, closeBtn) {
    var lastFocused = null;

    function openMenu() {
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var firstLink = overlay.querySelector("a");
      if (firstLink) firstLink.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeMenu() {
      overlay.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    toggle.addEventListener("click", function () {
      var isOpen = overlay.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeMenu);
    }

    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  Clinic.Nav = { init: init };
})();
