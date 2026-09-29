/* ============================================================================
   strata-modern — page generator.

   Run `node build.mjs` from this directory to write every .html file. The
   output is a plain static site with no build step required to view it; this
   script exists so the notice-pack shell is authored once instead of forty
   times. Content lives here and in ./content/*.json.
   ========================================================================= */
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const readJSON = async f => JSON.parse(await readFile(path.join(ROOT, 'content', f), 'utf8'));

/* ------------------------------------------------------------------ facts -- */
const MAIL_SOL = 'solutions@stratastaffglobal.com';
const MAIL_TRN = 'training@stratastaffglobal.com';
const TEL_AU_D = '(+61) 3 9133 3255', TEL_AU_H = '+61391333255';
const TEL_CA_D = '+1 (236) 312 1669', TEL_CA_H = '+12363121669';
const ADDR_AU = 'PO Box 109 Ivanhoe Victoria 3079, Australia';
const ADDR_CA = '777 Hornby Street, Suite 600, Vancouver, British Columbia, V6Z 1S4, Canada';
const SOCIAL = [
  ['https://www.linkedin.com/company/stratastaff/', 'LinkedIn'],
  ['https://www.facebook.com/officialstratastaff', 'Facebook'],
  ['https://www.instagram.com/stratastaff/', 'Instagram'],
];

/* ------------------------------------------------------------- the roles -- */
const STRATA_ROLES = [
  {
    id: 's-admin', no: 'A.1', name: 'Strata Administrative Specialist',
    href: 'role-administrative-specialist.html',
    one: 'Keeps records, meetings, notices and workflows moving.',
    about: 'An expert who provides a top-notch service to our clients and enhances the overall efficiency of our strata operations. Detail-oriented at maintaining an accurate database and providing general administrative support. With exceptional organizational and time-management skills, these nit-picking experts ensure all data is correct and up-to-date. With an in-depth knowledge of strata practices, we ensure that we provide our client the top-tier administrative support.',
    exp: ['Strata Industry Knowledge', 'Data Management', 'Customer Service Excellence', 'Document Management', 'Maintain and Update Records', 'Legal and Regulatory Compliance', 'Invoice Processing'],
    modules: ['Introduction to Strata Management', 'Basic Data Strata Insurance Handling Skills', 'Data Entry in Strata Industry', 'Understanding Certificates and Document Preparation', 'Soft Skills'],
  },
  {
    id: 's-acct', no: 'A.2', name: 'Strata Accountant',
    href: 'role-accountant.html',
    one: 'Supports reconciliations, levies, payments and reports.',
    about: 'With extensive experience in managing financial operations for strata schemes, our Strata Accountants are adept at handling a wide range of accounting tasks, ensuring compliance with regulatory requirements and providing exceptional financial management services. They possess a keen eye for detail, strong analytical skills and a commitment to delivering accurate and timely financial information. With a strong foundation in strata accounting, we ensure the financial health and compliance of strata schemes, providing peace of mind to the client and contributing to the company\u2019s smooth operation.',
    exp: ['Strata Industry Knowledge', 'Accounts Payable and Receivable', 'Assessment and Collection of Strata Fees', 'Bank Reconciliation Process', 'Expense Management and Payments', 'Debt Collection Process', 'Taxation', 'Financial Reporting and Audit'],
    modules: ['Introduction to Strata Management', 'Strata Management Fees and Governance Support', 'Invoice Management, Certificates, and Budget', 'Accounting, Financial Statements, and Audit', 'Soft Skills'],
  },
  {
    id: 's-ea', no: 'A.3', name: 'Strata Executive Assistant',
    href: 'role-executive-assistant.html',
    one: 'Handles calendars, inbox, data entry and reporting.',
    about: 'Senior-level support covering scheduling, reporting, stakeholder communication and strata manager coordination. Our Executive Assistants take the administrative weight off your strata managers so their day goes to the decisions only they can make \u2014 the calendar, the inbox, the reporting cycle and the follow-up that otherwise never gets done.',
    exp: ['Strata Executive and Governance Support', 'Project Coordination and Maintenance Repairs', 'Scheduling and Diary Management', 'Reporting and Data Entry', 'Stakeholder Communication', 'Strata Manager Coordination', 'Document Preparation'],
    modules: ['Introduction to Strata Management', 'Strata Executive & Governance Support', 'Project Coordination & Maintenance Repairs', 'Administrative Support', 'Soft Skills'],
  },
  {
    id: 's-comp', no: 'A.4', name: 'Strata Compliance Specialist',
    href: 'role-compliance-specialist.html',
    one: 'Tracks by-laws, defect lodgements and regulatory deadlines.',
    about: 'A highly skilled and knowledgeable Strata Compliance Specialist with extensive expertise in ensuring strata properties\u2019 legal and regulatory compliance. Possesses a comprehensive understanding of strata property legislation, local building codes and other relevant regulatory requirements. Adept in strata governance, offering guidance on the interpretation and enforcement of by-laws, rules and policies, and advising on strata council procedures, decision-making processes and meeting management.',
    exp: ['Legislative Update', 'By-Law Management', 'Maintenance and Repairs Compliance', 'Health and Safety Compliance', 'Compliance and Governance', 'Documentation and Record Keeping'],
    modules: ['Introduction to Strata Management', 'Understanding Strata Compliance', 'Legal Framework and Governance', 'Financial Management & Property Maintenance', 'Compliance Audits and Inspections', 'Meetings and Voting', 'Administrative Tasks', 'Soft Skills'],
  },
  {
    id: 's-ins', no: 'A.5', name: 'Strata Insurance Specialist',
    href: 'role-insurance-specialist.html',
    one: 'Coordinates renewals, claims and insurance enquiries.',
    about: 'A distinct set of expertise tailored to the unique needs of strata agencies \u2014 assisting the strata corporation with the claims procedure, from filing to resolution; coordinating with contractors, maintenance providers and other service vendors to ensure compliance with insurance requirements and to address any issues that may impact insurance coverage. By leveraging the expertise of a Strata Insurance Specialist, a strata management business can provide added value to its clients, mitigate risks, enhance operational efficiency and position itself for long-term success.',
    exp: ['Strata Industry Knowledge', 'Facilitating Claims Management', 'Insurance Data Management', 'Maintain and Update Records', 'Compliance Assurance', 'Coordination with Insurance Broker', 'Ethical Standard'],
    modules: ['Introduction to Strata Management', 'Basic Data Strata Insurance Handling Skills', 'Property and Valuation Management', 'Financial and Claims Management', 'Soft Skills'],
  },
  {
    id: 's-cc', no: 'A.6', name: 'Strata Customer Care',
    href: 'role-customer-care.html',
    one: 'Responds to owners, suppliers, requests and follow-ups.',
    about: 'Specialised in handling enquiries, resolving issues and providing information about strata management services. Responding promptly and professionally, with a range of skills and knowledge to effectively address the needs and concerns of strata property owners, residents and strata councils. Highly capable of maintaining accurate and up-to-date records of strata documents, contracts, correspondence and legal notices. By putting customer care initiatives first, strata agencies can differentiate themselves in the market and achieve sustainable business success.',
    exp: ['Strata Industry Knowledge', 'Strong Communication Skills', 'Customer Service Excellence', 'Conflict Resolution', 'Strata Manager\u2019s Assistance', 'Multichannel Support', 'Maintenance Coordination'],
    modules: ['Introduction to Strata Management', 'Basic Data Strata tasks', 'Property and Financial Management', 'Customer Concerns/Resolution', 'Soft Skills'],
  },
];

const PM_ROLES = [
  {
    id: 'p-admin', no: 'B.1', name: 'Property Management Administrative Specialist',
    href: 'role-pm-administrative-specialist.html',
    one: 'Tenancy documentation, lease renewals and maintenance coordination.',
    about: 'A dedicated expert in delivering outstanding service to our clients and enhancing the efficiency of our property management operations. Highly detail-oriented, adept at keeping accurate databases and providing strong administrative support. Known for excellent organizational and time-management skills, ensuring that all data is correct and current. With a thorough understanding of property management techniques, we provide our clients with exceptional administrative support.',
    exp: ['Property Management Industry Knowledge', 'Data Management and Document Management', 'Customer Service Excellence', 'Processing Invoice and Supplier Update', 'Maintain and Update Records', 'Assist with Tenant Relations and Lease Renewals', 'Create Comparative Market Analysis'],
    modules: ['Introduction to Property Management', 'Scope of Property Management', 'Roles and Responsibilities of a Property Manager', 'Technology in Property Management', 'Challenges in Property Management', 'Best Practices for Successful Property Management'],
  },
  {
    id: 'p-ea', no: 'B.2', name: 'Property Management Executive Assistant',
    href: 'role-pm-executive-assistant.html',
    one: 'Schedules, inspections, reporting and landlord communication.',
    about: 'Effectively supports a property manager: an Executive Assistant excels in communication, organization and time management. Key responsibilities include managing schedules, prioritizing tasks, handling administrative duties and tracking property maintenance and lease agreements, with extensive knowledge of property management principles as well as the ability to create reports and presentations.',
    exp: ['Document Preparation & Record Keeping', 'Coordinate Communication and Correspondence', 'Manage Confidential Information', 'Provide General Support to the Property Managers', 'Manage Property Manager\u2019s Schedules, Inbox and Calendars', 'Streamline Property Operations: Tenant Relations, Maintenance Coordination, Lease Management, Regulatory Compliance'],
    modules: ['Introduction to Property Management', 'Scope of Property Management', 'Roles and Responsibilities of a Property Manager', 'Technology in Property Management', 'Challenges in Property Management', 'Best Practices for Successful Property Management'],
  },
  {
    id: 'p-acct', no: 'B.3', name: 'Property Management Accountant',
    href: 'role-pm-accountant.html',
    one: 'Rental accounting, trust reconciliation and disbursement runs.',
    about: 'With vast experience running financial operations and specialising in the real estate and property management industries, this professional has a broad understanding of real estate market trends and their financial implications. Their extensive experience ensures that all financial operations, from budgeting to reporting, are carried out accurately and efficiently.',
    exp: ['Property Management Industry Knowledge', 'Financial Reporting and Analysis', 'Budgeting and Forecasting', 'Accounts Payable and Receivable', 'General Ledger Maintenance', 'Tax Compliance', 'Financial Compliance'],
    modules: ['Introduction to Property Management', 'Scope of Property Management', 'Roles and Responsibilities of a Property Manager', 'Technology in Property Management', 'Challenges in Property Management', 'Best Practices for Successful Property Management'],
  },
  {
    id: 'p-cc', no: 'B.4', name: 'Property Management Customer Care',
    href: 'role-pm-customer-care.html',
    one: 'Tenant and landlord enquiries, maintenance requests and follow-up.',
    about: 'An excellent communicator who conveys information clearly and effectively, ensuring tenants understand policies, procedures and any updates about the property. Provides effective customer care that ensures customers feel valued and heard, leading to higher satisfaction and retention rates. They provide high-level support by addressing customer needs promptly and efficiently. Customer care professionals help foster a positive brand reputation and drive business success.',
    exp: ['Property Management Industry Knowledge', 'Customer Relationship Management', 'Excellent Customer Support', 'Maintenance Coordination', 'Move-In and Move-Out Process', 'Lease Administration', 'Handling Enquiries and Complaints', 'Customer Feedback', 'Record Keeping'],
    modules: ['Introduction to Property Management', 'Scope of Property Management', 'Roles and Responsibilities of a Property Manager', 'Technology in Property Management', 'Challenges in Property Management', 'Best Practices for Successful Property Management'],
  },
];

const ALL_ROLES = STRATA_ROLES.concat(PM_ROLES);

const PLATFORMS = [
  ['platform-stratamax.png', 'StrataMax'], ['platform-urbanise.png', 'Urbanise'],
  ['platform-stratafy.png', 'Stratafy'], ['platform-mri.png', 'MRI'],
  ['platform-stratavault.png', 'Strata Vault'], ['platform-piq.png', 'PIQ'],
  ['platform-smata.jpg', 'Smata'], ['platform-idmax.png', 'IDMax'],
  ['platform-buildium.png', 'Buildium'], ['platform-aim.png', 'AIM'],
  ['platform-bing.png', 'Bing'], ['platform-strack.png', 'Strack'],
];

const TASK_LEDGER = [
  'Reconciliation', 'Payment Run', 'Debt Recovery', 'Financial Report', 'Valuation',
  'Bank Downloads', 'Section 184', 'Invoicing', 'Levy Queries', 'Strata Roll', 'Section 22',
  'Insurance Claims', 'Drafting Letters', 'Data Update', 'Archiving', 'Asbestos', 'AFSS',
  'Work Order', 'Bylaw Notices', 'Compliance', 'AGM', 'EGM',
];

