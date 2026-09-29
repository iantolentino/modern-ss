/* ============================================================================
   STRATA STAFF GLOBAL — behaviour for the "AGENDA" notice-pack build.

   Progressive enhancement only. Without this file the whole site still reads:
   the highlighter is simply already drawn, the register shows its first five
   posts, the tabs work on their own via :checked, and the folio rail shows the
   pack's index rather than a live position.
   ========================================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------- 1. contents drawer */
  var drawer = document.getElementById('drawer');
  var openers = document.querySelectorAll('[data-drawer-open]');
  var closer = document.querySelector('[data-drawer-close]');
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.removeAttribute('inert');
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var f = drawer.querySelector('a, button');
    if (f) f.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('inert', '');
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  openers.forEach(function (b) { b.addEventListener('click', openDrawer); });
  if (closer) closer.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });
  }

  /* ------------------------------------------------------- 2. the highlighter
     The cover's operative words are swept once on arrival, and the closing
     statement once at the resolution. Nowhere else on the site. The layer is
     authored in the markup; this only drives the reveal, so with no JavaScript
     the stroke is already drawn and nothing is hidden. */
  var marks = document.querySelectorAll('.mark[data-mark]');
  if (marks.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      marks.forEach(function (m) { m.classList.add('is-drawn'); });
    } else {
      var mo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var t = en.target;
          setTimeout(function () { t.classList.add('is-drawn'); }, 150);
          mo.unobserve(t);
        });
      }, { threshold: 0.4 });
      marks.forEach(function (m) { mo.observe(m); });
    }
  }

  /* ------------------------------------------------- 3. stamp impressions
     The resolution's CARRIED stamp settles onto the sheet once. */
  var settles = document.querySelectorAll('.stamp--settle');
  if (settles.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      settles.forEach(function (s) { s.classList.add('is-in'); });
    } else {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var t = en.target;
          setTimeout(function () { t.classList.add('is-in'); }, 160);
          so.unobserve(t);
        });
      }, { threshold: 0.5 });
      settles.forEach(function (s) { so.observe(s); });
    }
  }

  /* --------------------------------------------------------- 4. folio rail
     Which section is under the reader, and how many the page holds.

     This counts *position*, not the printed item number. The home page's
     sections are named rather than numbered, and an earlier version keyed the
     rail off `[data-item]`, so on that page it found nothing and left the
     static "01 / 01" placeholder on screen. Counting `section.item` and
     reporting the index works on every page, numbered or not. */
  var items = Array.prototype.slice.call(document.querySelectorAll('section.item'));
  var folioNow = document.querySelectorAll('[data-folio-now]');
  var folioAll = document.querySelectorAll('[data-folio-all]');
  if (items.length && folioNow.length) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    folioAll.forEach(function (e) { e.textContent = pad(items.length); });
    var setFolio = function (n) {
      folioNow.forEach(function (e) { e.textContent = pad(n); });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setFolio(items.indexOf(en.target) + 1);
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      items.forEach(function (i) { io.observe(i); });
    } else {
      setFolio(1);
    }
  }

  /* -------------------------------------------------- 5. the capacity control
     Signature interaction. The register decomposes the 200,000-a-month figure
     into posts the reader can count, and traces the real 5-to-21 trajectory
     Strata Choice described in their own statement. Illustrative, and labelled
     as such in the page. */
  var cap = document.getElementById('capacity');
  var rows = document.getElementById('reg-rows');
  var poolEl = document.getElementById('reg-pool');
  if (cap && rows && poolEl) {
    var pool;
    try { pool = JSON.parse(poolEl.textContent); } catch (e) { pool = []; }
    var outN = document.querySelectorAll('[data-reg-n]');
    var outPhase = document.querySelectorAll('[data-reg-phase]');
    var outTasks = document.querySelectorAll('[data-reg-tasks]');
    var rowList = [];

    function build(n) {
      var have = rowList.length;
      if (n > have) {
        for (var i = have; i < n; i++) {
          var p = pool[i % pool.length];
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td class="n">' + String(i + 1).padStart(2, '0') + '</td>' +
            '<td class="role">' + p.role + '</td>' +
            '<td class="task">' + p.task + '</td>' +
            '<td class="ref">' + p.ref + '</td>';
          tr.className = 'is-new';
          rows.appendChild(tr);
          rowList.push(tr);
        }
      } else if (n < have) {
        for (var j = have - 1; j >= n; j--) {
          rows.removeChild(rowList[j]);
          rowList.pop();
        }
      }
    }

    function phase(n) {
      if (n <= 6) return 'FOUNDATION SQUAD';
      if (n <= 11) return 'FULL STRATA DESK';
      if (n <= 16) return 'DESK PLUS PROPERTY MANAGEMENT';
      return 'TWO-SHIFT COVERAGE';
    }

    function update() {
      var n = parseInt(cap.value, 10);
      build(n);
      outN.forEach(function (e) { e.textContent = n; });
      outPhase.forEach(function (e) { e.textContent = phase(n); });
      // The 200,000+ figure is the company's whole monthly volume; this line
      // scales it illustratively and says so on the page.
      outTasks.forEach(function (e) { e.textContent = (n * 9).toLocaleString('en-AU') + 'k'; });
      cap.setAttribute('aria-valuetext', n + ' specialists on your offshore team');
    }

    cap.addEventListener('input', update);
    build(parseInt(cap.value, 10) || 5);
    update();
  }

  /* --------------------------------------------------------------- 6. forms
     Front-end only. Errors name the problem and the recovery; success replaces
     the form with a filed notice rather than an alert. */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var status = form.querySelector('.form__status');
    form.setAttribute('novalidate', '');

    /* Wire each error to the control it describes, so a screen reader hears the
       message as part of the field rather than as loose text. Done here rather
       than in the markup because this is enhancement, not content. */
    form.querySelectorAll('.field').forEach(function (field, i) {
      var ctl = field.querySelector('input, select, textarea');
      var err = field.querySelector('.field__err');
      if (!ctl || !err) return;
      if (!err.id) err.id = (form.id || 'form') + '-err-' + i;
      err.setAttribute('role', 'alert');
      var described = (ctl.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (described.indexOf(err.id) === -1) described.push(err.id);
      ctl.setAttribute('aria-describedby', described.join(' '));
    });

    function clear(field) {
      field.removeAttribute('data-invalid');
      var ctl = field.querySelector('input, select, textarea');
      if (ctl) ctl.removeAttribute('aria-invalid');
      var err = field.querySelector('.field__err');
      if (err) { err.hidden = true; err.textContent = ''; }
    }
    function fail(field, msg) {
      field.setAttribute('data-invalid', '');
      var ctl = field.querySelector('input, select, textarea');
      if (ctl) ctl.setAttribute('aria-invalid', 'true');
      var err = field.querySelector('.field__err');
      if (err) { err.hidden = false; err.textContent = msg; }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('.field').forEach(function (field) {
        clear(field);
        var ctl = field.querySelector('input, select, textarea');
        if (!ctl || ctl.disabled) return;
        var val = (ctl.value || '').trim();
        if (ctl.hasAttribute('required') && !val) {
          fail(field, 'Required — ' + (ctl.getAttribute('data-name') || ctl.name) + ' is needed to file this.');
          firstBad = firstBad || ctl;
          return;
        }
        if (ctl.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
          fail(field, 'That email is missing a domain — try name@agency.com.au');
          firstBad = firstBad || ctl;
        }
        if (ctl.type === 'tel' && val && val.replace(/[^\d]/g, '').length < 8) {
          fail(field, 'That number looks short — include the area or country code.');
          firstBad = firstBad || ctl;
        }
      });
      if (firstBad) { firstBad.focus(); return; }

      if (status) {
        form.querySelectorAll('.form__fieldset, .form__acts').forEach(function (n) { n.hidden = true; });
        status.hidden = false;
        status.setAttribute('tabindex', '-1');
        status.focus();
      }
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field) clear(field);
    });
  });

  /* ------------------------------------------------------------- 7. cookies */
  var cookies = document.getElementById('cookies');
  if (cookies) {
    var KEY = 'ssg.notice.cookies';
    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) {}
    if (!stored) {
      cookies.hidden = false;
      cookies.querySelectorAll('[data-cookie]').forEach(function (b) {
        b.addEventListener('click', function () {
          try { window.localStorage.setItem(KEY, b.getAttribute('data-cookie')); } catch (e) {}
          cookies.hidden = true;
        });
      });
    }
  }

  /* ------------------------------------- 8. the year in the back cover line */
  document.querySelectorAll('[data-year]').forEach(function (e) {
    e.textContent = new Date().getFullYear();
  });
})();
