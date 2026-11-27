<?php
// Chat assistant: a chat-style panel with preset questions and written answers.
// The answers come from the FAQs in the admin plus a few built from site settings (widget.php).
// To add AI later, see the note at answerFor() in chat.js: call a server-side endpoint so the API key never reaches the browser.
return [
    'name'    => 'Chat assistant',
    'enabled' => true,
    'order'   => 30,
    'styles'  => ['chat.css'],
    'scripts' => ['chat.js'],
];
