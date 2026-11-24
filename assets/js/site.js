(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header shadow
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  // Dropdown menus: hover/focus on desktop (CSS), tap to expand on mobile
  document.querySelectorAll('.menu-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('.has-menu');
      var open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.has-menu.open').forEach(function (li) {
      li.classList.remove('open');
      li.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (window.innerWidth <= 960) return;
    document.querySelectorAll('.has-menu.open').forEach(function (li) { if (!li.contains(e.target)) li.classList.remove('open'); });
  });

  // Reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Stagger the task chips once their list is revealed
  document.querySelectorAll('.chips li').forEach(function (li, i) { li.style.transitionDelay = (i * 35) + 'ms'; });

  // Count-up stats; keeps the thousands separator if the value has one (e.g. 200,000)
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, raw = el.getAttribute('data-count'), target = parseInt(raw.replace(/,/g, ''), 10);
        co.unobserve(el);
        if (isNaN(target) || (target >= 1900 && target <= 2100)) return; // years stay static
        var commas = raw.indexOf(',') !== -1, start = performance.now(), dur = 1600;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = commas ? v.toLocaleString('en-US') : String(v);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { co.observe(n); });
  }

  // Role directory: the photo beside the board shows the role you point at or tab to
  var board = document.querySelector('[data-board]');
  var boardImg = document.querySelector('[data-board-img]');
  if (board && boardImg) {
    var show = function (a) {
      board.querySelectorAll('a.is-on').forEach(function (x) { x.classList.remove('is-on'); });
      a.classList.add('is-on');
      var src = a.getAttribute('data-img');
      if (!src || boardImg.getAttribute('src') === src) return;
      boardImg.classList.add('is-swapping');
      var next = new Image();
      next.onload = next.onerror = function () { boardImg.src = src; boardImg.classList.remove('is-swapping'); };
      next.src = src;
    };
    board.addEventListener('mouseover', function (e) { var a = e.target.closest('a[data-img]'); if (a) show(a); });
    board.addEventListener('focusin', function (e) { var a = e.target.closest('a[data-img]'); if (a) show(a); });
    window.ssgBoardFirst = function () { var a = board.querySelector('li:not([hidden]) a[data-img]'); if (a) show(a); };
  }

  // Filter tabs (roles, jobs)
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var section = tabs.closest('section');
    var target = section && section.querySelector('[data-filter-target]');
    if (!target) return;
    var apply = function (f) {
      target.querySelectorAll('[data-cat]').forEach(function (el) {
        var show = f === 'all' || el.getAttribute('data-cat') === f;
        el.hidden = !show;
        if (show) el.classList.add('in');
      });
      // Cards moved: let GSAP's scroll triggers recalculate (plugins/gsap-motion/motion.js)
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (window.ssgRevealVisible) window.ssgRevealVisible();
      if (window.ssgBoardFirst) window.ssgBoardFirst();
    };
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      apply(b.getAttribute('data-filter'));
    });
    var first = tabs.querySelector('button[aria-selected="true"]');
    if (first) apply(first.getAttribute('data-filter'));
  });

  // Testimonial slider buttons
  var slider = document.querySelector('[data-slider]');
  document.querySelectorAll('[data-slide]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!slider) return;
      var card = slider.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 22 : 320;
      var dir = parseInt(b.getAttribute('data-slide'), 10);
      var atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
      if (dir > 0 && atEnd) slider.scrollTo({ left: 0, behavior: 'smooth' });
      else slider.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
  });

  // File input label
  document.querySelectorAll('.file-drop input[type=file]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var label = inp.parentElement.querySelector('[data-file-label]');
      if (label && inp.files[0]) { label.textContent = inp.files[0].name; inp.parentElement.classList.add('has-file'); }
    });
  });
})();