const MEMBERS = [
  ['member-sca-nsw.png', 'Strata Community Association', 'New South Wales'],
  ['member-sca-sa.png', 'Strata Community Association', 'South Australia'],
  ['member-reinsw.png', 'Real Estate Institute', 'New South Wales'],
  ['member-cci-bc.png', 'Canadian Condominium Institute', 'British Columbia'],
];

const TESTIMONIALS = [
  { n: 'Joshua Baldwin', r: 'President, SCA Australasia', o: 'Munro Property', img: 'client-joshua-baldwin.jpg',
    q: 'Strata Staff has been our trusted partner for several years, and we are always impressed by their service, professionalism and friendliness. They have a talented and adaptable team that can learn new skills quickly and efficiently. They are flexible and responsive to our needs, and they deliver excellent results. We value their support and expertise greatly.' },
  { n: 'Michael Haines', r: 'President, SCA South Australia', o: 'Strata Management SA', img: 'client-michael-haines.jpg',
    q: 'Choosing Strata Staff as our offshoring partner has been a game-changer; it has completely transformed our business operations. Their dedication to quality service and seamless communication are consistently impressive. Their exceptional commitment to customer satisfaction, attention to detail and proactive problem-solving have resulted in significant improvements in our company.' },
  { n: 'Craig Mowll', r: 'Chief Executive Officer', o: 'Strata Choice', img: 'client-craig-mowll.png',
    q: 'We have developed a strong sense that we have a partner who not only assists us with our business cost challenges but also collaborates with us in building our offshore team as we continue to be a major player in the strata industry. We are grateful that Strata Staff became our offshore strategic partner in 2023. We started with them with only 5 staff and now we have grown to 21 headcounts, which speaks volumes on how our requirements have been attended to.' },
  { n: 'Paul Cvetko-Lueger', r: 'Leader of Operations & Business Development', o: 'ESM Strata', img: 'client-paul-cvetko.jpg',
    q: 'Strata Staff provided a comprehensive service that surpassed other providers we considered. This meant they could thoroughly grasp our business, including our processes, procedures and systems. Strata Staff have truly been a partner; they support us on a daily basis so we can focus on what we need to do onshore.' },
  { n: 'Jason Elliott', r: 'Director', o: 'Toowoomba Strata', img: 'client-jason-elliott.jpg',
    q: 'We have worked with Strata Staff for several years. They fill a very important role for us to complete somewhat repetitive work in a very cost-efficient way. Their systems and structures allow us to get the best possible result from our offshore staff. We are also regularly provided with a high level of accountability feedback. We have never felt uneasy about expanding the role and responsibilities of our offshore staff.' },
  { n: 'Mark Louis', r: 'Managing Director', o: 'Vital Strata', img: 'client-mark-louis.jpg',
    q: 'Working with Strata Staff has been an absolute game-changer for our firm. Their service consistently surpasses our expectations, delivering prompt, professional and genuinely friendly assistance. What sets them apart is their unwavering commitment to adaptability and continuous learning. Partnering with Strata Staff has undoubtedly been one of the best decisions for our firm.' },
  { n: 'Strata Bee', r: 'Client partner', o: 'Strata Bee', img: 'client-strata-bee.png',
    q: 'We have worked with Strata Staff for a few years now and we are so happy to have found them. We have great trust in the team and they have never let us down \u2014 each task is actioned efficiently and to a high standard. Strata Staff\u2019s reliability and professionalism have helped us immensely and we highly recommend them.' },
  { n: 'Christine Kelly', r: 'Director', o: 'Stanton & Taylor Strata Management', img: 'client-stanton-taylor.png',
    q: 'Our firm has worked with Strata Staff for a number of years now, and find their service to be prompt, professional and friendly. The team at Strata Staff are always happy to help and have no problems learning new skills. They are willing to work around what our team needs, and we find their assistance to be enormously valuable.' },
  { n: 'Felix Xie', r: 'Strata Manager', o: 'Professionals Strata Team', img: 'client-professionals.jpg',
    q: 'Strata Staff service has been very professional and outcome focused. They have a superb team that execute tasks diligently. We expect this relationship to grow much more with the years ahead as we expand offshore requirements using the full depth of Strata Staff\u2019s expertise.' },
];

const EXECUTIVES = [
  { n: 'Trevor McGuinness', r: 'Owner / Co-Founder', img: 'exec-trevor.jpg',
    b: 'Co-founded Strata Staff in April 2019 after several reconnaissance trips to the Philippines, and set the company\u2019s original thesis: that strata administration could be documented, taught and delivered offshore to a standard Australian agencies would trust.' },
  { n: 'Paul Miller', r: 'Owner / Co-Founder', img: 'exec-paul.jpg',
    b: 'Shared the vision from the first conversation and, with Trevor, beta-tested strata administration work in the Philippines before the hard launch. Paul\u2019s focus is the long-term health of the client partnerships the business is built on.' },
  { n: 'Tongta Miller', r: 'Chief Financial Officer', img: 'exec-tongta.jpg',
    b: 'Leads the finance function across both jurisdictions, holding the commercial discipline behind a business that has scaled from three computers to more than 200,000 individual strata tasks a month.' },
  { n: 'Dan Fabros', r: 'Executive Managing Director', img: 'exec-dan.jpg',
    b: 'Dan manages the company\u2019s macro to micro-operations. He works directly with the ownership group to set strategic goals while managing budgets and resources. He manages the core people by leading and developing the leadership and management teams. He ensures that Strata Staff\u2019s service level continuously improves by executing agile methodologies for optimum outcomes. He represents Strata Staff in establishing partnerships and relationships with key stakeholders. Dan is ultimately responsible for driving business growth and ensuring the long-term scalability and success of the business.', c: true },
];

const TEAM = [
  ['Anna Marie David', 'Human Resource Manager', 'hr'],
  ['Trixy Bulaun', 'HR Officer', 'hr'],
  ['Neil Dane Puno', 'HR Generalist', 'hr'],
  ['Mary Ann Pineda', 'Training and Development Manager', 'td'],
  ['Marey Iams Sarate', 'Executive Assistant Lead Trainer', 'td'],
  ['Maristella Gaton', 'Accountant Lead Trainer', 'td'],
  ['Jeremiah Feliciano', 'Administrative Specialist Lead Trainer', 'td'],
  ['Jahaziel Beltran', 'Accounting Manager', 'af'],
  ['Sarahjane Manliclic', 'Accounting Officer', 'af'],
  ['Desika Mundia', 'Administration and Facilities Manager', 'lf'],
  ['Patricia Garcia', 'Executive Assistant to the Executive Managing Director / Support Executive Services Team Lead', 'es'],
  ['Leah Adriano', 'Business Development Manager', 'sb'],
  ['Riel Lacsamana', 'Information Technology Officer', 'it'],
  ['Dave Jason Velasquez', 'Information Technology Specialist', 'it'],
  ['Ian Kenneth Crisostomo', 'Information Technology Specialist', 'it'],
  ['Patricia Puno', 'Client Success Manager', 'cs'],
  ['Rei Sanchez', 'Team Leader', 'cs'],
  ['Sheena Magdaraog', 'Team Leader', 'cs'],
  ['Carlo Andreu Tayag', 'Team Leader', 'cs'],
  ['Mcryn Aie Changcoco', 'Team Leader', 'cs'],
];

const TEAM_FILTERS = [
  ['all', 'All'], ['pc', 'People & Culture'], ['hr', 'Human Resource'], ['td', 'Training & Development'],
  ['af', 'Accounting & Finance'], ['lf', 'Legal & Facilities Administration'], ['es', 'Executive Services'],
  ['sb', 'Sales & Business Development'], ['it', 'Information Technology'], ['sm', 'Systems & Multimedia'],
  ['cs', 'Client Success & Team Leaders'],
];

const TEAM_PHOTOS = [
  'team-anna.jpg', 'team-trixy.webp', 'team-neil.webp', 'team-maryann.jpg', 'team-marey.webp',
  'team-jeremiah.webp', 'team-jahaziel.jpg', 'team-sarahjane.webp', 'team-desika.jpg',
  'team-patricia-garcia.webp', 'team-leah.jpg', 'team-riel.jpg', 'team-dave.webp', 'team-ian.webp',
  'team-patricia-puno.jpg', 'team-rei.jpg', 'team-sheena.jpg', 'team-carlo.jpg', 'team-mcryn.jpg',
];

/* ------------------------------------------------------------- the index -- */
const NAV = [
  {
    href: 'about.html', label: 'About', bar: 'About', kids: [
      ['about.html', 'About Us', 'Who Strata Staff Global is and what it is for.'],
      ['journey.html', 'Enjoying The Journey', 'April 2019 to more than 200,000 tasks a month.'],
      ['executives.html', 'Executives', 'The four office bearers.'],
      ['team.html', 'Our Awesome Team', 'The register of officers.'],
      ['testimonials.html', 'Our Clients Have Spoken', 'Nine signed statements.'],
    ],
  },
  {
    href: 'solutions.html', label: 'Solutions', bar: 'Solutions', kids: [
      ['solutions.html', 'All Offshore Specialists', 'Ten roles across two service lines.'],
      ['strata-services.html', 'Strata Services', 'Six strata specialists.'],
      ['strata-staff-plus.html', 'Strata Staff Plus', 'Four property management specialists.'],
    ],
  },
  {
    href: 'strata-services.html', label: 'Strata Services', bar: 'Services',
    kids: STRATA_ROLES.map(r => [r.href, r.name, r.one]),
  },
  {
    href: 'strata-staff-plus.html', label: 'Strata Staff Plus', bar: 'Plus',
    kids: PM_ROLES.map(r => [r.href, r.name, r.one]),
  },
  {
    href: 'learning.html', label: 'Learning', bar: 'Learning', kids: [
      ['learning.html', 'Learning Programs', 'How the training is structured.'],
      ['academy.html', 'Strata Staff Academy', 'The online learning hub.'],
      ['foundation-training-program.html', 'Foundation Training Program', 'Industry readiness before endorsement.'],
      ['course-outline.html', 'Course Outline Per Role', 'Every module, every role.'],
    ],
  },
  { href: 'insights.html', label: 'Insights', bar: 'Insights' },
  {
    href: 'careers.html', label: 'Careers', bar: 'Careers', kids: [
      ['careers.html', 'Careers at Strata Staff', 'Open positions and the application form.'],
      ['job-junior-accountant.html', 'Junior Accountant', 'Angeles City / San Fernando City.'],
      ['job-mid-level-accountant.html', 'Mid-Level Accountant (Nightshift)', 'Angeles City.'],
      ['job-senior-accountant.html', 'Senior Accountant', 'Angeles City.'],
      ['job-hr-assistant.html', 'Human Resources Assistant', 'Angeles City.'],
    ],
  },
  { href: 'contact.html', label: 'Talk To Us', bar: 'Contact' },
];

/* ---------------------------------------------------------------- helpers -- */
const esc = s => String(s)
  .replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const mark = (text, extra = '') =>
  `<span class="mark${extra}" data-mark>${esc(text)}<span class="mark__ink" aria-hidden="true"></span></span>`;

const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';

const stamp = (lines, cls = '', rot = '-3.4deg') => {
  const arr = Array.isArray(lines) ? lines : [lines];
  return `<span class="stamp ${cls}" style="--rot:${rot}">` +
    arr.map(l => `<span class="stamp__line">${typeof l === 'string' ? esc(l) : l}</span>`).join('') +
    '</span>';
};

const item = ({ no, id, title, lede, body = '', aside = '', wide = false }) => `
      <section class="item" id="${id}" data-item="${no}">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>${no}</p>
          <div class="item__head">
            <h2 class="display">${title}</h2>
            ${lede ? `<p class="item__lede">${lede}</p>` : ''}
          </div>
          ${body ? `<div class="item__body${wide ? ' item__body--wide' : ''}">${body}</div>` : ''}
          ${aside ? `<aside class="item__aside">${aside}</aside>` : ''}
        </div>
      </section>`;

const schRows = rows => rows.map(r =>
  `<tr><td class="k">${r[0]}</td><td class="v n">${r[1]}</td></tr>`).join('');

const roleTable = roles => `
      <table class="sched">
        <thead><tr><th scope="col">Item</th><th scope="col">Role</th><th scope="col">What it covers</th><th scope="col" class="n">Schedule</th></tr></thead>
        <tbody>
          ${roles.map(r => `<tr class="is-link">
            <td class="n">${r.no}</td>
            <td class="role"><a href="${r.href}">${esc(r.name)}</a></td>
            <td class="k">${esc(r.one)}</td>
            <td class="n"><a href="${r.href}">Read${' &rarr;'}</a></td>
          </tr>`).join('\n          ')}
        </tbody>
      </table>`;

