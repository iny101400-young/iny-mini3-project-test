/* BuildWise Prototype v1 — Decision / Report 공통 표시 도구
   판단 문구와 상태 표현을 한 곳에 두어 두 화면이 같은 문구를 쓰게 한다.
   판단 규칙 자체는 assets/js/buildwise-rules.js에 있다. */
(function (root) {
  "use strict";

  var DATA_URL = "data/buildwise_v1.json";

  var LABELS = {
    // 사용자 화면에는 required / optional 대신 이 문구만 보여 준다.
    choice: { required: "필요함", optional: "상관없음" },
    verdict: {
      use: "기존 솔루션 활용 후보 있음",
      verify: "기존 솔루션 + 추가 확인 필요",
      none: "현재 조건에서 후보 없음"
    },
    direction: {
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
    },
    status: {
      ok: { cls: "badge--ok", icon: "✓", label: "충족" },
      check: { cls: "badge--check", icon: "?", label: "확인 필요" },
      over: { cls: "badge--over", icon: "!", label: "예산 초과" }
    },
    group: { ok: "모든 필수 조건 충족", check: "추가 확인 필요", over: "예산 초과" },
    feature: { citation: "Citation", ocr: "OCR" },
    // 현재 v1 데이터에 포함되지 않아 모든 후보에 대해 도입 전 확인이 필요한 항목
    dataLimits: ["상세 요금제", "사용자 수 과금", "실제 처리 한도", "조직 보안 / 데이터 정책"]
  };

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
    var s = LABELS.status[state];
    return '<span class="badge ' + s.cls + '"><span class="badge__icon" aria-hidden="true">' + s.icon + "</span>" +
      esc(label || s.label) + "</span>";
  }

  // 데이터에서 확인된 기능 상태: "미지원"이라는 표현은 쓰지 않는다.
  function featureBadge(state) {
    return state === "ok" ? badge("ok", "지원 확인") : badge("check", "확인 필요");
  }

  function sourceLink(url) {
    return url
      ? '<a class="link-out" href="' + esc(url) + '" target="_blank" rel="noopener">원문 보기 ↗</a>'
      : "—";
  }

  // 한 줄 판단 아래에 붙는 사실 요약 (계산된 숫자만 사용)
  function verdictSummary(result) {
    var c = result.counts;
    return {
      use: "예산 내 후보 " + c.inBudget + "개 중 " + c.ok + "개가 입력한 필수 조건을 모두 충족합니다.",
      verify: "예산 내 후보 " + c.inBudget + "개 모두 일부 필수 조건을 현재 데이터만으로 확인할 수 없습니다.",
      none: "현재 입력한 예산 범위에서는 비교 가능한 후보가 없습니다."
    }[result.verdict];
  }

  function formatScrapedAt(value) {
    var m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2}|Z)$/.exec(value);
    return m ? m[1] + " " + m[2] + " (UTC" + (m[3] === "Z" ? "" : m[3]) + ")" : value;
  }

  // 데이터에 있는 수집 시점을 중복 없이 모은다 (임의 날짜를 만들지 않는다).
  function scrapedAtText(items) {
    var stamps = items.map(function (it) { return it.scraped_at; }).filter(Boolean)
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    return stamps.length ? stamps.map(formatScrapedAt).join(", ") : "—";
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    el.textContent = text;
    el.classList.remove("value-empty", "metric__value--empty");
  }

  // JSON을 불러와 최소 구조를 확인한다. 실패하면 reject → 화면은 오류 상태를 보여 준다.
  function loadItems() {
    return fetch(DATA_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (items) {
        var valid = Array.isArray(items) && items.length > 0 && items.every(function (it) {
          return it && typeof it.name === "string" && typeof it.price === "number" && isFinite(it.price);
        });
        if (!valid) throw new Error("invalid data");
        return items;
      });
  }

  root.BuildWiseUI = {
    LABELS: LABELS,
    esc: esc,
    usd: usd,
    badge: badge,
    featureBadge: featureBadge,
    sourceLink: sourceLink,
    verdictSummary: verdictSummary,
    scrapedAtText: scrapedAtText,
    setText: setText,
    loadItems: loadItems
  };
})(window);
