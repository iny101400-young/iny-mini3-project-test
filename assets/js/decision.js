/* Decision 화면: Compare 조건 + data/buildwise_v1.json → 판단 결과 표시
   기준: docs/PROTOTYPE_V1_DECISION_RULES.md, docs/WIREFRAME_04_DECISION.md
   판단 규칙은 buildwise-rules.js, 판단 문구·배지는 buildwise-ui.js를 Report와 함께 쓴다. */
(function () {
  "use strict";

  var R = window.BuildWiseRules;
  var UI = window.BuildWiseUI;
  var L = UI.LABELS;

  function $(id) { return document.getElementById(id); }

  function showOnly(stateId) {
    $("result").hidden = true;
    $(stateId).hidden = false;
  }

  function renderTop(cond, result) {
    var c = result.counts;
    UI.setText("verdict-title", L.verdict[result.verdict]);
    UI.setText("verdict-desc", UI.verdictSummary(result));

    UI.setText("in-budget", UI.usd(cond.budget) + " 이하");
    UI.setText("in-citation", L.choice[cond.citation]);
    UI.setText("in-ocr", L.choice[cond.ocr]);

    UI.setText("m-total", String(c.total));
    UI.setText("m-in-budget", String(c.inBudget));
    UI.setText("m-ok", String(c.ok));
    UI.setText("m-check", String(c.check));

    var d = L.direction[result.verdict];
    UI.setText("direction-title", d.title);
    UI.setText("direction-body", d.body);
  }

  function renderCandidates(result) {
    var c = result.counts;
    UI.setText("c-ok", String(c.ok));
    UI.setText("c-check", String(c.check));
    UI.setText("c-over", String(c.over));

    var html = "";
    var lastGroup = null;
    result.ordered.forEach(function (row) {
      var it = row.item;
      if (row.status !== lastGroup) {
        lastGroup = row.status;
        html += '<tr class="group-row"><td colspan="8">' + L.group[row.status] + " · " + c[row.status] + "개</td></tr>";
      }
      var gaps = row.status === "check" ? row.gaps.map(function (g) { return L.feature[g]; }).join(", ") : "—";
      html += "<tr>" +
        '<td class="cell-name">' + UI.esc(it.name) + "</td>" +
        '<td class="num">' + UI.usd(it.price, true) + "</td>" +
        '<td class="cell-raw">' + UI.esc(it.price_raw || "—") + "</td>" +
        "<td>" + UI.featureBadge(row.citation) + "</td>" +
        "<td>" + UI.featureBadge(row.ocr) + "</td>" +
        "<td>" + UI.badge(row.status) + "</td>" +
        "<td>" + UI.esc(gaps) + "</td>" +
        "<td>" + UI.sourceLink(it.detail_url) + "</td>" +
        "</tr>";
    });
    $("candidate-rows").innerHTML = html;
  }

  function renderGap(cond, result) {
    var items = [];
    ["citation", "ocr"].forEach(function (key) {
      var targets = result.gapTargets[key];
      if (cond[key] === "required" && targets.length) {
        items.push('<li><p class="result-list__title">' + L.feature[key] + " 지원 여부 추가 확인</p>" +
          '<p class="result-list__meta">대상 후보 ' + targets.length + "개: " +
          UI.esc(targets.map(function (r) { return r.item.name; }).join(", ")) + "</p></li>");
      }
    });
    if (!items.length) {
      items.push('<li><p class="result-list__title">현재 필수 조건 기준으로 추가 확인이 필요한 후보가 없습니다.</p></li>');
    }
    var excluded = ["citation", "ocr"].filter(function (k) { return cond[k] === "optional"; })
      .map(function (k) { return L.feature[k]; });
    if (excluded.length) {
      items.push('<li><p class="result-list__meta">' + UI.esc(excluded.join(", ")) +
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
      return '<li><span class="checklist__box" aria-hidden="true"></span><span class="checklist__text">' + UI.esc(t) + "</span></li>";
    }).join("");
  }

  function render(cond, items) {
    var result = R.evaluate(items, cond);
    var empty = result.verdict === "none";

    renderTop(cond, result);
    UI.setText("ev-count", items.length + "개");
    UI.setText("ev-scraped", UI.scrapedAtText(items));

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

  UI.loadItems()
    .then(function (items) { render(cond, items); })
    .catch(function () { showOnly("state-error"); });
})();
