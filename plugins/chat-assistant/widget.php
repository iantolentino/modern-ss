<?php
/**
 * Chat assistant panel, included once per page by layout_foot().
 * Questions and answers: a few built from site settings, then every published FAQ from the admin.
 * Each entry: q (question), a (answer), links (label => url) shown as buttons under the answer.
 */
$c = setting('contact', []);
$tel = function ($n) { return 'tel:' . preg_replace('/[^\d+]/', '', (string) $n); };
$person = array_filter([
    'Book a 30-minute call' => url('contact') . '#book',
    'Call Australia ' . ($c['au_phone'] ?? '') => !empty($c['au_phone']) ? $tel($c['au_phone']) : '',
    'Call Canada ' . ($c['ca_phone'] ?? '') => !empty($c['ca_phone']) ? $tel($c['ca_phone']) : '',
    'Email ' . ($c['email'] ?? '') => !empty($c['email']) ? 'mailto:' . $c['email'] : '',
]);
$roles = items('services', function ($s) { return $s['category'] === 'strata'; });
$qa = [
    ['q' => 'What does Strata Staff do?',
     'a' => 'We build offshore teams for strata agencies in Australia and Canada. Every specialist is trained in strata before they join your team, and works inside your systems and processes.',
     'links' => ['See the roles' => url('solutions')]],
    ['q' => 'Which roles can you fill?',
     'a' => 'Strata roles: ' . implode(', ', array_map(function ($s) { return $s['title']; }, $roles)) . '. We also have property management roles under Strata Staff Plus.',
     'links' => ['Compare all roles' => url('pricing'), 'See the roles' => url('solutions')]],
    ['q' => 'How much does it cost?',
     'a' => 'It depends on the role, the level and the hours you need. Every role is all-inclusive: recruitment, Strata Staff Academy training, equipment, HR and payroll. Book a call and we\'ll put together a quote.',
     'links' => ['Pricing by role' => url('pricing'), 'Book a 30-minute call' => url('contact') . '#book']],
    ['q' => 'How many hours could an offshore team free up?',
     'a' => 'The Hidden Capacity Test works it out in under a minute: enter your number of managers and their routine hours a day, and it shows the hours a year, what they cost and the team it would take.',
     'links' => ['Take the Hidden Capacity Test' => url('hidden-capacity-test')]],
    ['q' => 'Do you work with Canadian agencies?',
     'a' => 'Yes. Our Canadian clients work with our Vancouver office, and their team works from our Marisol Office in Angeles City, Pampanga.',
     'links' => ['Strata Staff Canada' => url('canada')]],
];
foreach (items('faqs') as $f) $qa[] = ['q' => $f['q'], 'a' => $f['a'], 'links' => []];
$qa[] = ['q' => 'Talk to a person', 'a' => 'Our solutions team is happy to help. Pick whichever suits you:', 'links' => $person, 'person' => true];
?>
<div class="chat" data-chat>
  <button type="button" class="chat-launch" data-chat-toggle aria-expanded="false" aria-controls="chat-panel">
    <span class="chat-launch-icon" aria-hidden="true"><?= icon('chat') ?></span>
    <span class="chat-launch-label">Chat with us</span>
  </button>
  <section class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
    <header class="chat-head">
      <span class="chat-avatar" aria-hidden="true"><img src="<?= e(url('assets/media/brand/strata-staff-mark.png')) ?>" alt="" width="28" height="28"></span>
      <div><h2 id="chat-title">Strata Staff assistant</h2><p>Quick answers to common questions</p></div>
      <button type="button" class="chat-close" data-chat-toggle aria-label="Close chat"><?= icon('close') ?></button>
    </header>
    <div class="chat-log" data-chat-log aria-live="polite">
      <div class="chat-msg bot"><p>Hi! I'm the Strata Staff assistant. Pick a question below, or type one and I'll find the closest answer.</p></div>
    </div>
    <div class="chat-suggest" data-chat-suggest aria-label="Suggested questions"></div>
    <form class="chat-input" data-chat-form>
      <label class="sr-only" for="chat-text">Type your question</label>
      <input id="chat-text" type="text" autocomplete="off" placeholder="Type your question…" maxlength="200">
      <button type="submit" aria-label="Send"><?= icon('arrow') ?></button>
    </form>
  </section>
  <script type="application/json" data-chat-data><?= json_encode($qa, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
</div>
