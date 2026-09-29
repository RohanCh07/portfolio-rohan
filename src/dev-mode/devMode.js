/**
 * devMode.js — IDE layout for Dev Mode (Phase 5).
 *
 * Full-screen editor interface for developers:
 * - Explorer sidebar with virtual files generated dynamically from content.js
 * - Multi-tab bar with open/close/switch controls
 * - Code editor pane with line numbers & syntax highlighting (highlight.js)
 * - Collapsible bottom terminal panel (commands coming in Phase 5b)
 * - Status bar showing location, availability, language, and mode
 *
 * Replaces the viewport when store.mode === "dev".
 */

import { getState, subscribe, setMode } from '../store.js';
import { content } from '../content.js';
import { exitDevMode } from '../ui/modeToggle.js';
import { mountTerminal } from './terminal.js';

/** Escape text for safe HTML injection. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Pure function: dynamically build virtual files from content.js.
 * @param {object} c — content object
 * @returns {Array<{ path: string, name: string, folder?: string, lang: string, icon: string, content: string }>}
 */
export function buildVirtualFiles(c = {}) {
  const files = [];

  // 1. about.md
  const about = c.about || {};
  const aboutBody = [
    `# ${about.name || 'About'}`,
    ``,
    `> **${about.title || 'Developer'}**  `,
    `> ${about.tagline || ''}`,
    ``,
    `**Location:** ${about.location || 'Unknown'}  `,
    `**Availability:** ${about.availability || 'Available'}  `,
    ``,
    `## Bio`,
    ``,
    about.bio || '',
  ].join('\n');

  files.push({
    path: 'about.md',
    name: 'about.md',
    lang: 'markdown',
    icon: '📝',
    content: aboutBody,
  });

  // 2. skills.json
  const skillsData = {
    categories: [...new Set((c.skills || []).map((s) => s.category))],
    skills: c.skills || [],
  };
  files.push({
    path: 'skills.json',
    name: 'skills.json',
    lang: 'json',
    icon: '⚡',
    content: JSON.stringify(skillsData, null, 2),
  });

  // 3. projects/<slug>.md for each project
  for (const p of c.projects || []) {
    const slug = p.id || 'project';
    const projMd = [
      `---`,
      `id: "${slug}"`,
      `title: "${p.title || ''}"`,
      `date: "${p.date || ''}"`,
      `featured: ${Boolean(p.featured)}`,
      `tech: [${(p.tech || []).map((t) => `"${t}"`).join(', ')}]`,
      `live: "${p.links?.live || ''}"`,
      `repo: "${p.links?.repo || ''}"`,
      `---`,
      ``,
      `# ${p.title || slug}`,
      ``,
      `> ${p.summary || ''}`,
      ``,
      `## Description`,
      ``,
      p.description || '',
    ].join('\n');

    files.push({
      path: `projects/${slug}.md`,
      name: `${slug}.md`,
      folder: 'projects',
      lang: 'markdown',
      icon: '📦',
      content: projMd,
    });
  }

  // 4. contact.ts
  const contact = c.contact || {};
  const contactTs = [
    `/**`,
    ` * Contact Information & Social Profiles`,
    ` */`,
    ``,
    `export interface ContactConfig {`,
    `  email: string;`,
    `  github: string;`,
    `  linkedin: string;`,
    `}`,
    ``,
    `export const contact: ContactConfig = {`,
    `  email: "${contact.email || ''}",`,
    `  github: "${contact.github || ''}",`,
    `  linkedin: "${contact.linkedin || ''}",`,
    `};`,
    ``,
    `export default contact;`,
  ].join('\n');

  files.push({
    path: 'contact.ts',
    name: 'contact.ts',
    lang: 'typescript',
    icon: '🔷',
    content: contactTs,
  });

  return files;
}

/**
 * Mount Dev Mode into #dev-mode container and wire tab & editor interactions.
 * Returns cleanup function.
 */
