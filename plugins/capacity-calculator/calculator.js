/* Hidden Capacity Test: managers × routine hours per day × 5 days × 48 weeks, updated as you type. */
(function () {
  'use strict';
  var fmt = function (n, d) { return n.toLocaleString('en-AU', { maximumFractionDigits: d || 0 }); };

  document.querySelectorAll('[data-calc]').forEach(function (form) {
    var el = function (sel) { return form.querySelector(sel); };
    var num = function (n, min, max, d) {
      var f = form.elements[n]; if (!f) return d;
      var v = parseFloat(f.value); return isNaN(v) ? d : Math.min(max, Math.max(min, v));
    };
    var set = function (sel, text) { var x = el(sel); if (x) x.textContent = text; };

    var update = function () {
      var cad = !!form.elements.currency && form.elements.currency.value === 'CAD';
      var sym = cad ? 'C$' : 'A$';
      var managers = num('managers', 0, 500, 0), hours = num('hours', 0, 10, 0), cost = num('cost', 0, 1000, 0);
      var total = Math.round(managers * hours * 5 * 48);

      set('[data-calc-hours]', fmt(total));
      set('[data-calc-weeks]', fmt(total / 40));
      set('[data-calc-team]', fmt(total / 1920, 1));
      set('[data-calc-symbol]', sym);
      var money = el('[data-calc-money]');
      if (money) {
        money.hidden = !cost;
        set('[data-calc-rate]', sym + fmt(cost));
        set('[data-calc-cost]', sym + fmt(total * cost));
      }
      // The indicative team cost follows the chosen country (placeholders until confirmed in the admin)
      var ind = el('[data-calc-indicative]');
      if (ind && form.dataset.yearAu) ind.innerHTML = cad ? form.dataset.yearCa : form.dataset.yearAu;

      // Hand the result to the "Email me my result" form when the page has one
      var mail = document.querySelector('[data-calc-mail]');
      if (mail) {
        mail.elements.result_hours.value = total;
        mail.elements.result_inputs.value = managers + ' managers × ' + hours + ' hrs/day' + (cost ? ' × ' + sym + cost + '/hr' : '') + ' (' + (cad ? 'Canada' : 'Australia') + ')';
      }
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    // "Calculate" re-runs the sum and draws the eye to the result (brings it into view on small screens)
    var run = el('[data-calc-run]');
    if (run) run.addEventListener('click', function () {
      update();
      var result = el('.calc-result');
      result.classList.remove('is-updated'); void result.offsetWidth; result.classList.add('is-updated');
      var r = result.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight) result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    update();
  });
})();
