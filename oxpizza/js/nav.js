/* 헤더 상태 + 모바일 메뉴 오버레이 */
(function () {
  "use strict";

  var header = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var overlay = document.querySelector("[data-menu-overlay]");
  var closeBtn = document.querySelector("[data-menu-close]");

  if (header) {
    var solid = function () {
      header.classList.toggle("is-solid", window.scrollY > 24);
    };
    solid();
    window.addEventListener("scroll", solid, { passive: true });
  }

  if (!toggle || !overlay) return;

  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = overlay.querySelector("a, button");
    if (first) first.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  toggle.addEventListener("click", function () {
    if (overlay.classList.contains("is-open")) close();
    else open();
  });

  if (closeBtn) closeBtn.addEventListener("click", close);

  // 메뉴 안의 링크를 누르면 닫고 해당 섹션으로 이동한다
  overlay.addEventListener("click", function (e) {
    if (e.target.closest("a[href^='#']")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  // 넓은 화면으로 돌아가면 열린 채로 남지 않게 한다
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
    if (e.matches && overlay.classList.contains("is-open")) close();
  });
})();
