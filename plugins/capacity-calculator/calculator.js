/* Capacity calculator plugin: managers x admin hours x weeks, updated as you type. */
(function () {
  'use strict';
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
})();