const optionsList = (rows, cls = '') => `
      <div class="opts${cls}">
        ${rows.map(r => `<a class="opt" href="${r.href}">
          <span class="opt__no">${r.no || ''}</span>
          <span class="opt__name">${esc(r.name)}</span>
          <span class="opt__desc">${esc(r.desc)}</span>
          <span class="opt__go" aria-hidden="true">${arrow}</span>
        </a>`).join('\n        ')}
      </div>`;

/* Index tabs. CSS cannot compare a checked input's id to an attribute, so the
   visibility rules for every tab group are emitted into styles-tabs.css below.
   Everything else about the pattern is CSS-only and works without JavaScript. */
const TAB_IDS = new Set();
const tabs = (group, items) => {
  items.forEach(it => TAB_IDS.add(it.id));
  return `
        <div class="tabs">
          <div class="tabs__list">
            ${items.map((it, i) => `<input type="radio" name="${group}" id="${it.id}"${i === 0 ? ' checked' : ''}><label for="${it.id}">${it.label}</label>`).join('\n            ')}
            ${items.map(it => `<div class="tabs__panel" data-tab="${it.id}">${it.html}</div>`).join('\n            ')}
          </div>
        </div>`;
};

const seal = ([img, org, place]) => `
        <figure class="seal">
          <div class="seal__disc">
            <span class="seal__guilloche" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" focusable="false"><use href="#guilloche"/></svg></span>
            <img src="assets/${img}" alt="${esc(org)} \u2014 ${esc(place)} membership" loading="lazy" decoding="async" width="230" height="120">
          </div>
          <figcaption class="seal__cap">${esc(place)}</figcaption>
        </figure>`;

/* An engraved seal ring: a guilloch\u00e9 rosette traced from an epicycloid, so the
   accreditation marks belong to the certificate world rather than to a card.
   Built once as a symbol and referenced with <use>, so the geometry is paid for
   once per page instead of once per seal. */
function guillocheSymbol() {
  const N = 240, R = 35, r = 9, d = 20, cx = 50, cy = 50;
  const outer = [], inner = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const k = (R - r) / r;
    outer.push(
      (cx + (R - r) * Math.cos(t) + d * Math.cos(k * t)).toFixed(1) + ',' +
      (cy + (R - r) * Math.sin(t) - d * Math.sin(k * t)).toFixed(1));
    inner.push((cx + 39 * Math.cos(t)).toFixed(1) + ',' + (cy + 39 * Math.sin(t)).toFixed(1));
  }
  return `    <symbol id="guilloche" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width=".7" fill="none" opacity=".55"/>
      <circle cx="50" cy="50" r="47.2" stroke="currentColor" stroke-width=".4" fill="none" opacity=".35"/>
      <polygon points="${outer.join(' ')}" stroke="currentColor" stroke-width=".28" fill="none" opacity=".7"/>
      <polygon points="${inner.join(' ')}" stroke="currentColor" stroke-width=".45" fill="none" opacity=".45"/>
    </symbol>`;
}
const GUILLOCHE = guillocheSymbol();

/* ================================================================ the shell */
const svgDefs = `<svg class="sr" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
${GUILLOCHE}
    <!-- rubber-stamp ink: fine grain plus a small displacement so no two
         impressions are identical -->
    <filter id="ink-rough" x="-8%" y="-14%" width="116%" height="128%">
      <feTurbulence type="fractalNoise" baseFrequency=".72 .86" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.9" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="19" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .38 .38 .38 0 .5" result="ga"/>
      <feComposite in="d" in2="ga" operator="in"/>
    </filter>
  </defs>
</svg>`;

