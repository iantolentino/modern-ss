<?php
/** Capacity calculator card. Set $calcId (unique) and $calcFull (true shows the weeks field) before including. */
$calcFull = $calcFull ?? false;
?>
<form class="calc-card" data-calc onsubmit="return false" aria-labelledby="<?= e($calcId) ?>-title">
  <h2 id="<?= e($calcId) ?>-title" class="calc-title">Find your potential capacity</h2>
  <p class="calc-intro">Enter a rough estimate. This is a conversation starter, not a promise of savings.</p>
  <div class="calc-fields<?= $calcFull ? '' : ' compact' ?>">
    <label>Strata managers
      <span class="calc-input"><input type="number" name="managers" min="1" max="500" value="6" inputmode="numeric"><em>managers</em></span>
    </label>
    <label>Admin hours per manager
      <span class="calc-input"><input type="number" name="hours" min="0" max="60" value="10" inputmode="numeric"><em>hrs / week</em></span>
    </label>
    <?php if ($calcFull): ?>
    <label>Working weeks per year
      <span class="calc-input"><input type="number" name="weeks" min="1" max="52" value="48" inputmode="numeric"><em>weeks</em></span>
    </label>
    <?php else: ?>
    <input type="hidden" name="weeks" value="48">
    <?php endif; ?>
  </div>
  <div class="calc-result" aria-live="polite">
    <small>Manager capacity tied up in back-office work each year</small>
    <strong data-calc-hours>2,880 hrs</strong>
    <p data-calc-copy>That's roughly 72 full 40-hour work weeks of manager time.</p>
  </div>
  <?php if ($calcFull): ?>
    <a class="btn btn-primary btn-block" href="<?= e(url('contact')) ?>">Book a capacity review <?= icon('arrow') ?></a>
  <?php else: ?>
    <a class="btn btn-primary btn-block" href="<?= e(url('capacity-calculator')) ?>">Open the full calculator <?= icon('arrow') ?></a>
  <?php endif; ?>
</form>
