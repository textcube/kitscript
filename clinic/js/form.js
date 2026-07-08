(function () {
  "use strict";

  window.Clinic = window.Clinic || {};

  function init() {
    var form = document.querySelector("[data-reserve-form]");
    if (!form) return;

    var errorEl = form.querySelector("[data-form-error]");
    var confirmEl = form.querySelector("[data-form-confirm]");
    var submitBtn = form.querySelector("[data-form-submit]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var result = validate(form);
      if (!result.valid) {
        showError(errorEl, result.message);
        var invalidField = form.querySelector('[name="' + result.field + '"]');
        if (invalidField) invalidField.focus();
        return;
      }

      showError(errorEl, "");
      form.setAttribute("data-submitted", "true");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }
      if (confirmEl) {
        confirmEl.hidden = false;
        confirmEl.focus();
      }
    });
  }

  function validate(form) {
    var name = form.querySelector('[name="name"]');
    var contact = form.querySelector('[name="contact"]');
    var time = form.querySelector('[name="time"]');

    if (!name || !name.value.trim()) {
      return { valid: false, field: "name", message: "성함을 알려주세요." };
    }

    if (!contact || !contact.value.trim()) {
      return { valid: false, field: "contact", message: "연락 가능한 연락처를 남겨주세요." };
    }

    var contactValue = contact.value.trim();
    var phonePattern = /^[0-9+\-()\s]{7,20}$/;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phonePattern.test(contactValue) && !emailPattern.test(contactValue)) {
      return { valid: false, field: "contact", message: "전화번호 또는 이메일 형식으로 입력해주세요." };
    }

    if (!time || !time.value.trim()) {
      return { valid: false, field: "time", message: "희망하시는 시간을 알려주세요." };
    }

    return { valid: true };
  }

  function showError(errorEl, message) {
    if (errorEl) errorEl.textContent = message;
  }

  Clinic.Form = { init: init };
})();
