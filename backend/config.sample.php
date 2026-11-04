<?php
// Copy to backend/config.php and adjust. The backend/ folder is blocked from the web by .htaccess.
return [
    // Lets you create the first admin from a non-local server: open /admin/?token=THIS_VALUE once.
    // Use a long random string, then clear it after your account exists.
    'setup_token' => '',
    // Canonical origin used in sitemap, canonical tags and structured data.
    'site_url'    => 'https://stratastaffglobal.com',
    // Where contact-form enquiries and job applications are emailed (comma-separated).
    'lead_emails' => 'solutions@stratastaffglobal.com',
    'job_emails'  => 'careers@stratastaffglobal.com',
];
