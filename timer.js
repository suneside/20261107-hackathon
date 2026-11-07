// 제출 마감 카운트다운 (한국 시간 고정). 숫자가 세로로 굴러가는 오도미터 방식.
(function () {
  var KST = '+09:00';
  var TARGET = Date.parse('2026-11-07T17:00:00' + KST);
  var MILESTONES = [
    { id: 'ms-freeze', t: Date.parse('2026-11-07T16:40:00' + KST) },
    { id: 'ms-submit', t: Date.parse('2026-11-07T16:50:00' + KST) }
  ];

  function parts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return [Math.min(99, Math.floor(s / 3600)), Math.floor((s % 3600) / 60), s % 60];
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hms(ms) { var p = parts(ms); return pad(p[0]) + ':' + pad(p[1]) + ':' + pad(p[2]); }

  function makeDigit() {
    var box = document.createElement('span');
    box.className = 'odo-d';
    var strip = document.createElement('span');
    strip.className = 'odo-strip';
    for (var i = 0; i < 10; i++) {
      var n = document.createElement('span');
      n.textContent = String(i);
      strip.appendChild(n);
    }
    box.appendChild(strip);
    return { strip: strip, val: 0, box: box };
  }

  function setupBig(root) {
    var digits = [];
    Array.prototype.forEach.call(root.querySelectorAll('[data-g]'), function (g) {
      for (var i = 0; i < 2; i++) {
        var d = makeDigit();
        g.appendChild(d.box);
        digits.push(d);
      }
    });
    return digits;
  }

  function setDigit(d, v) {
    if (d.val === v) return;
    d.val = v;
    d.strip.style.transform = 'translateY(' + (-v * 10) + '%)';
  }

  var big = document.querySelector('[data-countdown]');
  var bigDigits = big ? setupBig(big) : [];
  var card = document.querySelector('.deadline');
  var compacts = document.querySelectorAll('[data-countdown-compact]');

  function tick() {
    var now = Date.now();
    var left = TARGET - now;
    var str = hms(left).replace(/:/g, '');
    for (var i = 0; i < bigDigits.length; i++) setDigit(bigDigits[i], +str.charAt(i));
    if (card) {
      card.classList.toggle('over', left <= 0);
      card.classList.toggle('crit', left > 0 && left <= 10 * 60000);
      card.classList.toggle('warn', left > 10 * 60000 && left <= 60 * 60000);
    }
    var label = left <= 0 ? '마감' : hms(left);
    Array.prototype.forEach.call(compacts, function (el) { el.textContent = label; });
    MILESTONES.forEach(function (m) {
      var el = document.getElementById(m.id);
      if (el) el.textContent = m.t - now <= 0 ? '지남' : hms(m.t - now);
    });
    var over = document.getElementById('dl-over');
    if (over) over.hidden = left > 0;
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  }

  // 처음엔 00:00:00에서 시작해 실제 남은 시간까지 굴러 올라가게 잠깐 늦춰 시작
  Array.prototype.forEach.call(compacts, function (el) { el.textContent = hms(TARGET - Date.now()); });
  setTimeout(tick, bigDigits.length ? 300 : 0);
})();
