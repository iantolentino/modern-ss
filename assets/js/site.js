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
    if (window.innerWidth <= 1180) return; // the phone-style menu is used up to 1180px
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

  // Membership logos: a window of four that steps along by one, like a phone home screen
  document.querySelectorAll('[data-members]').forEach(function (track) {
    if (reduce || track.children.length < 2) return;
    var paused = false;
    track.parentElement.addEventListener('mouseenter', function () { paused = true; });
    track.parentElement.addEventListener('mouseleave', function () { paused = false; });
    track.addEventListener('focusin', function () { paused = true; });
    track.addEventListener('focusout', function () { paused = false; });
    setInterval(function () {
      // Only slide when there are more logos than fit (four on desktop, two on phones)
      if (paused || document.hidden || track.scrollWidth <= track.parentElement.clientWidth + 2) return;
      var first = track.firstElementChild;
      var step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.style.transition = 'transform .6s cubic-bezier(.23, 1, .32, 1)';
      track.style.transform = 'translateX(' + (-step) + 'px)';
      track.addEventListener('transitionend', function done() {
        track.removeEventListener('transitionend', done);
        track.style.transition = 'none';
        track.appendChild(first);
        track.style.transform = 'none';
      });
    }, 3200);
  });

  // Rotating client quotes: one at a time, cross-fading every 7 seconds
  document.querySelectorAll('[data-rotate]').forEach(function (box) {
    var items = box.children;
    if (items.length < 2 || reduce) return;
    var i = 0, paused = false;
    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      items[i].hidden = true;
      i = (i + 1) % items.length;
      items[i].hidden = false;
      items[i].classList.remove('is-in'); void items[i].offsetWidth; items[i].classList.add('is-in');
    }, 7000);
  });

  // Horizontal sliders (Solutions role groups): previous/next move by one card
  document.querySelectorAll('[data-hs-track]').forEach(function (track) {
    var prev = document.querySelector('[data-hs-prev][aria-controls="' + track.id + '"]');
    var next = document.querySelector('[data-hs-next][aria-controls="' + track.id + '"]');
    if (!prev || !next) return;
    var step = function () { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300; };
    var sync = function () {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      // Nothing to slide (everything already fits): hide the arrows
      prev.parentElement.style.visibility = track.scrollWidth <= track.clientWidth + 4 ? 'hidden' : '';
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  // "Show all" buttons reveal the rest of a list
  document.querySelectorAll('[data-show-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var more = document.getElementById(b.getAttribute('data-show-all'));
      if (!more) return;
      more.hidden = false;
      more.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in', 'revealed'); el.style.opacity = 1; el.style.visibility = 'visible'; el.style.transform = 'none'; });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      b.parentElement.remove();
    });
  });

  // Booking form: weekdays only, and the chosen Philippine-time slot shown in the visitor's own time zone
  document.querySelectorAll('[data-booking]').forEach(function (form) {
    var date = form.querySelector('[data-book-date]');
    if (date) date.addEventListener('change', function () {
      var d = new Date(date.value + 'T12:00:00+08:00').getUTCDay();
      date.setCustomValidity(d === 0 || d === 6 ? 'Please choose a weekday.' : '');
    });
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    var local = form.querySelector('[data-book-local]');
    if (/Manila/.test(tz) || new Date().getTimezoneOffset() === -480 || !local) return; // already on UTC+8
    var show = function () {
      var picked = form.querySelector('input[name=time]:checked');
      if (!picked) return;
      var day = (date && date.value) || new Date().toISOString().slice(0, 10);
      var when = new Date(day + 'T' + picked.value + ':00+08:00');
      local.textContent = 'That is ' + when.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) + ' where you are.';
      local.hidden = false;
    };
    form.addEventListener('change', show);
    show();
  });

  // Client video: the 165 MB file only loads when the visitor presses play
  document.querySelectorAll('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = document.createElement('video');
      v.src = b.getAttribute('data-video'); v.controls = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('aria-label', b.getAttribute('aria-label').replace(/^Play /, ''));
      b.replaceWith(v); v.focus();
    });
  });

  // Task chips: phones show ten, this button shows the rest
  document.querySelectorAll('[data-chips-more]').forEach(function (b) {
    b.addEventListener('click', function () { b.previousElementSibling.classList.add('is-open'); b.remove(); });
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
      // A role slider starts again from the first card of the chosen category
      if (target.hasAttribute('data-hs-track')) { target.scrollLeft = 0; target.dispatchEvent(new Event('scroll')); }
      // Cards moved: let GSAP's scroll triggers recalculate (plugins/gsap-motion/motion.js)
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (window.ssgRevealVisible) window.ssgRevealVisible();
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
