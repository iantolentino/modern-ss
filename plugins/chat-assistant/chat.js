/* Chat assistant: preset questions with written answers, shown as a chat. */
(function () {
  'use strict';
  var root = document.querySelector('[data-chat]');
  if (!root) return;
  var panel = root.querySelector('.chat-panel');
  var launch = root.querySelector('.chat-launch');
  var log = root.querySelector('[data-chat-log]');
  var suggest = root.querySelector('[data-chat-suggest]');
  var form = root.querySelector('[data-chat-form]');
  var input = form.querySelector('input');
  var qa = JSON.parse(root.querySelector('[data-chat-data]').textContent);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var asked = {};

  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  var scroll = function () { log.scrollTop = log.scrollHeight; };

  var open = function (show) {
    panel.hidden = !show;
    root.classList.toggle('is-open', show);
    root.querySelectorAll('[data-chat-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', String(show)); });
    if (show) { renderSuggestions(); var first = suggest.querySelector('button'); (first || input).focus(); }
    else launch.focus();
  };

  // Chips for the questions not asked yet; "Talk to a person" always stays last
  var renderSuggestions = function () {
    suggest.innerHTML = '';
    qa.forEach(function (item, i) {
      if (asked[i] && !item.person) return;
      var b = el('button', 'chat-chip' + (item.person ? ' is-person' : ''), item.q);
      b.type = 'button';
      b.addEventListener('click', function () { ask(i); });
      suggest.appendChild(b);
    });
  };

  var botSay = function (item) {
    var typing = el('div', 'chat-msg bot is-typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    typing.setAttribute('aria-label', 'Typing');
    log.appendChild(typing); scroll();
    setTimeout(function () {
      typing.remove();
      var msg = el('div', 'chat-msg bot');
      msg.appendChild(el('p', '', item.a));
      var links = Object.keys(item.links || {});
      if (links.length) {
        var row = el('div', 'chat-links');
        links.forEach(function (label) { var a = el('a', '', label); a.href = item.links[label]; row.appendChild(a); });
        msg.appendChild(row);
      }
      log.appendChild(msg); scroll();
    }, reduce ? 0 : 650);
  };

  var ask = function (i) {
    asked[i] = true;
    log.appendChild(el('div', 'chat-msg me', qa[i].q)); scroll();
    botSay(qa[i]);
    renderSuggestions();
  };

  // Typed questions: pick the preset question sharing the most words.
  // To add AI later, replace this with a fetch() to a server-side endpoint (keep the API key on the server).
  var answerFor = function (text) {
    // words every answer shares (strata, staff) or that carry no meaning are ignored; endings are trimmed so start/started match
    var stop = ' the and can you your our for with what how are does have has who why when where which that this from into about will there they them his her its was were been any all not but get got want need use strata staff team teams '.split(' ');
    var same = { price: 'cost', pricing: 'cost', prices: 'cost', rate: 'cost', rates: 'cost', fee: 'cost', fees: 'cost', expensive: 'cost', cheap: 'cost', begin: 'start', onboard: 'start', onboarding: 'start', located: 'based', location: 'based', software: 'software', platform: 'software', platforms: 'software', canada: 'canadian', vancouver: 'canadian' };
    var tokens = function (s) {
      return (s.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter(function (w) { return stop.indexOf(w) < 0; })
        .map(function (w) { w = same[w] || w; return w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w; });
    };
    var words = tokens(text);
    var best = -1, score = 0;
    qa.forEach(function (item, i) {
      var q = tokens(item.q), a = tokens(item.a);
      // whole-word matches; words in the question count three times as much as words in the answer
      var s = words.reduce(function (n, w) { return n + (q.indexOf(w) > -1 ? 3 : 0) + (a.indexOf(w) > -1 ? 1 : 0); }, 0);
      if (s > score) { score = s; best = i; }
    });
    return score >= 1 ? best : -1;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    log.appendChild(el('div', 'chat-msg me', text)); scroll();
    var i = answerFor(text);
    if (i > -1) { asked[i] = true; botSay({ a: 'Here\'s the closest answer I have to "' + qa[i].q + '":\n\n' + qa[i].a, links: qa[i].links }); renderSuggestions(); }
    else {
      var person = qa.filter(function (item) { return item.person; })[0];
      botSay({ a: 'I can\'t answer that one yet. Our solutions team can help:', links: person ? person.links : {} });
    }
  });

  root.querySelectorAll('[data-chat-toggle]').forEach(function (b) { b.addEventListener('click', function () { open(panel.hidden); }); });
  document.querySelectorAll('[data-chat-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(true); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });
})();
