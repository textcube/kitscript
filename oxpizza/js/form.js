/* 예약 문의 폼.
   보내는 곳이 아직 없으므로 검증만 하고 안내 문구로 바꾼다.
   TODO: 실제 접수처(메일/폼 서비스/캐치테이블 연동)가 정해지면 submit 을 연결할 것. */
(function () {
  "use strict";

  var form = document.querySelector("[data-reserve-form]");
  if (!form) return;

  var fields = form.querySelector("[data-form-fields]");
  var errorBox = form.querySelector("[data-form-error]");
  var submit = form.querySelector("[data-form-submit]");
  var confirm = form.querySelector("[data-form-confirm]");

  var LABEL = { name: "이름", contact: "연락처", time: "희망 시간" };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var missing = [];
    ["name", "contact", "time"].forEach(function (key) {
      var input = form.elements[key];
      if (input && !input.value.trim()) missing.push(LABEL[key]);
    });

    if (missing.length) {
      errorBox.textContent = missing.join(", ") + " 을(를) 입력해 주세요.";
      var first = form.querySelector("input:invalid, input[value='']") ||
                  form.elements[["name", "contact", "time"].filter(function (k) {
                    return form.elements[k] && !form.elements[k].value.trim();
                  })[0]];
      if (first && first.focus) first.focus();
      return;
    }

    errorBox.textContent = "";
    if (fields) fields.hidden = true;
    if (submit) submit.hidden = true;
    if (confirm) {
      confirm.hidden = false;
      confirm.focus();
    }
  });

  // 입력을 다시 시작하면 오류 문구를 지운다
  form.addEventListener("input", function () {
    if (errorBox.textContent) errorBox.textContent = "";
  });
})();
