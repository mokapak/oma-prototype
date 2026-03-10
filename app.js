/* =====================================================
   OMA APPS DETAILS — Shared Interactive Module
   ===================================================== */

(function () {
  'use strict';

  /* ---------- UTILITY ---------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function on(el, evt, fn) { if (el) el.addEventListener(evt, fn); }
  function toggleClass(el, cls) { if (el) el.classList.toggle(cls); }

  /* ---------- DROPDOWN ---------- */
  function initDropdowns() {
    qsa('[data-dropdown]').forEach(function (trigger) {
      var menu = qs('#' + trigger.getAttribute('data-dropdown'));
      if (!menu) return;
      on(trigger, 'click', function (e) {
        e.stopPropagation();
        // close others
        qsa('.dropdown-menu.open').forEach(function (m) { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
        // update trigger text if option clicked
      });
      qsa('.dropdown-item', menu).forEach(function (item) {
        on(item, 'click', function () {
          var txt = qs('.dropdown-label', trigger);
          if (txt) txt.textContent = item.textContent.trim();
          menu.classList.remove('open');
          trigger.dispatchEvent(new CustomEvent('dropdown-change', { detail: item.dataset.value || item.textContent.trim() }));
        });
      });
    });
  }

  /* ---------- MODAL ---------- */
  function initModals() {
    qsa('[data-modal]').forEach(function (btn) {
      var modal = qs('#' + btn.getAttribute('data-modal'));
      if (!modal) return;
      on(btn, 'click', function (e) { e.stopPropagation(); openModal(modal); });
    });
    // Handle close buttons and backdrop click for both .modal-overlay and .modal-backdrop
    on(document, 'click', function (e) {
      var closeBtn = e.target.closest('.modal-close');
      if (closeBtn) {
        var modal = closeBtn.closest('.modal-overlay, .modal-backdrop');
        if (modal) closeModal(modal);
        return;
      }
      // Backdrop click (click directly on the backdrop, not the inner modal)
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-backdrop')) {
        closeModal(e.target);
      }
    });
  }
  function openModal(modal) {
    if (typeof modal === 'string') modal = qs('#' + modal);
    if (modal) modal.classList.add('open');
  }
  function closeModal(modal) {
    if (typeof modal === 'string') modal = qs('#' + modal);
    if (modal) modal.classList.remove('open');
  }

  /* ---------- TABS ---------- */
  function initTabs() {
    qsa('[data-tabs]').forEach(function (container) {
      var tabs = qsa('.tab-btn', container);
      var panels = qsa('[data-tab-panel]');
      tabs.forEach(function (tab) {
        on(tab, 'click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var target = tab.dataset.tab;
          panels.forEach(function (p) {
            p.style.display = p.dataset.tabPanel === target ? '' : 'none';
          });
        });
      });
    });
  }

  /* ---------- TABLE SORT ---------- */
  function initTableSort() {
    qsa('.tbl th[data-sort]').forEach(function (th) {
      on(th, 'click', function () {
        var table = th.closest('.tbl');
        var tbody = qs('tbody', table);
        if (!tbody) return;
        var idx = Array.from(th.parentNode.children).indexOf(th);
        var rows = Array.from(tbody.querySelectorAll('tr'));
        var asc = th.dataset.sortDir !== 'asc';
        // reset all
        qsa('th[data-sort]', table).forEach(function (h) { h.dataset.sortDir = ''; });
        th.dataset.sortDir = asc ? 'asc' : 'desc';
        rows.sort(function (a, b) {
          var va = (a.children[idx] || {}).textContent || '';
          var vb = (b.children[idx] || {}).textContent || '';
          var na = parseFloat(va.replace(/[^0-9.\-]/g, '')), nb = parseFloat(vb.replace(/[^0-9.\-]/g, ''));
          if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
          return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
        // update sort indicators
        var sortSpan = qs('.sort', th);
        if (sortSpan) sortSpan.textContent = asc ? '▲' : '▼';
      });
    });
  }

  /* ---------- TABLE SEARCH ---------- */
  function initTableSearch() {
    qsa('[data-search-table]').forEach(function (input) {
      var tableId = input.getAttribute('data-search-table');
      var table = qs('#' + tableId);
      if (!table) return;
      on(input, 'input', function () {
        var q = input.value.toLowerCase();
        qsa('tbody tr', table).forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
        });
      });
    });
  }

  /* ---------- PAGINATION ---------- */
  function initPagination() {
    qsa('[data-paginate]').forEach(function (container) {
      var perPage = parseInt(container.dataset.paginate) || 10;
      var items = qsa('.paginate-item', container);
      var nav = qs('.pagination', container.parentNode) || qs('.pagination');
      if (!items.length) return;
      var totalPages = Math.ceil(items.length / perPage);
      var current = 1;
      function render() {
        items.forEach(function (item, i) {
          item.style.display = (i >= (current - 1) * perPage && i < current * perPage) ? '' : 'none';
        });
        if (nav) renderPaginationNav(nav, current, totalPages, function (p) { current = p; render(); });
      }
      render();
    });
  }
  function renderPaginationNav(nav, current, total, onChange) {
    nav.innerHTML = '';
    var prev = document.createElement('button');
    prev.className = 'page-btn'; prev.textContent = '‹'; prev.disabled = current <= 1;
    on(prev, 'click', function () { if (current > 1) onChange(current - 1); });
    nav.appendChild(prev);
    for (var i = 1; i <= total; i++) {
      if (total > 7 && i > 3 && i < total - 1 && Math.abs(i - current) > 1) {
        if (i === 4 || i === total - 2) { var dots = document.createElement('span'); dots.className = 'page-dots'; dots.textContent = '…'; nav.appendChild(dots); }
        continue;
      }
      (function (page) {
        var btn = document.createElement('button');
        btn.className = 'page-btn' + (page === current ? ' active' : '');
        btn.textContent = page;
        on(btn, 'click', function () { onChange(page); });
        nav.appendChild(btn);
      })(i);
    }
    var next = document.createElement('button');
    next.className = 'page-btn'; next.textContent = '›'; next.disabled = current >= total;
    on(next, 'click', function () { if (current < total) onChange(current + 1); });
    nav.appendChild(next);
  }

  /* ---------- TOAST ---------- */
  window.showToast = function (message, duration) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, duration || 2500);
  };

  /* ---------- HEADER INTERACTIONS ---------- */
  /* Inject notification panel + user menu HTML if not already present */
  function injectHeaderPanels() {
    // --- Notification Panel ---
    var bellBtn = qs('.h-btn');
    if (bellBtn && !qs('#notifPanel')) {
      bellBtn.style.position = 'relative';
      var badge = document.createElement('span');
      badge.className = 'notif-badge';
      badge.id = 'notifBadge';
      badge.textContent = '3';
      bellBtn.appendChild(badge);

      var panel = document.createElement('div');
      panel.className = 'notif-panel';
      panel.id = 'notifPanel';
      panel.innerHTML = [
        '<div class="notif-panel-header">Notifications <span class="notif-mark-read" id="notifMarkRead">Mark all read</span></div>',
        '<div class="notif-item unread"><div class="notif-dot"></div><div class="notif-body"><div class="notif-title">Orange et moi — New version available</div><div class="notif-time">2h ago</div></div></div>',
        '<div class="notif-item unread"><div class="notif-dot"></div><div class="notif-body"><div class="notif-title">TV d\'Orange — Rating dropped to 3.9</div><div class="notif-time">5h ago</div></div></div>',
        '<div class="notif-item unread"><div class="notif-dot"></div><div class="notif-body"><div class="notif-title">Weekly report is ready</div><div class="notif-time">Yesterday</div></div></div>',
        '<div class="notif-item"><div class="notif-dot" style="opacity:0"></div><div class="notif-body"><div class="notif-title">Simyo — Scoring improved +12</div><div class="notif-time">2 days ago</div></div></div>',
        '<div class="notif-panel-footer"><a href="notifications.html" style="font-size:12px;color:var(--orange);font-weight:600;">View all notifications \u2192</a></div>'
      ].join('');
      bellBtn.appendChild(panel);

      var markRead = panel.querySelector('#notifMarkRead');
      if (markRead) {
        on(markRead, 'click', function (e) {
          e.stopPropagation();
          panel.querySelectorAll('.notif-item.unread').forEach(function (el) { el.classList.remove('unread'); });
          var b = qs('#notifBadge');
          if (b) b.remove();
          showToast('All notifications marked as read');
        });
      }
    }

    // --- User Menu ---
    var userBtn = qs('.h-user');
    if (userBtn && !qs('#userMenu')) {
      userBtn.style.position = 'relative';
      var menu = document.createElement('div');
      menu.className = 'user-menu';
      menu.id = 'userMenu';
      menu.innerHTML = [
        '<div class="user-menu-profile">',
        '  <div class="h-avatar" style="width:36px;height:36px;font-size:13px;background:var(--orange);">TC</div>',
        '  <div><div style="font-weight:700;font-size:13px;">Th\u00e9ophile Cornuet</div><div style="font-size:11px;color:var(--text-3);">theophile.cornuet@orange.com</div></div>',
        '</div>',
        '<div class="user-menu-sep"></div>',
        '<a href="settings.html" class="user-menu-item">\u2699\ufe0f Settings</a>',
        '<a href="profile.html" class="user-menu-item">\ud83d\udc64 My Profile</a>',
        '<div class="user-menu-sep"></div>',
        '<div class="user-menu-item" style="color:var(--red);">\ud83d\udeaa Sign out</div>'
      ].join('');
      userBtn.appendChild(menu);
    }
  }

  function initHeader() {
    injectHeaderPanels();

    // Notification dropdown
    var bellBtn = qs('.h-btn');
    var notifPanel = qs('#notifPanel');
    if (bellBtn && notifPanel) {
      on(bellBtn, 'click', function (e) {
        e.stopPropagation();
        notifPanel.classList.toggle('open');
        var userMenu = qs('#userMenu');
        if (userMenu) userMenu.classList.remove('open');
      });
      // Wire "Mark all read" — handles both injected and pre-embedded panels
      var markRead = qs('.notif-mark-read', notifPanel);
      if (markRead && !markRead.dataset.wired) {
        markRead.dataset.wired = '1';
        on(markRead, 'click', function (e) {
          e.stopPropagation();
          qsa('.notif-item.unread', notifPanel).forEach(function (el) { el.classList.remove('unread'); });
          var badge = qs('.notif-badge', bellBtn);
          if (badge) badge.remove();
          showToast('All notifications marked as read');
        });
      }
    }
    // User dropdown
    var userBtn = qs('.h-user');
    var userMenu = qs('#userMenu');
    if (userBtn && userMenu) {
      on(userBtn, 'click', function (e) {
        e.stopPropagation();
        userMenu.classList.toggle('open');
        var notifP = qs('#notifPanel');
        if (notifP) notifP.classList.remove('open');
      });
    }
  }

  /* ---------- FOOTER MODALS ---------- */
  function initFooterModals() {
    // Inject modal HTML once
    if (!qs('#contactModal')) {
      var contactModal = document.createElement('div');
      contactModal.className = 'modal-backdrop';
      contactModal.id = 'contactModal';
      contactModal.innerHTML = [
        '<div class="modal" style="max-width:480px;">',
        '  <div class="modal-header"><span class="modal-title">Contact</span>',
        '    <button class="modal-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '  </div>',
        '  <div class="modal-body">',
        '    <p style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:16px;">For any question or feedback about <strong>OMA Apps Details</strong>, please contact the platform team:</p>',
        '    <div style="background:var(--bg);border-radius:var(--r-md);padding:16px;font-size:13px;display:flex;flex-direction:column;gap:8px;">',
        '      <div>\ud83d\udce7 <a href="mailto:oma-support@orange.com" style="color:var(--orange);">oma-support@orange.com</a></div>',
        '      <div>\ud83d\udcac Slack: <strong>#oma-apps-details</strong></div>',
        '      <div>\ud83d\udcca Confluence: <a href="#" style="color:var(--orange);">OMA Documentation</a></div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(contactModal);
    }

    if (!qs('#legalModal')) {
      var legalModal = document.createElement('div');
      legalModal.className = 'modal-backdrop';
      legalModal.id = 'legalModal';
      legalModal.innerHTML = [
        '<div class="modal" style="max-width:520px;">',
        '  <div class="modal-header"><span class="modal-title">Legal Notices</span>',
        '    <button class="modal-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '  </div>',
        '  <div class="modal-body" style="max-height:60vh;overflow-y:auto;">',
        '    <p style="font-size:13px;color:var(--text-2);line-height:1.7;">',
        '      <strong>OMA Apps Details</strong> is an internal platform owned and operated by Orange SA.<br><br>',
        '      All data, KPIs, ratings, reviews and metrics displayed on this platform are sourced from official app stores (Google Play, Apple App Store, Huawei AppGallery) and Orange internal data systems.<br><br>',
        '      Access to this platform is strictly reserved for authorised Orange Group employees and partners. Unauthorised access or distribution of data is prohibited.<br><br>',
        '      &copy; Orange SA 2026 \u2014 All rights reserved.',
        '    </p>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(legalModal);
    }

    if (!qs('#apiModal')) {
      var apiModal = document.createElement('div');
      apiModal.className = 'modal-backdrop';
      apiModal.id = 'apiModal';
      apiModal.innerHTML = [
        '<div class="modal" style="max-width:520px;">',
        '  <div class="modal-header">',
        '    <span class="modal-title" id="apiModalTitle">API V2</span>',
        '    <button class="modal-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '  </div>',
        '  <div class="modal-body" style="max-height:60vh;overflow-y:auto;">',
        '    <p style="font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:12px;">',
        '      The <strong id="apiModalName">OMA API V2</strong> provides programmatic access to app KPIs, ratings, reviews and store metadata for all Orange Group applications.',
        '    </p>',
        '    <div style="background:var(--bg);border-radius:var(--r-md);padding:16px;font-size:13px;display:flex;flex-direction:column;gap:10px;">',
        '      <div><strong>Base URL</strong><br><code id="apiModalBase" style="font-size:11px;color:var(--orange);">https://api.oma.orange.com/v2</code></div>',
        '      <div><strong>Authentication</strong><br>Bearer token — contact the platform team to request access.</div>',
        '      <div><strong>Documentation</strong><br><a href="#" style="color:var(--orange);">Swagger / OpenAPI Spec \u2192</a></div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(apiModal);
    }

    // Wire up footer links
    qsa('.footer-link[data-modal]').forEach(function (link) {
      on(link, 'click', function (e) {
        e.preventDefault();
        var modal = qs('#' + link.dataset.modal);
        if (modal) openModal(modal);
      });
    });

    // Wire up footer links that don't already have data-modal (by text content)
    qsa('.footer-link').forEach(function (link) {
      if (link.dataset.modal) return; // already handled above
      var txt = link.textContent.trim().toLowerCase();
      on(link, 'click', function (e) {
        e.preventDefault();
        if (txt.indexOf('contact') > -1) {
          openModal(qs('#contactModal'));
        } else if (txt.indexOf('legal') > -1) {
          openModal(qs('#legalModal'));
        } else if (txt.indexOf('api v2') > -1 || txt === 'api v2') {
          var m = qs('#apiModal');
          if (m) {
            qs('#apiModalTitle', m).textContent = 'API V2';
            qs('#apiModalName', m).textContent = 'OMA API V2';
            qs('#apiModalBase', m).textContent = 'https://api.oma.orange.com/v2';
            openModal(m);
          }
        } else if (txt.indexOf('api v3') > -1 || txt === 'api v3') {
          var m = qs('#apiModal');
          if (m) {
            qs('#apiModalTitle', m).textContent = 'API V3';
            qs('#apiModalName', m).textContent = 'OMA API V3';
            qs('#apiModalBase', m).textContent = 'https://api.oma.orange.com/v3';
            openModal(m);
          }
        }
      });
    });
  }

  /* ---------- FILTER PANEL (Catalog) ---------- */
  function initFilterPanel() {
    var panel = qs('.filter-panel');
    var toggle = qs('#filterToggle');
    if (!panel || !toggle) return;

    // Mobile toggle — skip if inline script already wired it
    if (!toggle.dataset.wired) {
      toggle.dataset.wired = '1';
      var backdrop = document.createElement('div');
      backdrop.className = 'filter-backdrop';
      document.body.appendChild(backdrop);

      function openPanel() { panel.classList.add('open'); backdrop.classList.add('show'); }
      function closePanel() { panel.classList.remove('open'); backdrop.classList.remove('show'); }
      on(toggle, 'click', function () { panel.classList.contains('open') ? closePanel() : openPanel(); });
      on(backdrop, 'click', closePanel);
    }

    // Collapsible filter groups
    qsa('.fgrp-title', panel).forEach(function (title) {
      on(title, 'click', function () {
        title.parentElement.classList.toggle('collapsed');
        var arrow = qs('.fgrp-arrow', title);
        if (arrow) arrow.textContent = title.parentElement.classList.contains('collapsed') ? '▸' : '▾';
      });
    });

    // Filter checkboxes
    var chipBar = qs('.filter-chip-bar');
    var items = qsa('.app-card, .catalog-row');
    qsa('.fopt input[type=checkbox]', panel).forEach(function (cb) {
      on(cb, 'change', function () { applyFilters(panel, chipBar, items); });
    });

    // Clear all
    var clearAll = qs('.filter-clear-all', panel);
    if (clearAll) {
      on(clearAll, 'click', function () {
        qsa('.fopt input[type=checkbox]', panel).forEach(function (cb) { cb.checked = false; });
        applyFilters(panel, chipBar, items);
      });
    }

    // Search input
    var searchInput = qs('.catalog-search');
    if (searchInput) {
      on(searchInput, 'input', function () { applyFilters(panel, chipBar, items); });
    }

    // Sort dropdown
    var sortTrigger = qs('[data-dropdown="sortMenu"]');
    if (sortTrigger) {
      on(sortTrigger, 'dropdown-change', function (e) { sortItems(items, e.detail); });
    }

    // Items per page
    var ippTrigger = qs('[data-dropdown="ippMenu"]');
    if (ippTrigger) {
      on(ippTrigger, 'dropdown-change', function () { paginateCatalog(); });
    }

    // Popin for large filter lists (skip if inline script already wired it)
    qsa('.fgrp-seeall', panel).forEach(function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      on(btn, 'click', function (e) {
        e.stopPropagation();
        var popin = qs('.filter-popin', btn.closest('.fgrp'));
        if (popin) popin.classList.toggle('open');
      });
    });
  }

  function applyFilters(panel, chipBar, items) {
    // Gather active filters
    var filters = {};
    qsa('.fgrp', panel).forEach(function (grp) {
      var key = grp.dataset.filterKey;
      if (!key) return;
      var checked = [];
      qsa('.fopt input:checked', grp).forEach(function (cb) { checked.push(cb.value); });
      if (checked.length) filters[key] = checked;
    });

    // Search term
    var searchInput = qs('.catalog-search');
    var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    // Filter items
    items.forEach(function (item) {
      var show = true;
      // Check each filter group
      Object.keys(filters).forEach(function (key) {
        var val = (item.dataset[key] || '').toLowerCase();
        var match = filters[key].some(function (f) { return val.indexOf(f.toLowerCase()) > -1; });
        if (!match) show = false;
      });
      // Check search
      if (searchTerm && item.textContent.toLowerCase().indexOf(searchTerm) === -1) show = false;
      item.style.display = show ? '' : 'none';
    });

    // Update chips
    if (chipBar) {
      chipBar.innerHTML = '';
      Object.keys(filters).forEach(function (key) {
        filters[key].forEach(function (val) {
          var chip = document.createElement('span');
          chip.className = 'filter-chip';
          chip.innerHTML = val + ' <span class="filter-chip-x" data-key="' + key + '" data-val="' + val + '">&times;</span>';
          chipBar.appendChild(chip);
        });
      });
      if (Object.keys(filters).length) {
        var clear = document.createElement('span');
        clear.className = 'filter-clear';
        clear.textContent = 'Clear all';
        on(clear, 'click', function () {
          qsa('.fopt input[type=checkbox]', panel).forEach(function (cb) { cb.checked = false; });
          applyFilters(panel, chipBar, items);
        });
        chipBar.appendChild(clear);
      }
      // Chip remove
      qsa('.filter-chip-x', chipBar).forEach(function (x) {
        on(x, 'click', function () {
          var cb = qs('.fopt input[value="' + x.dataset.val + '"]', panel);
          if (cb) { cb.checked = false; applyFilters(panel, chipBar, items); }
        });
      });
    }

    // Update count
    var countEl = qs('.toolbar-count strong');
    if (countEl) {
      var visible = items.filter(function (i) { return i.style.display !== 'none'; }).length;
      countEl.textContent = visible;
    }
  }

  /* ---------- CATALOG PAGINATION (items-per-page) ---------- */
  function paginateCatalog() {
    var ippLabel = qs('[data-dropdown="ippMenu"] .dropdown-label');
    var ipp = ippLabel ? parseInt(ippLabel.textContent) : 12;
    if (isNaN(ipp) || ipp < 1) ipp = 12;
    var items = qsa('.app-card, .catalog-row');
    var visible = items.filter(function (i) { return i.style.display !== 'none'; });
    visible.forEach(function (item, i) { item.style.display = i < ipp ? '' : 'none'; });
    var countEl = qs('.toolbar-count strong');
    if (countEl) countEl.textContent = Math.min(visible.length, ipp);
  }

  function sortItems(items, criteria) {
    if (!items.length) return;
    var parent = items[0].parentNode;
    var sorted = items.slice().sort(function (a, b) {
      switch (criteria) {
        case 'Name A-Z': return (a.dataset.name || a.textContent).localeCompare(b.dataset.name || b.textContent);
        case 'Name Z-A': return (b.dataset.name || b.textContent).localeCompare(a.dataset.name || a.textContent);
        case 'Rating':
          return parseFloat(b.dataset.rating || 0) - parseFloat(a.dataset.rating || 0);
        case 'Downloads':
          return parseFloat(b.dataset.downloads || 0) - parseFloat(a.dataset.downloads || 0);
        default: return 0;
      }
    });
    sorted.forEach(function (item) { parent.appendChild(item); });
  }

  /* ---------- PLATFORM TABS (App detail) ---------- */
  function initPlatformTabs() {
    // Generic platform-tabs containers (data-platform attribute based)
    qsa('.platform-tabs').forEach(function (container) {
      var tabs = qsa('.platform-tab', container);
      tabs.forEach(function (tab) {
        on(tab, 'click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var target = tab.dataset.platform;
          qsa('[data-platform-content]').forEach(function (p) {
            p.style.display = p.dataset.platformContent === target || target === 'all' ? '' : 'none';
          });
        });
      });
    });

    // err-tab buttons (app-errors, app-store-view, app-devices, app-summary) — active state + content switching
    qsa('.err-tab').forEach(function (tab) {
      var siblings = qsa('.err-tab', tab.parentNode);
      on(tab, 'click', function () {
        siblings.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        // Content switching via data-err-platform attribute on section wrappers
        var target = tab.dataset.errPlatform;
        if (target) {
          qsa('[data-err-platform]:not(.err-tab)').forEach(function (section) {
            section.style.display = section.dataset.errPlatform === target || target === 'all' ? '' : 'none';
          });
          // Update KPI values if the page has platform-specific data attributes
          qsa('.kpi-value[data-android-val], .kpi-value[data-ios-val]').forEach(function (el) {
            var val = target === 'android' ? el.dataset.androidVal :
                      target === 'ios'     ? el.dataset.iosVal :
                      target === 'huawei'  ? el.dataset.huaweiVal :
                      el.dataset.allVal || el.textContent;
            if (val) el.textContent = val;
          });
          // Update KPI trends
          qsa('.kpi-trend[data-android-trend]').forEach(function (el) {
            var val = target === 'android' ? el.dataset.androidTrend :
                      target === 'ios'     ? el.dataset.iosTrend :
                      target === 'huawei'  ? el.dataset.huaweiTrend :
                      el.dataset.allTrend || el.textContent;
            if (val) {
              el.textContent = val;
              el.className = 'kpi-trend ' + (val.includes('↑') ? 'trend-up' : val.includes('↓') ? 'trend-down' : '');
            }
          });
          // Update KPI help text (sub-label)
          qsa('.kpi-help[data-android-help]').forEach(function (el) {
            var val = target === 'android' ? el.dataset.androidHelp :
                      target === 'ios'     ? el.dataset.iosHelp :
                      target === 'huawei'  ? el.dataset.huaweiHelp :
                      el.dataset.allHelp || el.textContent;
            if (val) el.textContent = val;
          });
        }
      });
    });
  }

  /* ---------- RANGE BUTTONS ---------- */
  function initRangeBtns() {
    qsa('.range-group').forEach(function (group) {
      var btns = qsa('.range-btn', group);
      btns.forEach(function (btn) {
        on(btn, 'click', function () {
          btns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          // dispatch event for chart update
          group.dispatchEvent(new CustomEvent('range-change', { detail: btn.dataset.range }));
        });
      });
    });
  }

  /* ---------- FAVORITE TOGGLE ---------- */
  var FAV_HEART_SVG = '<svg viewBox="0 0 24 24" fill="%FILL%" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  function favHeartSvg(filled) { return FAV_HEART_SVG.replace('%FILL%', filled ? 'currentColor' : 'none'); }

  function initFavorites() {
    // Render .app-info-fav as a pill button with SVG heart + label text
    qsa('.app-info-fav').forEach(function (btn) {
      if (!btn.dataset.favInit) {
        btn.dataset.favInit = '1';
        var isFav = btn.classList.contains('active');
        btn.innerHTML = favHeartSvg(isFav) + (isFav ? 'Favorited' : 'Add to favorites');
      }
    });

    qsa('.app-card-fav, .app-info-fav').forEach(function (btn) {
      on(btn, 'click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('active');
        var isFav = btn.classList.contains('active');
        if (btn.classList.contains('app-info-fav')) {
          btn.innerHTML = favHeartSvg(isFav) + (isFav ? 'Favorited' : 'Add to favorites');
        } else {
          btn.textContent = isFav ? '♥' : '♡';
        }
        showToast(isFav ? 'Added to favorites' : 'Removed from favorites');
      });
    });
  }

  /* ---------- EXPORT BUTTONS ---------- */
  function initExportBtns() {
    qsa('.btn-export, [data-action="export"]').forEach(function (btn) {
      on(btn, 'click', function (e) {
        e.preventDefault();
        showToast('Export started — file will download shortly');
      });
    });
  }

  /* ---------- HEADER SEARCH ---------- */
  var SEARCH_APPS = [
    { name: 'Orange et moi France', country: 'France', store: 'Android · iOS · Huawei', color: '#ff7900', initials: 'OEM', href: 'app-summary.html' },
    { name: 'Orange Bank', country: 'France', store: 'Android · iOS', color: '#0070c0', initials: 'OB', href: 'app-summary.html' },
    { name: 'TV d\'Orange', country: 'France', store: 'Android · iOS · Huawei', color: '#6a1de8', initials: 'TV', href: 'app-summary.html' },
    { name: 'Mail Orange', country: 'France', store: 'Android · iOS', color: '#198754', initials: 'MO', href: 'app-summary.html' },
    { name: 'Mon Réseau Orange', country: 'France', store: 'Android · iOS', color: '#dc3545', initials: 'MR', href: 'app-summary.html' },
    { name: 'Orange Money', country: 'Senegal', store: 'Android · iOS', color: '#ff7900', initials: 'OM', href: 'app-summary.html' },
    { name: 'Orange et moi Africa', country: 'Ivory Coast', store: 'Android', color: '#fd7e14', initials: 'OA', href: 'app-summary.html' },
    { name: 'Simyo', country: 'Spain', store: 'Android · iOS', color: '#0dcaf0', initials: 'SM', href: 'app-summary.html' },
    { name: 'Djingo', country: 'France', store: 'Android · iOS', color: '#e83e8c', initials: 'DJ', href: 'app-summary.html' },
    { name: 'Orange Go', country: 'Belgium', store: 'Android · iOS', color: '#20c997', initials: 'OG', href: 'app-summary.html' },
    { name: 'Orange Pro', country: 'France', store: 'Android · iOS', color: '#6610f2', initials: 'OP', href: 'app-summary.html' },
    { name: 'Recharge Orange', country: 'France', store: 'Android · iOS', color: '#adb5bd', initials: 'RO', href: 'app-summary.html' }
  ];

  function initHeaderSearch() {
    var input = qs('#headerSearch');
    if (!input) return;

    // Create results container
    var resultsEl = document.createElement('div');
    resultsEl.className = 'header-search-results';
    resultsEl.id = 'headerSearchResults';
    input.parentElement.appendChild(resultsEl);

    function renderResults(term) {
      resultsEl.innerHTML = '';
      if (!term || term.length < 1) { resultsEl.classList.remove('open'); return; }
      var matches = SEARCH_APPS.filter(function (a) {
        return a.name.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
               a.country.toLowerCase().indexOf(term.toLowerCase()) !== -1;
      }).slice(0, 6);
      if (matches.length === 0) {
        resultsEl.innerHTML = '<div class="header-search-result-empty">No apps found for "' + term + '"</div>';
      } else {
        matches.forEach(function (app) {
          var item = document.createElement('a');
          item.className = 'header-search-result';
          item.href = app.href;
          item.innerHTML = '<div class="header-search-result-icon" style="background:' + app.color + ';">' + app.initials + '</div>' +
            '<div><div class="header-search-result-name">' + app.name + '</div>' +
            '<div class="header-search-result-meta">' + app.store + ' · ' + app.country + '</div></div>';
          resultsEl.appendChild(item);
        });
      }
      resultsEl.classList.add('open');
    }

    on(input, 'input', function () { renderResults(input.value.trim()); });
    on(input, 'focus', function () { if (input.value.trim()) renderResults(input.value.trim()); });
    on(input, 'keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        resultsEl.classList.remove('open');
        window.location.href = 'catalog-list.html?q=' + encodeURIComponent(input.value.trim());
      }
      if (e.key === 'Escape') { resultsEl.classList.remove('open'); input.blur(); }
    });
    on(resultsEl, 'click', function (e) { e.stopPropagation(); });
  }

  /* ---------- APP FAMILY CHEVRON ---------- */
  function initAppFamilyChevron() {
    var chevrons = qsa('[data-app-family]');
    chevrons.forEach(function (chevron) {
      var menuId = chevron.dataset.appFamily;
      var menu = qs('#' + menuId);
      if (!menu) return;
      on(chevron, 'click', function (e) {
        e.stopPropagation();
        qsa('.app-family-menu.open').forEach(function (m) { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
      });
      qsa('.dropdown-item', menu).forEach(function (item) {
        on(item, 'click', function () {
          if (item.dataset.href) window.location.href = item.dataset.href;
          menu.classList.remove('open');
        });
      });
    });
  }

  /* ---------- REVIEWS FILTERS ---------- */
  function initReviewFilters() {
    var cards = qsa('.review-card');
    if (!cards.length) return;

    var filters = { stars: 'all', sentiment: 'all', store: 'all' };

    function applyReviewFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var starsOk = filters.stars === 'all' || card.dataset.stars === filters.stars;
        var sentOk  = filters.sentiment === 'all' || card.dataset.sentiment === filters.sentiment;
        var storeOk = filters.store === 'all' || card.dataset.store === filters.store;
        var show = starsOk && sentOk && storeOk;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      // Update count label if present
      var countEl = qs('.reviews-count strong');
      if (countEl && filters.store !== 'all') {
        var storeLabel = filters.store === 'android' ? 'Android' : filters.store === 'ios' ? 'iOS' : 'Huawei';
        countEl.closest('.reviews-count').innerHTML = '<strong style="color:var(--text);">' + visible + '</strong> reviews shown · Filtered by ' + storeLabel;
      } else if (countEl) {
        countEl.closest('.reviews-count').innerHTML = '<strong style="color:var(--text);">32,814</strong> reviews · Sorted by Most Recent';
      }
    }

    // Stars filter
    var starsMenu = qs('#starsMenuR');
    if (starsMenu) {
      qsa('.dropdown-item', starsMenu).forEach(function (item) {
        on(item, 'click', function () {
          filters.stars = item.dataset.value || 'all';
          applyReviewFilters();
        });
      });
    }

    // Status/Sentiment filter
    var statusMenu = qs('#statusMenuR');
    if (statusMenu) {
      qsa('.dropdown-item', statusMenu).forEach(function (item) {
        on(item, 'click', function () {
          filters.sentiment = item.dataset.value || 'all';
          applyReviewFilters();
        });
      });
    }

    // Store filter
    var storeMenu = qs('#storeMenuR');
    if (storeMenu) {
      qsa('.dropdown-item', storeMenu).forEach(function (item) {
        on(item, 'click', function () {
          filters.store = item.dataset.value || 'all';
          applyReviewFilters();
        });
      });
    }
  }

  /* ---------- INFO BAR STORE BADGE SWITCHING ---------- */
  function initInfoBarStoreSwitching() {
    var storeBadges = qsa('.app-info-meta .badge-android, .app-info-meta .badge-ios, .app-info-meta .badge-huawei');
    if (!storeBadges.length) return;
    // Mark the first badge as active by default
    if (!storeBadges.some(function (b) { return b.classList.contains('active'); })) {
      storeBadges[0].classList.add('active');
    }
    storeBadges.forEach(function (badge) {
      on(badge, 'click', function () {
        var platform = badge.classList.contains('badge-android') ? 'android'
                     : badge.classList.contains('badge-ios')     ? 'ios'
                     : 'huawei';
        storeBadges.forEach(function (b) { b.classList.remove('active'); });
        badge.classList.add('active');
        // Trigger the matching .err-tab if present (errors, store-view, devices, etc.)
        var tab = qs('.err-tab[data-err-platform="' + platform + '"]');
        if (tab) tab.click();
      });
    });
  }

  /* ---------- GLOBAL: CLOSE ON OUTSIDE CLICK / ESC ---------- */
  function initGlobalClose() {
    on(document, 'click', function () {
      qsa('.dropdown-menu.open').forEach(function (m) { m.classList.remove('open'); });
      qsa('#notifPanel.open, #userMenu.open').forEach(function (p) { p.classList.remove('open'); });
      qsa('.filter-popin.open').forEach(function (p) { p.classList.remove('open'); });
      qsa('.app-family-menu.open').forEach(function (m) { m.classList.remove('open'); });
      var sr = qs('#headerSearchResults');
      if (sr) sr.classList.remove('open');
    });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') {
        qsa('.dropdown-menu.open').forEach(function (m) { m.classList.remove('open'); });
        qsa('.modal-overlay.open, .modal-backdrop.open').forEach(function (m) { closeModal(m); });
        qsa('.filter-popin.open').forEach(function (p) { p.classList.remove('open'); });
        qsa('#notifPanel.open, #userMenu.open').forEach(function (p) { p.classList.remove('open'); });
        qsa('.app-family-menu.open').forEach(function (m) { m.classList.remove('open'); });
        var sr = qs('#headerSearchResults');
        if (sr) { sr.classList.remove('open'); }
      }
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    // Inject body classes so CSS can scope footer margins per page type
    if (qs('.filter-panel'))    document.body.classList.add('has-filter-panel');
    if (qs('.app-sidebar-nav')) document.body.classList.add('has-app-sidebar');

    initDropdowns();
    initModals();
    initTabs();
    initTableSort();
    initTableSearch();
    initPagination();
    initHeader();
    initHeaderSearch();
    initFilterPanel();
    initPlatformTabs();
    initInfoBarStoreSwitching();
    initRangeBtns();
    initFavorites();
    initExportBtns();
    initFooterModals();
    initAppFamilyChevron();
    initReviewFilters();
    initGlobalClose();
    fixUserMenuIcons();
    fixPlatformTabEmoji();
    fixPlatformBadges();
  }

  /* ---------- FIX PLATFORM TAB EMOJI (strips emoji from .err-tab buttons) ---------- */
  function fixPlatformTabEmoji() {
    var platformColors = { android: '#3ddc84', ios: '#555', huawei: '#cf0a2c', all: 'var(--orange)' };
    qsa('.err-tab').forEach(function(btn) {
      var platform = (btn.getAttribute('data-err-platform') || '').toLowerCase();
      // Strip all emoji characters from text
      var clean = btn.textContent.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      var color = platformColors[platform] || 'var(--orange)';
      var dot = platform && platform !== 'all'
        ? '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + color + ';margin-right:5px;flex-shrink:0;"></span>'
        : '';
      btn.innerHTML = dot + clean;
    });
  }

  /* ---------- FIX USER MENU ICONS (replaces emoji with SVG) ---------- */
  function fixUserMenuIcons() {
    var map = {
      '\u2699\uFE0F': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
      '\uD83D\uDC64': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      '\uD83D\uDCCA': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      '\uD83D\uDEAA': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    };
    qsa('.user-menu-item').forEach(function(item) {
      var text = item.textContent.trim();
      Object.keys(map).forEach(function(emoji) {
        if (text.includes(emoji)) {
          var label = text.replace(emoji, '').trim();
          item.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">' + map[emoji] + label + '</span>';
        }
      });
    });
  }

  /* ---------- FIX PLATFORM BADGES (swaps badge-dark/gray/blue to platform-specific color classes) ---------- */
  function fixPlatformBadges() {
    qsa('.badge').forEach(function(badge) {
      var text = badge.textContent.trim();
      if (text === 'Android') {
        badge.classList.remove('badge-dark', 'badge-gray', 'badge-blue');
        badge.classList.add('badge-android');
      } else if (text === 'iOS') {
        badge.classList.remove('badge-dark', 'badge-gray', 'badge-blue');
        badge.classList.add('badge-ios');
      } else if (text === 'Huawei') {
        badge.classList.remove('badge-dark', 'badge-gray', 'badge-blue');
        badge.classList.add('badge-huawei');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
