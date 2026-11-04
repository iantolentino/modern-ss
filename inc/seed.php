<?php
/**
 * First-run content, taken from stratastaffglobal.com (Nov 2026).
 * Every value is editable later in /admin. Images ship in assets/media/.
 */

function ensure_seeded(): void {
    foreach ([DATA_DIR, PRIVATE_DIR, PRIVATE_DIR . '/resumes', UPLOAD_DIR] as $dir) {
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
    }
    if (!is_file(DATA_DIR . '/.htaccess')) @file_put_contents(DATA_DIR . '/.htaccess', "Require all denied\n");
    if (!is_file(UPLOAD_DIR . '/.htaccess')) {
        @file_put_contents(UPLOAD_DIR . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php\\d?|phtml|phar|cgi|pl|py|sh|html?|svg)$\">\n    Require all denied\n</FilesMatch>\n");
    }
    if (is_file(store_path('settings'))) return;

    $m = 'assets/media/';

    save('settings', [
        'site_name' => 'Strata Staff Global',
        'tagline'   => 'Premium offshore capacity solutions for strata agencies in Australia and Canada. Since 2019.',
        'logo'      => $m . 'brand/strata-staff-global-logo.png',
        'logo_footer' => $m . 'brand/strata-staff-global-logo.png',
        'favicon'   => $m . 'brand/favicon.png',
        'og_image'  => $m . 'site/the-strata-staff-difference.webp',
        'seo' => [
            'home_title'       => 'Offshore Strata Staff, Australia & Canada | Strata Staff Global',
            'home_description' => 'Strata-trained offshore administrators, accountants, EAs and compliance specialists for strata agencies in Australia and Canada. Book a free discovery call.',
        ],
        'hero' => [
            'eyebrow'  => 'Serving strata agencies in Australia & Canada since 2019',
            'title'    => 'Build Your Strata Staff Global Offshore Team',
            'subtitle' => 'Strata-trained professionals who expand your capacity, streamline daily operations, and help your business grow with confidence.',
            'note'     => 'No obligation. See where your team can unlock capacity.',
            'image'    => $m . 'roles/strata-administrative-specialist.webp',
            'image_2'  => $m . 'roles/strata-accountant.webp',
            'image_3'  => $m . 'roles/strata-executive-assistant.webp',
        ],
        'stats' => [
            ['value' => '500', 'suffix' => '+', 'label' => 'Placements'],
            ['value' => '98',  'suffix' => '%', 'label' => 'Retention rate'],
            ['value' => '200,000', 'suffix' => '+', 'label' => 'Strata tasks handled per month'],
            ['value' => '13',  'suffix' => '+', 'label' => 'Strata platforms'],
        ],
        'contact' => [
            'email'      => 'solutions@stratastaffglobal.com',
            'careers_email' => 'careers@stratastaffglobal.com',
            'booking_url' => 'https://stratastaffglobal.com/learn-more/',
            'scorecard_url' => 'https://stratastaffglobal.com/scorecard/',
            'au_address' => 'PO Box 109, Ivanhoe, Victoria 3079, Australia',
            'au_phone'   => '+61 3 9133 3255',
            'ca_address' => '777 Hornby Street, Suite 600, Vancouver, British Columbia V6Z 1S4, Canada',
            'ca_phone'   => '+1 236 312 1669',
        ],
        'social' => [
            'linkedin'  => 'https://www.linkedin.com/company/stratastaff/',
            'facebook'  => 'https://www.facebook.com/officialstratastaff',
            'instagram' => 'https://www.instagram.com/stratastaff/',
        ],
        'privacy' => (string) @file_get_contents(__DIR__ . '/privacy-default.md'),
        'careers' => [
            'headline' => 'Careers at Strata Staff',
            'intro'    => 'We are looking for results-oriented and outcome-focused people to enjoy the journey with us.',
            'image'    => $m . 'site/about-strata-staff-team.webp',
            'benefits' => "Health insurance\nLife insurance\nPaid training\nBirthday leave\nCompany events\nOpportunities for career growth",
        ],
    ]);

    $logos = [
        ['StrataMax', 'platform', 'platforms/stratamax.webp', ''], ['Urbanise', 'platform', 'platforms/urbanise.webp', ''],
        ['Stratafy', 'platform', 'platforms/stratafy.webp', ''], ['MRI', 'platform', '', ''],
        ['Strata Vault', 'platform', 'platforms/strata-vault.webp', ''], ['PIQ', 'platform', 'platforms/piq.webp', ''],
        ['Smata', 'platform', 'platforms/smata.webp', ''], ['MR5', 'platform', 'platforms/mr5.webp', ''],
        ['Strack', 'platform', 'platforms/strack.webp', ''], ['iDMax', 'platform', 'platforms/idmax.webp', ''],
        ['AIM', 'platform', 'platforms/aim.webp', ''], ['Bing', 'platform', 'platforms/bing.webp', ''],
        ['Buildium', 'platform', 'platforms/buildium.webp', ''],
        // Industry association memberships, as shown on stratastaffglobal.com
        ['Strata Community Association NSW', 'membership', 'members/sca-nsw-member.webp', 'https://nsw.strata.community/', 'Corporate member · Australia'],
        ['Strata Community Association SA', 'membership', 'members/sca-sa-member.webp', 'https://www.strata.community/', 'Corporate member · Australia'],
        ['Strata Community Association WA', 'membership', 'members/sca-wa-member.webp', '', 'Member · Australia'],
        ['Real Estate Institute of NSW', 'membership', 'members/reinsw-member.webp', 'https://www.reinsw.com.au/', 'Member · Australia'],
        ['Canadian Condominium Institute BC', 'membership', 'members/cci-bc-member.webp', 'https://www.cci.ca/', 'Member · Canada'],
    ];
    $rows = [];
    foreach ($logos as $i => $l) {
        $rows[] = ['id' => uid(), 'name' => $l[0], 'group' => $l[1], 'image' => $l[2] ? $m . $l[2] : '', 'url' => $l[3], 'note' => $l[4] ?? '', 'order' => $i + 1, 'status' => 'published'];
    }
    save('logos', $rows);

    $intro = 'Module 1: Introduction to Strata Management';
    $soft = 'Soft Skills';
    $pm = "Module 1: Introduction to Property Management, scope of property management, and the roles and responsibilities of a property manager\nModule 2: Technology in property management, challenges in property management, and best practices for successful property management";
    $outline = [
        'strata-customer-care' => "$intro\nModule 2: Basic Data Strata Tasks\nModule 3: Property and Financial Management\nModule 4: Customer Concerns and Resolution\nModule 5: $soft",
        'strata-administration-specialist' => "$intro\nModule 2: Basic Data Strata Insurance Handling Skills\nModule 3: Data Entry in Strata Industry\nModule 4: Understanding Certificates and Document Preparation\nModule 5: $soft",
        'strata-accountant' => "$intro\nModule 2: Strata Management Fees and Governance Support\nModule 3: Invoice Management, Certificates, and Budget\nModule 4: Accounting, Financial Statements, and Audit\nModule 5: $soft",
        'strata-executive-assistant' => "$intro\nModule 2: Strata Executive and Governance Support\nModule 3: Project Coordination and Maintenance Repairs\nModule 4: Administrative Support\nModule 5: $soft",
        'strata-compliance-specialist' => "$intro\nModule 2: Understanding Strata Compliance\nModule 3: Legal Framework and Governance\nModule 4: Financial Management and Property Maintenance\nModule 5: Compliance Audits and Inspections\nModule 6: Meetings and Voting\nModule 7: Administrative Tasks\nModule 8: $soft",
        'strata-insurance-specialist' => "$intro\nModule 2: Basic Data Strata Insurance Handling Skills\nModule 3: Property and Valuation Management\nModule 4: Financial and Claims Management\nModule 5: $soft",
        'property-management-administrative-specialist' => $pm,
        'property-management-executive-assistant' => $pm,
        'property-management-accountant' => $pm,
        'property-management-customer-care' => $pm,
    ];
    // [title, slug, category, card image, detail image, summary, about, expertise]
    $svc = [
        ['Strata Customer Care', 'strata-customer-care', 'strata', 'strata-customer-care', 'detail-strata-customer-care',
            'Dedicated specialists handling owner, tenant and supplier enquiries with professionalism and care.',
            'Specialised in handling enquiries, resolving issues and providing information about strata management services. They respond promptly and professionally to the needs and concerns of strata property owners, residents and strata councils, and keep accurate, up-to-date records of strata documents, contracts, correspondence and legal notices.',
            "Strata industry knowledge\nStrong communication skills\nCustomer service excellence\nConflict resolution\nStrata manager's assistance\nMultichannel support\nMaintenance coordination"],
        ['Strata Administrative Specialist', 'strata-administration-specialist', 'strata', 'strata-administrative-specialist', '',
            'Expert administrators managing correspondence, meeting preparation, compliance tracking and daily documentation.',
            'Provides top-notch administrative support and improves the overall efficiency of your strata operations. Detail-oriented in maintaining an accurate database, with strong organisational and time-management skills to keep all data correct and up to date, backed by in-depth knowledge of strata practices.',
            "Strata industry knowledge\nData management\nCustomer service excellence\nDocument management\nMaintaining and updating records\nLegal and regulatory compliance\nInvoice processing"],
        ['Strata Accountant', 'strata-accountant', 'strata', 'strata-accountant', 'detail-strata-accountant',
            'Offshore accountants handling levy processing, arrears, budgeting and financial reporting for your portfolio.',
            'Experienced in managing financial operations for strata schemes. Handles a wide range of accounting tasks, ensures compliance with regulatory requirements, and delivers accurate and timely financial information, with a keen eye for detail and strong analytical skills.',
            "Strata industry knowledge\nAccounts payable and receivable\nAssessment and collection of strata fees\nBank reconciliation\nExpense management and payments\nDebt collection\nTaxation\nFinancial reporting and audit"],
        ['Strata Executive Assistant', 'strata-executive-assistant', 'strata', 'strata-executive-assistant', '',
            'Senior-level support covering scheduling, reporting, stakeholder communication and strata manager coordination.',
            'Works alongside your strata managers to handle calendars, inbox, data entry and reporting, so managers can spend their time on clients and buildings.',
            "Calendar and inbox management\nData entry and reporting\nStakeholder communication\nStrata manager coordination\nMeeting preparation\nDrafting correspondence"],
        ['Strata Compliance Specialist', 'strata-compliance-specialist', 'strata', 'strata-compliance-specialist', 'detail-strata-compliance-specialist',
            'Specialists making sure properties meet regulatory requirements, managing by-laws, defect tracking and lodgements.',
            'Ensures the legal and regulatory compliance of strata properties, with a working understanding of strata property legislation, local building codes and related requirements. Supports strata governance, including the interpretation and enforcement of by-laws, rules and policies, council procedures and meeting management.',
            "Legislative updates\nBy-law management\nMaintenance and repairs compliance\nHealth and safety compliance\nCompliance and governance\nDocumentation and record keeping"],
        ['Strata Insurance Specialist', 'strata-insurance-specialist', 'strata', 'strata-insurance-specialist', 'detail-strata-insurance-specialist',
            'Experienced staff coordinating policy renewals, claims management and insurance-related owner enquiries.',
            'Assists the strata corporation with the claims procedure from filing to resolution, and coordinates with contractors, maintenance providers and other vendors to meet insurance requirements and address issues that may affect coverage.',
            "Strata industry knowledge\nClaims management\nInsurance data management\nMaintaining and updating records\nCompliance assurance\nCoordination with insurance brokers"],
        ['Property Management Administrative Specialist', 'property-management-administrative-specialist', 'pm', 'property-management-administrative-specialist', 'detail-property-management-administrative-specialist',
            'Property management administrators handling tenancy documentation, lease renewals and maintenance coordination.',
            'Delivers strong administrative support for property management operations: keeping databases accurate, handling documentation, and making sure all data is correct and current.',
            "Property management industry knowledge\nData and document management\nCustomer service excellence\nInvoice processing and supplier updates\nMaintaining and updating records\nTenant relations and lease renewals\nComparative market analysis"],
        ['Property Management Executive Assistant', 'property-management-executive-assistant', 'pm', 'property-management-executive-assistant', 'detail-property-management-executive-assistant',
            'Executive support for property managers, including inspection scheduling, reporting and landlord communication.',
            'Supports property managers by managing schedules, prioritising tasks, handling administrative duties, and tracking property maintenance and lease agreements, with the ability to prepare reports and presentations.',
            "Document preparation and record keeping\nCommunication and correspondence\nManaging confidential information\nGeneral support to property managers\nManaging schedules, inbox and calendars\nTenant relations, maintenance coordination and lease management"],
        ['Property Management Accountant', 'property-management-accountant', 'pm', 'property-management-accountant', 'detail-property-management-accountant',
            'Financial specialists for rental accounting, trust reconciliation, EOFY processing and disbursement runs.',
            'Runs financial operations for real estate and property management businesses, making sure everything from budgeting to reporting is carried out accurately and efficiently.',
            "Property management industry knowledge\nFinancial reporting and analysis\nBudgeting and forecasting\nAccounts payable and receivable\nGeneral ledger maintenance\nTax compliance\nFinancial compliance"],
        ['Property Management Customer Care', 'property-management-customer-care', 'pm', 'property-management-customer-care', 'detail-property-management-customer-care',
            'Dedicated support handling tenant and landlord enquiries, maintenance requests and routine follow-up communication.',
            'Communicates clearly with tenants about policies, procedures and property updates, and addresses customer needs promptly so tenants and owners feel heard.',
            "Property management industry knowledge\nCustomer relationship management\nCustomer support\nMaintenance coordination\nMove-in and move-out process\nLease administration\nEnquiries and complaints\nRecord keeping"],
    ];
    $rows = [];
    foreach ($svc as $i => $s) {
        $rows[] = [
            'id' => uid(), 'slug' => $s[1], 'title' => $s[0], 'category' => $s[2],
            'image' => $m . 'roles/' . $s[3] . '.webp',
            'image_detail' => $s[4] ? $m . 'roles/' . $s[4] . '.webp' : '',
            'summary' => $s[5], 'body' => $s[6], 'tasks' => $s[7], 'outline' => $outline[$s[1]] ?? '',
            'order' => $i + 1, 'status' => 'published',
        ];
    }
    save('services', $rows);

    // [name, title, group, photo, department, bio]
    $team = [
        ['Trevor McGuinness', 'Owner / Co-Founder', 'leadership', 'trevor-mcguinness.webp', '', ''],
        ['Paul Miller', 'Owner / Co-Founder', 'leadership', 'paul-miller.webp', '', ''],
        ['Tongta Miller', 'Chief Financial Officer', 'leadership', 'tongta-miller.webp', '', ''],
        ['Dan Fabros', 'Executive Managing Director', 'leadership', 'dan-fabros.webp', '',
            "Dan manages the company's operations from macro to micro. He works directly with the ownership group to set strategic goals and manage budgets and resources, leads and develops the leadership and management teams, and represents Strata Staff in partnerships with key stakeholders."],
        ['Anna Marie David', 'Human Resource Manager', 'team', 'anna-marie-david.webp', 'People & Culture', ''],
        ['Trixy Bulaun', 'HR Officer', 'team', 'trixy-bulaun.webp', 'People & Culture', ''],
        ['Neil Dane Puno', 'HR Generalist', 'team', 'neil-dane-puno.webp', 'People & Culture', ''],
        ['Mary Ann Pineda', 'Training and Development Manager', 'team', 'mary-ann-pineda.webp', 'Training & Development', ''],
        ['Marey Iams Sarate', 'Executive Assistant Lead Trainer', 'team', 'marey-iams-sarate.webp', 'Training & Development', ''],
        ['Jeremiah Feliciano', 'Administrative Specialist Lead Trainer', 'team', 'jeremiah-feliciano.webp', 'Training & Development', ''],
        ['Jahaziel Beltran', 'Accounting Manager', 'team', 'jahaziel-beltran.webp', 'Accounting & Finance', ''],
        ['Sarahjane Manliclic', 'Accounting Officer', 'team', 'sarahjane-manliclic.webp', 'Accounting & Finance', ''],
        ['Desika Mundia', 'Administration and Facilities Manager', 'team', 'desika-mundia.webp', 'Legal & Facilities', ''],
        ['Patricia Garcia', 'Executive Assistant to the Executive Managing Director', 'team', 'patricia-garcia.webp', 'Executive Services', ''],
        ['Leah Adriano', 'Business Development Manager', 'team', 'leah-adriano.webp', 'Sales & Business Development', ''],
        ['Riel Lacsamana', 'Information Technology Officer', 'team', 'riel-lacsamana.webp', 'IT & Network Support', ''],
        ['Dave Jason Velasquez', 'Information Technology Specialist', 'team', 'dave-jason-velasquez.webp', 'IT & Network Support', ''],
        ['Ian Kenneth Crisostomo', 'Systems & Multimedia', 'team', 'ian-kenneth-crisostomo.webp', 'Systems & Multimedia', ''],
        ['Patricia Puno', 'Client Success Manager', 'team', 'patricia-puno.webp', 'Client Success', ''],
        ['Rei Sanchez', 'Team Leader', 'team', 'rei-sanchez.webp', 'Client Success', ''],
        ['Sheena Magdaraog', 'Team Leader', 'team', 'sheena-magdaraog.webp', 'Client Success', ''],
        ['Carlo Andreu Tayag', 'Team Leader', 'team', 'carlo-andreu-tayag.webp', 'Client Success', ''],
        ['Mcryn Aie Changcoco', 'Team Leader', 'team', 'mcryn-aie-changcoco.webp', 'Client Success', ''],
    ];
    $rows = [];
    foreach ($team as $i => $t) {
        $rows[] = ['id' => uid(), 'name' => $t[0], 'title' => $t[1], 'group' => $t[2], 'department' => $t[4],
            'photo' => $m . 'team/' . $t[3], 'bio' => $t[5], 'linkedin' => '', 'order' => $i + 1, 'status' => 'published'];
    }
    save('team', $rows);

    // Client testimonials as published on stratastaffglobal.com
    $tm = [
        ['Joshua Baldwin', 'President, SCA Australasia', 'Munro Property', 'joshua-baldwin.webp',
            'Strata Staff has been our trusted partner for several years, and we are always impressed by their service, professionalism and friendliness. They have a talented and adaptable team that can learn new skills quickly and efficiently. They are flexible and responsive to our needs, and they deliver excellent results. We value their support and expertise greatly.'],
        ['Michael Haines', 'President, SCA South Australia', 'Strata Management SA', 'michael-haines.webp',
            'Choosing Strata Staff as our offshoring partner has been a game-changer; it has completely transformed our business operations. Their exceptional commitment to customer satisfaction, attention to detail, and proactive problem-solving have resulted in significant improvements in our company.'],
        ['Craig Mowll', 'Chief Executive Officer', 'Strata Choice', 'craig-mowll.webp',
            'We have developed a strong sense that we have a partner who not only assists us with our business cost challenges but also collaborates with us in building our offshore team. We are grateful that Strata Staff became our offshore strategic partner in 2023. We started with them with only 5 staff and now we have grown to 21 headcounts.'],
        ['Paul Cvetko-Lueger', 'Leader of Operations & Business Development', 'ESM Strata', 'paul-cvetko-lueger.webp',
            'Strata Staff provided a comprehensive service that surpassed other providers we considered. This meant they could thoroughly grasp our business, including our processes, procedures, and systems. Strata Staff have truly been a partner, they support us on a daily basis so we can focus on what we need to do onshore.'],
        ['Jason Elliott', 'Director', 'Toowoomba Strata', 'jason-elliott.webp',
            'They fill a very important role for us to complete somewhat repetitive work in a very cost-efficient way. Their systems and structures allow us to get the best possible result from our offshore staff. We have never felt uneasy about expanding the role and responsibilities of our offshore staff.'],
        ['Mark Louis', 'Managing Director', 'Vital Strata', 'mark-louis.webp',
            'Working with Strata Staff has been an absolute game-changer for our firm. Their service consistently surpasses our expectations, delivering prompt, professional, and genuinely friendly assistance. Partnering with Strata Staff has undoubtedly been one of the best decisions for our firm.'],
        ['Strata Bee', '', 'Strata Bee', 'strata-bee.webp',
            'We have worked with Strata Staff for a few years now and we are so happy to have found them. We have great trust in the team and they have never let us down – each task is actioned efficiently and to a high standard.'],
        ['Christine Kelly', 'Director', 'Stanton & Taylor Strata Management', 'stanton-taylor-strata-management.webp',
            'Our firm has worked with Strata Staff for a number of years now, and find their service to be prompt, professional and friendly. The team at Strata Staff are always happy to help and have no problems learning new skills.'],
        ['Felix Xie', 'Strata Manager', 'Professionals Strata Team', 'professionals-strata-team.webp',
            'Strata Staff service has been very professional and outcome focused. They have a superb team that execute tasks diligently. We expect this relationship to grow much more with the years ahead.'],
    ];
    $rows = [];
    foreach ($tm as $i => $t) {
        $rows[] = ['id' => uid(), 'name' => $t[0], 'title' => $t[1], 'company' => $t[2], 'quote' => $t[4],
            'photo' => $m . 'clients/' . $t[3], 'order' => $i + 1, 'status' => 'published'];
    }
    save('testimonials', $rows);

    $benefits = "Health insurance\nLife insurance\nPaid training\nBirthday leave\nCompany events\nOpportunities for career growth";
    save('jobs', [
        [
            'id' => uid(), 'slug' => 'hr-assistant', 'title' => 'Human Resources Assistant', 'department' => 'Human Resources',
            'type' => 'Full-time', 'schedule' => '', 'location' => 'Angeles City, Pampanga',
            'summary' => 'Administrative and operational HR support with a focus on industrial relations, HR compliance and employee relations.',
            'description' => "The HR Assistant provides administrative and operational support across HR functions, with a primary focus on Industrial Relations, HR Compliance and Employee Relations. The role assists with employee relations cases, disciplinary matters, HR documentation, investigations and compliance, and supports employee engagement, recruitment, onboarding, records, attendance and leave administration, and performance management.",
            'responsibilities' => "## Industrial and employee relations\nAssist in managing and monitoring employee relations and industrial relations cases\nPrepare and process Notices to Explain (NTEs), written warnings, disciplinary notices and other HR correspondence\nCoordinate administrative hearings, employee meetings and case discussions\nGather and organise documentation required for investigations\nMaintain accurate and confidential records of employee relations and disciplinary cases\n## HR compliance\nMaintain HR compliance records and documentation\nPrepare documents for internal audits, compliance reviews and government requirements\nTrack compliance-related activities and deadlines\n## General HR administration\nPrepare HR reports, trackers, presentations and documentation\nPrepare HR-related letters, certificates and notices\nRespond to employee enquiries and requests\n## Recruitment, onboarding and engagement\nSupport the recruitment team with coordination activities\nSupport orientation and onboarding\nHelp plan employee engagement activities, HR events and surveys",
            'qualifications' => "Bachelor's degree in Psychology\n0–1 year of HR experience, particularly in industrial relations\nKnowledge of labour standards and due process\nProficiency in MS Office (Excel, Word, PowerPoint)\nDiscretion and confidentiality with sensitive records\nClear written and verbal communication",
            'benefits' => $benefits, 'date' => '2026-10-20', 'closes' => '', 'status' => 'open',
        ],
        [
            'id' => uid(), 'slug' => 'junior-accountant', 'title' => 'Junior Accountant', 'department' => 'Accounting',
            'type' => 'Full-time', 'schedule' => 'Nightshift (Permanent)', 'location' => 'Angeles City, Pampanga',
            'summary' => 'Process invoices, levies, owner charges and reimbursements for strata clients. Fresh graduates are encouraged to apply.',
            'description' => "The Junior Accountant provides accounting and administrative support to client operations by processing financial transactions, maintaining accurate accounting records, and preparing financial documentation. The role ensures the timely and accurate processing of invoices, owner charges, reimbursements, levy administration and financial records.\n\nThis position suits people who are detail-oriented, analytical and eager to build a career in accounting. Comprehensive training is provided.",
            'responsibilities' => "## Financial transaction processing\nProcess invoices and financial documents accurately and on time\nAssist in processing Funds on Behalf (FOB) transactions\nProcess owner reimbursements and verify supporting documentation\nAssist in processing lot owner charges\n## Strata levy administration\nPrepare and process strata levy transactions\nGenerate and distribute levy notices to property owners\nMaintain accurate levy records\n## Administrative support\nCreate and update supplier records\nProcess work orders and quotation requests\nGenerate strata certificates and other finance documents\n## Data management\nEnter and maintain accurate financial information\nReview and validate supporting documents before processing\nAssist with reconciliation and data verification",
            'qualifications' => "Bachelor's degree in Accountancy, Accounting Technology, Management Accounting, Financial Management or a related course\nFresh graduates are highly encouraged to apply\nBasic understanding of accounting principles\nProficient in Microsoft Excel\nStrong numerical aptitude and attention to detail\nGood written and verbal English",
            'benefits' => "Health insurance\nLife insurance\nPaid training\nCompany events\nOpportunities for promotion", 'date' => '2026-10-15', 'closes' => '', 'status' => 'open',
        ],
        [
            'id' => uid(), 'slug' => 'mid-level-accountant-nightshift', 'title' => 'Mid-Level Accountant (Nightshift)', 'department' => 'Accounting',
            'type' => 'Full-time', 'schedule' => 'Nightshift (Permanent)', 'location' => 'Angeles City, Pampanga',
            'summary' => 'Manage accounts payable, reconciliations, levies, budgets and year-end preparation for strata-titled properties.',
            'description' => "The Mid-Level Accountant manages mid-tier financial operations for strata-titled properties. Positioned between junior and senior roles, this position prepares and reviews financial statements, executes accounts payable and bank reconciliations, drafts property budgets, manages levy operations, and handles end-of-year financial preparation.",
            'responsibilities' => "## Accounts payable and banking\nOversee invoice and credit processing and execute payment runs\nProcess lot owner charges and reimbursements\nPerform daily bank downloads and reconciliations\n## Levy management\nStrike levies, issue levy notices and handle debt recovery\nRespond to levy enquiries from owners and clients by email and phone\n## Budgeting and financial tracking\nDraft property budgets and reconcile accounts\n## Financial year-end\nAssist in year-end closing, including adjusting charges and interest, reallocating codes and funds, and preparing files for audit",
            'qualifications' => "Bachelor's degree in Accountancy, Accounting Technology, Finance or a related course\n2–4 years of experience in general accounting, accounts payable or financial reporting\nBPO, real estate or offshore client experience is highly preferred\nStrong end-to-end accounting skills (AP, AR, bank reconciliations, GL)\nIntermediate to advanced Excel\nClear written and verbal English for levy queries",
            'benefits' => $benefits, 'date' => '2026-10-10', 'closes' => '', 'status' => 'open',
        ],
    ]);

    $ins = $m . 'insights/';
    $gallery = function (string $base, int $n) use ($ins) {
        $out = [];
        for ($i = 2; $i <= $n; $i++) $out[] = $ins . $base . '-' . $i . '.webp';
        return implode("\n", $out);
    };
    $posts = [
        ['Strata Staff Joins the Canadian Condominium Institute (CCI) British Columbia Chapter', 'strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter', 'Announcement', '2025-11-07', 'cci-british-columbia-membership.webp', '',
            'Strata Staff is proud to be a new member of the Canadian Condominium Institute (CCI) British Columbia Chapter.',
            "Strata Staff is proud to be a new member of the Canadian Condominium Institute (CCI) British Columbia Chapter.\n\nThis membership represents more than an expansion of our network. It reflects our ongoing commitment to supporting condominium and strata management professionals across Canada through reliable offshore solutions.\n\nBy joining CCI British Columbia, we gain opportunities to connect with industry leaders, exchange knowledge, and collaborate on ways to improve operational efficiency, reduce workload pressure, and enhance client service for condominium and strata management teams.\n\nFor Strata Staff, this membership strengthens our role as an offshoring partner that understands the needs of the Canadian condominium and strata industry, helping management companies focus on their core operations.\n\nWant to know more about how we can support your team? [Book a free consultation](/contact)."],
        ['Strata Staff Joins SCA South Australia', 'strata-staff-joins-sca-south-australia', 'Announcement', '2025-07-15', 'sca-south-australia-membership.webp', '',
            'Strata Staff is now a corporate member of the Strata Community Association South Australia (SCA SA).',
            "We're proud to announce that Strata Staff is now a corporate member of the Strata Community Association South Australia (SCA SA).\n\nThis is another step in our commitment to the strata industry. As a company delivering offshore staffing solutions for strata and property professionals, we believe industry alignment is key to long-term success, for our clients and the communities they serve.\n\nWith membership in both the New South Wales and South Australia chapters of the Strata Community Association, we are:\n\n- Deepening our support for strata businesses across regions\n- Reinforcing our dedication to quality, trust and collaboration\n- Strengthening our connection to the evolving needs of the strata sector\n\nWe look forward to contributing to the SCA community."],
        ['Strata Staff Unveils Its Upgraded Marisol Office', 'strata-staff-unveils-its-upgraded-marisol-office', 'Announcement', '2025-06-25', 'marisol-office-upgrade.webp', '',
            'Upgrades to our Marisol Office for team members and visiting clients: concierge support, a client lounge and meeting rooms.',
            "We have upgraded our Marisol Office to create a more comfortable and productive environment for our team members and visiting clients.\n\nWhether you're dropping by for a quick check-in or spending the day with your offshore team, the space is designed to make your visit smooth and convenient.\n\n## What's new for visiting clients\n\n**Full concierge support.** From arranging accommodation to transport bookings, our team is here to help. We also offer a dedicated company vehicle for local travel.\n\n**Client lounge.** A newly built lounge designed for comfort, focused work and productive meetings.\n\n**Meeting rooms.** Available for team training sessions, coaching discussions and one-on-ones.\n\n**Safe and secure.** 24/7 building security and a secure key-door lock system.\n\nPlanning a visit? Contact Patty at [patty@stratastaffglobal.com](mailto:patty@stratastaffglobal.com)."],
        ['We are a Trusted SCA Member', 'we-are-a-trusted-sca-member', 'Announcement', '2025-02-06', 'sca-nsw-membership.webp', '',
            'Strata Staff is now an official corporate member of the Strata Community Association NSW.',
            "Strata Staff is now an official corporate member of the Strata Community Association NSW.\n\nWe are proud to be the first offshoring company to join the association, reinforcing our commitment to delivering service and value to the strata industry.\n\nMembership gives our clients confidence that we are aligned with an organisation that upholds strong industry standards and promotes best practice."],
        ['As We Enter 2025, a New Symbol Will Lead the Way', 'as-we-enter-2025-a-new-symbol-will-lead-the-way', 'Newsletter', '2025-01-27', 'new-logo-2025.webp', '',
            'Introducing the new Strata Staff logo for 2025.',
            "As we continue to grow, we're unveiling our new logo: a symbol of growth, innovation, and our commitment to the strata and property industries.\n\nWhile our look evolves, our mission to deliver trusted expertise and service stays the same. Strata Staff has been providing strategic offshore business solutions since 2019."],
        ['Strata Staff Places Premium in Strategic Client Partnerships and Engagement', 'premium-in-strategic-client-partnerships-and-engagement', 'News', '2024-11-12', 'client-visit-australia-2024.webp', '',
            'Executive Managing Director Dan Fabros Jr. visited clients in Sydney, Melbourne and Adelaide.',
            "Our Executive Managing Director, Dan Fabros Jr., visited our clients in Sydney, Melbourne and Adelaide for a series of meetings.\n\nDuring these visits we focused on strengthening our partnerships, aligning long-term plans, and checking how clients are progressing with their offshore teams. We appreciate the continued collaboration and look forward to building on these relationships."],
        ['Strata Staff Connect 3rd Quarter 2024', 'strata-staff-connect-3rd-quarter-2024', 'Newsletter', '2024-10-30', 'connect-q3-2024-cover.webp', $gallery('connect-q3-2024', 7),
            'Our Q3 2024 newsletter theme: Thrive in Balance: Work, Play, Achieve.',
            "As we step into the second half of the year, it's inspiring to see the energy and dedication everyone brings to our mission. This quarter's theme: **Thrive in Balance: Work, Play, Achieve.**\n\nEach Strata Staffer has contributed to our shared goals, internally and in the wider community. The full newsletter is below."],
        ['Strata Staff Connect 1st–2nd Quarter 2024', 'strata-staff-connect-1st-2nd-quarter-2024', 'Newsletter', '2024-07-31', 'connect-q1-q2-2024-cover.webp', $gallery('connect-q1-q2-2024', 7),
            'We now provide 24/7 offshore capacity solutions for our international client partners.',
            "Breaking boundaries with our international client partners: Strata Staff now provides 24/7 offshore capacity solutions.\n\nThe full newsletter is below."],
    ];
    $rows = [];
    foreach ($posts as $p) {
        $rows[] = ['id' => uid(), 'slug' => $p[1], 'title' => $p[0], 'category' => $p[2], 'date' => $p[3],
            'cover' => $ins . $p[4], 'gallery' => $p[5], 'excerpt' => $p[6], 'body' => $p[7],
            'author' => 'Strata Staff Global', 'status' => 'published'];
    }
    $seoTitles = [
        'strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter' => 'Strata Staff Joins CCI British Columbia',
        'premium-in-strategic-client-partnerships-and-engagement' => 'Client Partnership Visits in Sydney, Melbourne & Adelaide',
    ];
    foreach ($rows as &$r) $r['seo_title'] = $seoTitles[$r['slug']] ?? '';
    unset($r);
    save('insights', $rows);

    // Answers use only facts published on stratastaffglobal.com
    $faqs = [
        ['Where is the Strata Staff team based?', 'Our team works from our Marisol Office in Angeles City, Pampanga, Philippines. Strata Staff started in a small office in Mabalacat, Pampanga in April 2019. Client offices are in Ivanhoe, Victoria and Vancouver, British Columbia.'],
        ['Are your staff trained in strata?', 'Yes. Our staff are trained specifically in strata operations and are familiar with Australian and Canadian strata legislation. New staff go through our Foundation Training Program, and every role has its own course outline through the Strata Staff Academy.'],
        ['Which strata software can your team use?', 'Our staff are familiar with 13+ platforms, including StrataMax, Urbanise, Stratafy, MRI, Strata Vault, PIQ, Smata, MR5 and Buildium.'],
        ['How do we get started?', 'Book a free 30-minute discovery call. We design an offshore capacity plan around your roles and platforms, then select, vet and train your staff before they join your workflows.'],
        ['Can you cover different time zones?', 'Yes. We provide 24/7 offshore capacity for our client partners in Australia and Canada, including permanent nightshift teams.'],
        ['Can we visit our offshore team?', 'Yes. Our Marisol Office has a client lounge and meeting rooms, and our team can arrange accommodation, transport and a company vehicle for your visit.'],
    ];
    $rows = [];
    foreach ($faqs as $i => $f) $rows[] = ['id' => uid(), 'q' => $f[0], 'a' => $f[1], 'order' => $i + 1, 'status' => 'published'];
    save('faqs', $rows);

    foreach (['leads', 'applications', 'users'] as $n) {
        if (!is_file(store_path($n))) save($n, []);
    }
}
