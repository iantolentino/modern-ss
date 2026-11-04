<?php
start_session(); // must precede output so the CSRF cookie is sent
$c = setting('contact', []);
require BACKEND_DIR . '/forms/contact.php'; // validates, stores and emails the enquiry

$crumbs = [['', 'Home'], ['contact', 'Contact']];
layout_head([
    'title' => 'Contact Strata Staff Global | Book a Free Discovery Call',
    'description' => 'Talk to our solutions team about building a strata-trained offshore team. Offices in Australia and Canada. Book a free 30-minute discovery call.',
    'path' => 'contact',
    'schema' => [breadcrumb_schema($crumbs)],
], 'contact');
page_hero('Talk to us', 'Tell us what you need.', 'Share a little about your agency and we\'ll come back with a clear capacity plan. No obligation.', $crumbs);
$v = function ($k) use ($old) { return e($old[$k] ?? ''); };
$roles = array_column(items('services'), 'title');
?>
<section class="section">
  <div class="wrap contact-grid">
    <div class="contact-info reveal">
      <h2 class="h3">Speak with our solutions team</h2>
      <p>Prefer to talk now? Call the office nearest you or book a time that suits.</p>
      <?php if (!empty($c['booking_url'])): ?><a class="btn btn-primary" href="<?= e($c['booking_url']) ?>" target="_blank" rel="noopener"><?= icon('calendar') ?> Schedule a free discovery call</a><?php endif; ?>
      <div class="office"><h3>Australia</h3><p><?= icon('pin') ?> <?= e($c['au_address'] ?? '') ?></p><p><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['au_phone'] ?? '')) ?>"><?= icon('phone') ?> <?= e($c['au_phone'] ?? '') ?></a></p></div>
      <div class="office"><h3>Canada</h3><p><?= icon('pin') ?> <?= e($c['ca_address'] ?? '') ?></p><p><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['ca_phone'] ?? '')) ?>"><?= icon('phone') ?> <?= e($c['ca_phone'] ?? '') ?></a></p></div>
      <div class="office"><h3>Email</h3><p><a href="mailto:<?= e($c['email'] ?? '') ?>"><?= icon('mail') ?> <?= e($c['email'] ?? '') ?></a></p></div>
    </div>
    <div class="side-card form-card reveal" id="enquire">
      <?php if ($sent): ?>
        <div class="success"><?= icon('check') ?><h2 class="h4">Thanks, we've got it.</h2><p>A member of our solutions team will be in touch within one business day.</p></div>
      <?php else: ?>
      <?php if ($errors): ?><div class="form-errors" role="alert"><?php foreach ($errors as $er): ?><p><?= e($er) ?></p><?php endforeach; ?></div><?php endif; ?>
      <form method="post" action="#enquire" class="form">
        <?= csrf_field() ?>
        <div class="hp-field" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <div class="row2">
          <label>First name<input name="first_name" required autocomplete="given-name" value="<?= $v('first_name') ?>"></label>
          <label>Last name<input name="last_name" autocomplete="family-name" value="<?= $v('last_name') ?>"></label>
        </div>
        <div class="row2">
          <label>Work email<input type="email" name="email" required autocomplete="email" value="<?= $v('email') ?>"></label>
          <label>Phone<input type="tel" name="phone" autocomplete="tel" value="<?= $v('phone') ?>"></label>
        </div>
        <div class="row2">
          <label>Agency name<input name="company" required autocomplete="organization" value="<?= $v('company') ?>"></label>
          <label>Country<select name="country"><option>Australia</option><option<?= ($old['country'] ?? '') === 'Canada' ? ' selected' : '' ?>>Canada</option><option<?= ($old['country'] ?? '') === 'Other' ? ' selected' : '' ?>>Other</option></select></label>
        </div>
        <label>Role you're interested in<select name="role"><option value="">Not sure yet</option>
          <?php foreach ($roles as $r): ?><option<?= ($old['role'] ?? '') === $r ? ' selected' : '' ?>><?= e($r) ?></option><?php endforeach; ?>
        </select></label>
        <label>How can we help?<textarea name="message" rows="4" placeholder="Team size, platforms you use, tasks you'd like to hand off…"><?= $v('message') ?></textarea></label>
        <button class="btn btn-primary btn-block btn-lg" type="submit">Send enquiry <?= icon('arrow') ?></button>
        <p class="fine">We respect your privacy. See our <a href="<?= e(url('privacy')) ?>">privacy policy</a>.</p>
      </form>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php layout_foot();
