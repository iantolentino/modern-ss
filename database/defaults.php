<?php
/**
 * Defaults for settings added after the first install (from the competitive review, Nov 2026).
 * They are merged under the saved settings, so a value saved in the admin always wins.
 * A `*` marks a placeholder the business must confirm; see docs/competitive-review-todo.md.
 */

declare(strict_types=1);

function settings_defaults(): array {
    return [
        'review' => [
            // '' shows placeholders with an amber * (internal preview); '1' hides every unconfirmed item
            'hide_placeholders' => '',
        ],
        'facts' => [
            'since'        => '2019',
            'location'     => 'Angeles City, Pampanga, PH',
            'stats_method' => 'How these figures are measured: method to be written by operations.*',
        ],
        'offer' => [
            'from_month'    => 'A$X,XXX*',
            'from_month_ca' => 'C$X,XXX*',
            'from_year'     => 'A$XX,XXX*',
            'from_year_ca'  => 'C$XX,XXX*',
            'included'      => "Recruitment and strata screening\nStrata Staff Academy training\nSecure workstation and equipment\nHR, payroll and benefits\nReplacement guarantee*",
            'shortlist'     => 'Shortlist in 10 business days*',
            'hours'         => 'AEST/AEDT or Pacific*',
            'levels'        => 'Junior · Mid · Senior*',
            'strata_plus'   => 'Strata Staff Plus brings the same Academy-trained model to property-management teams.*',
        ],
        'trust' => [
            'headline' => "Your owners' data, protected",
            'iso'      => 'ISO 27001 roadmap*',
            'pillars'  => [
                ['title' => 'Data and privacy', 'question' => 'How owner and financial data is protected under Australian and Canadian privacy law.', 'answer' => ''],
                ['title' => 'Access controls', 'question' => 'Who can see what, how systems are accessed, and how access is removed when someone leaves.', 'answer' => ''],
                ['title' => 'Accountability', 'question' => "Who employs the team, how they're supervised, and where responsibility sits.", 'answer' => ''],
                ['title' => 'Continuity', 'question' => "What happens when someone leaves or is absent, and how quickly they're replaced.", 'answer' => ''],
            ],
        ],
        'links' => [
            'live_chat'    => '',
            'client_login' => '',
        ],
        'case_strata_choice' => [
            'since'      => '2023',
            'from'       => '5',
            'to'         => '21',
            'roles'      => "Administrative Specialists*\nAccountants*\nCustomer Care*\nTeam lead*",
            'platforms'  => 'To confirm*',
            'challenge'  => '',
            'built'      => '',
            'results'    => '',
            'video_url'  => '',
            'hours_back' => '',
            'response'   => '',
        ],
        'canada' => [
            'hours'   => 'Pacific-time coverage*',
            'pricing' => 'Pricing in CAD*',
            'stories' => 'Canadian client stories*',
            'tasks'   => "Form B information certificates\nForm F certificates of payment\nDepreciation-report admin and tracking\nCRT dispute document packs\nStrata fee arrears and owner notices\nCouncil minutes and bylaw registers",
        ],
    ];
}
