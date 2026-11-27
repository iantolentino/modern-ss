<?php
/**
 * Hidden Capacity Test card (competitive review, slides 17 and 21).
 * Formula: managers × routine hours per day × 5 days × 48 working weeks.
 * Set $calcId (unique) and $calcFull (true: currency toggle, team size, indicative cost) before including.
 */
$calcFull = $calcFull ?? false;
$o = setting('offer', []);
$yearAu = confirmed($o['from_year'] ?? '');
$yearCa = confirmed($o['from_year_ca'] ?? '');
?>
<form class="calc-card<?= $calcFull ? ' calc-full' : '' ?>" data-calc onsubmit="return false" aria-labelledby="<?= e($calcId) ?>-title"
      data-year-au="<?= e($yearAu) ?>" data-year-ca="<?= e($yearCa) ?>">
  <?php if (!$calcFull): ?>
  <h2 id="<?= e($calcId) ?>-title" class="calc-title">Hidden Capacity Test <span class="calc-badge">No sign-up</span></h2>
  <p class="calc-intro">How many hours are your managers spending on work that doesn't need their experience?</p>
  <?php else: ?>
  <h2 id="<?= e($calcId) ?>-title" class="sr-only">Hidden Capacity Test</h2>
  <div class="calc-in">
  <div class="calc-currency" role="radiogroup" aria-label="Country">
    <label><input type="radio" name="currency" value="AUD" checked> Australia · A$</label>
    <label><input type="radio" name="currency" value="CAD"> Canada · C$</label>
  </div>
  <?php endif; ?>
  <div class="calc-fields<?= $calcFull ? '' : ' compact' ?>">
    <label>Strata managers
      <span class="calc-input"><input type="number" name="managers" min="1" max="500" value="6" inputmode="numeric"></span>
    </label>
    <label>Routine hours each, per day
      <span class="calc-input"><input type="number" name="hours" min="0" max="10" step="0.5" value="2" inputmode="decimal"></span>
    </label>
    <label>Hourly cost <small>(optional)</small>
      <span class="calc-input"><em data-calc-symbol>A$</em><input type="number" name="cost" min="0" max="1000" step="1" placeholder="60" inputmode="decimal"></span>
    </label>
  </div>
  <?php if ($calcFull): ?>
  <p class="calc-help">Think reconciliations, invoice processing, data updates, archiving and routine correspondence.</p>
  <button type="button" class="btn btn-primary btn-lg calc-run" data-calc-run><?= icon('clock') ?> Calculate</button>
  </div>
  <div class="calc-out">
  <?php endif; ?>
  <div class="calc-result" aria-live="polite">
    <strong><span data-calc-hours>2,880</span> hours a year</strong>
    <p>on routine work: about <span data-calc-weeks>72</span> full working weeks of manager time</p>
    <p class="calc-money" data-calc-money hidden>At <span data-calc-rate></span> an hour, that is <span data-calc-cost></span> a year.</p>
  </div>
  <?php if ($calcFull): ?>
  <div class="calc-extra">
    <div><small>Team it would take</small><strong>≈ <span data-calc-team>1.5</span> specialists</strong><span>Hours ÷ 1,920 working hours a year</span></div>
    <?php if ($yearAu !== ''): ?>
    <div><small>Indicative cost of an offshore team to take this on</small><strong>From <span data-calc-indicative><?= $yearAu ?></span> a year</strong><span>All-inclusive: recruitment, Academy training, equipment, HR and payroll</span></div>
    <?php endif; ?>
  </div>
  <p class="calc-close">That time could go back to your clients and towards taking on more buildings.</p>
  </div>
  <?php else: ?>
  <p class="calc-formula"><span>Managers × hrs/day × 5 days × 48 weeks</span> <a class="text-link" href="<?= e(url('hidden-capacity-test')) ?>">See my full result <?= icon('arrow') ?></a></p>
  <?php endif; ?>
</form>
