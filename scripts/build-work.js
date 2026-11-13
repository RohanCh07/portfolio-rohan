#!/usr/bin/env node
/*
 * Builds the project case-study pages: work/<slug>.html
 *
 *   node scripts/build-work.js
 *
 * Content for every project lives in ALL_PROJECTS below; ORDER sets which ones are built
 * and in what order. Each page shows that project's paper from the homepage notice board.
 * Pages chain together: the last section of each links to the next project, in the
 * same order as the homepage, looping back to the first.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'work');

const ALL_PROJECTS = [
  {
    slug: 'ramanujan', name: 'Ramanujan', kind: 'Company', area: 'Analytics copilot · Moglix', year: '2026',
    pitch: 'Ask business questions in plain English inside Microsoft Teams and get answers from company data in seconds.',
    role: 'Backend & GenAI · AI & Analytics team', status: 'Internal tool',
    stack: ['Python', 'FastAPI', 'Gemini', 'Vertex AI', 'BigQuery', 'Qdrant', 'Sentence-Transformers', 'Microsoft Graph API', 'Docker'],
    links: [],
    overview: {
      title: 'A question in Teams. An answer from the warehouse.',
      text: 'Ramanujan is an analytics copilot that lives where business teams already talk: Microsoft Teams. Someone asks a question in plain English, and a Gemini agent turns it into governed BigQuery SQL, runs it and replies with the answer, without the person writing SQL or opening a dashboard.',
    },
    problem: {
      title: 'Every simple question waited on someone who could write the query.',
      text: 'Business teams had questions about their numbers every day, but the answers sat in a data warehouse behind SQL and dashboards. Each question became a request to the data team, and the same metric could be calculated differently depending on who wrote the query.',
      points: ['Answers locked behind SQL and dashboards', 'Metrics defined differently by different people', 'Data access that has to respect who is asking'],
    },
    system: {
      title: 'Five steps from a sentence to a governed answer.',
      steps: [
        ['Ask', 'A question arrives from Microsoft Teams through the Microsoft Graph API.'],
        ['Ground', 'RAG over a KPI glossary in Qdrant finds the business definition of each metric.'],
        ['Generate', 'A Gemini ReAct agent writes BigQuery SQL that follows those definitions.'],
        ['Guard', 'A SQL policy engine checks the query and applies row-level access control.'],
        ['Answer', 'The result comes back to Teams, grounded in the data, not guessed.'],
      ],
    },
    decisions: [
      ['Should the model be free to query anything?', 'Every query passes a SQL policy engine with row-level access control.', 'People only ever see the data they are allowed to see.'],
      ['How do answers match what the business means by a metric?', 'RAG over a KPI glossary with sentence-transformer embeddings.', 'GMV, margin or fill rate mean the same thing in every answer.'],
      ['How should the service be structured?', 'A FastAPI service on Vertex AI built with hexagonal architecture.', 'Models, data sources and chat channels can be swapped without touching the core.'],
    ],
    flow: ['Ask a question in Teams', 'The agent writes a governed query', 'Guardrails check the query and access', 'Read the answer in the chat'],
    outcome: {
      title: 'Data questions answered where the conversation already happens.',
      stats: [['Seconds', 'From question to answer'], ['0 SQL', 'Needed from the person asking'], ['Row-level', 'Access control on every query']],
    },
  },
  {
    slug: 'payment-advice', name: 'Payment Advice Automation', short: 'Payment Advice', kind: 'Company', area: 'Finance automation · Moglix', year: '2026',
    pitch: 'Reads customer payment advices and auto-maps every payment to the right open invoices for the finance team.',
    role: 'Backend & ML · AI & Analytics team', status: 'In production',
    stack: ['Python', 'Django', 'Celery', 'Kafka', 'Redis', 'MongoDB', 'MySQL', 'Qdrant', 'LayoutLMv3', 'HDBSCAN', 'Gemini', 'HTMX', 'Docker'],
    links: [],
    overview: {
      title: 'A payment arrives with a PDF. The invoices close themselves.',
      text: 'When a customer pays, they send a payment advice: a document listing which invoices the money covers, the UTR and any tax deducted. This pipeline reads those advices from support tickets, extracts every line, checks it against the ERP and the bank, and maps the payment to open invoices for the accounts-receivable team.',
    },
    problem: {
      title: 'Every customer sends the same information in a different shape.',
      text: 'Advices arrive as PDFs, spreadsheets and emails, each customer with its own layout, and some run to hundreds of pages. Matching them to invoices by hand is slow, and a small mistake means a payment sits unapplied or an invoice stays open.',
      points: ['A different layout for every customer', 'Long advices with hundreds of invoice lines', 'Manual matching against the ERP and bank entries'],
    },
    system: {
      title: 'From a ticket to a mapped payment, in six steps.',
      steps: [
        ['Collect', 'Tickets flow in from the helpdesk through Kafka and Celery workers.'],
        ['Classify', 'LayoutLMv3 and Qdrant layout matching route each advice to the right parser.'],
        ['Extract', '14+ customer-specific parsers pull UTRs, invoices and TDS, with Gemini as fallback.'],
        ['Validate', 'Extracted payments are checked against the ERP and matched to bank entries.'],
        ['Map', 'Payments are auto-mapped to open invoices behind open-balance and deduction guards.'],
        ['Learn', 'HDBSCAN clusters unseen layouts and Gemini writes a parser config for each one.'],
      ],
    },
    decisions: [
      ['Parsers or an LLM for every document?', 'Fast deterministic parsers first, Gemini only as the fallback.', 'Most advices are parsed in a fraction of a second, cheaply and predictably.'],
      ['How do new customer layouts get supported?', 'A self-learning loop: cluster unseen layouts, generate a config, activate it only above 80% held-out accuracy.', 'New formats come online without hand-writing every parser.'],
      ['How do you change the model safely?', 'An A/B harness compares models on real advices before switching.', 'The model migration made extraction about 3× faster and cheaper.'],
    ],
    flow: ['An advice arrives in a ticket', 'It is classified and parsed', 'Payments are validated and mapped', 'Finance reviews it in the dashboard'],
    outcome: {
      title: 'Cash application that runs itself, with a person still in control.',
      stats: [['14+', 'Customer-specific parsers'], ['~0.2 s', 'To parse a 100+ page advice'], ['~3×', 'Faster, cheaper extraction']],
    },
  },
  {
    slug: 'repo-safety', name: 'Repo-Safety', kind: 'Personal', area: 'Security', year: '2026',
    pitch: 'A static scanner that checks an untrusted repo or ZIP, like a “take-home test”, for hidden auto-run malware before you open it.',
    role: 'Solo — design, engine, extensions', status: 'In development',
    stack: ['TypeScript', 'Node.js', 'Fastify', 'BullMQ', 'Redis', 'PostgreSQL', 'Docker', 'VS Code Extension API', 'Chrome MV3', 'Vitest'],
    links: [{ label: 'GitHub', href: 'https://github.com/RohanCh07/Repo-Safety' }],
    overview: {
      title: 'Know what a repo will do before you open it.',
      text: 'Repo-Safety reads a folder, ZIP or GitHub link without ever running it, and looks for the tricks that make code execute the moment you open, install or build it. Each finding comes with the file, the line and a plain-English reason, and everything rolls up into a Safe, Suspicious or Dangerous verdict with a 0–100 risk score.',
    },
    problem: {
      title: 'Opening a folder should not be enough to get you hacked.',
      text: 'Fake recruiters send developers “take-home tests” that hide malware in places that run automatically: editor tasks that fire when a folder opens, install hooks, git hooks and download-and-run scripts. Most people never look in those places before they trust a project.',
      points: ['Code that runs the moment a folder is opened', 'Install and git hooks that hide in plain sight', 'No quick way to check before you click “Trust”'],
    },
    system: {
      title: 'Read safely, scan, score, explain.',
      steps: [
        ['Ingest', 'Reads a folder or ZIP into memory with size, file and depth limits, and rejects zip bombs and zip-slip.'],
        ['Scan', '11 rules look for folder-open tasks, install hooks, hidden git hooks, download-and-run scripts, obfuscation and typosquats.'],
        ['Score', 'Findings roll up into a Safe / Suspicious / Dangerous verdict and a 0–100 risk score.'],
        ['Explain', 'Every finding points to a file and line with a plain-English reason.'],
        ['Surface', 'One engine behind a CLI, a VS Code extension, a web app and a Chrome extension.'],
      ],
    },
    decisions: [
      ['Should it run the code to see what it does?', 'Never. Static analysis only, and no git clone: repos are fetched as archives.', 'It is safe to point at hostile input, which is the whole point.'],
      ['How do you avoid crying wolf?', 'Suspicious-only repos are capped below the Dangerous range, and every rule is tested against popular projects.', 'Normal install scripts never look like a real trap.'],
      ['One tool or four?', 'One scanning engine shared by the CLI, VS Code, the web app and the browser extension.', 'The same verdict wherever a developer meets the repo.'],
    ],
    flow: ['Drop in a repo, ZIP or link', 'Read the verdict and score', 'Open the flagged lines', 'Decide whether to trust it'],
    outcome: {
      title: 'Fast on huge repos, quiet on healthy ones.',
      stats: [['11', 'Detection rules'], ['12 s', 'To scan a 68k-file repo'], ['0 / 21', 'Popular repos flagged Dangerous']],
    },
  },
  {
    slug: 'supplierinv', name: 'SupplierInv', kind: 'Company', area: 'Invoice intelligence · Moglix', year: '2026',
    pitch: 'Turns unstructured supplier invoices into validated data with generative AI, then reconciles them with no manual review.',
    role: 'Backend & GenAI · AI & Analytics team', status: 'In production',
    stack: ['Python', 'Gemini', 'AWS Textract', 'Pydantic', 'Kafka', 'MongoDB', 'BigQuery', 'Power BI'],
    links: [],
    overview: {
      title: 'Messy invoices in. Clean, checked data out.',
      text: 'Supplier invoices arrive as scans and PDFs in every possible format. SupplierInv reads them with OCR and Gemini, turns each one into schema-validated data, streams it through Kafka into MongoDB and BigQuery, and reconciles it automatically, feeding live Power BI dashboards for procurement.',
    },
    problem: {
      title: 'Hours of reading invoices line by line.',
      text: 'Every invoice had to be read, typed in and checked against the order: item by item, quantities, tax codes and the supplier’s GST number. The work was slow, repetitive and easy to get wrong at scale.',
      points: ['Invoices in every format and layout', 'Line-by-line checks against the order', 'Tax and compliance rules on every line'],
    },
    system: {
      title: 'Five steps from a scanned page to reconciled data.',
      steps: [
        ['Read', 'AWS Textract extracts the text and Gemini understands the structure.'],
        ['Structure', 'Every invoice is validated against a strict Pydantic schema.'],
        ['Stream', 'A real-time Kafka → MongoDB → BigQuery backbone moves the data.'],
        ['Reconcile', 'Fuzzy item matching, tolerance bands, HSN validation and GSTIN checks.'],
        ['Report', 'Results feed live Power BI dashboards for procurement analytics.'],
      ],
    },
    decisions: [
      ['OCR or an LLM?', 'Both: Textract for reliable text, Gemini for structure and meaning.', 'Accurate text with an understanding of what each field is.'],
      ['What stops bad data getting in?', 'A strict schema at the door, before anything is stored.', 'Downstream reports only ever see clean, typed data.'],
      ['How strict should matching be?', 'Fuzzy matching with tolerance bands instead of exact equality.', 'Real-world differences pass; real errors do not.'],
    ],
    flow: ['An invoice arrives', 'It is read and structured', 'It is checked and reconciled', 'Results appear in the dashboard'],
    outcome: {
      title: 'From manual review to zero-touch processing.',
      stats: [['Zero-touch', 'Invoices reconciled without review'], ['Real-time', 'Kafka → MongoDB → BigQuery'], ['4 checks', 'Items, tolerance, HSN, GSTIN']],
    },
  },
  {
    slug: 'procurement', name: 'Conversational Procurement', short: 'Procurement', kind: 'Company', area: 'Agentic AI · Moglix', year: '2026',
    pitch: 'A WhatsApp AI agent that lets people run sourcing workflows through plain conversation.',
    role: 'Backend & agents · AI & Analytics team', status: 'Internal tool',
    stack: ['Python', 'FastAPI', 'WhatsApp Business API', 'Agentic AI', 'REST APIs'],
    links: [],
    overview: {
      title: 'Sourcing, in the chat app everyone already has.',
      text: 'The procurement assistant is an AI agent reachable on WhatsApp. People describe what they need in their own words, and the agent works out the request, runs the right sourcing workflow through backend services and replies in the same conversation.',
    },
    problem: {
      title: 'Sourcing meant forms, portals and follow-up calls.',
      text: 'Starting a sourcing request usually meant logging in to a portal, filling a form and chasing updates. Many of the people who needed it were on the move and already lived in WhatsApp.',
      points: ['A portal to log in to for every request', 'Forms that do not fit how people ask', 'Updates scattered across calls and emails'],
    },
    system: {
      title: 'Four steps from a message to a sourcing action.',
      steps: [
        ['Message', 'A user writes to the assistant on WhatsApp.'],
        ['Understand', 'The agent works out what is being asked and what is missing.'],
        ['Act', 'Agent orchestration calls the sourcing workflows through backend REST APIs.'],
        ['Reply', 'A contextual answer comes back in the same conversation.'],
      ],
    },
    decisions: [
      ['Why WhatsApp?', 'Meet people in the app they already use every day.', 'No new tool to learn and no portal to log in to.'],
      ['A fixed menu or an agent?', 'An agent that understands free text and asks for what is missing.', 'People can ask the way they would ask a colleague.'],
      ['Where does the logic live?', 'Backend services the agent orchestrates, not the chat itself.', 'Workflows stay consistent whichever channel starts them.'],
    ],
    flow: ['Send a message on WhatsApp', 'The agent asks for anything missing', 'The sourcing workflow runs', 'Get the answer in the chat'],
    outcome: {
      title: 'Procurement as a conversation instead of a form.',
      stats: [['WhatsApp', 'No new app to learn'], ['Plain language', 'Instead of forms'], ['End-to-end', 'From message to sourcing action']],
    },
  },
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

// The case studies chain in the same order as the papers on the homepage board, looping back.
// Older projects that are no longer on the board keep their existing pages but leave the chain.
const ORDER = ['lumida', 'ramanujan', 'distiller', 'payment-advice', 'repo-safety', 'supplierinv', 'procurement', 'cerebra', 'bug-detection', 'blockauth'];
const PROJECTS = ORDER.map(slug => {
  const p = ALL_PROJECTS.find(x => x.slug === slug);
  if (!p) throw new Error('no content for ' + slug);
  return p;
});

// ---------------------------------------------------------------- helpers
const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pad = n => String(n).padStart(2, '0');
const hash = f => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);

// Each case study shows that project's paper from the homepage notice board, so the board and
// the study always share the same artwork. Links inside the paper are removed (the paper itself
// sits inside the "next project" link).
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function paperFor(slug) {
  const at = home.indexOf(`data-slug="${slug}"`);
  if (at < 0) throw new Error('no board paper for ' + slug);
  const start = home.lastIndexOf('<article', at);
  const end = home.indexOf('</article>', at) + '</article>'.length;
  return home.slice(start, end)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, '')
    .replace(/<br>\s*(?=<\/div>)/g, '')
    .replace(/ style="[^"]*"/, '')
    .replace(/src="assets\//g, 'src="/assets/');
}

const v = { css: hash('style.css'), js: hash('main.js') };

// short statements for each project's side card (hero)
const LINES = {
  'lumida': ['Read-only.', 'Evidence first.'],
  'ramanujan': ['Ask in Teams.', 'Governed answers.'],
  'payment-advice': ['Parsers first.', 'Gemini as fallback.'],
  'repo-safety': ['Never runs code.', 'Explains every flag.'],
  'supplierinv': ['Strict schema.', 'Zero-touch review.'],
  'procurement': ['Just a chat.', 'Real workflows.'],
  'cerebra': ['One sentence.', 'One request.'],
  'distiller': ['One line to adopt.', 'A fallback at every step.'],
  'bug-detection': ['Caught live.', 'Explained or fixed.'],
  'blockauth': ['No central server.', 'Verifiable access.'],
  'admin-panel': ['Backend logic.', 'Core features.'],
  'flight-delay-predictor': ['Live data in.', 'Forecasts out.'],
  'ecommerce-api': ['Roles. Validation.', 'A clean schema.'],
};

function page(p, i) {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const num = pad(i + 1);
  const title = `${p.name} — Rohan Chauhan`;
  const chapters = [['overview', 'Overview'], ['problem', 'Problem'], ['system', 'How it works'], ['decisions', 'Decisions'], ['flow', 'Flow'], ['outcome', 'Outcome']];
  const tones = ['paper', 'ink'];
  let t = 0, g = 0;
  const tone = () => tones[(t++) % 2];
  // the thread runs in a lane at the left edge (right edge on phones), with a knot at each
  // section label; it leaves the lane only at the hero pin, the pipeline and the next project's pin
  const gutter = () => { const id = 'gm' + (g++); const k = 'k' + id.slice(2); return { id, k, knot: `<i class="lane-knot" id="${k}" aria-hidden="true"></i>`, attr: `data-thread="a:${id}:0,0,l a:${k}:0,0,ln a:${id}:0,1,l"`, mark: `<span class="gutter-mark" id="${id}" aria-hidden="true"></span>` }; };
  const line = LINES[p.slug] || [p.status, p.kind];

  const G = Array.from({ length: 9 }, gutter);
  const hero = { attr: `data-thread="a:hpin:0.5,0.004 a:hfelt:0.05,0.07 a:hlane:0,0 a:${G[0].id}:0,1,l" data-thread-mobile="a:hpin:0.5,0.004 a:hfelt:0.95,0.07 a:hlane:0,0 a:${G[0].id}:0,1,l"`, mark: G[0].mark };

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

    <!-- 01 HERO -->
    <section class="band tone-${tone()} study-hero" ${hero.attr}>
      ${hero.mark}
      <div class="band__inner">
        <div class="study-col">
          <p class="study-label mono reveal"><span>${num}</span> / ${esc(p.area)}</p>
          <h1 class="study-hero__name display" style="--n:${(p.short || p.name).length}">${esc(p.short || p.name)}</h1>
          <div class="study-hero__rule"><span class="mono">Project study</span></div>
          <p class="study-hero__pitch reveal">${esc(p.pitch)}</p>
        </div>
        <div class="study-hero__visual">
          <div class="study-paper" id="hfelt" aria-hidden="true"><i class="lane-at" id="hlane"></i>
${paperFor(p.slug).replace('<article ', '<article id="hpin" ')}
          </div>
          <aside class="study-card reveal">
            <p class="study-card__label mono">${esc(p.kind)} · ${esc(p.year)}</p>
            <p class="study-card__line">${esc(line[0])}<br>${esc(line[1])}</p>
            <p class="study-card__tags mono">${p.stack.slice(0, 4).map(esc).join(' / ')}</p>
          </aside>
        </div>
        <p class="study-caption mono">${esc(p.name)} / ${esc(p.area)} / ${esc(p.year)}</p>
        <dl class="study-meta">
          <div><dt class="mono">Role</dt><dd>${esc(p.role)}</dd></div>
          <div><dt class="mono">Status</dt><dd>${esc(p.status)}</dd></div>
          <div><dt class="mono">Year</dt><dd>${esc(p.year)}</dd></div>
          <div class="study-meta__wide"><dt class="mono">Stack</dt><dd>${p.stack.map(esc).join(' / ')}</dd></div>
${p.links.length ? `          <div class="study-meta__wide"><dt class="mono">Links</dt><dd>${p.links.map(l => `<a class="explore mono" data-cursor="Open" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join(' ')}</dd></div>` : ''}
        </dl>
        <nav class="study-index mono" aria-label="In this study">
          <span>In this study</span>
          <ol>
${chapters.map(([id, label]) => `            <li><a href="#${id}">${label}</a></li>`).join('\n')}
          </ol>
        </nav>
      </div>
    </section>

    <!-- 02 OVERVIEW -->
    <section class="band tone-${tone()} study-chapter" id="overview" ${G[1].attr}>
      ${G[1].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[1].knot}02 / Overview</p>
        <div class="study-two">
          <h2 class="study-h2 reveal">${esc(p.overview.title)}</h2>
          <p class="study-text reveal">${esc(p.overview.text)}</p>
        </div>
        <ol class="study-modules reveal" style="--n:${p.system.steps.length}">
${p.system.steps.map(([h]) => `          <li>${esc(h)}</li>`).join('\n')}
        </ol>
        <p class="study-caption mono">${esc(p.name)} / how the parts connect</p>
      </div>
    </section>

    <!-- 03 PROBLEM -->
    <section class="band tone-${tone()} study-chapter" id="problem" ${G[2].attr}>
      ${G[2].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[2].knot}03 / The problem</p>
        <h2 class="study-h2 study-h2--big study-col reveal">${esc(p.problem.title)}</h2>
        <div class="study-two study-two--low">
          <div></div>
          <p class="study-text reveal">${esc(p.problem.text)}</p>
        </div>
        <ol class="study-rows">
${p.problem.points.map((pt, k) => `          <li class="reveal"><span class="study-rows__n mono">${pad(k + 1)}</span><h3>${esc(pt)}</h3></li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- 04 SYSTEM -->
    <section class="band tone-${tone()} study-chapter" id="system" data-thread="a:${G[3].id}:0,0,l a:${G[3].k}:0,0,ln a:pl0:0,0,l ${p.system.steps.map((_, k) => `a:ps${k}:0.5,0.5,l`).join(' ')} a:ptr:0,0,r a:pbr:0,0,r a:pl1:0,0,r a:${G[3].id}:0,1,l" data-thread-mobile="${G[3].attr.slice(13, -1)}">
      ${G[3].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[3].knot}04 / How it works</p>
        <h2 class="study-h2 study-col reveal">${esc(p.system.title)}</h2>
        <ol class="study-steps study-steps--thread" id="pipe" style="--n:${p.system.steps.length}"><i class="lane-at" id="pl0"></i><i class="lane-at lane-at--below" id="pl1"></i><i class="lane-at lane-at--tr" id="ptr"></i><i class="lane-at lane-at--br" id="pbr"></i>
${p.system.steps.map(([h, d], k) => `          <li class="study-step reveal"><span class="study-step__node" id="ps${k}"></span><span class="study-step__n mono">${pad(k + 1)}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- 05 DECISIONS -->
    <section class="band tone-${tone()} study-chapter" id="decisions" ${G[4].attr}>
      ${G[4].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[4].knot}05 / Key decisions</p>
        <h2 class="study-h2 study-h2--big study-col reveal">Where the important calls were made.</h2>
${p.decisions.map(([q, c, e], k) => `        <article class="study-decision reveal">
          <p class="study-label mono">Decision ${pad(k + 1)}</p>
          <div class="study-two"><h3 class="study-h3">${esc(q)}</h3><div></div></div>
          <ol class="study-rows study-rows--split">
            <li><span class="study-rows__n mono">→</span><h3>The choice</h3><p>${esc(c)}</p></li>
            <li><span class="study-rows__n mono">→</span><h3>What it gave</h3><p>${esc(e)}</p></li>
          </ol>
        </article>`).join('\n')}
      </div>
    </section>

    <!-- 06 FLOW -->
    <section class="band tone-${tone()} study-chapter" id="flow" ${G[5].attr}>
      ${G[5].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[5].knot}06 / The flow</p>
        <div class="study-two">
          <h2 class="study-h2 reveal">From the first step to the result.</h2>
          <p class="study-text reveal">What it looks like from the side of the person using it — the path through ${esc(p.short || p.name)} in ${p.flow.length} steps.</p>
        </div>
        <ol class="study-journey">
${p.flow.map((s, k) => `          <li class="reveal"><span class="mono">${pad(k + 1)}</span>${esc(s)}</li>`).join('\n')}
        </ol>
        <p class="study-caption mono">${esc(p.name)} / user flow</p>
      </div>
    </section>

    <!-- 07 OUTCOME -->
    <section class="band tone-${tone()} study-chapter" id="outcome" ${G[6].attr}>
      ${G[6].mark}
      <div class="band__inner">
        <p class="study-label mono reveal">${G[6].knot}07 / Outcome</p>
        <h2 class="study-h2 study-h2--big study-col reveal">${esc(p.outcome.title)}</h2>
        <dl class="study-stats">
${p.outcome.stats.map(([n, l]) => `          <div class="reveal"><dt class="mono">${esc(l)}</dt><dd>${esc(n)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

    <!-- 08 NEXT -->
    <section class="band tone-${tone()} study-next" data-thread="a:${G[7].id}:0,0,l a:${G[7].k}:0,0,ln a:nlane:0,0 a:nfelt:0.14,0.035 a:npin:0.5,0.004" data-thread-mobile="a:${G[7].id}:0,0,l a:${G[7].k}:0,0,ln a:${G[7].id}:0,0.5,l">
      ${G[7].mark}
      <a class="study-next__link" href="/work/${next.slug}" data-cursor="Next">
        <span class="study-label mono">${G[7].knot}${pad((i + 1) % PROJECTS.length + 1)} / Next project</span>
        <span class="study-next__row"><span class="study-next__name display" style="--n:${(next.short || next.name).length}">${esc(next.short || next.name)}</span><span class="study-next__arrow" aria-hidden="true">↗</span></span>
        <span class="study-next__pitch">${esc(next.pitch)}</span>
        <span class="study-paper study-paper--next" id="nfelt" aria-hidden="true"><i class="lane-at" id="nlane"></i>
${paperFor(next.slug).replace('<article ', '<article id="npin" ')}
        </span>
      </a>
      <div class="study-next__foot mono">
        <a href="/work/${PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length].slug}">← ${esc(PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length].short || PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length].name)}</a>
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

// sitemap
const base = 'https://chauhanrohan.vercel.app';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
${ALL_PROJECTS.map(p => `  <url><loc>${base}/work/${p.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`);
console.log('sitemap.xml updated');
