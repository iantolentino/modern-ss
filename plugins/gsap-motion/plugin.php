<?php
// GSAP (free, incl. plugins) drives the richer motion; the CSS animations in
// assets/css/site.css remain the fallback if it is disabled or fails to load.
return [
    'name'    => 'GSAP motion',
    'enabled' => true,
    'order'   => 20,
    'styles'  => ['motion.css'],
    'scripts' => [
        'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
        'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
        'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js',
        'motion.js',
    ],
];
