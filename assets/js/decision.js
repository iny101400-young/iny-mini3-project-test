/* Decision 화면: Compare 조건 + data/buildwise_v1.json → 판단 결과 표시
   기준: docs/PROTOTYPE_V1_DECISION_RULES.md, docs/WIREFRAME_04_DECISION.md
   판단 규칙은 assets/js/buildwise-rules.js 한 곳에만 둔다. */
(function () {
  "use strict";

  var R = window.BuildWiseRules;
  var DATA_URL = "data/buildwise_v1.json";

  var CHOICE_LABEL = { required: "필요함", optional: "상관없음" };
  var VERDICT_TITLE = {
    use: "기존 솔루션 활용 후보 있음",
    verify: "기존 솔루션 + 추가 확인 필요",
    none: "현재 조건에서 후보 없음"
  };
  var DIRECTION = {
    use: {
      title: "기존 SaaS 우선 검토",
      body: "현재 입력한 조건을 충족하는 후보가 확인됩니다. 기존 SaaS 검토를 우선하고, 도입 전 상세 요금제와 운영 조건을 확인해 주세요."
    },
    verify: {
      title: "기존 SaaS 후보 검토 + 추가 확인",
      body: "예산 범위 내 후보가 존재하지만 일부 필수 기능은 현재 데이터만으로 확인할 수 없습니다. 후보 원문에서 해당 조건을 추가로 확인해 주세요."
    },
    none: {
      title: "예산 조건 조정 후 재검토",
      body: "현재 입력한 예산 범위에서는 비교 가능한 후보가 없습니다. 이 결과는 기능 부족이나 추가 개발 필요를 의미하지 않습니다."
    }
  };
  var STATUS = {
    ok: { cls: "badge--ok", icon: "✓", label: "충족" },
    check: { cls: "badge--check", icon: "?", label: "확인 필요" },
    over: { cls: "badge--over", icon: "!", label: "예산 초과" }
  };
  var GROUP_LABEL = { ok: "모든 필수 조건 충족", check: "추가 확인 필요", over: "예산 초과" };
  var GAP_LABEL = { citation: "Citation", ocr: "OCR" };

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function usd(n, fixed) {
    return "$" + n.toLocaleString("en-US", fixed
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumFractionDigits: 2 });
  }

  function badge(state, label) {
    var s = STATUS[state];
    return '<span class="badge ' + s.cls + '"><span class="badge__icon" aria-hidden="true">' + s.icon + "</span>" +
      esc(label || s.label) + "</span>";
  }

  // 데이터에서 확인된 기능 상태: "미지원"이라는 표현은 쓰지 않는다.
  function featureBadge(state) {
    return state === "ok" ? badge("ok", "지원 확인") : badge("check", "확인 필요");
  }

  function setText(id, text) {
    var el = $(id);
    el.textContent = text;
    el.classList.remove("value-empty", "metric__value--empty");
  }

  function formatScrapedAt(value) {
    var m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2}|Z)$/.exec(value);
    return m ? m[1] + " " + m[2] + " (UTC" + (m[3] === "Z" ? "" : m[3]) + ")" : value;
  }

  function showOnly(stateId) {
    $("result").hidden = true;
    $(stateId).hidden = false;
  }

  function isValidData(items) {
    return Array.isArray(items) && items.length > 0 && items.every(function (it) {
      return it && typeof it.name === "string" && typeof it.price === "number" && isFinite(it.price);
    });
  }

  function renderTop(cond, result) {
    var c = result.counts;
    setText("verdict-title", VERDICT_TITLE[result.verdict]);
    var desc = {
      use: "예산 내 후보 " + c.inBudget + "개 중 " + c.ok + "개가 입력한 필수 조건을 모두 충족합니다.",
      verify: "예산 내 후보 " + c.inBudget + "개 모두 일부 필수 조건을 현재 데이터만으로 확인할 수 없습니다.",
      none: "현재 입력한 예산 범위에서는 비교 가능한 후보가 없습니다."
    }[result.verdict];
    setText("verdict-desc", desc);

    setText("in-budget", usd(cond.budget) + " 이하");
    setText("in-citation", CHOICE_LABEL[cond.citation]);
    setText("in-ocr", CHOICE_LABEL[cond.ocr]);

    setText("m-total", String(c.total));
    setText("m-in-budget", String(c.inBudget));
    setText("m-ok", String(c.ok));
    setText("m-check", String(c.check));

    var d = DIRECTION[result.verdict];
    setText("direction-title", d.title);
    setText("direction-body", d.body);
  }

  function renderCandidates(result) {
    var c = result.counts;
    setText("c-ok", String(c.ok));
    setText("c-check", String(c.check));
    setText("c-over", String(c.over));

    var html = "";
    var lastGroup = null;
    result.ordered.forEach(function (row) {
      var it = row.item;
      if (row.status !== lastGroup) {
        lastGroup = row.status;
        html += '<tr class="group-row"><td colspan="8">' + GROUP_LABEL[row.status] + " · " + c[row.status] + "개</td></tr>";
      }
      var gaps = row.status === "check" ? row.gaps.map(function (g) { return GAP_LABEL[g]; }).join(", ") : "—";
      html += "<tr>" +
        '<td class="cell-name">' + esc(it.name) + "</td>" +
        '<td class="num">' + usd(it.price, true) + "</td>" +
        '<td class="cell-raw">' + esc(it.price_raw || "—") + "</td>" +
        "<td>" + featureBadge(row.citation) + "</td>" +
        "<td>" + featureBadge(row.ocr) + "</td>" +
        "<td>" + badge(row.status) + "</td>" +
        "<td>" + esc(gaps) + "</td>" +
        "<td>" + (it.detail_url
          ? '<a class="link-out" href="' + esc(it.detail_url) + '" target="_blank" rel="noopener">원문 보기 ↗</a>'
          : "—") + "</td>" +
        "</tr>";
    });
    $("candidate-rows").innerHTML = html;
  }

  function renderGap(cond, result) {
    var items = [];
    ["citation", "ocr"].forEach(function (key) {
      var targets = result.gapTargets[key];
      if (cond[key] === "required" && targets.length) {
        items.push('<li><p class="result-list__title">' + GAP_LABEL[key] + " 지원 여부 추가 확인</p>" +
          '<p class="result-list__meta">대상 후보 ' + targets.length + "개: " +
          esc(targets.map(function (r) { return r.item.name; }).join(", ")) + "</p></li>");
      }
    });
    if (!items.length) {
      items.push('<li><p class="result-list__title">현재 필수 조건 기준으로 추가 확인이 필요한 후보가 없습니다.</p></li>');
    }
    var excluded = ["citation", "ocr"].filter(function (k) { return cond[k] === "optional"; })
      .map(function (k) { return GAP_LABEL[k]; });
    if (excluded.length) {
      items.push('<li><p class="result-list__meta">' + esc(excluded.join(", ")) +
        ": 상관없음 선택 — 현재 비교의 필수 조건에서 제외</p></li>");
    }
    $("gap-list").innerHTML = items.join("");
  }

  function renderNext(result) {
    var list = result.verdict === "use"
      ? ["조건 충족 후보의 공식 요금제 재확인", "사용자 수 과금 조건 확인", "실제 처리 한도 확인", "조직 보안 / 데이터 정책 적합성 검토"]
      : ["상세 요금제 확인", "사용자 수 과금 확인", "처리 한도 확인", "조직 보안 / 데이터 정책 확인"];
    if (result.counts.check > 0) list.push("확인 필요 후보의 원문 페이지 확인");
    $("next-list").innerHTML = list.map(function (t) {
      return '<li><span class="checklist__box" aria-hidden="true"></span><span class="checklist__text">' + esc(t) + "</span></li>";
    }).join("");
  }

  function renderEvidence(items) {
    setText("ev-count", items.length + "개");
    var stamps = items.map(function (it) { return it.scraped_at; }).filter(Boolean)
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    setText("ev-scraped", stamps.length ? stamps.map(formatScrapedAt).join(", ") : "—");
  }

  function render(cond, items) {
    var result = R.evaluate(items, cond);
    var empty = result.verdict === "none";

    renderTop(cond, result);
    renderEvidence(items);

    // 후보 없음: 비교표·Gap·다음 확인 목록을 숨기고 예산 재입력 CTA만 보여 준다.
    $("section-candidates").hidden = empty;
    $("section-gap").hidden = empty;
    $("section-next").hidden = empty;
    $("empty-cta").hidden = !empty;

    if (!empty) {
      renderCandidates(result);
      renderGap(cond, result);
      renderNext(result);
    }

    var query = R.toQuery(cond);
    $("report-link").href = "report.html?" + query;
    $("reinput-link").href = "compare.html?" + query;
    $("empty-cta-link").href = "compare.html?" + query;
    $("result").setAttribute("aria-busy", "false");
  }

  var cond = R.parseConditions(window.location.search);
  if (!cond) { showOnly("state-invalid"); return; }

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (items) {
      if (!isValidData(items)) throw new Error("invalid data");
      render(cond, items);
    })
    .catch(function () { showOnly("state-error"); });
})();
