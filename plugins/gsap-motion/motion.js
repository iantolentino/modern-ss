/*
 * Strata Staff Global — GSAP motion layer.
 * Runs only when GSAP loaded and the visitor has no reduced-motion preference;
 * otherwise the CSS animations in site.css remain the fallback.
 */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ duration: 0.9, ease: 'power3.out' });
  // One-shot reveals stay "active" until the page end, so jumping past them
  // (anchor links like team#team, or a fast scroll) still fires them.
  // Scrubbed triggers below set their own end.
  ScrollTrigger.defaults({ end: 'max' });

  var root = document.documentElement;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return gsap.utils.toArray(s, ctx); };

  var mm = gsap.matchMedia();

  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 961px)',
    finePointer: '(pointer: fine)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (!c.motion) return;

    // GSAP takes over from the CSS keyframe/transition fallbacks
    root.classList.add('gsap');

    /* ---------- Home hero: the signature moment ----------
       The building is revealed floor by floor (blue storeys slide away bottom to top) while the
       headline rises in. Everything is visible by default; this only runs once, on load. */
    var hero = $('.fh-hero');
    if (hero) {
      var facade = $('[data-facade]', hero);
      var floors = [];
      if (facade) {
        var count = 9;
        for (var f = 0; f < count; f++) {
          var band = document.createElement('span');
          band.className = 'fh-facade-floor';
          band.setAttribute('aria-hidden', 'true');
          band.style.top = (f * 100 / count) + '%';
          band.style.height = (100 / count + 0.4) + '%';
          facade.appendChild(band);
          floors.push(band);
        }
        facade.classList.add('is-floors');
      }

      var heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      SplitText.create('.fh-hero h1', {
        type: 'lines, words', mask: 'lines', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.words, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: 'expo.out', delay: 0.1 });
        }
      });
      heroTl.from($$('.fh-hero-sub, .fh-hero-actions, .fh-trust', hero), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.35);
      if (floors.length) {
        heroTl.to(floors.slice().reverse(), { scaleX: 0, duration: 0.7, stagger: 0.06, ease: 'expo.inOut',
          onComplete: function () { floors.forEach(function (b) { b.remove(); }); } }, 0.15)
          .from($('img', facade), { scale: 1.08, duration: 1.4 }, 0.15);
      }
      heroTl.from('.fh-calc', { autoAlpha: 0, y: 12, duration: 0.6 }, 0.9);
    }

    /* ---------- Inner page heroes ---------- */
    var pageHero = $('.page-hero');
    if (pageHero && !hero) {
      var pageTl = gsap.timeline({ defaults: { duration: 0.9 } });
      pageTl.from($$('.crumbs, .eyebrow', pageHero), { autoAlpha: 0, y: 14, stagger: 0.08 });
      SplitText.create($('h1', pageHero), {
        type: 'lines, words', mask: 'lines', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.words, { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.04, delay: 0.15 });
        }
      });
      pageTl.from($$('.lede, .btn, .job-tags, .calc-note', pageHero), { autoAlpha: 0, y: 20, stagger: 0.08 }, 0.45);
      var portrait = $('.hero-portrait', pageHero) || $('.calc-card', pageHero);
      if (portrait) {
        pageTl.fromTo(portrait, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' }, 0.2);
      }
    }

    /* ---------- Generic reveals, batched so neighbours stagger together ---------- */
    var revealIn = function (batch) {
      // data-rv marks "reveal started"; .revealed (added on finish) re-enables CSS hover transitions
      batch = batch.filter(function (el) { return !el.dataset.rv; });
      if (!batch.length) return;
      batch.forEach(function (el) { el.dataset.rv = '1'; });
      gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06, overwrite: true,
        clearProps: 'transform',
        onComplete: function () { batch.forEach(function (el) { el.classList.add('revealed'); }); }
      });
    };
    gsap.set('.reveal', { autoAlpha: 0, y: 16 });
    ScrollTrigger.batch('.reveal', { start: 'top 90%', once: true, interval: 0.1, onEnter: revealIn });

    // Filters (team departments, role tabs) move cards into view without scrolling;
    // site.js calls this after filtering so newly visible cards don't stay hidden.
    window.ssgRevealVisible = function () {
      revealIn($$('.reveal').filter(function (el) {
        if (el.hidden || !el.offsetParent) return false;
        return el.getBoundingClientRect().top < window.innerHeight * 0.92;
      }));
    };

    /* ---------- Feature images: wipe open with a slow zoom ---------- */
    $$('.split-img img, .photo-pair img, .timeline-img').forEach(function (img) {
      gsap.timeline({ scrollTrigger: { trigger: img, start: 'top 85%', once: true } })
        .fromTo(img, { clipPath: 'inset(0% 0% 100% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'expo.out', clearProps: 'clipPath' })
        .from(img, { scale: 1.18, duration: 1.8, ease: 'expo.out' }, 0);
    });

    /* ---------- "How it works": progress line draws with scroll ---------- */
    var steps = $('.steps');
    if (steps && c.desktop) {
      gsap.fromTo(steps, { '--progress': 0 }, {
        '--progress': 1, ease: 'none',
        scrollTrigger: { trigger: steps, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
      });
    }

    /* ---------- Task chips pop in, scattered ---------- */
    var chips = $('.chips');
    if (chips) {
      gsap.from($$('li', chips), {
        autoAlpha: 0, y: 10, scale: 0.95, duration: 0.45, ease: 'expo.out',
        stagger: { each: 0.035, from: 'random' }, clearProps: 'transform',
        scrollTrigger: { trigger: chips, start: 'top 85%', once: true }
      });
    }

    /* ---------- Membership logos and CTA badge ---------- */
    var cta = $('.cta-photo .cta-badge');
    if (cta) {
      gsap.from(cta, {
        autoAlpha: 0, y: 16, duration: 0.6, ease: 'expo.out',
        scrollTrigger: { trigger: '.cta-inner', start: 'top 85%', once: true }
      });
    }

    /* ---------- Magnetic primary buttons (pointer devices) ---------- */
    if (c.finePointer) {
      $$('.btn-primary, .cta-actions .btn, .nav-cta').forEach(function (btn) {
        var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
    }

    /* ---------- Header slides away on scroll down, back on scroll up ---------- */
    var header = $('.site-header');
    var nav = $('#main-nav');
    if (header) {
      var showHeader = gsap.from(header, { yPercent: -100, paused: true, duration: 0.35, ease: 'power2.out' }).progress(1);
      ScrollTrigger.create({
        start: 'top top', end: 'max',
        onUpdate: function (self) {
          if (nav && nav.classList.contains('open')) return;
          if (self.scroll() < 160 || self.direction === -1) showHeader.play();
          else showHeader.reverse();
        }
      });
    }

    return function () { root.classList.remove('gsap'); };
  });

  // Images and fonts change layout after load; recalculate trigger positions once
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
