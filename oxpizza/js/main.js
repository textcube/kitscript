/* 자잘한 마감 */
(function () {
  "use strict";

  // 푸터 연도
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // 인트로가 끝나면 흔적을 지운다. 스크롤 잠금을 반드시 풀어야 하므로
  // 애니메이션 이벤트가 아니라 타이머로 보장한다.
  var root = document.documentElement;
  if (root.classList.contains("oven-on")) {
    setTimeout(function () { root.classList.remove("oven-on"); }, 1900);
  }

  // 고정 헤더 높이만큼 앵커 스크롤 위치를 보정한다
  var header = document.querySelector("[data-nav]");
  if (!header) return;

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href^='#']");
    if (!link) return;

    var id = link.getAttribute("href");
    if (id === "#" || id.length < 2) return;

    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });

    // 주소창에도 반영하되 기록은 남기지 않는다
    if (history.replaceState) history.replaceState(null, "", id);
  });
})();
