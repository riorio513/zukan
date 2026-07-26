(function () {
  'use strict';
  var D = window.PLANT_DATA;
  var app = document.getElementById('app');
  var tabs = document.getElementById('tabs');

  var MONTH_ORDER = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03'];
  var now = new Date();
  var CURRENT_MONTH_NUM = now.getMonth() + 1; // 1-12
  var CURRENT_MONTH_PAD = (CURRENT_MONTH_NUM < 10 ? '0' : '') + CURRENT_MONTH_NUM;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function meterHtml(m) {
    var dots = '';
    for (var i = 0; i < m.total; i++) {
      dots += '<i class="' + (i < m.filled ? 'on' : '') + '"></i>';
    }
    return (
      '<div class="meter"><span class="label">' + esc(m.label) + '</span>' +
      '<span class="bar">' + dots + '</span>' +
      '<span class="val">' + esc(m.val) + '</span></div>'
    );
  }

  function findPlant(id) {
    for (var i = 0; i < D.plants.length; i++) if (D.plants[i].id === id) return D.plants[i];
    return null;
  }
  function findMonth(id) {
    for (var i = 0; i < D.months.length; i++) if (D.months[i].id === id) return D.months[i];
    return null;
  }
  function findChapter(id) {
    for (var i = 0; i < D.chapters.length; i++) if (D.chapters[i].id === id) return D.chapters[i];
    return null;
  }
  function calendarRowForNum(padNum) {
    var n = parseInt(padNum, 10);
    for (var i = 0; i < D.calendar.rows.length; i++) {
      if (parseInt(D.calendar.rows[i].month, 10) === n) return D.calendar.rows[i];
    }
    return null;
  }

  // ---------------- ホーム ----------------
  function viewHome() {
    var curMonth = D.months.filter(function (m) { return m.num === CURRENT_MONTH_PAD; })[0];
    var curCal = calendarRowForNum(CURRENT_MONTH_PAD);

    var specHtml = D.meta.spec.map(function (s) {
      return '<b>' + esc(s.label) + '</b>　' + esc(s.text) + '<br>';
    }).join('');

    var nowTasks = D.plants.map(function (p) {
      var row = null;
      for (var i = 0; i < p.monthTable.length; i++) {
        if (parseInt(p.monthTable[i].month, 10) === CURRENT_MONTH_NUM) { row = p.monthTable[i]; break; }
      }
      return { name: p.name, work: row ? row.work : '' };
    });

    var nowListHtml = nowTasks.map(function (t) {
      return '<li><span class="p-name">' + esc(t.name) + '</span><span class="p-work">' + t.work + '</span></li>';
    }).join('');

    app.innerHTML =
      '<div class="spec-box">' + specHtml + '</div>' +
      (curMonth ? (
        '<div class="now-card">' +
        '<div class="now-head"><span class="month-badge">今月・' + esc(curMonth.name) + '</span>' +
        '<span class="theme">' + esc(curMonth.theme) + '</span></div>' +
        (curCal ? '<div class="month-cal">' +
          '<span><b>気象</b>' + curCal.weather.replace(/<[^>]+>/g, '') + '</span>' +
          '<span><b>置き場所</b>' + curCal.placement + '</span>' +
          '<span><b>水やり</b>' + curCal.water + '</span>' +
          '<span><b>肥料</b>' + curCal.fert + '</span>' +
          '</div>' : '') +
        '<p style="font-size:12.5px;color:var(--ink-soft);margin:14px 0 0;">今月、各鉢でやること（詳しくは植物図鑑の月別表へ）</p>' +
        '<ul class="now-list">' + nowListHtml + '</ul>' +
        '<a class="back-link" href="#/months/' + curMonth.id + '" style="margin-top:12px;">→ ' + esc(curMonth.name) + 'の実行ガイドを読む</a>' +
        '</div>'
      ) : '') +
      '<div class="home-grid">' +
      tile('植物図鑑', '13種の株ごとに、月別の水やり・肥料・作業と、よくある悩みQ&Aをまとめてある', '#/plants') +
      tile('月別ガイド', '4月から3月まで、その月にやることだけを読み下せる形に', '#/months') +
      tile('トラブル対策', '葉が黄色い・茶色いなどのサインから原因と対処を探す', '#/troubles') +
      tile('基本ガイド', '光・水・肥料・植え替え・支柱・剪定など、管理の考え方の土台', '#/guide') +
      tile('道具・チェックリスト', '資材の一覧と、毎月15分でできる巡回チェック', '#/tools') +
      '</div>';
  }

  function tile(title, desc, href) {
    return (
      '<a class="tile" href="' + href + '">' +
      '<div class="tile-title">' + esc(title) + '</div>' +
      '<div class="tile-desc">' + esc(desc) + '</div>' +
      '</a>'
    );
  }

  // ---------------- 植物図鑑：一覧 ----------------
  function viewPlantList(query) {
    var q = (query || '').trim().toLowerCase();
    var list = D.plants.filter(function (p) {
      if (!q) return true;
      return (p.name + p.latin + p.catch).toLowerCase().indexOf(q) !== -1;
    });

    var cards = list.map(function (p) {
      var mini = p.meters.map(function (m) {
        return '<span><b>' + esc(m.label) + '</b> ' + m.filled + '/' + m.total + '</span>';
      }).join('');
      return (
        '<a class="plant-card" href="#/plants/' + p.id + '">' +
        '<span class="no">' + esc(p.no) + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<span class="latin">' + esc(p.latin) + '</span>' +
        '<p class="catch">' + esc(p.catch) + '</p>' +
        '<div class="mini-meters">' + mini + '</div>' +
        '</a>'
      );
    }).join('');

    app.innerHTML =
      '<h1 class="page-title">植物図鑑</h1>' +
      '<p class="page-lead">全' + D.plants.length + '種。株ごとの性質・月別の管理表・よくある悩みをまとめている。</p>' +
      '<div class="searchbar"><input type="search" id="plant-search" placeholder="植物名・学名で検索" value="' + esc(query || '') + '"></div>' +
      '<div class="plant-grid">' + (cards || '<p class="empty-msg">見つかりませんでした</p>') + '</div>';

    var input = document.getElementById('plant-search');
    input.addEventListener('input', function () {
      location.hash = '#/plants?q=' + encodeURIComponent(input.value);
    });
    input.focus();
    var val = input.value;
    input.setSelectionRange(val.length, val.length);
  }

  // ---------------- 植物図鑑：詳細 ----------------
  function viewPlantDetail(id) {
    var p = findPlant(id);
    if (!p) { app.innerHTML = '<p class="empty-msg">植物が見つかりません</p>'; return; }

    var metersHtml = '<div class="meters">' + p.meters.map(meterHtml).join('') + '</div>';
    var quickHtml = '<div class="quickfacts">' + p.quickfacts.map(function (q) {
      return '<span><b>' + esc(q.label) + '</b>' + esc(q.text) + '</span>';
    }).join('') + '</div>';

    var sectionsHtml = p.sections.map(function (s) {
      return '<div class="plant-section"><h4>' + esc(s.heading) + '</h4>' + s.html + '</div>';
    }).join('');

    var monthRows = p.monthTable.map(function (r) {
      var isCur = parseInt(r.month, 10) === CURRENT_MONTH_NUM;
      return (
        '<tr' + (isCur ? ' class="current-month"' : '') + '>' +
        '<th>' + esc(r.month) + '</th>' +
        '<td>' + r.place + '</td>' +
        '<td>' + r.water + '</td>' +
        '<td class="fert">' + r.fert + '</td>' +
        '<td class="vital">' + r.vital + '</td>' +
        '<td>' + r.work + '</td>' +
        '</tr>'
      );
    }).join('');

    var qaHtml = '<div class="qa-list">' + p.qa.map(function (item) {
      return (
        '<details class="qa-item"><summary>' + esc(item.q) + '</summary>' +
        '<div class="a">' + esc(item.a) + '</div></details>'
      );
    }).join('') + '</div>';

    app.innerHTML =
      '<a class="back-link" href="#/plants">← 植物図鑑一覧へ</a>' +
      '<div class="plant-detail-head">' +
      '<span class="no">' + esc(p.no) + '</span><h1>' + esc(p.name) + '</h1>' +
      '<span class="latin">' + esc(p.latin) + '</span></div>' +
      '<p class="plant-catch">' + esc(p.catch) + '</p>' +
      metersHtml + quickHtml + sectionsHtml +
      '<p class="sub-label" style="font-size:11px;letter-spacing:.2em;color:var(--brass);font-weight:700;margin:26px 0 6px;">月別の管理</p>' +
      '<div class="table-wrap"><table class="month-table"><thead><tr><th>月</th><th>置き場所</th><th>水やり</th><th>追肥</th><th>活力剤</th><th>作業</th></tr></thead><tbody>' + monthRows + '</tbody></table></div>' +
      '<p class="sub-label" style="font-size:11px;letter-spacing:.2em;color:var(--brass);font-weight:700;margin:30px 0 10px;">よくある悩み</p>' +
      qaHtml;
  }

  // ---------------- 月別ガイド ----------------
  function viewMonths(id) {
    var activeId = id || 'm-' + CURRENT_MONTH_PAD;
    var m = findMonth(activeId);
    if (!m) { m = findMonth('m-' + CURRENT_MONTH_PAD); activeId = m.id; }

    var pills = MONTH_ORDER.map(function (num) {
      var mm = D.months.filter(function (x) { return x.num === num; })[0];
      var isNow = num === CURRENT_MONTH_PAD;
      var isActive = mm.id === activeId;
      return '<a href="#/months/' + mm.id + '" class="' + (isActive ? 'active' : '') + (isNow ? ' is-now' : '') + '">' + esc(mm.name) + '</a>';
    }).join('');

    var cal = calendarRowForNum(m.num);
    var calHtml = cal ? (
      '<div class="month-cal">' +
      '<span><b>気象</b>' + cal.weather.replace(/<[^>]+>/g, '') + '</span>' +
      '<span><b>置き場所・光</b>' + cal.placement + '</span>' +
      '<span><b>水やり</b>' + cal.water + '</span>' +
      '<span><b>肥料・活力剤</b>' + cal.fert + '</span>' +
      '</div>'
    ) : '';

    var sectionsHtml = m.sections.map(function (s) {
      return '<div class="month-section"><h4>' + esc(s.heading) + '</h4><p>' + s.text + '</p></div>';
    }).join('');

    var switchNote = (m.num === '05' || m.num === '10')
      ? '<div class="note"><span class="tag">' + esc(D.calendar.note.tag) + '</span>' + D.calendar.note.html + '</div>'
      : '';

    app.innerHTML =
      '<h1 class="page-title">月別ガイド</h1>' +
      '<p class="page-lead">その月にやることだけを読み下せる形に。株ごとの細かい数値は植物図鑑の月別表を見てほしい。</p>' +
      '<div class="month-pills">' + pills + '</div>' +
      '<div class="month-detail-head"><span class="num">' + esc(m.num) + '</span><h1>' + esc(m.name) + '</h1></div>' +
      '<p class="month-theme">' + esc(m.theme) + '</p>' +
      calHtml + sectionsHtml + switchNote;
  }

  // ---------------- トラブル対策 ----------------
  function viewTroubles(query) {
    var q = (query || '').trim().toLowerCase();
    var items = D.troubles.items.filter(function (t) {
      if (!q) return true;
      return (t.name + t.sign).toLowerCase().indexOf(q) !== -1;
    });

    var listHtml = items.map(function (t) {
      return (
        '<div class="symptom' + (t.danger ? ' danger' : '') + '">' +
        '<h4>' + esc(t.name) + (t.danger ? '<span class="danger-badge">要警戒</span>' : '') + '</h4>' +
        '<p class="sign">' + esc(t.sign) + '</p>' +
        t.html +
        '</div>'
      );
    }).join('');

    app.innerHTML =
      '<h1 class="page-title">トラブル対策</h1>' +
      '<p class="page-lead">最初に見るのは葉の手触りと土の湿り気の2点。ほとんどの分岐はこの2つで付く。</p>' +
      '<div class="note warn"><span class="tag">' + esc(D.troubles.intro.tag) + '</span>' + D.troubles.intro.html + '</div>' +
      '<div class="searchbar"><input type="search" id="trouble-search" placeholder="症状名で検索（例：ハダニ、根腐れ）" value="' + esc(query || '') + '"></div>' +
      (listHtml || '<p class="empty-msg">見つかりませんでした</p>');

    var searchInput = document.getElementById('trouble-search');
    searchInput.addEventListener('input', function () {
      location.hash = '#/troubles?q=' + encodeURIComponent(searchInput.value);
    });
  }

  // ---------------- 基本ガイド ----------------
  function viewGuide(id) {
    var activeId = id || D.chapters[0].id;
    var ch = findChapter(activeId) || D.chapters[0];
    activeId = ch.id;

    var pills = D.chapters.map(function (c) {
      return '<a href="#/guide/' + c.id + '" class="' + (c.id === activeId ? 'active' : '') + '">' + esc(c.num) + ' ' + esc(c.title) + '</a>';
    }).join('');

    app.innerHTML =
      '<h1 class="page-title">基本ガイド</h1>' +
      '<p class="page-lead">光・水・肥料・植え替え・支柱・剪定など、この環境での管理の考え方。</p>' +
      '<div class="guide-pills">' + pills + '</div>' +
      '<div class="guide-body">' + ch.html + '</div>';
  }

  // ---------------- 道具・チェックリスト ----------------
  function viewTools() {
    var addRows = D.tools.addRows.map(function (r) {
      return '<tr><td>' + r.item + '</td><td>' + r.purpose + '</td><td class="hot">' + esc(r.deadline) + '</td></tr>';
    }).join('');
    var monthlyLis = D.checklist.monthly.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    var seasonalLis = D.checklist.seasonal.map(function (t) { return '<li>' + t + '</li>'; }).join('');

    app.innerHTML =
      '<div class="section-block">' +
      '<h2>道具と資材</h2>' +
      '<h4 style="color:var(--moss);font-size:14px;">すでにあるもの</h4><p style="font-size:14px;">' + D.tools.have + '</p>' +
      '<h4 style="color:var(--moss);font-size:14px;">優先度の高い追加</h4>' +
      '<div class="table-wrap"><table><thead><tr><th>もの</th><th>用途</th><th>いつまでに</th></tr></thead><tbody>' + addRows + '</tbody></table></div>' +
      '<h4 style="color:var(--moss);font-size:14px;">あると管理が安定するもの</h4>' + D.tools.stableHtml +
      '<div class="note"><span class="tag">' + esc(D.tools.note.tag) + '</span>' + D.tools.note.html + '</div>' +
      '</div>' +
      '<div class="section-block">' +
      '<h2>月次チェックリスト</h2>' +
      '<h4 style="color:var(--moss);font-size:14px;">毎月やること（所要15分程度）</h4>' +
      '<ul class="check">' + monthlyLis + '</ul>' +
      '<h4 style="color:var(--moss);font-size:14px;">季節ごとに追加すること</h4>' +
      '<ul class="check">' + seasonalLis + '</ul>' +
      '<div class="note"><span class="tag">' + esc(D.checklist.note.tag) + '</span>' + D.checklist.note.html + '</div>' +
      '</div>';
  }

  // ---------------- ルーター ----------------
  function setActiveTab(name) {
    var links = tabs.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('active', links[i].getAttribute('data-tab') === name);
    }
  }

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var qIndex = h.indexOf('?');
    var query = '';
    if (qIndex !== -1) {
      var qs = h.slice(qIndex + 1);
      h = h.slice(0, qIndex);
      var m = qs.match(/q=([^&]*)/);
      if (m) query = decodeURIComponent(m[1]);
    }
    var parts = h.split('/').filter(Boolean);
    return { root: parts[0] || 'home', sub: parts[1] || '', query: query };
  }

  function route() {
    var r = parseHash();
    window.scrollTo(0, 0);
    switch (r.root) {
      case 'plants':
        setActiveTab('plants');
        if (r.sub) viewPlantDetail(r.sub); else viewPlantList(r.query);
        break;
      case 'months':
        setActiveTab('months');
        viewMonths(r.sub);
        break;
      case 'troubles':
        setActiveTab('troubles');
        viewTroubles(r.query);
        break;
      case 'guide':
        setActiveTab('guide');
        viewGuide(r.sub);
        break;
      case 'tools':
        setActiveTab('tools');
        viewTools();
        break;
      default:
        setActiveTab('home');
        viewHome();
    }
  }

  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/home';
  route();
})();
