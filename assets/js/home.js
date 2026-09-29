/* Home Evidence: 가격 분포 Histogram
   data/buildwise_v1.json의 price로 기존 EDA와 같은 구간을 센다 (값을 하드코딩하지 않는다). */
(function () {
  "use strict";

  var bars = document.getElementById("hist-bars");
  var note = document.getElementById("hist-note");
  if (!bars) return;

  // 기존 EDA 구간 이름 (마지막 구간만 50 포함)
  function binLabel(edges, i) {
    var last = i === edges.length - 2;
    return "$" + edges[i] + " 이상 $" + edges[i + 1] + (last ? " 이하" : " 미만");
  }

  fetch("data/buildwise_v1.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (items) {
      if (!Array.isArray(items) || !items.length) throw new Error("invalid data");
      var hist = window.BuildWiseRules.priceHistogram(items);
      var max = Math.max.apply(null, hist.counts) || 1;

      // Evidence Metric: 정제 데이터 수와 $0 이상 $10 미만 후보 수를 JSON에서 계산한다.
      [["home-clean-count", items.length], ["home-low-count", hist.counts[0]]].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (!el) return;
        el.textContent = String(pair[1]);
        el.classList.remove("metric__value--empty");
      });

      bars.innerHTML = hist.counts.map(function (count, i) {
        var label = binLabel(hist.edges, i) + ": " + count + "개";
        return '<div class="chart__bar" role="img" aria-label="' + label + '" title="' + label + '"' +
          ' style="height:' + (count / max * 100) + '%">' +
          '<span class="chart__bar-value" aria-hidden="true">' + count + "</span></div>";
      }).join("");

      var text = "정제 데이터 " + items.length + "개 기준 · 현재 수집한 표본이며 전체 시장을 대표하지 않습니다.";
      if (hist.outside) text += " 구간 밖 " + hist.outside + "개 제외.";
      note.textContent = text;
      note.hidden = false;
    })
    .catch(function () {
      note.textContent = "가격 분포 데이터를 불러오지 못했습니다.";
      note.hidden = false;
    });
})();
