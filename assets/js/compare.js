/* Compare 화면: 입력 요약 실시간 반영 + 문서 기준 검증 + Decision 이동
   기준: docs/WIREFRAME_03_COMPARE.md */
(function () {
  "use strict";

  var form = document.getElementById("compare-form");
  if (!form) return;

  // 브라우저 기본 검증 대신 아래 문구를 사용한다 (JS가 없으면 기본 required가 동작).
  form.noValidate = true;

  var MESSAGES = {
    budgetEmpty: "월 예산을 입력해 주세요.",
    budgetInvalid: "0보다 큰 월 예산을 입력해 주세요.",
    citation: "출처 인용 필요 여부를 선택해 주세요.",
    ocr: "OCR 필요 여부를 선택해 주세요."
  };
  // 사용자 화면에는 required / optional 대신 이 문구만 보여 준다.
  var CHOICE_LABEL = { required: "필요함", optional: "상관없음" };

  var budgetInput = form.elements.budget;

  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function formatUsd(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function setSummary(id, text) {
    var el = document.getElementById(id);
    el.textContent = text || (id === "sum-budget" ? "미입력" : "미선택");
    el.classList.toggle("value-empty", !text);
  }

  // 입력 요약 패널을 현재 입력값으로 갱신한다.
  function updateSummary() {
    var raw = budgetInput.value.trim();
    var n = Number(raw);
    setSummary("sum-budget", raw !== "" && isFinite(n) && n > 0 ? formatUsd(n) + " 이하" : "");
    setSummary("sum-citation", CHOICE_LABEL[checked("citation")] || "");
    setSummary("sum-ocr", CHOICE_LABEL[checked("ocr")] || "");
  }

  function showError(key, message) {
    var block = document.getElementById("block-" + key);
    var error = document.getElementById("error-" + key);
    block.classList.toggle("is-invalid", !!message);
    error.textContent = message || "";
    error.hidden = !message;
    if (key === "budget") budgetInput.setAttribute("aria-invalid", message ? "true" : "false");
  }

  // 세 입력을 검사하고, 문제 있는 항목의 메시지를 해당 Input Block 안에 표시한다.
  function validate() {
    var errors = {};
    var raw = budgetInput.value.trim();
    var n = Number(raw);
    if (raw === "") errors.budget = MESSAGES.budgetEmpty;
    else if (!isFinite(n) || n <= 0) errors.budget = MESSAGES.budgetInvalid;
    if (!checked("citation")) errors.citation = MESSAGES.citation;
    if (!checked("ocr")) errors.ocr = MESSAGES.ocr;

    ["budget", "citation", "ocr"].forEach(function (key) { showError(key, errors[key]); });
    return errors;
  }

  // 입력하면 요약을 바로 갱신하고, 이미 표시된 오류는 해당 항목만 다시 검사한다.
  form.addEventListener("input", function (e) {
    updateSummary();
    var key = e.target.name;
    var block = document.getElementById("block-" + key);
    if (block && block.classList.contains("is-invalid")) {
      var errors = {};
      var raw = budgetInput.value.trim();
      var n = Number(raw);
      if (key === "budget") errors.budget = raw === "" ? MESSAGES.budgetEmpty : (!isFinite(n) || n <= 0 ? MESSAGES.budgetInvalid : "");
      showError(key, errors[key] || "");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = validate();
    var keys = Object.keys(errors);
    if (keys.length) {
      // 첫 번째 문제 항목으로 이동한다.
      var first = keys[0] === "budget" ? budgetInput : form.querySelector('input[name="' + keys[0] + '"]');
      first.focus();
      return;
    }
    var query = "budget=" + encodeURIComponent(Number(budgetInput.value.trim())) +
      "&citation=" + encodeURIComponent(checked("citation")) +
      "&ocr=" + encodeURIComponent(checked("ocr"));
    window.location.href = "decision.html?" + query;
  });

  // Decision에서 "조건 다시 입력하기"로 돌아온 경우, 사용자가 입력했던 값을 다시 채운다.
  (function restoreFromQuery() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("budget")) budgetInput.value = params.get("budget");
    ["citation", "ocr"].forEach(function (name) {
      var v = params.get(name);
      var el = v && form.querySelector('input[name="' + name + '"][value="' + (v === "optional" || v === "required" ? v : "") + '"]');
      if (el) el.checked = true;
    });
  })();

  updateSummary();
})();