function head({ title, desc, page, depth = 0, bodyClass = '' }) {
  const t = title ? `${title} — Strata Staff Global` : 'Strata Staff Global — Your Premium Strata Offshore Capacity Solutions Provider';
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#00102E">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_AU">
<link rel="icon" href="assets/logo-icon.png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/logo-icon.png">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="styles-tabs.css">
<script>document.documentElement.className += ' js';</script>
<script defer src="app.js"></script>
<noscript><style>.mark__ink{clip-path:inset(0 0 0 0)!important}</style></noscript>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${svgDefs}
<a class="skip" href="#main">Skip to the notice</a>
<div class="sheet">
${documentBar(page)}
  <div class="body-grid">
${punch()}
    <div class="sheet__body">
`;
}

const CRUMB = { about: 'About', solutions: 'Solutions', services: 'Strata Services', plus: 'Strata Staff Plus', learning: 'Learning', insights: 'Insights', careers: 'Careers', contact: 'Talk To Us' };

function documentBar(page) {
  return `    <header class="bar">
      <a class="bar__brand" href="index.html">
        <img src="assets/logo-full.png" alt="Strata Staff Global" width="2049" height="447">
      </a>
      <span class="bar__tag">Premium strata offshore capacity solutions</span>
      <nav class="bar__nav" aria-label="Agenda">
${NAV.map(n => `        <a href="${n.href}"${page === n.href ? ' aria-current="page"' : ''}>${esc(n.bar)}</a>`).join('\n')}
      </nav>
      <a class="bar__cta btn" href="contact.html#book">Talk to us</a>
      <span class="bar__folio" aria-hidden="true"><span data-folio-now>01</span>&thinsp;/&thinsp;<span data-folio-all>01</span></span>
      <button class="bar__menu" type="button" data-drawer-open aria-controls="drawer" aria-expanded="false">Contents</button>
    </header>`;
}

function punch() {
  return `      <div class="punch" aria-hidden="true">
        <div class="punch__stick">
          <span class="hole"></span>
          <span class="punch__rule"></span>
          <span class="folio">Item <b><span data-folio-now>01</span>/<span data-folio-all>01</span></b></span>
          <span class="punch__rule"></span>
          <span class="hole"></span>
        </div>
      </div>`;
}

function drawer() {
  return `  <div class="drawer" id="drawer" inert aria-label="Contents">
    <div class="drawer__top">
      <img src="assets/logo-full.png" alt="Strata Staff Global" width="2049" height="447">
      <button class="drawer__close" type="button" data-drawer-close>Close</button>
    </div>
    <div class="drawer__body">
${NAV.map(n => `      <section class="drawer__group">
        <h2>${esc(n.label)}</h2>
        <ol>
          <li><a href="${n.href}"><span>${esc(n.label)} overview</span><em>${esc(n.href === 'contact.html' ? 'Book the 30-minute discovery call' : 'Start here')}</em></a></li>
${(n.kids || []).map(k => `          <li><a href="${k[0]}"><span>${esc(k[1])}</span><em>${esc(k[2] || '')}</em></a></li>`).join('\n')}
        </ol>
      </section>`).join('\n')}
      <div class="drawer__cta">
        <a class="btn" href="contact.html#book">Schedule the free discovery call</a>
        <a class="btn2" href="mailto:${MAIL_SOL}">${MAIL_SOL}</a>
      </div>
    </div>
  </div>`;
}

function footer() {
  return `      <div class="perf" aria-hidden="true"></div>
      <footer class="foot">
        <div class="foot__wrap">
          <div class="foot__brand">
            <img src="assets/logo-full.png" alt="Strata Staff Global" width="2049" height="447" loading="lazy">
            <p class="prose" style="margin-top:1rem;max-width:34ch">Purpose-trained offshore specialists for strata and property management agencies across Australia and Canada. Operating since April 2019.</p>
          </div>
          <div class="foot__col">
            <h3>Company</h3>
            <ul>
              <li><a href="about.html">About Us</a></li>
              <li><a href="journey.html">Enjoying The Journey</a></li>
              <li><a href="executives.html">Executives</a></li>
              <li><a href="team.html">Our Awesome Team</a></li>
              <li><a href="testimonials.html">Our Clients Have Spoken</a></li>
              <li><a href="careers.html">Careers at Strata Staff</a></li>
              <li><a href="privacy.html">Privacy Policy</a></li>
            </ul>
          </div>
          <div class="foot__col">
            <h3>Strata Services</h3>
            <ul>
${STRATA_ROLES.map(r => `              <li><a href="${r.href}">${esc(r.name.replace('Strata ', ''))}</a></li>`).join('\n')}
            </ul>
          </div>
          <div class="foot__col">
            <h3>Strata Staff Plus</h3>
            <ul>
${PM_ROLES.map(r => `              <li><a href="${r.href}">${esc(r.name.replace('Property Management ', ''))}</a></li>`).join('\n')}
            </ul>
          </div>
          <div class="foot__col">
            <h3>Learning</h3>
            <ul>
              <li><a href="course-outline.html">Course Outline Per Role</a></li>
              <li><a href="foundation-training-program.html">Foundation Training Program</a></li>
              <li><a href="academy.html">Strata Staff Academy</a></li>
              <li><a href="insights.html">Insights</a></li>
              <li><a href="solutions.html">Solutions</a></li>
            </ul>
          </div>
        </div>
        <div class="foot__wrap" style="margin-top:2.4rem">
          <div class="foot__addr">
            <dl>
              <dt>Australia</dt><dd>${esc(ADDR_AU)}<br><a href="tel:${TEL_AU_H}">${TEL_AU_D}</a></dd>
              <dt>Canada</dt><dd>${esc(ADDR_CA)}<br><a href="tel:${TEL_CA_H}">${TEL_CA_D}</a></dd>
              <dt>Email</dt><dd><a href="mailto:${MAIL_SOL}">${MAIL_SOL}</a> &nbsp;·&nbsp; <a href="mailto:${MAIL_TRN}">${MAIL_TRN}</a></dd>
            </dl>
          </div>
          <div class="foot__social">
            <h3>Follow</h3>
            <ul>
${SOCIAL.map(s => `              <li><a href="${s[0]}" rel="noopener">${esc(s[1])}</a></li>`).join('\n')}
            </ul>
          </div>
        </div>
        <div class="foot__legal">
          <p>&copy; <span data-year>2026</span> Strata Staff Global</p>
          <p>Australia &nbsp;·&nbsp; Canada &nbsp;·&nbsp; Philippines</p>
          <p><a class="link" href="privacy.html">Privacy Policy</a></p>
        </div>
      </footer>
      <div class="cookies" id="cookies" hidden role="region" aria-label="Cookies">
        <p><span class="note">Notice of cookies</span>We use cookies for analytics, security, forms and embedded services. You can accept or decline; declining still leaves the notice readable.</p>
        <span class="cookies__acts">
          <button class="btn" type="button" data-cookie="accepted">Accept</button>
          <button class="btn2" type="button" data-cookie="declined">Decline</button>
        </span>
      </div>
`;
}

const tail = `    </div>
  </div>
</div>
${''}`;

function page(opts) {
  const { head: h, main, page: p } = opts;
  return head(h) + main + drawer() + footer() + tail + `</body>
</html>
`;
}

/* An interior sheet header, the pack's own device for a new schedule. */
function phead({ crumb, ref, title, lede, aside = '' }) {
  return `      <header class="phead">
        <div class="wrap">
          <nav class="phead__ref crumbs" aria-label="Breadcrumb">
            <a href="index.html">Notice</a><span aria-hidden="true">/</span>
            ${crumb.map((c, i) => {
              const last = i === crumb.length - 1;
              const sep = i ? '<span aria-hidden="true">/</span>' : '';
              // the current page is the end of the trail, not a link to itself
              return sep + (last
                ? `<span aria-current="page">${esc(c[1])}</span>`
                : `<a href="${c[0]}">${esc(c[1])}</a>`);
            }).join('')}
          </nav>
          <div class="phead__main">
            ${ref ? `<p class="ref" style="margin-bottom:.9rem">${ref}</p>` : ''}
            <h1 class="display">${title}</h1>
            ${lede ? `<p class="lede">${lede}</p>` : ''}
          </div>
          ${aside ? `<aside class="phead__aside">${aside}</aside>` : ''}
        </div>
      </header>`;
}

const ctaBlock = (heading = 'Schedule Free Discovery Call') => `
      <section class="item" id="book" data-item="09">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>09</p>
          <div class="item__head">
            <h2 class="display">${heading}</h2>
            <p class="item__lede">We value your time in engaging with us. Your enquiry is a true reflection of your interest, so tell us more and we will come back to you with a tailored capacity plan.</p>
          </div>
          <div class="item__body item__body--wide">
            <div class="facts">
              <div class="fact"><p class="fact__v">30</p><p class="fact__k">Minutes, no obligation</p><p class="fact__s">A discovery call with the solutions team.</p></div>
              <div class="fact"><p class="fact__v">AU</p><p class="fact__k">Australia</p><p class="fact__s"><a class="link" href="tel:${TEL_AU_H}">${TEL_AU_D}</a></p></div>
              <div class="fact"><p class="fact__v">CA</p><p class="fact__k">Canada</p><p class="fact__s"><a class="link" href="tel:${TEL_CA_H}">${TEL_CA_D}</a></p></div>
              <div class="fact"><p class="fact__v">@</p><p class="fact__k">Email</p><p class="fact__s"><a class="link" href="mailto:${MAIL_SOL}">${MAIL_SOL}</a></p></div>
            </div>
            <p style="margin-top:2.2rem;display:flex;flex-wrap:wrap;gap:1.3rem;align-items:center">
              <a class="btn btn--lg" href="contact.html#book">Schedule the free discovery call</a>
              <a class="btn2" href="contact.html#capacity">Take the capacity test ${arrow}</a>
            </p>
          </div>
        </div>
      </section>`;

/* ============================================================== the pages == */
const PAGES = {};

/* ------------------------------------------------------------------ home -- */
PAGES['index.html'] = () => {
  const rows = [
    ['Placements since April 2019', '500+'],
    ['Client retention rate', '98%'],
    ['Individual strata tasks per month', '200,000+'],
    ['Strata platforms staff are trained on', '13+'],
    ['Purpose-trained specialists available', '10 roles'],
    ['Delivery locations', 'AU · CA · PH'],
  ];
  return page({
    page: 'index.html',
    head: {
      title: 'Build Your Strata Staff Global Offshore Team',
      desc: 'Strata-trained professionals who expand your capacity, streamline daily operations, and help your agency grow with confidence. Servicing Australian and Canadian strata agencies since April 2019.',
    },
    main: `
    <main id="main">
      <section class="cover">
        <div class="wrap">
          <div class="cover__main">
            <p class="opening">Notice is hereby given</p>
            <h1 class="display">that your strata agency can carry ${mark('more lots')} <span class="ink-quiet">than it has hours</span>.</h1>
            <p class="lede">Strata Staff Global places purpose-trained offshore specialists inside Australian and Canadian strata agencies &mdash; accountants, administrative specialists, executive assistants, compliance and insurance specialists, and customer care. They arrive trained on the platforms you already run and the legislation you already answer to.</p>
            <div class="cover__acts">
              <a class="btn btn--lg" href="contact.html#book">Schedule the free discovery call</a>
              <a class="btn2" href="contact.html#capacity">Take the capacity test ${arrow}</a>
            </div>
            <p class="cover__ref">
              <span class="ref">AU <a class="link" href="tel:${TEL_AU_H}">${TEL_AU_D}</a></span>
              <span class="ref">CA <a class="link" href="tel:${TEL_CA_H}">${TEL_CA_D}</a></span>
              <span class="ref"><a class="link" href="mailto:${MAIL_SOL}">${MAIL_SOL}</a></span>
              <span class="ref">No obligation &middot; 30 minutes</span>
            </p>
          </div>
          <aside class="cover__aside">
            <table class="sched sched--particulars">
              <caption class="note">Schedule 1 &mdash; Particulars</caption>
              <tbody>${schRows(rows)}</tbody>
            </table>
            <div class="stamp-wrap">${stamp(['Strata-trained', 'Ready day one'], 'stamp--lg', '-3.2deg')}</div>
            <p class="note" style="margin-top:1.6rem;display:flex;align-items:center;gap:.7rem">
              <img src="assets/flag-au.svg" alt="" width="22" height="16" loading="lazy">
              <img src="assets/flag-ca.svg" alt="" width="22" height="16" loading="lazy">
              Australia &amp; Canada
            </p>
          </aside>
        </div>
      </section>

      <div class="field-marker">
        <p>Every placement is trained on strata legislation and on more than thirteen strata platforms before they touch your portfolio. That is the whole difference between a strata specialist and a generalist offshore seat.</p>
      </div>

${item({
      no: '01', id: 'motion', title: 'Motion 01 &mdash; Your capacity plan',
      lede: 'From first contact to a fully operational offshore desk in four clauses. Each one is resolved before the next is put.',
      wide: true,
      body: `
        <div class="clauses">
          <div class="clause"><p class="clause__no">1.1</p><h3>Book a discovery call</h3><p>Schedule a free 30-minute call with our solutions team to share your staffing needs and goals.</p></div>
          <div class="clause"><p class="clause__no">1.2</p><h3>We design your solution</h3><p>Our team creates a tailored offshore capacity plan &mdash; matching the right roles, skills and strata platforms to your business.</p></div>
          <div class="clause"><p class="clause__no">1.3</p><h3>Meet your offshore team</h3><p>We select, vet and purpose-train your offshore staff on strata operations so they hit the ground running.</p></div>
          <div class="clause"><p class="clause__no">1.4</p><h3>Scale with confidence</h3><p>Your offshore team integrates into your workflows, increasing capacity without proportional overhead costs.</p></div>
        </div>`,
    })}

${item({
      no: '02', id: 'specialists', title: 'Schedule 2 &mdash; The specialists',
      lede: 'Ten roles, two service lines. Every one of them is filled by a specialist who understands your industry, not a generalist administrator.',
      aside: `<div class="stamp-wrap" style="padding-top:0">${stamp(['Not a', 'generalist BPO'], 'stamp--sm', '4deg')}</div>
        <p class="note" style="margin-top:2rem">Platforms in daily use</p>
        <ul class="tasks">${TASK_LEDGER.slice(0, 8).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`,
      body: `
${tabs('sched2', [
        { id: 'tab-strata', label: 'Strata Services <span class="tick">A</span>', html: `<p class="prose">Our strata management team handles the full back office of your agency &mdash; from financial processing and compliance tracking to customer care and executive support. Fully trained on Australian strata platforms and processes.</p>${roleTable(STRATA_ROLES)}` },
        { id: 'tab-plus', label: 'Strata Staff Plus <span class="tick">B</span>', html: `<p class="prose">Extend your property management team with purpose-trained Strata Staff Global specialists. We handle the operational load so your in-house managers can focus on relationships and growth.</p>${roleTable(PM_ROLES)}` },
      ])}`,
    })}

${item({
      no: '03', id: 'platforms', title: 'Schedule 3 &mdash; The platforms',
      lede: 'Our familiarity with the strata platforms you already run works to your advantage. Minimal ramp-up time, maximum output from week one, because nobody has to be taught the software from scratch.',
      wide: true,
      body: `
        <div class="plats">
          ${PLATFORMS.map(p => `<div class="plat"><img src="assets/${p[0]}" alt="${esc(p[1])}" loading="lazy" decoding="async"><span class="plat__cap">${esc(p[1])}</span></div>`).join('\n          ')}
        </div>
        <p class="note" style="margin-top:1.4rem">Thirteen or more platforms in daily use, including the twelve above.</p>`,
      aside: '',
    })}

${item({
      no: '04', id: 'register', title: 'Motion 02 &mdash; The register of posts',
      lede: 'The company handles more than 200,000 individual strata tasks a month. Move the pointer to see that figure decompose into the posts it is actually made of, and to trace the growth path one client described in their own statement.',
      wide: true,
      body: `
        <div class="register">
          <div class="reg-out" aria-live="polite">
            <p class="reg-out__n"><span data-reg-n>5</span></p>
            <p><span class="reg-out__lab">Specialists on your offshore team</span><br><span class="note" data-reg-phase>Foundation squad</span></p>
            <p class="reg-out__note">Illustrative model &mdash; your plan is built on the call</p>
          </div>
          <div class="scale">
            <label class="note" for="capacity">Move the pointer &mdash; 5 to 21 specialists</label>
            <div class="scale__ruler">
              <span class="scale__ticks" aria-hidden="true">${Array.from({ length: 17 }, (_, i) => `<i class="${i % 5 === 0 ? 'maj' : ''}"></i>`).join('')}</span>
              <input type="range" id="capacity" min="5" max="21" step="1" value="5" aria-describedby="cap-hint">
            </div>
            <p class="scale__legend note"><span>5 &middot; where Strata Choice started in 2023</span><span>21 &middot; where they are now</span></p>
          </div>
          <table class="sched reg-table">
            <thead><tr><th scope="col" class="n">Post</th><th scope="col">Role</th><th scope="col">Task area</th><th scope="col" class="n">Ref</th></tr></thead>
            <tbody id="reg-rows"></tbody>
          </table>
          <p class="reg-hint" id="cap-hint">Post count is illustrative of a typical blended desk. The monthly task volume beside it is the company&rsquo;s own reported figure, scaled to the size of desk you select. Nothing here is a quotation; a real plan is built on the call.</p>
        </div>`,
    })}

${item({
      no: '05', id: 'statements', title: 'Schedule 4 &mdash; Statements received',
      lede: 'Nine statements from agency principals and industry officeholders, reproduced in full. This is the evidence schedule the rest of the notice rests on.',
      wide: true,
      body: `
        <div class="stmt">
          ${TESTIMONIALS.map(t => `<div class="stmt__row">
            <div class="stmt__sig"><img src="assets/${t.img}" alt="" width="150" height="150" loading="lazy" decoding="async"></div>
            <blockquote>${esc(t.q)}</blockquote>
            <div class="stmt__meta">
              <p class="stmt__name">${esc(t.n)}</p>
              <p class="stmt__role">${esc(t.r)}</p>
              <p class="stmt__org">${esc(t.o)}</p>
              <div class="stmt__stamp">${stamp('Received', 'stamp--sm stamp--quiet', '-2.4deg')}</div>
            </div>
          </div>`).join('\n          ')}
        </div>`,
    })}

${item({
      no: '06', id: 'accreditation', title: 'Schedule 5 &mdash; Accreditation',
      lede: 'Strata Staff Global holds corporate membership of the industry bodies its clients belong to, in both countries it serves.',
      wide: true,
      body: `<div class="seals">${MEMBERS.map(seal).join('')}</div>`,
    })}

${item({
      no: '07', id: 'papers', title: 'Schedule 6 &mdash; Papers circulated',
      lede: 'Announcements, newsletters and partnership notes, as published.',
      wide: true,
      body: `<div id="papers-list" data-papers></div>`,
      aside: '',
    })}

${item({
      no: '08', id: 'resolution', title: '', body: '', aside: '',
    })}
    </main>`,
  });
};

/* ------------------------------------------------------------- solutions -- */
PAGES['solutions.html'] = () => page({
  page: 'solutions.html',
  head: {
    title: 'Solutions',
    desc: 'Ten offshore roles across two service lines: Strata Services for strata agencies, and Strata Staff Plus for property management.',
  },
  main: `
    <main id="main">
${phead({
    crumb: [['solutions.html', 'Solutions']],
    ref: 'Schedule of specialists',
    title: 'Meet our offshore specialists',
    lede: 'Experience efficiency and significant savings with Strata Staff&rsquo;s offshore capacity solutions &mdash; fully supporting your agency&rsquo;s needs from administrative tasks to specialised services, with top-tier talent, flexible scaling options and an unwavering commitment to quality.',
    aside: `<div class="stamp-wrap" style="padding-top:0;justify-content:flex-end">${stamp(['Ten roles', 'one standard'], 'stamp--sm', '-3deg')}</div>`,
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head">
            <h2 class="display">Strata management offshore solutions</h2>
            <p class="item__lede">Our strata management team handles the full back office of your strata agency &mdash; from financial processing and compliance tracking to customer care and executive support. Fully trained on Australian strata platforms and processes.</p>
          </div>
          <div class="item__body item__body--wide">${roleTable(STRATA_ROLES)}</div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head">
            <h2 class="display">Property management offshore solutions</h2>
            <p class="item__lede">Extend your property management team with purpose-trained Strata Staff Global specialists. We handle the operational load so your in-house managers can focus on relationships and growth.</p>
          </div>
          <div class="item__body item__body--wide">${roleTable(PM_ROLES)}</div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

/* -------------------------------------------------- the two service lines -- */
function serviceLine(title, desc, ref, roles, note) {
  return page({
    page: roles === STRATA_ROLES ? 'strata-services.html' : 'strata-staff-plus.html',
    head: { title, desc },
    main: `
    <main id="main">
${phead({
      crumb: [[roles === STRATA_ROLES ? 'strata-services.html' : 'strata-staff-plus.html', title]],
      ref,
      title: 'Build your Strata Staff Global offshore team',
      lede: 'Maximise capacity. Optimise productivity. Increase the bottom line. ' + note,
    })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">${esc(title)} roles</h2></div>
          <div class="item__body item__body--wide">${roleTable(roles)}</div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
  });
}
PAGES['strata-services.html'] = () => serviceLine('Strata Services', 'Six strata specialists trained on Australian strata legislation and platforms.', 'Schedule A', STRATA_ROLES,
  'Our strata specialists are trained specifically in strata operations and understand the dynamics and ever-changing requirements of strata agencies across Australia and Canada.');
PAGES['strata-staff-plus.html'] = () => serviceLine('Strata Staff Plus', 'Four property management specialists for agencies running both strata and rental portfolios.', 'Schedule B', PM_ROLES,
  'Strata Staff Plus extends the same standard of training into property management: tenancy documentation, lease renewals, trust reconciliation, inspections and tenant care.');

/* ----------------------------------------------------------- role pages --- */
/* The two service lines, as descriptors a role page can name in its crumb. */
const LINE_STRATA = { href: 'strata-services.html', name: 'Strata Services', kind: 'strata' };
const LINE_PLUS = { href: 'strata-staff-plus.html', name: 'Strata Staff Plus', kind: 'plus' };

function rolePage(role, line) {
  return page({
    page: role.href,
    head: { title: role.name, desc: role.about.slice(0, 180) },
    main: `
    <main id="main">
${phead({
      crumb: [[line.href, line.name], [role.href, role.name]],
      ref: `Item ${role.no} &mdash; ${line.name}`,
      title: esc(role.name),
      lede: role.one,
      aside: `<div class="stamp-wrap" style="padding-top:0;justify-content:flex-end">${stamp([line.kind === 'strata' ? 'Strata' : 'Property mgmt', 'specialist'], 'stamp--sm', '-3.4deg')}</div>`,
    })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">About the role</h2></div>
          <div class="item__body item__body--wide"><p class="prose">${esc(role.about)}</p></div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Expertise</h2>
            <p class="item__lede">What this specialist is trained to own from day one.</p></div>
          <div class="item__body item__body--wide">
            <div class="trio">
              ${role.exp.map((e, i) => `<div><span class="trio__n">${role.no}.${i + 1}</span><h3>${esc(e)}</h3></div>`).join('\n              ')}
            </div>
          </div>
        </div>
      </section>
      <section class="item" data-item="03">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>03</p>
          <div class="item__head"><h2 class="display">Training schedule</h2>
            <p class="item__lede">Every ${esc(role.name.replace(/^Strata |^Property Management /, '').toLowerCase())} completes these modules before endorsement to an agency.</p></div>
          <div class="item__body item__body--wide">
            <table class="sched">
              <thead><tr><th scope="col">Module</th><th scope="col">Content</th></tr></thead>
              <tbody>
                ${role.modules.map((m, i) => `<tr><td class="n">M${i + 1}</td><td class="role">${esc(m)}</td></tr>`).join('\n                ')}
              </tbody>
            </table>
            <p class="note" style="margin-top:1.2rem"><a class="link" href="course-outline.html">See the full course outline per role</a></p>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
  });
}
for (const r of STRATA_ROLES) PAGES[r.href] = () => rolePage(r, LINE_STRATA);
for (const r of PM_ROLES) PAGES[r.href] = () => rolePage(r, LINE_PLUS);

/* ------------------------------------------------------------- learning --- */
PAGES['learning.html'] = () => page({
  page: 'learning.html',
  head: { title: 'Learning', desc: 'Structured training programs, certification tracks and a dedicated learning academy built for strata industry success.' },
  main: `
    <main id="main">
${phead({
    crumb: [['learning.html', 'Learning']],
    ref: 'Education schedule',
    title: 'Our learning programs',
    lede: 'Strata Staff invests in your offshore team from day one &mdash; with structured training programs, certification tracks and a dedicated learning academy built for strata industry success.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">The three programs</h2></div>
          <div class="item__body item__body--wide">
${optionsList([
    { href: 'academy.html', no: 'E.1', name: 'Strata Staff Academy', desc: 'Our dedicated online learning hub where team members access training resources, certification tracks and professional development modules to stay strata-ready.' },
    { href: 'foundation-training-program.html', no: 'E.2', name: 'Foundation Training Program', desc: 'Equips aspiring strata professionals with essential industry skills, preparing them for a successful placement with a strata agency partner from day one.' },
    { href: 'course-outline.html', no: 'E.3', name: 'Course Outline Per Role', desc: 'Role-specific training outlines for every position, from Accountants and Executive Assistants to Compliance Specialists and Customer Care.' },
  ])}
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Foundation Training Program</h2>
            <p class="item__lede">The FTP trains aspiring strata learners in basic foundation skills, which helps them be better prepared upon endorsement to a strata agency partner. It increases the industry readiness of professionals who want to start a career in the strata industry.</p></div>
          <div class="item__body item__body--wide">
            <div class="duo" style="padding:0">
              <div class="duo__a">
                <h3>How our FTP adds value to our workforce</h3>
                <ul class="tasks" style="margin-top:1rem">
                  ${['Building of Basic Foundational Knowledgebase', 'Monitored Competency Levels', 'Professional Growth and Career Advancement', 'Consistent Proficiency Intervention', 'Skill-Gaps Coaching and Management', 'Professional Representation of the Strata Industry'].map(x => `<li>${esc(x)}</li>`).join('')}
                </ul>
              </div>
              <div class="duo__b">
                <h3>How our FTP enhances value for client partners</h3>
                <ul class="tasks" style="margin-top:1rem">
                  ${['Aligned Process Execution with Internal Agency Metrics', 'Quality Assurance and Client Satisfaction', 'High Compliance Ratio', 'Tailored Task Management Solutions Per Agency'].map(x => `<li>${esc(x)}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['academy.html'] = () => page({
  page: 'academy.html',
  head: { title: 'Strata Staff Academy', desc: 'Learn and be strata ready. The Strata Staff Academy online learning hub.' },
  main: `
    <main id="main">
${phead({
    crumb: [['learning.html', 'Learning'], ['academy.html', 'Strata Staff Academy']],
    ref: 'Education schedule &mdash; E.1',
    title: 'Learn and be strata ready',
    lede: 'The Strata Staff Academy is the online learning hub where team members access training resources, certification tracks and professional development modules to stay strata-ready. Master strata management with our comprehensive learning platform.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Enrolment particulars</h2>
            <p class="item__lede">For more information and to enrol, contact the enrolment team. Existing students can sign in to continue a track.</p></div>
          <div class="item__body item__body--wide">
            <div class="facts">
              <div class="fact"><p class="fact__v">Hub</p><p class="fact__k">Format</p><p class="fact__s">Online, self-paced modules with certification tracks.</p></div>
              <div class="fact"><p class="fact__v">@</p><p class="fact__k">Enrolment email</p><p class="fact__s"><a class="link" href="mailto:${MAIL_TRN}">${MAIL_TRN}</a></p></div>
              <div class="fact"><p class="fact__v">10</p><p class="fact__k">Role tracks</p><p class="fact__s"><a class="link" href="course-outline.html">See every course outline</a></p></div>
              <div class="fact"><p class="fact__v">2019</p><p class="fact__k">Training since</p><p class="fact__s">Documented task by task from the first month.</p></div>
            </div>
            <form class="form" data-demo novalidate>
              <div class="form__fieldset" style="display:contents">
                <div class="field"><label for="ac-name">Full name <span class="req">*</span></label><input id="ac-name" name="name" type="text" autocomplete="name" required data-name="your name"><p class="field__err" hidden></p></div>
                <div class="field"><label for="ac-email">Email <span class="req">*</span></label><input id="ac-email" name="email" type="email" autocomplete="email" required data-name="your email"><p class="field__err" hidden></p></div>
                <div class="field"><label for="ac-phone">Phone</label><input id="ac-phone" name="phone" type="tel" autocomplete="tel" data-name="your phone"><p class="field__err" hidden></p></div>
                <div class="field"><label for="ac-track">Track of interest</label>
                  <select id="ac-track" name="track">
                    <option>Strata Administrative Specialist</option>
                    <option>Strata Accountant</option>
                    <option>Strata Executive Assistant</option>
                    <option>Strata Compliance Specialist</option>
                    <option>Strata Insurance Specialist</option>
                    <option>Strata Customer Care</option>
                    <option>Property Management track</option>
                  </select></div>
              </div>
              <div class="form__acts">
                <button class="btn" type="submit">Submit enrolment enquiry</button>
                <span class="note">Demo build &mdash; this form is not connected to an endpoint.</span>
              </div>
              <div class="form__status" hidden role="status">
                <h3>Enrolment enquiry filed</h3>
                <p class="prose">Thank you. The enrolment team receives this and replies from training@stratastaffglobal.com. In this rebuild nothing was actually sent, because no endpoint is wired up.</p>
              </div>
            </form>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['foundation-training-program.html'] = () => page({
  page: 'foundation-training-program.html',
  head: { title: 'Foundation Training Program', desc: 'The Foundation Training Program equips aspiring strata professionals with essential industry skills before placement.' },
  main: `
    <main id="main">
${phead({
    crumb: [['learning.html', 'Learning'], ['foundation-training-program.html', 'Foundation Training Program']],
    ref: 'Education schedule &mdash; E.2',
    title: 'Excellence with our Foundation Training Program',
    lede: 'The Foundation Training Program (FTP) aims to train aspiring strata learners in basic foundation skills, which will help them be better prepared upon endorsement to a strata agency partner. This program will help increase the industry readiness of professionals who want to start a career in the strata industry.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">What the program is for</h2></div>
          <div class="item__body item__body--wide">
            <div class="duo" style="padding:0">
              <div class="duo__a"><h3>For our workforce</h3>
                <ul class="tasks" style="margin-top:1rem">${['Building of Basic Foundational Knowledgebase', 'Monitored Competency Levels', 'Professional Growth and Career Advancement', 'Consistent Proficiency Intervention', 'Skill-Gaps Coaching and Management', 'Professional Representation of the Strata Industry'].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
              </div>
              <div class="duo__b"><h3>For client agency partners</h3>
                <ul class="tasks" style="margin-top:1rem">${['Aligned Process Execution with Internal Agency Metrics', 'Quality Assurance and Client Satisfaction', 'High Compliance Ratio', 'Tailored Task Management Solutions Per Agency'].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Continuing education</h2>
            <p class="item__lede">The learning delivery team also runs the externally published Strata Property Management 101 programme, a six-course series delivered face to face or by live stream.</p>
            <p class="item__lede" style="margin-top:1rem">Contact the enrolment team for current dates and fees.</p>
            <p style="margin-top:1.6rem"><a class="btn2" href="mailto:${MAIL_TRN}">${MAIL_TRN} ${arrow}</a></p>
          </div>
          <div class="item__body item__body--wide">
            <table class="sched">
              <thead><tr><th scope="col">Part</th><th scope="col">Stage</th><th scope="col">Covered</th></tr></thead>
              <tbody>
                <tr><td class="n">1</td><td class="role">Before MCST registration &amp; MC constitution</td><td class="k">Management of development; establishing and managing maintenance funds; managing and maintaining common property; accountability for maintenance funds.</td></tr>
                <tr><td class="n">2</td><td class="role">After MC constitution to first AGM</td><td class="k">Financial procedures for established maintenance funds; the role of the MC as trustee and restrictions on it; convening the first AGM.</td></tr>
                <tr><td class="n">3</td><td class="role">After the first AGM: handover</td><td class="k">Delivery of documents; preparing the annual budget for approval; independent condition survey of common property; latent defects.</td></tr>
              </tbody>
            </table>
            <p class="note" style="margin-top:1.4rem">Session format: three hours plus Q&amp;A and a networking session. Six modular courses in total; participants may select the courses they hold a vested interest in.</p>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['course-outline.html'] = () => page({
  page: 'course-outline.html',
  head: { title: 'Course Outline Per Role', desc: 'Role-specific strata and property management training outlines for every Strata Staff Global position.' },
  main: `
    <main id="main">
${phead({
    crumb: [['learning.html', 'Learning'], ['course-outline.html', 'Course Outline Per Role']],
    ref: 'Education schedule &mdash; E.3',
    title: 'Course outline per role',
    lede: 'Browse the training outline for every Strata Staff Global position. Each role completes the strata foundation modules plus the modules specific to its work.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Strata training outline</h2></div>
          <div class="item__body item__body--wide">
${tabs('course', STRATA_ROLES.map(r => ({
            id: `tab-c-${r.id}`, label: esc(r.name.replace('Strata ', '')),
            html: `<h3>${esc(r.name)} &mdash; ${r.modules.length} modules</h3><ul>${r.modules.map((m, i) => `<li><span class="num" style="color:var(--ink-3);margin-right:.7rem">M${i + 1}</span>${esc(m)}</li>`).join('')}</ul>`,
          })))}
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Property management training outline</h2>
            <p class="item__lede">The property management tracks share a common foundation and then specialise by role.</p></div>
          <div class="item__body item__body--wide">
${tabs('coursepm', PM_ROLES.map(r => ({
            id: `tab-p-${r.id}`, label: esc(r.name.replace('Property Management ', '')),
            html: `<h3>${esc(r.name)} &mdash; 6 modules</h3><ul>${r.modules.map((m, i) => `<li><span class="num" style="color:var(--ink-3);margin-right:.7rem">M${i + 1}</span>${esc(m)}</li>`).join('')}</ul>`,
          })))}
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

/* ---------------------------------------------------------------- about --- */
PAGES['about.html'] = () => page({
  page: 'about.html',
  head: { title: 'About Us', desc: 'Strata Staff Global is a premium offshore capacity solutions provider serving strata agencies across Australia and Canada.' },
  main: `
    <main id="main">
${phead({
    crumb: [['about.html', 'About Us']],
    ref: 'Company particulars',
    title: 'About Strata Staff Global',
    lede: 'A premium offshore capacity solutions provider serving strata agencies across Australia and Canada. We specialise in connecting strata businesses with high-performing, strata-trained global teams who are ready to work from day one.',
    aside: `<div class="stamp-wrap" style="padding-top:0;justify-content:flex-end">${stamp(['Since', 'April 2019'], 'stamp--sm', '3deg')}</div>`,
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Bespoke strata offshoring for agencies globally</h2></div>
          <div class="item__body item__body--wide">
            <div class="duo" style="padding:0">
              <div class="duo__a">
                <p class="prose">Founded by strata industry professionals, Strata Staff Global was built with one purpose: to give strata agencies the offshore talent they need to scale without compromise. Our staff are not generalists &mdash; they are trained specifically in strata operations, fluent in the day-to-day realities of property management, and familiar with Australian and Canadian strata legislation.</p>
                <p class="prose">We add value to strata agencies by providing offshore capacity solutions that augment rising staff and operating costs, driving revenue streams upward while maintaining the service quality your clients expect. Whether you need one specialist or an entire offshore team, we have the experience and infrastructure to make it seamless.</p>
              </div>
              <div class="duo__b">
                <table class="sched sched--particulars">
                  <caption class="note">Schedule &mdash; The company</caption>
                  <tbody>
                    <tr><td class="k">Operating since</td><td class="v n">April 2019</td></tr>
                    <tr><td class="k">Tasks handled per month</td><td class="v n">200,000+</td></tr>
                    <tr><td class="k">Service lines</td><td class="v n">2</td></tr>
                    <tr><td class="k">Specialist roles</td><td class="v n">10</td></tr>
                    <tr><td class="k">Industry memberships</td><td class="v n">4</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">The Strata Staff difference</h2></div>
          <div class="item__body item__body--wide">
            <div class="trio">
              <div><h3>Strata-trained and ready</h3><p>Our global teams are trained specifically in strata operations. They understand the dynamics and ever-changing requirements of strata agencies across Australia and Canada &mdash; not just general admin or back-office work. Your offshore staff hit the ground running.</p></div>
              <div><h3>Tailored capacity solutions</h3><p>We provide strategic offshore capacity built around your agency&rsquo;s specific needs. Our solutions augment rising staff and operating costs, helping you scale headcount without proportionally increasing overheads, so your bottom line grows.</p></div>
              <div><h3>Turn-key platform expertise</h3><p>Our staff are familiar with 13+ strata platforms including StrataMax, Urbanise, Stratafy, MRI, Strata Vault, PIQ, Smata and more. Minimal ramp-up time. Maximum output from week one.</p></div>
            </div>
          </div>
        </div>
      </section>
      <section class="item" data-item="03">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>03</p>
          <div class="item__head"><h2 class="display">Where to go next</h2></div>
          <div class="item__body item__body--wide">
${optionsList([
    { href: 'journey.html', no: 'C.1', name: 'Enjoying The Journey', desc: 'From three computers and a water dispenser in Mabalacat to more than 200,000 tasks a month.' },
    { href: 'executives.html', no: 'C.2', name: 'Executives', desc: 'The four office bearers and what each is accountable for.' },
    { href: 'team.html', no: 'C.3', name: 'Our Awesome Team', desc: 'Twenty named officers across ten departments.' },
    { href: 'testimonials.html', no: 'C.4', name: 'Our Clients Have Spoken', desc: 'Nine signed statements from agency principals and industry officeholders.' },
  ])}
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['journey.html'] = () => page({
  page: 'journey.html',
  head: { title: 'Enjoying The Journey', desc: 'From a small office in Mabalacat Pampanga in 2019 to more than 200,000 strata tasks a month.' },
  main: `
    <main id="main">
${phead({
    crumb: [['about.html', 'About Us'], ['journey.html', 'Enjoying The Journey']],
    ref: 'Minutes of the first meeting',
    title: 'Enjoying the journey',
    lede: 'Guided by the utmost aim of helping strata agencies with specialised capacity solutions, Strata Staff embarked on its humble beginnings in a small office in Mabalacat, Pampanga, in 2019.',
    aside: `<div class="stamp-wrap" style="padding-top:0;justify-content:flex-end">${stamp(['Humble', 'beginnings'], 'stamp--sm', '-3.2deg')}</div>`,
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">How it all began</h2></div>
          <div class="item__body item__body--wide">
            <div class="clauses">
              <div class="clause"><p class="clause__no">2015&ndash;16</p><h3>The first trips</h3><p>Trevor McGuinness made initial trips to the Philippines, thinking about a business concept that could provide employment opportunities. Upon returning to Australia he discussed the offshoring model with his friend Paul Miller.</p></div>
              <div class="clause"><p class="clause__no">2019</p><h3>Hard launch in April</h3><p>Having shared values and a vision for the concept, Trevor and Paul beta-tested strata administration work in the Philippines. Seeing the potential for a specialist BPO helping strata companies with high-end business admin work offshore, they launched Strata Staff.</p></div>
              <div class="clause"><p class="clause__no">2020</p><h3>Operations scale</h3><p>Dan Fabros joined Strata Staff, helping Paul and Trevor with operations and business scalability.</p></div>
              <div class="clause"><p class="clause__no">Today</p><h3>More than 200,000 tasks a month</h3><p>From processing basic strata administration tasks like archiving to complicated property and strata administration tasks like S184 and S22, handling levy queries, preparing financial bank statements, inbox management and drafting AGM agendas &mdash; Strata Staff now handles as many as 200,000+ individual business tasks per month.</p></div>
            </div>
            <p class="prose" style="margin-top:2rem">Roadblocks like earthquakes, lockdowns and the COVID-19 pandemic did not deter Strata Staff from pushing forward and responding to the challenge despite the adversity. Starting with three computers and a water dispenser did not prevent the team from dedicating hours after hours documenting every strata admin task, while servicing some agencies with just casual hours during that time.</p>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Core values and workplace culture</h2>
            <p class="item__lede">At Strata Staff we have an inclusive and intentional work environment, guided by our values and culture. We continually aim to improve our service levels to ensure strategic partnerships are strengthened. Our people define and echo the quality of our engagements, which has been substantiated by client testimonials.</p></div>
          <div class="item__body item__body--wide">
            <div class="trio">
              <div><h3>Gratitude</h3><p>Thank-you culture.</p></div>
              <div><h3>Get it done</h3><p>Hustle culture.</p></div>
              <div><h3>Be part of the solution</h3><p>Adding-value culture.</p></div>
              <div><h3>Help others to be better</h3><p>Paying-it-forward culture.</p></div>
            </div>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['executives.html'] = () => page({
  page: 'executives.html',
  head: { title: 'Executives', desc: 'Strata Staff Global is led by executive management with diverse professional backgrounds in strata, corporate finance and business development.' },
  main: `
    <main id="main">
${phead({
    crumb: [['about.html', 'About Us'], ['executives.html', 'Executives']],
    ref: 'Office bearers',
    title: 'Executives',
    lede: 'Strata Staff&rsquo;s vision and growth are led by exceptional executive management with diverse professional backgrounds in strata, corporate finance and business development.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">The four office bearers</h2></div>
          <div class="item__body item__body--wide">
            <div class="seals" style="grid-template-columns:repeat(4,minmax(0,1fr))">
              ${EXECUTIVES.map(e => `<figure class="seal">
                <img src="assets/${e.img}" alt="${esc(e.n)}" width="908" height="1671" loading="lazy" decoding="async" style="width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;object-position:top;border:1px solid var(--rule)">
                <figcaption class="seal__cap seal__cap--person" style="margin-top:1rem">
                  <b class="exec__name">${esc(e.n)}</b>
                  <span class="seal__role">${esc(e.r)}</span>
                </figcaption>
              </figure>`).join('\n              ')}
            </div>
          </div>
        </div>
      </section>
      ${EXECUTIVES.filter(e => e.c).map(e => `
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">${esc(e.r)}</h2>
            <p class="item__lede">${esc(e.n)}</p></div>
          <div class="item__body item__body--wide">
            <p class="prose">${esc(e.b)}</p>
            <table class="sched" style="max-width:640px;margin-top:1.8rem">
              <tbody>
                <tr><td class="k">Email</td><td class="v n"><a class="link" href="mailto:dante@stratastaffglobal.com">dante@stratastaffglobal.com</a></td></tr>
                <tr><td class="k">Australia</td><td class="v n"><a class="link" href="tel:+61391170964">+61 3 9117 0964</a></td></tr>
                <tr><td class="k">Canada</td><td class="v n"><a class="link" href="tel:+12363121667">+1 236 312 1667</a></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>`).join('')}
${ctaBlock()}
    </main>`,
});

PAGES['team.html'] = () => page({
  page: 'team.html',
  head: { title: 'Our Awesome Team', desc: 'The twenty officers of Strata Staff Global, by department.' },
  main: `
    <main id="main">
${phead({
    crumb: [['about.html', 'About Us'], ['team.html', 'Our Awesome Team']],
    ref: 'Register of officers',
    title: 'Our awesome team',
    lede: 'Strata Staff takes pride in having a capable management and leadership team able to support strata agency partners from task-specific detail through to capacity and performance reviews.',
    aside: `<table class="sched sched--particulars"><caption class="note">Register summary</caption><tbody>
      <tr><td class="k">Named officers</td><td class="v n">20</td></tr>
      <tr><td class="k">Departments</td><td class="v n">10</td></tr>
      <tr><td class="k">Lead trainers</td><td class="v n">3</td></tr>
    </tbody></table>`,
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Photographic register</h2>
            <p class="item__lede">Portraits from the company&rsquo;s own gallery. They are shown here without name pairings: this rebuild could not verify each portrait against each name, and mislabelling a colleague would be worse than leaving the pair apart.</p></div>
          <div class="item__body item__body--wide">
            <div class="platwall">
              ${TEAM_PHOTOS.map((p, i) => `<figure><img src="assets/${p}" alt="" width="163" height="300" loading="lazy" decoding="async"><figcaption>Plate ${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('\n              ')}
            </div>
            <p class="note" style="margin-top:1.2rem">Nineteen plates are held in the gallery against twenty names in the register, and the filenames do not map reliably on their own. The pairs are therefore left apart.</p>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Officers by department</h2></div>
          <div class="item__body item__body--wide">
${tabs('team', TEAM_FILTERS.map(([id, label]) => {
            const rows = TEAM.filter(t => id === 'all' || t[2] === id);
            return {
              id: `tab-${id}`, label: esc(label),
              html: `<table class="sched">
                  <thead><tr><th scope="col" class="n">&numero;</th><th scope="col">Officer</th><th scope="col">Position</th></tr></thead>
                  <tbody>${rows.length
                  ? rows.map((t, j) => `<tr><td class="n">${String(j + 1).padStart(2, '0')}</td><td class="role">${esc(t[0])}</td><td class="k">${esc(t[1])}</td></tr>`).join('\n                    ')
                  : '<tr><td colspan="3" class="k">No officer is recorded under this department in the published register, so this panel is left empty rather than filled with a guess.</td></tr>'}</tbody>
                </table>`,
            };
          }))}
            <p class="note" style="margin-top:1.4rem">The Systems &amp; Multimedia department carries no named officer in the published register, so its panel is shown empty rather than filled with a guess.</p>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

PAGES['testimonials.html'] = () => page({
  page: 'testimonials.html',
  head: { title: 'Our Clients Have Spoken', desc: 'Nine statements from strata agency principals and industry officeholders across Australia and Canada.' },
  main: `
    <main id="main">
${phead({
    crumb: [['about.html', 'About Us'], ['testimonials.html', 'Our Clients Have Spoken']],
    ref: 'Statements received',
    title: 'Our clients have spoken',
    lede: 'Every statement below is reproduced in full, attributed to the person who gave it. These are the agency principals and industry officeholders whose businesses run on Strata Staff desks.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Nine statements</h2></div>
          <div class="item__body item__body--wide">
            <div class="stmt">
              ${TESTIMONIALS.map(t => `<div class="stmt__row">
                <div class="stmt__sig"><img src="assets/${t.img}" alt="" width="150" height="150" loading="lazy" decoding="async"></div>
                <blockquote>${esc(t.q)}</blockquote>
                <div class="stmt__meta">
                  <p class="stmt__name">${esc(t.n)}</p>
                  <p class="stmt__role">${esc(t.r)}</p>
                  <p class="stmt__org">${esc(t.o)}</p>
                  <div class="stmt__stamp">${stamp('Received', 'stamp--sm stamp--quiet', '-2.4deg')}</div>
                </div>
              </div>`).join('\n              ')}
            </div>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

/* -------------------------------------------------------------- insights -- */
function fmtDate(d) { return d; }
PAGES['insights.html'] = () => page({
  page: 'insights.html',
  head: { title: 'Insights', desc: 'News, updates and industry insights from Strata Staff Global.' },
  main: `
    <main id="main">
${phead({
    crumb: [['insights.html', 'Insights']],
    ref: 'Papers circulated',
    title: 'Insights',
    lede: 'News, updates and industry insight from Strata Staff Global &mdash; announcements, quarterly newsletters and notes from the client partnership programme.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Circulated papers</h2></div>
          <div class="item__body item__body--wide">
${optionsList(POSTS.map((p, i) => ({
    href: `post-${p.file}.html`, no: String(i + 1).padStart(2, '0'), name: p.title,
    desc: `${p.cat} · ${p.date} — ${p.summary}`,
  })))}
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

function postPage(p) {
  const paras = p.body.split('\n').map(s => s.trim()).filter(Boolean)
    .filter(l => !/^(Leave a Reply Cancel reply|You must be logged in to post a comment\.)$/.test(l));
  return page({
    page: `post-${p.file}.html`,
    head: { title: p.title, desc: p.summary.slice(0, 180) },
    main: `
    <main id="main">
${phead({
      crumb: [['insights.html', 'Insights'], [`post-${p.file}.html`, p.title]],
      ref: `${p.cat} &middot; ${p.date} &middot; 1 min read`,
      title: esc(p.title),
      lede: esc(p.summary),
    })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">The paper</h2></div>
          <div class="item__body item__body--wide">
            <div class="doc-body">
              ${paras.map(t => `<p>${esc(t)}</p>`).join('\n              ')}
            </div>
            <p class="note" style="margin-top:2rem">Filed under ${esc(p.cat)} &middot; ${esc(p.date)} &middot; by Strata Staff</p>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Other papers</h2></div>
          <div class="item__body item__body--wide">
${optionsList(POSTS.filter(o => o.file !== p.file).slice(0, 4).map(o => ({ href: `post-${o.file}.html`, no: '', name: o.title, desc: `${o.cat} · ${o.date}` })))}
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
  });
}

/* -------------------------------------------------------------- careers --- */
function jobListRows() {
  return JOBS.map((j, i) => ({
    href: `job-${j.slug}.html`, no: String(i + 1).padStart(2, '0'), name: j.title,
    desc: `${j.shift} · ${j.site}`,
  }));
}

PAGES['careers.html'] = () => page({
  page: 'careers.html',
  head: { title: 'Careers at Strata Staff', desc: 'Open positions at Strata Staff Global in Angeles City: accountants and a human resources assistant.' },
  main: `
    <main id="main">
${phead({
    crumb: [['careers.html', 'Careers at Strata Staff']],
    ref: 'Notice of vacancies',
    title: 'Careers at Strata Staff',
    lede: 'We are looking for results-oriented and outcome-focused people to enjoy the journey with us. Every role below is a real, open position with a full position description.',
    aside: `<table class="sched sched--particulars"><caption class="note">Vacancies</caption><tbody>
      <tr><td class="k">Open positions</td><td class="v n">4</td></tr>
      <tr><td class="k">Work site</td><td class="v n">Angeles City</td></tr>
      <tr><td class="k">Employment</td><td class="v n">Permanent</td></tr>
    </tbody></table>`,
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Open positions</h2>
            <p class="item__lede">Explore current opportunities below and select a role to read the full position description and apply.</p></div>
          <div class="item__body item__body--wide">${optionsList(jobListRows())}</div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Apply</h2>
            <p class="item__lede">Tell us who you are and which role you are applying for. Applications are reviewed by the people and culture team.</p></div>
          <div class="item__body item__body--wide">
            <form class="form" data-demo novalidate>
              <div class="form__fieldset" style="display:contents">
                <div class="field"><label for="c-first">First name <span class="req">*</span></label><input id="c-first" name="first" type="text" autocomplete="given-name" required data-name="your first name"><p class="field__err" hidden></p></div>
                <div class="field"><label for="c-last">Last name <span class="req">*</span></label><input id="c-last" name="last" type="text" autocomplete="family-name" required data-name="your last name"><p class="field__err" hidden></p></div>
                <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required data-name="your email"><p class="field__err" hidden></p></div>
                <div class="field"><label for="c-phone">Contact number <span class="req">*</span></label><input id="c-phone" name="phone" type="tel" autocomplete="tel" required data-name="a contact number"><p class="field__err" hidden></p></div>
                <div class="field"><label for="c-pos">Position <span class="req">*</span></label>
                  <select id="c-pos" name="position" required data-name="the role">
                    <option value="">Select a position</option>
                    ${JOBS.map(j => `<option>${esc(j.title)}</option>`).join('\n                    ')}
                    <option>Strata Administrative Specialist</option>
                    <option>Strata Executive Assistant</option>
                    <option>Customer Care</option>
                    <option>Business Development Representative</option>
                  </select><p class="field__err" hidden></p></div>
                <fieldset class="field">
                  <legend>Work schedule</legend>
                  <div class="choice" style="padding-top:.5rem">
                    <label><input type="radio" name="schedule" value="Dayshift" checked> Dayshift</label>
                    <label><input type="radio" name="schedule" value="Nightshift"> Nightshift</label>
                  </div>
                </fieldset>
                <fieldset class="field">
                  <legend>Availability</legend>
                  <div class="choice" style="padding-top:.5rem">
                    <label><input type="radio" name="availability" value="Immediately" checked> Immediately</label>
                    <label><input type="radio" name="availability" value="30 days"> 30 days</label>
                  </div>
                </fieldset>
                <div class="field field--full"><label for="c-note">Anything we should know</label><textarea id="c-note" name="note" data-name="a note"></textarea><p class="field__hint">Optional. Relevant experience, current notice period, or questions about the role.</p></div>
                <div class="field field--full"><label for="c-resume">Resume</label><input id="c-resume" name="resume" type="file" accept=".pdf,.doc,.docx"><p class="field__hint">PDF or Word document. In this rebuild the file is not uploaded anywhere.</p></div>
              </div>
              <div class="form__acts">
                <button class="btn" type="submit">Apply now</button>
                <span class="note">Demo build &mdash; this form is not connected to an endpoint.</span>
              </div>
              <div class="form__status" hidden role="status">
                <h3>Application filed</h3>
                <p class="prose">Thank you. The people and culture team reviews applications against the position description and replies by email. In this rebuild nothing was actually sent, because no endpoint is wired up.</p>
              </div>
            </form>
          </div>
        </div>
      </section>
${ctaBlock()}
    </main>`,
});

function jobPage(j) {
  const L = j.lines;
  const idx = k => L.findIndex(l => l.toLowerCase().startsWith(k.toLowerCase()));
  const slice = (a, b) => (a > -1 ? L.slice(a + 1, b > -1 && b > a ? b : L.length) : []);
  const details = slice(idx('Position Details'), idx('About the Job'));
  const about = slice(idx('About the Job'), idx('Responsibilities'));
  const rest = (() => {
    let i = idx('Responsibilities');
    if (i < 0) i = idx('Requirements');
    if (i < 0) i = -1;
    return i > -1 ? L.slice(i) : [];
  })();

  // Group the remaining lines into headed runs: a line with no trailing period
  // that is followed by more lines acts as a heading.
  const groups = [];
  let cur = null;
  for (const line of rest) {
    const isHeading =
      !/^[•\u2022-]/.test(line) && line.length < 82 &&
      (/^([A-Z]|[IVX]+)\.\s+\S/.test(line) || /:$/.test(line) || (/^[A-Z]/.test(line) && !/[.!?]$/.test(line)));
    if (isHeading) {
      cur = { h: line.replace(/:$/, ''), items: [] };
      groups.push(cur);
    } else if (cur) {
      cur.items.push(line);
    } else {
      cur = { h: '', items: [line] };
      groups.push(cur);
    }
  }
  // promote a heading run that is immediately a bullet of prose into the body
  const detailRows = details.map(d => {
    const m = d.match(/^([^:]{2,40}):\s*(.*)$/);
    return m ? [m[1], m[2]] : ['', d];
  });

  return page({
    page: `job-${j.slug}.html`,
    head: { title: j.title, desc: about.join(' ').slice(0, 180) },
    main: `
    <main id="main">
${phead({
      crumb: [['careers.html', 'Careers'], [`job-${j.slug}.html`, j.title]],
      ref: 'Position description',
      title: esc(j.title),
      lede: `${esc(j.shift)} &middot; ${esc(j.site)}`,
      aside: `<div class="stamp-wrap" style="padding-top:0;justify-content:flex-end">${stamp(['Open', 'position'], 'stamp--sm', '-3deg')}</div>`,
    })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Position details</h2></div>
          <div class="item__body item__body--wide">
            <table class="sched sched--particulars" style="max-width:680px">
              <tbody>${detailRows.map(r => `<tr><td class="k">${esc(r[0])}</td><td class="v n" style="font-size:1rem;text-align:left;font-family:var(--sans);font-weight:500">${esc(r[1])}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section class="item" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">About the job</h2></div>
          <div class="item__body item__body--wide"><div class="doc-body">${about.map(p => `<p>${esc(p)}</p>`).join('')}</div></div>
        </div>
      </section>
      <section class="item" data-item="03">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>03</p>
          <div class="item__head"><h2 class="display">Responsibilities, requirements and benefits</h2></div>
          <div class="item__body item__body--wide">
            <div class="doc-body">
              ${groups.map(g => `${g.h ? `<h3>${esc(g.h)}</h3>` : ''}${g.items.length ? `<ul>${g.items.map(i => `<li>${esc(i.replace(/^[•\u2022]\s*/, ''))}</li>`).join('')}</ul>` : ''}`).join('\n              ')}
            </div>
          </div>
        </div>
      </section>
      <section class="item" data-item="04">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>04</p>
          <div class="item__head"><h2 class="display">Apply for this role</h2>
            <p class="item__lede">Applications go to the people and culture team. Tell us the role name in your subject line.</p>
            <p style="margin-top:1.4rem;display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center">
              <a class="btn" href="careers.html#apply">Open the application form</a>
              <a class="btn2" href="careers.html">All open positions ${arrow}</a>
            </p></div>
        </div>
      </section>
    </main>`,
  });
}

/* -------------------------------------------------------------- contact --- */
PAGES['contact.html'] = () => page({
  page: 'contact.html',
  head: { title: 'Talk To Us', desc: 'Tell us what you need. Book the free 30-minute discovery call with the Strata Staff Global solutions team.' },
  main: `
    <main id="main">
${phead({
    crumb: [['contact.html', 'Talk To Us']],
    ref: 'Proxy form',
    title: 'Tell us what you need',
    lede: 'We value your time in engaging with us. Your enquiry is a true reflection of your interest, so tell us more and we will come back with a capacity plan built around your agency.',
  })}
      <section class="item" id="book" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Book the free discovery call</h2>
            <p class="item__lede">Thirty minutes with the solutions team. Bring your lot count, your current headcount and the tasks that never get to the bottom of the pile.</p></div>
          <div class="item__body item__body--wide">
            <form class="form" data-demo novalidate>
              <div class="form__fieldset" style="display:contents">
                <div class="field"><label for="k-name">Name <span class="req">*</span></label><input id="k-name" name="name" type="text" autocomplete="name" required data-name="your name"><p class="field__err" hidden></p></div>
                <div class="field"><label for="k-agency">Agency <span class="req">*</span></label><input id="k-agency" name="agency" type="text" autocomplete="organization" required data-name="your agency"><p class="field__err" hidden></p></div>
                <div class="field"><label for="k-email">Email <span class="req">*</span></label><input id="k-email" name="email" type="email" autocomplete="email" required data-name="your email"><p class="field__err" hidden></p></div>
                <div class="field"><label for="k-phone">Phone <span class="req">*</span></label><input id="k-phone" name="phone" type="tel" autocomplete="tel" required data-name="a phone number"><p class="field__err" hidden></p></div>
                <div class="field"><label for="k-country">Country of operation <span class="req">*</span></label>
                  <select id="k-country" name="country" required data-name="your country">
                    <option value="">Select</option>
                    <option>Australia</option><option>Canada</option><option>Both</option><option>Other</option>
                  </select><p class="field__err" hidden></p></div>
                <div class="field"><label for="k-lots">Lots under management</label><input id="k-lots" name="lots" type="text" inputmode="numeric" placeholder="e.g. 1,400"><p class="field__hint">Optional, and useful for sizing a plan.</p></div>
                <div class="field field--full"><label for="k-need">What is backing up?</label><textarea id="k-need" name="need" placeholder="Levy queries, reconciliations, inbox management, AGM preparation, insurance claims, arrears follow-up…"></textarea><p class="field__hint">Optional. A sentence or two is plenty.</p></div>
              </div>
              <div class="form__acts">
                <button class="btn btn--lg" type="submit">Request the discovery call</button>
                <span class="note">Demo build &mdash; this form is not connected to an endpoint.</span>
              </div>
              <div class="form__status" hidden role="status">
                <h3>Request filed</h3>
                <p class="prose">Thank you. The solutions team replies from solutions@stratastaffglobal.com to arrange a 30-minute call. If it is urgent, the Australian and Canadian numbers are below. In this rebuild nothing was actually sent, because no endpoint is wired up.</p>
              </div>
            </form>
          </div>
          <aside class="item__aside">
            <table class="sched sched--particulars">
              <caption class="note">Contact schedule</caption>
              <tbody>
                <tr><td class="k">Solutions email</td><td class="v n" style="font-size:.86rem"><a class="link" href="mailto:${MAIL_SOL}">${MAIL_SOL}</a></td></tr>
                <tr><td class="k">Training email</td><td class="v n" style="font-size:.86rem"><a class="link" href="mailto:${MAIL_TRN}">${MAIL_TRN}</a></td></tr>
                <tr><td class="k">Australia</td><td class="v n"><a class="link" href="tel:${TEL_AU_H}">${TEL_AU_D}</a></td></tr>
                <tr><td class="k">Canada</td><td class="v n"><a class="link" href="tel:${TEL_CA_H}">${TEL_CA_D}</a></td></tr>
                <tr><td class="k">AU office</td><td class="k" style="text-align:right">${esc(ADDR_AU)}</td></tr>
                <tr><td class="k">CA office</td><td class="k" style="text-align:right">${esc(ADDR_CA)}</td></tr>
              </tbody>
            </table>
            <div class="stamp-wrap">${stamp(['We reply', 'personally'], 'stamp--sm', '-3deg')}</div>
          </aside>
        </div>
      </section>
      <section class="item" id="capacity" data-item="02">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>02</p>
          <div class="item__head"><h2 class="display">Take the capacity test</h2>
            <p class="item__lede">A short scorecard that shows where your team can unlock capacity: how many hours a week go to work that a trained offshore specialist could own, and which roles would recover them.</p></div>
          <div class="item__body item__body--wide">
            <div class="facts">
              <div class="fact"><p class="fact__v">12</p><p class="fact__k">Questions</p><p class="fact__s">About eight minutes.</p></div>
              <div class="fact"><p class="fact__v">3</p><p class="fact__k">Outputs</p><p class="fact__s">Hours recoverable, roles to fill, and a suggested first desk.</p></div>
              <div class="fact"><p class="fact__v">0</p><p class="fact__k">Obligation</p><p class="fact__s">No cost, no commitment, no sales sequence.</p></div>
              <div class="fact"><p class="fact__v">@</p><p class="fact__k">Ask for it</p><p class="fact__s"><a class="link" href="mailto:${MAIL_SOL}?subject=Capacity%20test">Request the scorecard</a></p></div>
            </div>
            <p class="note" style="margin-top:1.4rem">The scorecard itself is delivered by the solutions team; this rebuild carries the request path only.</p>
          </div>
        </div>
      </section>
    </main>`,
});

/* -------------------------------------------------------------- privacy --- */
PAGES['privacy.html'] = () => page({
  page: 'privacy.html',
  head: { title: 'Privacy Policy', desc: 'How Strata Staff Global collects, uses, discloses and retains personal information.' },
  main: `
    <main id="main">
${phead({
    crumb: [['privacy.html', 'Privacy Policy']],
    ref: 'Annexure',
    title: 'Privacy Policy',
    lede: 'How we collect, use, disclose, store and retain personal information across our Australian and Canadian operations.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Personal information</h2></div>
          <div class="item__body item__body--wide">
            <div class="doc-body">
              <h3>1. Personal information we collect</h3>
              <p>We collect information you give us directly through the forms on this site and through our engagement with you, and information collected automatically when you use the site.</p>
              <h3>Enquiry, &ldquo;Talk To Us&rdquo; and consultation forms</h3>
              <p>Name, agency, role, email address, telephone number, country of operation, approximate lots under management and the content of your message.</p>
              <h3>Booking system</h3>
              <p>Name, email address, telephone number and the time slot you select when arranging a discovery call.</p>
              <h3>Strata capacity test and scorecard</h3>
              <p>Your responses to the scorecard, together with the contact details you provide to receive the result.</p>
              <h3>Careers and job applications</h3>
              <p>Name, contact details, work schedule and availability preferences, the position applied for, any note you provide, and the resume you attach.</p>
              <h3>Strata Staff Academy and training forms</h3>
              <p>Name, email address, telephone number and the training track of interest.</p>
              <h3>Other forms and embedded services</h3>
              <p>Some pages embed third-party services such as scheduling, mapping or video, which may set their own cookies and collect information under their own policies.</p>
              <h3>Technical, analytics and security information</h3>
              <p>IP address, browser and device type, pages viewed, referring page and approximate location derived from IP, collected for analytics, security and to keep forms working.</p>
              <h3>2. Why we collect and use personal information</h3>
              <p>To respond to enquiries and arrange consultations; to prepare a capacity plan; to assess job applications and manage recruitment; to administer training and enrolment; to operate, secure and improve the site; to meet legal and regulatory obligations in Australia and Canada; and to send communications you have asked for.</p>
              <h3>3. Disclosure and third-party services</h3>
              <p>We disclose personal information to service providers who help us operate &mdash; hosting, email, scheduling, analytics, applicant tracking and training platforms &mdash; and where required by law. We do not sell personal information.</p>
              <h3>4. Cookies and similar technologies</h3>
              <p>We use cookies for analytics, security, forms and embedded services. You can accept or decline through the notice on this site, and you can block or delete cookies in your browser settings; some parts of the site may not work as intended if you do.</p>
              <h3>5. Storage, security and retention</h3>
              <p>Information is stored on systems operated by us and our providers, with access controls, encryption in transit and administrative safeguards. We retain personal information only as long as needed for the purposes above or as required by law.</p>
              <h3>6. Access, correction and deletion requests</h3>
              <p>You may ask to access, correct or delete the personal information we hold about you. Contact us using the details below and we will respond within the time required by applicable law.</p>
              <h3>7. Complaints</h3>
              <p>If you believe we have handled your personal information improperly, contact us first. If you are not satisfied with our response, you may complain to the relevant privacy regulator in your jurisdiction.</p>
              <h3>8. Contact us</h3>
              <p>Privacy enquiries: <a class="link" href="mailto:${MAIL_SOL}">${MAIL_SOL}</a>. Australia: ${esc(ADDR_AU)}, ${TEL_AU_D}. Canada: ${esc(ADDR_CA)}, ${TEL_CA_D}.</p>
              <h3>9. Changes to this policy</h3>
              <p>We may update this policy from time to time. The current version is always published on this page.</p>
              <p class="note" style="margin-top:2rem">This text is a plain-language restatement of the incumbent site&rsquo;s privacy policy, rewritten for this rebuild. It is not legal advice and should be reviewed by the client before publication.</p>
            </div>
          </div>
        </div>
      </section>
    </main>`,
});

PAGES['404.html'] = () => page({
  page: '404.html',
  head: { title: 'Page not found', desc: 'That item is not in the notice pack.' },
  main: `
    <main id="main">
${phead({
    crumb: [['404.html', 'Not found']],
    ref: 'Item not in the pack',
    title: 'That item is not in this notice pack',
    lede: 'The page you asked for is not filed here. The contents list is the fastest way back.',
  })}
      <section class="item" data-item="01">
        <div class="item__wrap">
          <p class="item__no"><span class="sr">Item </span>01</p>
          <div class="item__head"><h2 class="display">Where to go</h2></div>
          <div class="item__body item__body--wide">
${optionsList([
    { href: 'index.html', no: '01', name: 'The notice', desc: 'The homepage, and the four clauses of the capacity motion.' },
    { href: 'solutions.html', no: '02', name: 'Solutions', desc: 'All ten offshore specialist roles.' },
    { href: 'insights.html', no: '03', name: 'Insights', desc: 'Eight circulated papers.' },
    { href: 'contact.html', no: '04', name: 'Talk To Us', desc: 'Book the free 30-minute discovery call.' },
  ])}
          </div>
        </div>
      </section>
    </main>`,
});

/* ============================================================ the render == */
const POSTS = await readJSON('posts.json');
const RAW_JOBS = await readJSON('jobs.json');
const JOBS = RAW_JOBS.map(j => ({
  ...j,
  slug: { 'junior-accountant': 'junior-accountant', 'mid-level-accountant-nightshift': 'mid-level-accountant', 'apply__senior-accountant': 'senior-accountant', 'hr-assistant': 'hr-assistant' }[j.file],
}));
for (const p of POSTS) PAGES[`post-${p.file}.html`] = () => postPage(p);
for (const j of JOBS) PAGES[`job-${j.slug}.html`] = () => jobPage(j);

/* the home page's papers list is rendered by the same data */
PAGES['index.html'] = (() => {
  const base = PAGES['index.html'];
  return () => {
    const html = base();
    const papers = optionsList(POSTS.map((p, i) => ({
      href: `post-${p.file}.html`, no: String(i + 1).padStart(2, '0'), name: p.title,
      desc: `${p.cat} · ${p.date} — ${p.summary}`,
    })));
    return html.replace('<div id="papers-list" data-papers></div>', papers);
  };
})();

/* ------------------------------------------------------------- the write -- */
const written = [];
const flaws = [];
for (const [file, fn] of Object.entries(PAGES)) {
  const html = fn();
  // A template hole that was never filled ships as the literal word. Catch it
  // here rather than in a browser.
  for (const bad of ['undefined', 'NaN', '[object Object]', '&lt;span']) {
    if (html.includes(bad)) {
      const at = html.indexOf(bad);
      flaws.push(`${file}: contains "${bad}" near …${html.slice(Math.max(0, at - 70), at + 40).replace(/\s+/g, ' ')}…`);
    }
  }
  await writeFile(path.join(ROOT, file), html, 'utf8');
  written.push([file, html.length]);
}
if (flaws.length) {
  console.error(`\nBUILD FAILED — ${flaws.length} unfilled template hole(s):`);
  for (const f of flaws) console.error('  ' + f);
  process.exit(1);
}

/* Tab panel visibility. CSS has no way to compare a checked input's id to an
   attribute value, so one rule per tab is generated from the ids the pages
   actually emitted above. Every other part of the pattern is hand-authored CSS. */
const tabsCss = `/* GENERATED by build.mjs — index tab panel visibility. Do not edit by hand. */
${[...TAB_IDS].sort().map(id => `#${id}:checked ~ .tabs__panel[data-tab="${id}"] { display: block; }`).join('\n')}
`;
await writeFile(path.join(ROOT, 'styles-tabs.css'), tabsCss, 'utf8');
console.log(`styles-tabs.css — ${TAB_IDS.size} tab panel rules`);

written.sort((a, b) => a[0].localeCompare(b[0]));
for (const [f, n] of written) console.log(`${String(n).padStart(7)}b  ${f}`);
console.log(`\n${written.length} pages written.`);

/* Remove assets this build does not ship, so nothing in assets/ is orphaned.
   Assets are referenced from HTML and, for typefaces, from CSS. */
const shipped = new Set(['fonts/fonts.css', 'marker.svg']);
for (const [f] of written) {
  const html = await readFile(path.join(ROOT, f), 'utf8');
  for (const m of html.matchAll(/assets\/([^"')?#]+)/g)) shipped.add(m[1]);
}
for (const cssFile of ['styles.css', 'styles-tabs.css', 'assets/fonts/fonts.css']) {
  let css;
  try { css = await readFile(path.join(ROOT, cssFile), 'utf8'); } catch { continue; }
  const dir = path.posix.dirname(cssFile.split(path.sep).join('/'));
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const u = m[1];
    if (/^(data:|https?:|#)/.test(u)) continue;
    // resolve relative to the stylesheet, then express it relative to assets/,
    // which is the key space this prune walks in
    let rel = path.posix.normalize(path.posix.join(dir, u));
    if (rel.startsWith('assets/')) rel = rel.slice('assets/'.length);
    shipped.add(rel);
  }
}
let removed = 0, kept = 0;
async function prune(dir, prefix = '') {
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = prefix + e.name;
    if (e.isDirectory()) { await prune(path.join(dir, e.name), rel + '/'); continue; }
    if (shipped.has(rel)) { kept++; continue; }
    await unlink(path.join(ROOT, dir, e.name));
    console.log('pruned unused asset:', rel);
    removed++;
  }
}
await prune('assets');
console.log(`assets: ${kept} shipped, ${removed} pruned.`);
