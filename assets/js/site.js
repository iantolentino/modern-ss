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

  // Rotating role names in the hero
  var rot = document.querySelector('.rotator-words');
  if (rot && !reduce) {
    var words = [];
    try { words = JSON.parse(rot.getAttribute('data-words')); } catch (e) {}
    var idx = 0;
    if (words.length > 1) setInterval(function () {
      idx = (idx + 1) % words.length;
      var span = document.createElement('span');
      span.className = 'rotator-word';
      span.textContent = words[idx];
      rot.replaceChildren(span);
    }, 2600);
  }

  // Gentle parallax on the hero photos (pointer devices only)
  var visual = document.querySelector('.hero-visual');
  if (visual && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var layers = visual.querySelectorAll('.hv-card');
    visual.closest('.hero').addEventListener('mousemove', function (e) {
      var r = visual.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
      layers.forEach(function (l, i) {
        var d = (i + 1) * 6;
        l.style.translate = (-x * d) + 'px ' + (-y * d) + 'px';
      });
    });
  }

  // Capacity calculator: managers x admin hours x weeks, updated as you type
  document.querySelectorAll('[data-calc]').forEach(function (form) {
    var num = function (n, min, max, d) { var v = parseFloat(form.elements[n].value); return isNaN(v) ? d : Math.min(max, Math.max(min, v)); };
    var update = function () {
      var total = Math.round(num('managers', 0, 500, 0) * num('hours', 0, 60, 0) * num('weeks', 1, 52, 48));
      var weeks = Math.round(total / 40 * 10) / 10;
      form.querySelector('[data-calc-hours]').textContent = total.toLocaleString('en-AU') + ' hrs';
      form.querySelector('[data-calc-copy]').textContent = "That's roughly " + weeks.toLocaleString('en-AU') + ' full 40-hour work weeks of manager time.';
    };
    form.addEventListener('input', update);
    update();
  });

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
