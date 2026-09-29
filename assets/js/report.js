/* Decision Report: Decision과 같은 query · 같은 JSON · 같은 규칙으로 문서형 리포트를 만든다.
   기준: docs/PROTOTYPE_V1_DECISION_REPORT.md, docs/WIREFRAME_05_DECISION_REPORT.md
   판단은 BuildWiseRules.evaluate 결과만 사용하고, 여기서 새 판단 규칙을 만들지 않는다. */
(function () {
  "use strict";

  var R = window.BuildWiseRules;
  var UI = window.BuildWiseUI;
  var L = UI.LABELS;

  function $(id) { return document.getElementById(id); }

  function listHtml(lines) {
    return lines.map(function (t) { return "<li>" + UI.esc(t) + "</li>"; }).join("");
  }

  function checklistHtml(lines) {
    return lines.map(function (t) {
      return '<li><span class="checklist__box" aria-hidden="true"></span><span class="checklist__text">' + UI.esc(t) + "</span></li>";
    }).join("");
  }

  function showOnly(stateId) {
    $("report-wrap").hidden = true;
    $(stateId).hidden = false;
  }

  // 예산 내 후보 중 해당 기능이 데이터에서 확인된 후보 수
  function confirmedInBudget(result, key) {
    return result.ordered.filter(function (r) { return r.inBudget && r[key] === "ok"; }).length;
  }

  function renderExecutive(result, empty) {
    var d = L.direction[result.verdict];
    if (empty) {
      // WIREFRAME_05 Empty Report State 문구
      UI.setText("exec-verdict", "현재 조건에서 비교 가능한 후보가 없습니다.");
      UI.setText("exec-summary", "현재 입력한 예산 범위에서는 비교 가능한 후보가 없습니다. 이 결과는 기능 부족이나 추가 개발 필요를 의미하지 않습니다.");
      UI.setText("exec-verdict-name", "판단: " + L.verdict.none);
      $("exec-verdict-name").hidden = false;
      UI.setText("exec-direction-title", d.title);
      $("exec-direction-body").hidden = true; // 위 설명과 같은 문장이므로 반복하지 않는다
    } else {
      UI.setText("exec-verdict", L.verdict[result.verdict]);
      UI.setText("exec-summary", UI.verdictSummary(result));
      UI.setText("exec-direction-title", d.title);
      UI.setText("exec-direction-body", d.body);
    }
  }

  function renderInputsAndNumbers(cond, result) {
    UI.setText("in-budget", UI.usd(cond.budget) + " 이하");
    UI.setText("in-citation", L.choice[cond.citation]);
    UI.setText("in-ocr", L.choice[cond.ocr]);

    var c = result.counts;
    UI.setText("m-total", String(c.total));
    UI.setText("m-in-budget", String(c.inBudget));
    UI.setText("m-ok", String(c.ok));
    UI.setText("m-check", String(c.check));
  }

  function renderKnowNeed(cond, result, empty) {
    var c = result.counts;
    if (empty) {
      $("known-list").innerHTML = listHtml([
        "현재 입력한 예산 범위 내 비교 가능한 후보 없음",
        "기능 부족 여부는 현재 결과만으로 판단할 수 없음",
        "추가 개발 필요 여부도 현재 결과만으로 판단하지 않음"
      ]);
      $("need-block").hidden = true;
      return;
    }

    // 현재 결과에서 계산되는 사실만 적는다.
    var known = ["예산 범위 내 후보 " + c.inBudget + "개 확인 (전체 " + c.total + "개 중)"];
    known.push(c.ok > 0
      ? "모든 필수 조건이 확인된 후보 " + c.ok + "개 존재"
      : "모든 필수 조건이 현재 데이터에서 확인된 후보는 없음");
    ["citation", "ocr"].forEach(function (key) {
      var n = confirmedInBudget(result, key);
      if (n > 0) known.push("예산 내 후보 중 " + L.feature[key] + " 지원 확인 " + n + "개");
      if (cond[key] === "optional") known.push(L.feature[key] + ": 상관없음 선택 — 현재 비교의 필수 조건에서 제외");
    });
    $("known-list").innerHTML = listHtml(known);

    // A. 후보 데이터에서 확인이 필요한 항목 (예산 내 확인 필요 후보만)
    var need = result.ordered.filter(function (r) { return r.status === "check"; }).map(function (r) {
      return r.item.name + " — " + r.gaps.map(function (g) { return L.feature[g]; }).join(", ") + " 지원 여부";
    });
    $("need-candidates").innerHTML = need.length
      ? listHtml(need)
      : listHtml(["현재 필수 조건 기준으로 후보 데이터에서 추가 확인이 필요한 항목 없음"]);
  }

  // 우선 검토 후보만: 모든 필수 조건 충족 → 추가 확인 필요. 예산 초과는 넣지 않는다.
  function renderShortlist(result) {
    var html = "";
    var lastGroup = null;
    result.ordered.filter(function (r) { return r.status !== "over"; }).forEach(function (row) {
      var it = row.item;
      if (row.status !== lastGroup) {
        lastGroup = row.status;
        html += '<tr class="group-row"><td colspan="8">' + L.group[row.status] + " · " + result.counts[row.status] + "개</td></tr>";
      }
      var gaps = row.gaps.length ? row.gaps.map(function (g) { return L.feature[g]; }).join(", ") : "—";
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
    $("shortlist-rows").innerHTML = html;
  }

  function renderEvidence(items, empty) {
    // 데이터 출처는 detail_url의 도메인에서만 가져온다.
    var hosts = items.map(function (it) {
      try { return new URL(it.detail_url).hostname; } catch (e) { return null; }
    }).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; });
    UI.setText("ev-source", hosts.length ? "후보별 원문 페이지 (" + hosts.join(", ") + ")" : "—");
    UI.setText("ev-scraped", UI.scrapedAtText(items));
    UI.setText("ev-count", items.length + "개");
    if (empty) {
      UI.setText("ev-price", "현재 조건에서 표시할 후보 없음");
      UI.setText("ev-url", "현재 조건에서 표시할 후보 없음");
    } else {
      $("ev-price").innerHTML = '후보별 가격 원문 — <a href="#section-shortlist">Candidate Shortlist ‘가격 원문’ 열</a>';
      $("ev-url").innerHTML = '후보별 detail_url — <a href="#section-shortlist">Candidate Shortlist ‘원문’ 열</a>';
    }
  }

  function renderMarket(items) {
    var mc = R.marketContext(items);
    var yes = mc.citation.yes, no = mc.citation.no;
    var fmt = function (v) { return v === null ? "—" : v.toFixed(2); };
    var lines = [
      "정제 데이터 " + mc.total + "개",
      "$" + mc.firstBin.from + " 이상 $" + mc.firstBin.to + " 미만 후보 " + mc.firstBin.count + "개",
      "Citation Yes 그룹 평균 " + fmt(yes.mean) + " USD (n=" + yes.n + ")",
      "Citation No 그룹 평균 " + fmt(no.mean) + " USD (n=" + no.n + ")"
    ];
    if (no.max !== null) {
      lines.push("Citation No 그룹 n=" + no.n + ", 해당 그룹에 " + no.max + " USD 값 포함 — 표본이 작아 한 값이 평균에 크게 영향을 줄 수 있음");
    }
    $("mc-list").innerHTML = listHtml(lines);

    // Citation Yes / No 평균 막대: 두 평균 중 큰 값을 100%로 둔다.
    var max = Math.max(yes.mean || 0, no.mean || 0) || 1;
    [["yes", yes], ["no", no]].forEach(function (pair) {
      var g = pair[1];
      $("bar-" + pair[0]).style.width = (g.mean === null ? 0 : g.mean / max * 100) + "%";
      UI.setText("bar-" + pair[0] + "-value", g.mean === null ? "—" : "$" + fmt(g.mean));
    });
    UI.setText("mc-chart-note", "Yes n=" + yes.n + " · No n=" + no.n + " · 현재 수집한 표본 기준");
  }

  function renderNext(empty) {
    if (empty) {
      $("next-list").innerHTML = checklistHtml(["예산 조건 다시 입력", "현재 비교 조건 확인", "조건 변경 후 다시 비교"]);
      return;
    }
    $("next-list").innerHTML = checklistHtml([
      "조건 충족 후보의 공식 요금제 재확인",
      "사용자 수 과금 조건 확인",
      "실제 처리 한도 확인",
      "조직 보안 / 데이터 정책 적합성 검토",
      "확인 결과를 바탕으로 도입 / 보완 / 개발 검토 진행"
    ]);
    UI.setText("next-note", "마지막 항목은 다음 단계의 의사결정 절차입니다. 현재 v1이 추가 개발 필요 여부를 확정했다는 뜻이 아닙니다.");
    $("next-note").hidden = false;
  }

  function render(cond, items) {
    var result = R.evaluate(items, cond);
    var empty = result.verdict === "none";
    var query = R.toQuery(cond);

    UI.setText("meta-scraped", UI.scrapedAtText(items));
    renderExecutive(result, empty);
    renderInputsAndNumbers(cond, result);
    renderKnowNeed(cond, result, empty);
    renderEvidence(items, empty);
    renderMarket(items);
    renderNext(empty);

    // 후보 없음: Shortlist와 원문 보기 링크를 숨기고 예산 재입력 CTA를 보여 준다.
    $("section-shortlist").hidden = empty;
    $("source-link").hidden = empty;
    $("empty-cta").hidden = !empty;
    if (!empty) renderShortlist(result);

    $("empty-cta-link").href = "compare.html?" + query;
    $("rebuild-link").href = "compare.html?" + query;
    $("report").setAttribute("aria-busy", "false");
  }

  var cond = R.parseConditions(window.location.search);
  if (!cond) { showOnly("state-invalid"); return; }

  $("retry-btn").addEventListener("click", function () { window.location.reload(); });
  $("error-reinput-link").href = "compare.html?" + R.toQuery(cond);

  UI.loadItems()
    .then(function (items) { render(cond, items); })
    .catch(function () { showOnly("state-error"); });
})();
