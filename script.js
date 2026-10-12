(function () {
  'use strict';

  var APP_KEY = 'webapp_mealBuddy';
  var APP_VERSION = '001.001';
  var PLAN_KEY = APP_KEY + '.plan.v1';
  var ACTIVE_KEY = APP_KEY + '.activeDay.v1';

  var ICONS = Buddy.ICONS;
  var escapeHtml = Buddy.escapeHtml;

  var DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
  ];

  var MEALS = [
    { key: 'breakfast', label: 'Breakfast', icon: 'sun' },
    { key: 'lunch', label: 'Lunch', icon: 'utensils' },
    { key: 'dinner', label: 'Dinner', icon: 'moon' }
  ];

  var PERSONS = [
    { key: 'male', label: 'Male' },
    { key: 'female', label: 'Female' }
  ];

  var FIELDS_PER_DAY = MEALS.length * PERSONS.length;

  var dom = {};
  var saveTimer = null;
  var state = {
    plan: emptyPlan(),
    activeDay: 'mon'
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    initStaticIcons();
    bindEvents();

    state.plan = loadPlan();

    var savedActive = loadActiveDay();
    if (savedActive && findDay(savedActive)) {
      state.activeDay = savedActive;
    } else {
      var todayKey = todayDayKey();
      state.activeDay = findDay(todayKey) ? todayKey : 'mon';
    }

    renderDayList();
    renderDetail();
  }

  function cacheDom() {
    dom.panelHeaderIcon = document.getElementById('panelHeaderIcon');
    dom.btnPrint = document.getElementById('btnPrint');
    dom.btnExportData = document.getElementById('btnExportData');
    dom.fileImportData = document.getElementById('fileImportData');
    dom.fileBtnIcon = document.getElementById('fileBtnIcon');
    dom.btnSettings = document.getElementById('btnSettings');

    dom.dayList = document.getElementById('dayList');

    dom.dayTitle = document.getElementById('dayTitle');
    dom.dayTag = document.getElementById('dayTag');
    dom.btnCopyDay = document.getElementById('btnCopyDay');
    dom.btnClearDay = document.getElementById('btnClearDay');
    dom.mealSections = document.getElementById('mealSections');

    dom.printArea = document.getElementById('printArea');
  }

  function initStaticIcons() {
    dom.panelHeaderIcon.innerHTML = ICONS.calendar;
    dom.btnPrint.innerHTML = ICONS.fileText;
    dom.btnExportData.innerHTML = ICONS.download;
    dom.fileBtnIcon.innerHTML = ICONS.upload;
    dom.btnSettings.innerHTML = ICONS.settings;
  }

  function bindEvents() {
    dom.btnSettings.addEventListener('click', openSettingsModal);
    dom.btnPrint.addEventListener('click', printWeek);
    dom.btnExportData.addEventListener('click', exportData);
    dom.fileImportData.addEventListener('change', function () {
      var file = this.files[0];
      if (file) importDataFromFile(file);
      this.value = '';
    });

    dom.btnClearDay.addEventListener('click', confirmClearDay);
    dom.btnCopyDay.addEventListener('click', openCopyDayModal);

    dom.dayList.addEventListener('click', function (e) {
      var item = e.target.closest('.day-list-item');
      if (item) setActiveDay(item.getAttribute('data-day'));
    });

    dom.mealSections.addEventListener('input', function (e) {
      var field = e.target.closest('.meal-field');
      if (!field) return;
      var meal = field.getAttribute('data-meal');
      var person = field.getAttribute('data-person');
      state.plan[state.activeDay][meal][person] = field.value;
      scheduleSave();
      updateActiveDayCount();
    });

    dom.mealSections.addEventListener('blur', function (e) {
      if (e.target.closest('.meal-field')) flushSave();
    }, true);

    window.addEventListener('beforeunload', flushSave);
  }

  /* ---------- Data ---------- */

  function emptyMeal() {
    var m = {};
    PERSONS.forEach(function (p) { m[p.key] = ''; });
    return m;
  }

  function emptyDay() {
    var d = {};
    MEALS.forEach(function (meal) { d[meal.key] = emptyMeal(); });
    return d;
  }

  function emptyPlan() {
    var plan = {};
    DAYS.forEach(function (day) { plan[day.key] = emptyDay(); });
    return plan;
  }

  function normalizePlan(raw) {
    var plan = emptyPlan();
    if (!raw || typeof raw !== 'object') return plan;
    DAYS.forEach(function (day) {
      var srcDay = raw[day.key];
      if (!srcDay || typeof srcDay !== 'object') return;
      MEALS.forEach(function (meal) {
        var srcMeal = srcDay[meal.key];
        if (!srcMeal || typeof srcMeal !== 'object') return;
        PERSONS.forEach(function (p) {
          var val = srcMeal[p.key];
          if (typeof val === 'string') plan[day.key][meal.key][p.key] = val;
        });
      });
    });
    return plan;
  }

  function loadPlan() {
    try {
      var raw = localStorage.getItem(PLAN_KEY);
      return raw ? normalizePlan(JSON.parse(raw)) : emptyPlan();
    } catch (e) {
      return emptyPlan();
    }
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 300);
  }

  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(state.plan)); } catch (e) {}
  }

  function loadActiveDay() {
    try { return localStorage.getItem(ACTIVE_KEY); } catch (e) { return null; }
  }

  function saveActiveDay() {
    try { localStorage.setItem(ACTIVE_KEY, state.activeDay); } catch (e) {}
  }

  /* ---------- Helpers ---------- */

  function findDay(key) {
    return DAYS.filter(function (d) { return d.key === key; })[0];
  }

  function dayLabel(key) {
    var d = findDay(key);
    return d ? d.label : key;
  }

  function todayDayKey() {
    // JS getDay(): 0 = Sunday .. 6 = Saturday
    var map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[new Date().getDay()];
  }

  function filledCount(dayKey) {
    var day = state.plan[dayKey];
    var n = 0;
    MEALS.forEach(function (meal) {
      PERSONS.forEach(function (p) {
        if (day[meal.key][p.key].trim()) n++;
      });
    });
    return n;
  }

  function isDayEmpty(dayKey) {
    return filledCount(dayKey) === 0;
  }

  /* ---------- Render: sidebar ---------- */

  function renderDayList() {
    var todayKey = todayDayKey();
    dom.dayList.innerHTML = DAYS.map(function (day) {
      var count = filledCount(day.key);
      var isActive = day.key === state.activeDay;
      var isToday = day.key === todayKey;
      return '' +
        '<li class="day-list-item' + (isActive ? ' active' : '') + '" data-day="' + day.key + '">' +
        '<span class="day-list-item-name">' + escapeHtml(day.label) + '</span>' +
        (isToday ? '<span class="day-list-item-today">Today</span>' : '') +
        '<span class="day-list-item-count' + (count === FIELDS_PER_DAY ? ' full' : '') + '">' +
        count + '/' + FIELDS_PER_DAY + '</span>' +
        '</li>';
    }).join('');
  }

  function updateActiveDayCount() {
    var item = dom.dayList.querySelector('.day-list-item[data-day="' + state.activeDay + '"]');
    if (!item) return;
    var count = filledCount(state.activeDay);
    var countEl = item.querySelector('.day-list-item-count');
    countEl.textContent = count + '/' + FIELDS_PER_DAY;
    countEl.classList.toggle('full', count === FIELDS_PER_DAY);
  }

  /* ---------- Render: detail ---------- */

  function renderDetail() {
    var day = state.plan[state.activeDay];

    dom.dayTitle.textContent = dayLabel(state.activeDay);
    dom.dayTag.hidden = state.activeDay !== todayDayKey();

    dom.mealSections.innerHTML = MEALS.map(function (meal) {
      var fields = PERSONS.map(function (p) {
        var val = day[meal.key][p.key];
        var id = 'field-' + meal.key + '-' + p.key;
        return '' +
          '<div class="meal-field-group">' +
          '<label class="meal-field-heading" for="' + id + '">' +
          Buddy.icon('users') + escapeHtml(p.label) +
          '</label>' +
          '<textarea id="' + id + '" class="meal-field" data-meal="' + meal.key + '" data-person="' + p.key + '" ' +
          'rows="3" placeholder="What\'s ' + escapeHtml(p.label.toLowerCase()) + ' having for ' +
          escapeHtml(meal.label.toLowerCase()) + '?">' + escapeHtml(val) + '</textarea>' +
          '</div>';
      }).join('');

      return '' +
        '<section class="meal-card">' +
        '<div class="meal-card-header">' +
        '<span class="meal-card-icon">' + ICONS[meal.icon] + '</span>' +
        '<h3>' + escapeHtml(meal.label) + '</h3>' +
        '</div>' +
        '<div class="meal-grid">' + fields + '</div>' +
        '</section>';
    }).join('');
  }

  function setActiveDay(key) {
    if (!findDay(key) || key === state.activeDay) return;
    flushSave();
    state.activeDay = key;
    saveActiveDay();
    renderDayList();
    renderDetail();
    var detail = document.getElementById('dayDetail');
    if (detail) detail.scrollTop = 0;
  }

  /* ---------- Day actions ---------- */

  function confirmClearDay() {
    if (isDayEmpty(state.activeDay)) {
      openInfoModal('Nothing to clear', dayLabel(state.activeDay) + ' has no meals planned yet.');
      return;
    }
    openConfirmModal(
      'Clear ' + dayLabel(state.activeDay),
      'Remove every planned meal for ' + dayLabel(state.activeDay) + '? This cannot be undone.',
      'Clear day',
      function () {
        state.plan[state.activeDay] = emptyDay();
        flushSave();
        renderDayList();
        renderDetail();
      },
      { danger: true }
    );
  }

  function openCopyDayModal() {
    if (isDayEmpty(state.activeDay)) {
      openInfoModal('Nothing to copy', 'Add some meals to ' + dayLabel(state.activeDay) + ' first.');
      return;
    }

    var rows = DAYS.filter(function (d) { return d.key !== state.activeDay; }).map(function (d) {
      var count = filledCount(d.key);
      var meta = count === 0 ? 'empty' : count + '/' + FIELDS_PER_DAY + ' planned';
      return '' +
        '<button type="button" class="copy-day-row" data-target="' + d.key + '">' +
        '<span class="copy-day-row-name">' + escapeHtml(d.label) + '</span>' +
        '<span class="copy-day-row-count">' + meta + '</span>' +
        '</button>';
    }).join('');

    var html =
      '<p class="modal-message">Copy every meal from <strong>' + escapeHtml(dayLabel(state.activeDay)) +
      '</strong> onto another day. The target day\'s current meals will be replaced.</p>' +
      '<div class="copy-day-list">' + rows + '</div>';

    openModal('Copy day', html, function (body) {
      body.querySelectorAll('.copy-day-row').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-target');
          copyDay(state.activeDay, target);
          closeModal();
          openInfoModal('Copied', dayLabel(state.activeDay) + ' was copied to ' + dayLabel(target) + '.');
        });
      });
    }, { autoSize: true });
  }

  function copyDay(fromKey, toKey) {
    state.plan[toKey] = cloneDay(state.plan[fromKey]);
    flushSave();
    renderDayList();
    renderDetail();
  }

  function cloneDay(day) {
    var out = emptyDay();
    MEALS.forEach(function (meal) {
      PERSONS.forEach(function (p) {
        out[meal.key][p.key] = day[meal.key][p.key];
      });
    });
    return out;
  }

  /* ---------- Import / export ---------- */

  function exportData() {
    var payload = {
      app: APP_KEY,
      version: 1,
      exportedAt: new Date().toISOString(),
      plan: state.plan
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mealbuddy-plan.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function importDataFromFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (e) {
        openInfoModal('Import failed', 'That file is not valid JSON.');
        return;
      }
      var incoming = parsed && parsed.plan ? parsed.plan : parsed;
      var normalized = normalizePlan(incoming);
      openConfirmModal(
        'Replace plan?',
        'Importing will replace your current weekly plan with the contents of this file.',
        'Replace',
        function () {
          state.plan = normalized;
          flushSave();
          renderDayList();
          renderDetail();
        },
        { danger: true }
      );
    };
    reader.readAsText(file);
  }

  /* ---------- Print ---------- */

  function printWeek() {
    var accent = document.documentElement.getAttribute('data-accent') || 'indigo';
    var colors = Buddy.theme.printColors(accent);
    dom.printArea.style.setProperty('--print-primary', colors.primary || '#4f46e5');
    dom.printArea.style.setProperty('--print-primary-light', colors.light || '#eef2ff');

    var body = DAYS.map(function (day) {
      var rows = MEALS.map(function (meal) {
        var cells = PERSONS.map(function (p) {
          var val = state.plan[day.key][meal.key][p.key].trim();
          return val
            ? '<td>' + escapeHtml(val) + '</td>'
            : '<td class="print-empty-cell">&mdash;</td>';
        }).join('');
        return '<tr><td>' + escapeHtml(meal.label) + '</td>' + cells + '</tr>';
      }).join('');

      return '' +
        '<div class="print-day-title">' + escapeHtml(day.label) + '</div>' +
        '<table class="print-table">' +
        '<thead><tr><th>Meal</th>' +
        PERSONS.map(function (p) { return '<th>' + escapeHtml(p.label) + '</th>'; }).join('') +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '</table>';
    }).join('');

    dom.printArea.innerHTML =
      '<div class="print-title">Weekly Meal Plan</div>' +
      '<div class="print-credit">' + ICONS.heartFilled +
      ' Made by Anish Safui &middot; Meal Buddy</div>' +
      body;

    window.print();
  }

  /* ---------- Modals ---------- */

  var modalApi = Buddy.modal.init();
  var openModal = modalApi.open;
  var closeModal = modalApi.close;

  function openConfirmModal(title, message, confirmLabel, onConfirm, opts) {
    opts = opts || {};
    var danger = opts.danger ? 'btn-danger' : 'btn-primary';
    var html =
      '<p class="modal-message">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnConfirmNo">Cancel</button>' +
      '<button class="btn ' + danger + '" id="btnConfirmYes">' + escapeHtml(confirmLabel) + '</button>' +
      '</div>';
    openModal(title, html, function (body) {
      body.querySelector('#btnConfirmNo').addEventListener('click', closeModal);
      body.querySelector('#btnConfirmYes').addEventListener('click', function () {
        closeModal();
        onConfirm();
      });
    }, { autoSize: true });
  }

  function openInfoModal(title, message) {
    var html =
      '<p class="modal-message">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-primary" id="btnInfoOk">OK</button>' +
      '</div>';
    openModal(title, html, function (body) {
      body.querySelector('#btnInfoOk').addEventListener('click', closeModal);
    }, { autoSize: true });
  }

  function openSettingsModal() {
    Buddy.settings.open(APP_KEY, openModal, closeModal, { appVersion: APP_VERSION });
  }
})();
