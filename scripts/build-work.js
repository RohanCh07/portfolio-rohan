#!/usr/bin/env node
/*
 * Builds the project case-study pages: work/<slug>.html
 *
 *   node scripts/build-work.js
 *
 * Content for every project lives in PROJECTS below. Each page reuses that project's
 * line drawing from index.html (the .project__stage of its homepage panel), so the
 * homepage and the case study always show the same artwork.
 * Pages chain together: the last section of each links to the next project, in the
 * same order as the homepage, looping back to the first.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'work');

const PROJECTS = [
  {
    slug: 'lumida', anchor: 'p-lumida', name: 'Lumida', kind: 'Personal', area: 'Data quality', year: '2026',
    pitch: 'A self-hosted engine that reads your database, finds what is quietly broken, and explains why.',
    role: 'Solo — design, backend, ML', status: 'Live preview',
    stack: ['Python', 'PostgreSQL', 'FastAPI', 'Docker', 'Gemini'],
    links: [{ label: 'Open Lumida', href: 'https://lumida.netlify.app/' }],
    overview: {
      title: 'Point it at a database. Read the findings over coffee.',
      text: 'Lumida connects read-only to an existing database and builds a picture of it on its own: which tables really relate to each other, what normal looks like for each column, and where the data has drifted. Every finding arrives with the evidence behind it and a plain-language explanation, so the person reading it does not need to know the schema by heart.',
    },
    problem: {
      title: 'Bad data rarely breaks loudly. It hides in the joins nobody wrote down.',
      text: 'Most production databases carry relationships that were never declared as foreign keys, and problems that only show up when a report looks wrong weeks later. Finding them by hand means reading the schema, guessing the joins and writing one-off queries — work that is slow and never finished.',
      points: ['Undeclared relationships between tables', 'Orphaned and inconsistent rows that pass every constraint', 'Findings that need explaining to people who did not build the schema'],
    },
    system: {
      title: 'Five steps, one direction: from the raw tables to a finding someone can act on.',
      steps: [
        ['Connect', 'Read-only connection to the database. Nothing is written back.'],
        ['Map', 'Infer the relationships between tables that were never declared.'],
        ['Detect', 'Profile each table and flag rows and values that break the pattern.'],
        ['Explain', 'An LLM turns each finding and its evidence into plain language.'],
        ['Learn', 'People confirm or dismiss findings, and Lumida learns from it.'],
      ],
    },
    decisions: [
      ['Should it be allowed to fix what it finds?', 'Read-only, always.', 'It can be pointed at production without risk, which is where the real problems live.'],
      ['Who decides that something is a problem?', 'The engine detects; the LLM only explains.', 'Findings stay reproducible and evidence-based, and the language model never invents an issue.'],
      ['How does it get better without retraining?', 'A confirm / dismiss loop on every finding.', 'Each review tunes what Lumida treats as normal for that database.'],
    ],
    flow: ['Connect a database', 'Review the map of relationships', 'Read the findings with evidence', 'Confirm or dismiss each one'],
    outcome: {
      title: 'Tested against a database with problems planted on purpose.',
      stats: [['15/15', 'Hidden relationships found'], ['13/13', 'Planted problems caught'], ['0', 'False alarms']],
    },
  },
  {
    slug: 'cerebra', anchor: 'p-cerebra', name: 'Cerebra', kind: 'Company', area: 'Generative AI · Moglix', year: '2026',
    pitch: 'A GenAI assistant that turns a sentence into a purchase request or an RFQ inside Credlex.',
    role: 'Built at Moglix', status: 'Internal tool',
    stack: ['Python', 'LLMs', 'REST APIs'],
    links: [],
    overview: {
      title: 'Ask for what you need. Get a request that is ready to submit.',
      text: 'Cerebra is a chatbot used inside Moglix to create purchase requests (PRs) and requests for quotation (RFQs) in Credlex. Instead of filling a long form field by field, people describe what they need in their own words and Cerebra drafts the request for them.',
    },
    problem: {
      title: 'Raising a request meant a long form, even for something simple.',
      text: 'Purchase requests and RFQs carry many structured fields. Filling them in is slow and easy to get wrong, and the information usually already exists in how the person would describe the need out loud.',
      points: ['Many fields for one simple need', 'The same details typed again for every request', 'A slow path from "we need this" to a request in the system'],
    },
    system: {
      title: 'From a sentence to a structured request, through the same APIs the app uses.',
      steps: [
        ['Ask', 'The user describes the need in plain language.'],
        ['Understand', 'The LLM extracts the item, quantity, dates and other fields.'],
        ['Draft', 'Cerebra fills a PR or RFQ draft and shows it back.'],
        ['Confirm', 'The user checks the draft before anything is created.'],
        ['Create', 'The request is created in Credlex through its REST APIs.'],
      ],
    },
    decisions: [
      ['Should the assistant create requests on its own?', 'Draft first, create only after the user confirms.', 'People stay in control of what is submitted, and mistakes are caught before they reach the system.'],
      ['How should it talk to Credlex?', 'Through Credlex\'s existing REST APIs.', 'Requests follow the same rules and validation as ones made in the app.'],
    ],
    flow: ['Describe the need', 'Review the drafted request', 'Confirm', 'PR or RFQ created in Credlex'],
    outcome: {
      title: 'Requests start from a sentence instead of a form.',
      stats: [['PRs + RFQs', 'Created from plain language'], ['Credlex', 'Integrated through its APIs'], ['Moglix', 'Used by internal teams']],
    },
  },
  {
    slug: 'distiller', anchor: 'p-distiller', name: 'Distiller', kind: 'Personal', area: 'LLM infrastructure', year: '2026',
    pitch: 'Change one line, and repeated LLM calls slowly move to a small model you own.',
    role: 'Solo — design and backend', status: 'In progress',
    stack: ['Python', 'FastAPI', 'LiteLLM', 'LoRA', 'Ollama'],
    links: [],
    overview: {
      title: 'An OpenAI-compatible gateway that learns your most repeated calls.',
      text: 'Distiller sits between an application and its LLM provider. A team adopts it by changing one line — the base URL. It logs the calls that keep repeating, fine-tunes small open models with LoRA to copy the large model on exactly those tasks, tests them quietly, and only then starts routing to them.',
    },
    problem: {
      title: 'Companies pay a large model to answer the same kind of question all day.',
      text: 'A lot of production LLM traffic is repetitive: the same extraction, the same classification, the same formatting. A much smaller model could handle it — but switching safely means collecting data, training, evaluating and routing, which most teams never get round to.',
      points: ['Repetitive calls billed at large-model prices', 'No safe path from a big model to a small one', 'Switching models means touching application code'],
    },
    system: {
      title: 'Log, train, test in the shadows, then route — with a fallback at every step.',
      steps: [
        ['Gateway', 'An OpenAI-compatible endpoint; adoption is a one-line change.'],
        ['Log', 'Record repeated calls and the large model\'s answers.'],
        ['Fine-tune', 'Train small open models with LoRA to copy those answers.'],
        ['Shadow test', 'Run the small model alongside the big one and compare.'],
        ['Route', 'Send confident requests to the small model, fall back otherwise.'],
      ],
    },
    decisions: [
      ['How do teams adopt it without rewriting code?', 'Be OpenAI-compatible.', 'Adoption is a one-line base-URL change.'],
      ['When is a small model good enough?', 'Prove it in shadow mode first.', 'Nothing is routed until the small model has matched the large one on real traffic.'],
      ['What if the small model is unsure?', 'Fall back to the large model.', 'Quality never drops below what the team had before.'],
    ],
    flow: ['Point the app at Distiller', 'Let it log real traffic', 'Train and shadow-test small models', 'Route confident requests'],
    outcome: {
      title: 'Built in the open, one stage at a time.',
      stats: [['Working', 'Gateway skeleton and CLI'], ['In development', 'LoRA training and routing'], ['1 line', 'To adopt it']],
    },
  },
  {
    slug: 'bug-detection', anchor: 'p-bug', name: 'Bug Detection & Fix Tool', short: 'Bug Detection', kind: 'Personal', area: 'Developer tools', year: '2025',
    pitch: 'A VS Code extension that catches errors as they happen — and either teaches you, or fixes them.',
    role: 'Solo — extension and backend', status: 'VS Code extension',
    stack: ['TypeScript', 'VS Code API', 'FastAPI', 'Python', 'RAG', 'Vector DB'],
    links: [],
    overview: {
      title: 'An error explained in your editor, the moment it appears.',
      text: 'The extension captures both static lint errors and runtime exceptions while you work, then uses LLM-based retrieval (RAG over a vector database) to explain them. You choose how much help you want: Tutor mode explains why the code broke; Debugger mode proposes a fix.',
    },
    problem: {
      title: 'An error message tells you what broke, rarely why.',
      text: 'Learners need the reasoning behind an error to stop repeating it; experienced developers just want the fix. Most tools give the same terse message to both, and copying it into a search engine breaks your flow.',
      points: ['Terse messages without the reason behind them', 'Leaving the editor to search for answers', 'One kind of help for very different needs'],
    },
    system: {
      title: 'Catch, retrieve, explain or fix — without leaving the editor.',
      steps: [
        ['Capture', 'Collect lint errors and runtime exceptions as they happen.'],
        ['Retrieve', 'Search a vector database for relevant docs and code context.'],
        ['Explain', 'An LLM reasons over the error and the retrieved context.'],
        ['Tutor or fix', 'Tutor mode teaches; Debugger mode proposes a change.'],
      ],
    },
    decisions: [
      ['One kind of help, or two?', 'Two modes: Tutor and Debugger.', 'Beginners learn the cause; experienced users get straight to the fix.'],
      ['How do answers stay grounded?', 'Retrieval (RAG) before generation.', 'Explanations are based on real documentation and code, not guesses.'],
    ],
    flow: ['Write code as usual', 'An error is caught', 'Choose Tutor or Debugger', 'Read the explanation or apply the fix'],
    outcome: {
      title: 'Help that matches the person asking for it.',
      stats: [['2 modes', 'Tutor and Debugger'], ['Lint + runtime', 'Both kinds of error captured'], ['RAG', 'Grounded explanations']],
    },
  },
  {
    slug: 'blockauth', anchor: 'p-blockauth', name: 'BlockAuth', kind: 'Research', area: 'Research · ICSDS-2025', year: 'Dec 2025',
    pitch: 'Decentralised identity on a blockchain, so IoT devices can prove who they are without a central server.',
    role: 'Research paper', status: 'Presented at ICSDS-2025',
    stack: ['Blockchain', 'Decentralised identity', 'IoT security'],
    links: [],
    overview: {
      title: 'Identity and access for IoT devices, without a single point of trust.',
      text: 'BlockAuth is a blockchain-based decentralised identity management system for secure authentication and access control across IoT networks. The research was presented at ICSDS-2025, Hooghly Engineering & Technology College, in December 2025.',
    },
    problem: {
      title: 'IoT networks usually trust one central server to say who is who.',
      text: 'When identity and access rely on a single authority, that authority becomes a bottleneck and a target. Large fleets of small devices need a way to authenticate and control access that does not depend on one server staying up and uncompromised.',
      points: ['A single point of failure for identity', 'A central target for attackers', 'Hard to scale across many small devices'],
    },
    system: {
      title: 'Identity, permissions and checks recorded on a shared ledger.',
      steps: [
        ['Register', 'Each device gets a decentralised identity on the chain.'],
        ['Grant', 'Access permissions are recorded as transactions.'],
        ['Authenticate', 'Devices prove their identity against the ledger.'],
        ['Verify', 'Any participant can check access without a central server.'],
      ],
    },
    decisions: [
      ['Where should identity live?', 'On a blockchain, not a central server.', 'No single authority to fail or attack.'],
      ['How is access controlled?', 'Permissions recorded on the same ledger.', 'Access decisions are transparent and verifiable by every participant.'],
    ],
    flow: ['A device joins the network', 'Its identity is registered', 'Access is granted', 'Requests are verified on the ledger'],
    outcome: {
      title: 'Presented as a research paper.',
      stats: [['ICSDS-2025', 'Conference'], ['Dec 2025', 'Hooghly Engineering & Technology College'], ['IoT', 'Authentication and access control']],
    },
  },
  {
    slug: 'admin-panel', anchor: 'p-admin', name: 'Admin Panel', kind: 'Company', area: 'Internal tools · Coding Jr', year: '2025',
    pitch: 'The internal panel a team runs its day on — I designed the backend logic and built the core features.',
    role: 'SDE, AI Research Internship', status: 'Internal tool',
    stack: ['Python', 'REST APIs', 'Web design', 'Git'],
    links: [],
    overview: {
      title: 'The back office behind the product.',
      text: 'During my AI Research internship at Coding Jr I worked as a Software Development Engineer on the company\'s internal admin panel. I designed its backend logic and implemented core features together with the team.',
    },
    problem: {
      title: 'Internal teams need one dependable place to manage the platform.',
      text: 'An admin panel is used every day by the people running the business, so its backend has to be predictable: clear endpoints, consistent rules, and features the team can build on.',
      points: ['Daily operational work for internal teams', 'Rules that must behave the same every time', 'A base the team can keep extending'],
    },
    system: {
      title: 'A backend designed for the panel the team uses every day.',
      steps: [
        ['Model', 'Design the backend logic behind each panel feature.'],
        ['Expose', 'Serve it to the panel through REST APIs.'],
        ['Build', 'Implement the core features with the team.'],
        ['Iterate', 'Extend and refine as the team\'s needs grow.'],
      ],
    },
    decisions: [
      ['How should the panel talk to the backend?', 'Through REST APIs.', 'The panel and future tools can share the same backend logic.'],
      ['Where do the rules live?', 'In the backend, not the interface.', 'Behaviour stays consistent whichever screen triggers it.'],
    ],
    flow: ['Team member opens the panel', 'Picks a task', 'Backend applies the rules', 'Result is saved and shown'],
    outcome: {
      title: 'Core features shipped with the team.',
      stats: [['Backend', 'Logic designed'], ['Core features', 'Implemented'], ['Coding Jr', 'Jun 2025 – Jan 2026']],
    },
  },
  {
    slug: 'flight-delay-predictor', anchor: 'p-flight', name: 'Flight Delay Predictor', short: 'Flight Delay', kind: 'Personal', area: 'Machine learning', year: '2025',
    pitch: 'Live flight and weather data in; delay forecasts for India\'s busiest airports out.',
    role: 'Solo — data pipeline, model, dashboard', status: 'Streamlit dashboard',
    stack: ['Python', 'Scikit-learn', 'Pandas', 'Streamlit', 'AviationStack API'],
    links: [],
    overview: {
      title: 'Will this flight leave on time? A forecast from live data.',
      text: 'A real-time prediction system that forecasts flight delays across major Indian airports. A data pipeline collects live flight and weather data from external APIs, a machine-learning model predicts delays, and an interactive Streamlit dashboard shows live flight status next to the forecasts.',
    },
    problem: {
      title: 'Delays depend on things that change by the minute.',
      text: 'Weather, traffic and schedules all move during the day, so a static timetable says little about whether a flight will actually leave on time. A useful forecast needs live inputs and a model that combines them.',
      points: ['Conditions that change through the day', 'Flight and weather data in different places', 'Forecasts that need to be readable at a glance'],
    },
    system: {
      title: 'Two live feeds, one model, one dashboard.',
      steps: [
        ['Collect', 'Pull live flight and weather data from external APIs.'],
        ['Prepare', 'Clean and join the feeds into features with Pandas.'],
        ['Predict', 'A Scikit-learn model forecasts the delay.'],
        ['Show', 'A Streamlit dashboard displays live status and predictions.'],
      ],
    },
    decisions: [
      ['Where do the inputs come from?', 'Live flight and weather APIs.', 'Forecasts reflect current conditions, not a stale snapshot.'],
      ['How should people see the results?', 'An interactive Streamlit dashboard.', 'Live status and predictions sit side by side.'],
    ],
    flow: ['Pick an airport', 'See live flight status', 'Read each delay forecast', 'Check the conditions behind it'],
    outcome: {
      title: 'Live forecasts for major Indian airports.',
      stats: [['Real-time', 'Flight and weather data'], ['ML', 'Scikit-learn delay model'], ['Streamlit', 'Interactive dashboard']],
    },
  },
  {
    slug: 'ecommerce-api', anchor: 'p-ecom', name: 'E-Commerce API', kind: 'Personal', area: 'Backend', year: '2024',
    pitch: 'Products, carts and orders as a REST API, with roles, validation and a properly normalised schema.',
    role: 'Solo — API and database', status: 'REST API',
    stack: ['Python', 'Django', 'Django REST Framework', 'MySQL', 'Postman'],
    links: [],
    overview: {
      title: 'The backend of a shop, built to be predictable.',
      text: 'REST APIs for product, cart and order management with input validation and clean JSON responses. Authentication and role-based access control use Django\'s built-in auth system, on top of a normalised MySQL schema with ORM logic for stock updates and order totals.',
    },
    problem: {
      title: 'Money and stock leave no room for "usually correct".',
      text: 'An e-commerce backend has to keep stock, carts and orders consistent, reject bad input, and make sure customers cannot do what only staff should. Those rules belong in the API and the schema, not in each screen.',
      points: ['Stock and totals that must always add up', 'Different permissions for customers and staff', 'Clear errors when a request is invalid'],
    },
    system: {
      title: 'Validation, roles and a normalised schema behind every endpoint.',
      steps: [
        ['Request', 'A client calls a product, cart or order endpoint.'],
        ['Validate', 'Input is checked; bad requests get a clear JSON error.'],
        ['Authorise', 'Django auth and roles decide what the caller may do.'],
        ['Persist', 'The ORM updates stock and totals in a normalised MySQL schema.'],
      ],
    },
    decisions: [
      ['Where should permissions be enforced?', 'Role-based access in the API, using Django auth.', 'A customer cannot reach staff actions, whatever client they use.'],
      ['How should the data be stored?', 'A normalised MySQL schema with ORM logic.', 'Stock updates and order totals stay consistent.'],
    ],
    flow: ['Browse products', 'Add to cart', 'Place an order', 'Stock and totals update'],
    outcome: {
      title: 'A clean, role-aware API for a shop.',
      stats: [['3 resources', 'Products, carts, orders'], ['Role-based', 'Access control'], ['Normalised', 'MySQL schema']],
    },
  },
];

// ---------------------------------------------------------------- helpers
const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pad = n => String(n).padStart(2, '0');
const hash = f => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);

// Pull each project's drawing (its homepage stage) out of index.html, minus the giant name.
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function stageFor(anchor) {
  const at = home.indexOf(`id="${anchor}"`);
  if (at < 0) throw new Error('missing ' + anchor);
  const start = home.lastIndexOf('<div class="project__stage">', at);
  const footer = home.indexOf('<footer class="project__foot">', at);
  let inner = home.slice(start + '<div class="project__stage">'.length, footer);
  inner = inner.slice(0, inner.lastIndexOf('</div>'));
  inner = inner.replace(/<h3 class="project__name[\s\S]*?<\/h3>/, '');
  return inner.replace(/src="assets\//g, 'src="/assets/');
}

const v = { css: hash('style.css'), js: hash('main.js') };

function page(p, i) {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const num = pad(i + 1);
  const title = `${p.name} — Rohan Chauhan`;
  const chapters = [['overview', 'Overview'], ['problem', 'Problem'], ['system', 'How it works'], ['decisions', 'Decisions'], ['flow', 'Flow'], ['outcome', 'Outcome']];
  const tones = ['paper', 'ink'];
  let t = i % 2;                                   // alternate black / ivory, starting differently per project
  const tone = () => tones[(t++) % 2];

  const meta = [
    ['Role', p.role], ['Year', p.year], ['Type', p.kind], ['Status', p.status],
  ];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(p.pitch)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(p.pitch)}">
  <meta property="og:image" content="/assets/og-image.jpg">
  <meta name="theme-color" content="#050505">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/ibm-plex-mono-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/style.css?v=${v.css}">
  <link rel="prev" href="/work/${PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length].slug}">
  <link rel="next" href="/work/${next.slug}">
  <script>
    (function () { var d = document.documentElement; d.classList.add('js', 'study-page'); try { localStorage.removeItem('theme'); } catch (e) {} })();
  </script>
</head>
<body>
  <a class="skip" href="#overview">Skip to the case study</a>

  <header class="site-header" id="header">
    <a class="wordmark" href="/" aria-label="Rohan Chauhan, home">RC</a>
    <nav class="nav" id="nav" aria-label="Sections">
      <a href="/#capabilities">Capabilities</a>
      <a href="/#projects">Projects</a>
      <a href="/#experience">Experience</a>
      <a href="/#about">About</a>
      <a href="/#contact">Contact</a>
    </nav>
    <button class="menu-button" id="menuButton" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  </header>

  <div class="cursor" id="cursor" aria-hidden="true"></div>

  <main id="top" class="study">
    <svg class="thread" id="thread" aria-hidden="true" focusable="false"></svg>

    <!-- HERO -->
    <section class="band tone-${tone()} study-hero" data-thread="0.04,0.06,n 0.06,0.3 0.3,0.55 0.8,0.7 0.965,1">
      <div class="band__inner">
        <p class="study-hero__label mono reveal"><span>${num}</span> / ${esc(p.area)}</p>
        <h1 class="study-hero__name display">${esc(p.name)}</h1>
        <div class="study-hero__intro">
          <p class="study-hero__pitch reveal">${esc(p.pitch)}</p>
          <span class="study-hero__tag mono reveal">Project study</span>
        </div>
        <div class="study-hero__stage project__stage" aria-hidden="true">
${stageFor(p.anchor)}
        </div>
        <dl class="study-meta mono reveal">
${meta.map(([k, val]) => `          <div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join('\n')}
          <div class="study-meta__stack"><dt>Stack</dt><dd>${p.stack.map(esc).join(' / ')}</dd></div>
${p.links.length ? `          <div class="study-meta__links"><dt>Links</dt><dd>${p.links.map(l => `<a class="explore" data-cursor="Open" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join(' ')}</dd></div>` : ''}
        </dl>
      </div>
    </section>

    <nav class="study-contents mono" aria-label="Chapters">
      <a class="study-contents__back" href="/#projects">← All projects</a>
      <ol>
${chapters.map(([id, label], k) => `        <li><a href="#${id}"><span>${pad(k + 1)}</span> ${label}</a></li>`).join('\n')}
      </ol>
    </nav>

    <!-- OVERVIEW -->
    <section class="band tone-${tone()} study-chapter" id="overview" data-thread="0.965,0 0.975,0.5 0.965,1">
      <div class="band__inner study-split">
        <p class="study-kicker mono reveal">01 / Overview</p>
        <h2 class="study-title reveal">${esc(p.overview.title)}</h2>
        <p class="study-text reveal">${esc(p.overview.text)}</p>
      </div>
    </section>

    <!-- PROBLEM -->
    <section class="band tone-${tone()} study-chapter study-problem" id="problem" data-thread="0.965,0 0.955,0.5 0.965,1">
      <div class="band__inner">
        <p class="study-kicker mono reveal">02 / The problem</p>
        <h2 class="study-title study-title--big reveal">${esc(p.problem.title)}</h2>
        <div class="study-split study-split--low">
          <p class="study-text reveal">${esc(p.problem.text)}</p>
          <ul class="study-points">
${p.problem.points.map(pt => `            <li class="reveal"><span class="study-points__dot" aria-hidden="true"></span>${esc(pt)}</li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>

    <!-- SYSTEM -->
    <section class="band tone-${tone()} study-chapter" id="system" data-thread="0.965,0 0.975,0.5 0.965,1">
      <div class="band__inner">
        <p class="study-kicker mono reveal">03 / How it works</p>
        <h2 class="study-title reveal">${esc(p.system.title)}</h2>
        <ol class="study-steps" style="--n:${p.system.steps.length}">
${p.system.steps.map(([h, d], k) => `          <li class="study-step reveal"><span class="study-step__node" aria-hidden="true"></span><span class="study-step__n mono">${pad(k + 1)}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- DECISIONS -->
    <section class="band tone-${tone()} study-chapter" id="decisions" data-thread="0.965,0 0.955,0.5 0.965,1">
      <div class="band__inner">
        <p class="study-kicker mono reveal">04 / Key decisions</p>
        <h2 class="study-title reveal">The choices that shaped it.</h2>
        <div class="study-decisions">
${p.decisions.map(([q, c, e], k) => `          <article class="study-decision reveal">
            <p class="study-decision__n mono">${pad(k + 1)}</p>
            <div><p class="study-decision__label mono">Question</p><h3>${esc(q)}</h3></div>
            <div><p class="study-decision__label mono">Choice</p><p class="study-decision__choice">${esc(c)}</p></div>
            <div><p class="study-decision__label mono">Effect</p><p>${esc(e)}</p></div>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- FLOW -->
    <section class="band tone-${tone()} study-chapter" id="flow" data-thread="0.965,0 0.975,0.5 0.965,1">
      <div class="band__inner">
        <p class="study-kicker mono reveal">05 / The flow</p>
        <h2 class="study-title reveal">What it looks like from the person using it.</h2>
        <ol class="study-flow mono">
${p.flow.map((s, k) => `          <li class="reveal"><span class="study-flow__n">${pad(k + 1)}</span><span class="study-flow__dot" aria-hidden="true"></span>${esc(s)}</li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- OUTCOME -->
    <section class="band tone-${tone()} study-chapter" id="outcome" data-thread="0.965,0 0.955,0.5 0.965,1">
      <div class="band__inner">
        <p class="study-kicker mono reveal">06 / Outcome</p>
        <h2 class="study-title reveal">${esc(p.outcome.title)}</h2>
        <dl class="study-stats">
${p.outcome.stats.map(([n, l]) => `          <div class="reveal"><dt class="mono">${esc(l)}</dt><dd>${esc(n)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

    <!-- NEXT -->
    <section class="band tone-${tone()} study-next" data-thread="0.965,0 0.975,0.22 0.93,0.4,e">
      <a class="study-next__link" href="/work/${next.slug}" data-cursor="Next">
        <span class="study-next__label mono">${pad((i + 1) % PROJECTS.length + 1)} / Next project</span>
        <span class="study-next__name display">${esc(next.short || next.name)}</span>
        <span class="study-next__pitch">${esc(next.pitch)}</span>
        <span class="study-next__arrow" aria-hidden="true">↗</span>
      </a>
      <div class="study-next__foot mono">
        <a href="/#projects">All projects</a>
        <a href="/#contact">Contact</a>
        <a href="#top">Back to top ↑</a>
      </div>
    </section>
  </main>

  <script src="/assets/lenis.min.js" defer></script>
  <script src="/main.js?v=${v.js}" defer></script>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
PROJECTS.forEach((p, i) => {
  fs.writeFileSync(path.join(OUT, p.slug + '.html'), page(p, i));
  console.log('work/' + p.slug + '.html');
});

// homepage "Explore project" links → case studies (kept in sync with PROJECTS)
let idx = home;
PROJECTS.forEach(p => {
  const at = idx.indexOf(`id="${p.anchor}"`);
  const footStart = idx.indexOf('<footer class="project__foot">', at);
  const footEnd = idx.indexOf('</footer>', footStart);
  let foot = idx.slice(footStart, footEnd);
  const link = `<a class="explore mono" data-cursor="Explore" href="/work/${p.slug}">Explore project <span aria-hidden="true">↗</span></a>`;
  foot = foot.replace(/<span class="explore explore--muted mono">[^<]*<\/span>/, link)
             .replace(/<a class="explore mono"[^>]*href="(https:\/\/lumida\.netlify\.app\/|\/work\/[a-z-]+)"[^>]*>[\s\S]*?<\/a>/, link);
  idx = idx.slice(0, footStart) + foot + idx.slice(footEnd);
});
fs.writeFileSync(path.join(ROOT, 'index.html'), idx);

// sitemap
const base = 'https://chauhanrohan.vercel.app';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
${PROJECTS.map(p => `  <url><loc>${base}/work/${p.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`);
console.log('index.html explore links + sitemap.xml updated');