export function mountDevMode() {
  const container = document.getElementById('dev-mode');
  if (!container) return () => {};

  const virtualFiles = buildVirtualFiles(content);
  const fileMap = new Map(virtualFiles.map((f) => [f.path, f]));

  // IDE State
  let openPaths = ['about.md'];
  let activePath = 'about.md';
  let isTerminalCollapsed = false;

  // Render initial static skeleton
  container.innerHTML = `
    <div class="ide-layout">
      <!-- Title Bar -->
      <header class="ide-titlebar">
        <div class="ide-titlebar-left">
          <span class="ide-window-dots">
            <span class="dot close"></span>
            <span class="dot min"></span>
            <span class="dot max"></span>
          </span>
          <span class="ide-app-name">CozyDesk IDE</span>
          <span class="ide-file-breadcrumb" id="ide-breadcrumb">about.md</span>
        </div>
        <div class="ide-titlebar-center">
          <span class="ide-search-box">🔍 portfolio-rohan (Workspace)</span>
        </div>
        <div class="ide-titlebar-right"></div>
      </header>

      <!-- Main Workbench -->
      <div class="ide-workbench">
        <!-- Explorer Sidebar -->
        <aside class="ide-sidebar">
          <div class="sidebar-section-header">
            <span class="sidebar-title">EXPLORER</span>
          </div>
          <div class="sidebar-folder-label">
            <span class="folder-arrow">▾</span>
            <span class="folder-icon">📁</span>
            <span class="folder-name">PORTFOLIO</span>
          </div>
          <nav class="sidebar-file-list" id="ide-file-tree" aria-label="Files"></nav>
        </aside>

        <!-- Main Editor & Terminal Area -->
        <main class="ide-main">
          <!-- Tab Bar -->
          <div class="ide-tab-bar" id="ide-tab-bar" role="tablist"></div>

          <!-- Code View Pane -->
          <div class="ide-editor-container" id="ide-editor-container"></div>

          <!-- Collapsible Terminal Panel -->
          <section class="ide-terminal-panel" id="ide-terminal-panel">
            <div class="terminal-bar">
              <div class="terminal-bar-left">
                <span class="term-title">TERMINAL</span>
                <span class="term-badge">zsh</span>
              </div>
              <div class="terminal-bar-right">
                <button type="button" class="term-btn" id="term-toggle-btn" title="Toggle Terminal Size">
                  <span class="term-toggle-icon">▾</span>
                </button>
              </div>
            </div>
            <div class="terminal-body" id="ide-terminal-body">
              <div class="term-welcome">CozyDesk Interactive Shell v1.0.0 (Phase 5)</div>
              <div class="term-hint">Terminal commands engine will be wired in Phase 5b.</div>
              <div class="term-prompt-row">
                <span class="term-user">rohan@cozy-desk</span>:<span class="term-path">~/portfolio</span>$&nbsp;<span class="term-cursor"></span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- Status Bar -->
      <footer class="ide-statusbar">
        <div class="statusbar-left">
          <span class="status-cell git-branch"><span class="branch-icon">⌥</span> main</span>
          <span class="status-cell status-ready"><span class="status-dot"></span> Ready</span>
          <span class="status-cell lang-tag" id="ide-status-lang">Markdown</span>
        </div>
        <div class="statusbar-right">
          <span class="status-cell location-tag">📍 ${esc(content.about?.location || '')}</span>
          <span class="status-cell avail-tag">● ${esc(content.about?.availability || '')}</span>
          <span class="status-cell mode-pill">DEV MODE</span>
        </div>
      </footer>
    </div>
  `;

  const fileTreeEl = container.querySelector('#ide-file-tree');
  const tabBarEl = container.querySelector('#ide-tab-bar');
  const editorContainerEl = container.querySelector('#ide-editor-container');
  const breadcrumbEl = container.querySelector('#ide-breadcrumb');
  const statusLangEl = container.querySelector('#ide-status-lang');
  const terminalPanelEl = container.querySelector('#ide-terminal-panel');
  const termToggleBtn = container.querySelector('#term-toggle-btn');
  const termToggleIcon = container.querySelector('.term-toggle-icon');

  // Terminal collapse toggle
  termToggleBtn.addEventListener('click', () => {
    isTerminalCollapsed = !isTerminalCollapsed;
    terminalPanelEl.classList.toggle('is-collapsed', isTerminalCollapsed);
    termToggleIcon.textContent = isTerminalCollapsed ? '▴' : '▾';
  });

  /* ── Sidebar Explorer Rendering ── */
  function renderExplorer() {
    fileTreeEl.innerHTML = '';

    // Group files: root files and projects folder
    const rootFiles = virtualFiles.filter((f) => !f.folder);
    const projectFiles = virtualFiles.filter((f) => f.folder === 'projects');

    // 1. Root files
    for (const f of rootFiles) {
      fileTreeEl.appendChild(createFileItem(f));
    }

    // 2. Projects folder
    if (projectFiles.length > 0) {
      const folderItem = document.createElement('div');
      folderItem.className = 'tree-folder';
      folderItem.innerHTML = `
        <div class="tree-folder-header">
          <span class="folder-arrow">▾</span>
          <span class="folder-icon">📂</span>
          <span class="folder-name">projects</span>
        </div>
        <div class="tree-folder-children"></div>
      `;
      const childrenContainer = folderItem.querySelector('.tree-folder-children');
      for (const pf of projectFiles) {
        childrenContainer.appendChild(createFileItem(pf, true));
      }
      fileTreeEl.appendChild(folderItem);
    }
  }

  function createFileItem(file, isNested = false) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `tree-file-item${isNested ? ' nested' : ''}${file.path === activePath ? ' active' : ''}`;
    item.setAttribute('data-path', file.path);
    item.innerHTML = `
      <span class="file-icon">${file.icon}</span>
      <span class="file-name">${esc(file.name)}</span>
    `;
    item.addEventListener('click', () => openFile(file.path));
    return item;
  }

  /* ── Tab Bar Rendering ── */
  function renderTabs() {
    tabBarEl.innerHTML = '';

    for (const path of openPaths) {
      const file = fileMap.get(path);
      if (!file) continue;

      const tab = document.createElement('div');
      tab.className = `ide-tab${path === activePath ? ' active' : ''}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(path === activePath));
      tab.innerHTML = `
        <span class="tab-icon">${file.icon}</span>
        <span class="tab-label">${esc(file.name)}</span>
        <button type="button" class="tab-close" title="Close tab" aria-label="Close ${file.name}">×</button>
      `;

      // Switch tab on click
      tab.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) return;
        activePath = path;
        updateUI();
      });

      // Close tab on close button click
      const closeBtn = tab.querySelector('.tab-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFile(path);
      });

      tabBarEl.appendChild(tab);
    }
  }

  /* ── Editor Content Rendering ── */
  function renderEditor() {
    if (!activePath || !fileMap.has(activePath)) {
      editorContainerEl.innerHTML = `
        <div class="editor-empty-state">
          <div class="empty-icon">☕</div>
          <div class="empty-title">No Editor Open</div>
          <div class="empty-hint">Select a file from the explorer on the left to inspect its source.</div>
        </div>
      `;
      breadcrumbEl.textContent = 'No file open';
      statusLangEl.textContent = 'Plain Text';
      return;
    }

    const file = fileMap.get(activePath);
    breadcrumbEl.textContent = file.path;
    statusLangEl.textContent = capitalize(file.lang);

    const rawCode = file.content;
    const lines = rawCode.split('\n');
    const lineNumbersHtml = lines.map((_, i) => `<span>${i + 1}</span>`).join('');

    let highlightedHtml = '';
    if (window.hljs) {
      try {
        highlightedHtml = window.hljs.highlight(rawCode, { language: file.lang }).value;
      } catch {
        highlightedHtml = esc(rawCode);
      }
    } else {
      highlightedHtml = esc(rawCode);
    }

    editorContainerEl.innerHTML = `
      <div class="editor-view">
        <div class="editor-gutter" aria-hidden="true">${lineNumbersHtml}</div>
        <pre class="editor-code"><code class="hljs language-${file.lang}">${highlightedHtml}</code></pre>
      </div>
    `;
  }

  /* ── Actions ── */
  function openFile(path) {
    if (!openPaths.includes(path)) {
      openPaths.push(path);
    }
    activePath = path;
    updateUI();
  }

  function closeFile(path) {
    const idx = openPaths.indexOf(path);
    if (idx === -1) return;

    openPaths.splice(idx, 1);

    if (activePath === path) {
      // Pick adjacent tab if available
      if (openPaths.length > 0) {
        activePath = openPaths[Math.min(idx, openPaths.length - 1)];
      } else {
        activePath = null;
      }
    }
    updateUI();
  }

  function updateUI() {
    renderExplorer();
    renderTabs();
    renderEditor();
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  /* ── Initial Render & Store Subscription ── */
  updateUI();

  // Initialize terminal
  const terminalBodyEl = container.querySelector('#ide-terminal-body');
  if (terminalBodyEl) {
    mountTerminal(terminalBodyEl);
  }

  function sync(state) {
    const isDev = state.mode === 'dev';
    container.hidden = !isDev;
    if (isDev) {
      updateUI();
    }
  }

  sync(getState());
  const unsubscribe = subscribe(sync);

  /* ── Contextual Escape Key ── */
  const onKeydown = (e) => {
    if (getState().mode === 'dev' && e.key === 'Escape') {
      const active = document.activeElement;
      if (active && active.id === 'term-input') {
        active.blur();
      } else {
        exitDevMode();
      }
    }
  };
  document.addEventListener('keydown', onKeydown);

  return () => {
    unsubscribe();
    document.removeEventListener('keydown', onKeydown);
  };
}
