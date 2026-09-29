/* BuildWise Prototype v1 — 판단 규칙
   기준: docs/PROTOTYPE_V1_DECISION_RULES.md
   - 상태는 ok(✓ 충족) / check(? 확인 필요) / over(! 예산 초과) 세 가지만 사용한다.
   - 데이터에 표시가 없는 기능은 "미지원"이 아니라 확인 필요로 처리한다.
   - 추천 점수나 가격순 정렬을 만들지 않는다. */
(function (root) {
  "use strict";

  // ocr_raw가 이 값일 때만 OCR 지원이 확인된 것으로 본다.
  var OCR_SUPPORTED = "Scanned PDF support";
  // Compare에서 넘어오는 선택값
  var CHOICES = ["required", "optional"];
  // 기존 EDA와 같은 가격 구간 경계 (마지막 구간만 50 포함)
  var PRICE_EDGES = [0, 10, 20, 30, 40, 50];

  // URL query에서 비교 조건을 읽는다. 하나라도 없거나 잘못되면 null.
  function parseConditions(search) {
    var params = new URLSearchParams(search);
    var budget = Number(params.get("budget"));
    var citation = params.get("citation");
    var ocr = params.get("ocr");
    if (!params.get("budget") || !isFinite(budget) || budget <= 0) return null;
    if (CHOICES.indexOf(citation) === -1 || CHOICES.indexOf(ocr) === -1) return null;
    return { budget: budget, citation: citation, ocr: ocr };
  }

  // 조건을 다시 query 문자열로 만든다 (Decision → Report / Compare 이동용)
  function toQuery(cond) {
    return "budget=" + encodeURIComponent(cond.budget) +
      "&citation=" + encodeURIComponent(cond.citation) +
      "&ocr=" + encodeURIComponent(cond.ocr);
  }

  // 데이터에서 확인된 기능 상태 (사용자 필수 여부와 무관)
  function citationState(item) { return item.citation === "Yes" ? "ok" : "check"; }
  function ocrState(item) { return item.ocr_raw === OCR_SUPPORTED ? "ok" : "check"; }

  // 후보 한 개를 판정한다.
  function evaluateItem(item, cond) {
    var inBudget = item.price <= cond.budget;
    var cState = citationState(item);
    var oState = ocrState(item);
    // 필수로 선택한 조건 중 확인되지 않은 것만 Gap으로 본다.
    var gaps = [];
    if (cond.citation === "required" && cState !== "ok") gaps.push("citation");
    if (cond.ocr === "required" && oState !== "ok") gaps.push("ocr");
    // 우선순위: 예산 초과 → 모든 필수 조건 확인 → 확인 필요
    var status = !inBudget ? "over" : (gaps.length === 0 ? "ok" : "check");
    return { item: item, inBudget: inBudget, citation: cState, ocr: oState, gaps: gaps, status: status };
  }

  // 전체 후보를 판정하고 판단 결과를 만든다.
  function evaluate(items, cond) {
    var rows = items.map(function (item) { return evaluateItem(item, cond); });
    var pick = function (s) { return rows.filter(function (r) { return r.status === s; }); };
    var ok = pick("ok"), check = pick("check"), over = pick("over");
    var inBudget = ok.length + check.length;

    // v1 판단: 추가 개발 검토는 확정하지 않는다.
    var verdict = inBudget === 0 ? "none" : (ok.length > 0 ? "use" : "verify");

    return {
      verdict: verdict,
      counts: { total: items.length, inBudget: inBudget, ok: ok.length, check: check.length, over: over.length },
      // 기본 그룹 순서만 사용하고, 그룹 안에서는 데이터 순서를 유지한다.
      ordered: ok.concat(check, over),
      gapTargets: {
        citation: check.filter(function (r) { return r.gaps.indexOf("citation") !== -1; }),
        ocr: check.filter(function (r) { return r.gaps.indexOf("ocr") !== -1; })
      }
    };
  }

  // 가격 분포를 기존 EDA 구간으로 센다.
  function priceHistogram(items, edges) {
    edges = edges || PRICE_EDGES;
    var counts = edges.slice(1).map(function () { return 0; });
    var outside = 0;
    items.forEach(function (item) {
      var p = item.price;
      var last = edges.length - 2;
      var idx = -1;
      for (var i = 0; i <= last; i++) {
        var upperOk = i === last ? p <= edges[i + 1] : p < edges[i + 1];
        if (p >= edges[i] && upperOk) { idx = i; break; }
      }
      if (idx === -1) outside++; else counts[idx]++;
    });
    return { edges: edges, counts: counts, outside: outside };
  }

  // 현재 표본의 시장 참고 정보 (기존 EDA와 같은 방식으로 계산). 추천 점수에 사용하지 않는다.
  function marketContext(items) {
    function group(value) {
      var prices = items.filter(function (it) { return it.citation === value; })
        .map(function (it) { return it.price; });
      var sum = prices.reduce(function (a, b) { return a + b; }, 0);
      return {
        n: prices.length,
        mean: prices.length ? sum / prices.length : null,
        max: prices.length ? Math.max.apply(null, prices) : null
      };
    }
    var hist = priceHistogram(items);
    return {
      total: items.length,
      // 첫 구간: $0 이상 $10 미만
      firstBin: { from: hist.edges[0], to: hist.edges[1], count: hist.counts[0] },
      citation: { yes: group("Yes"), no: group("No") }
    };
  }

  var api = {
    OCR_SUPPORTED: OCR_SUPPORTED,
    PRICE_EDGES: PRICE_EDGES,
    parseConditions: parseConditions,
    toQuery: toQuery,
    evaluate: evaluate,
    priceHistogram: priceHistogram,
    marketContext: marketContext
  };

  root.BuildWiseRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
