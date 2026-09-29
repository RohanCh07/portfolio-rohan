import { content } from '../content.js';

export function mountTerminal(container) {
  container.innerHTML = `
    <div class="term-welcome">CozyDesk Interactive Shell v1.0.0 (Phase 5b)</div>
    <div class="term-hint">Type 'help' to see available commands.</div>
    <div class="term-log" id="term-log"></div>
    <div class="term-prompt-row" style="display: flex; align-items: center; position: relative;">
      <span class="term-user">rohan@cozy-desk</span>:<span class="term-path">~/portfolio</span>$&nbsp;
      <input type="text" id="term-input" autocomplete="off" spellcheck="false" style="background: transparent; border: none; color: var(--text); font-family: inherit; font-size: inherit; flex: 1; outline: none; caret-color: var(--monitor);" />
    </div>
  `;

  const logEl = container.querySelector('#term-log');
  const inputEl = container.querySelector('#term-input');

  const history = [];
  let historyIdx = -1;

  function printLine(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.style.marginBottom = '6px';
    logEl.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function printPromptAndCommand(cmd) {
    printLine(`<span class="term-user">rohan@cozy-desk</span>:<span class="term-path">~/portfolio</span>$&nbsp;<span style="color:var(--text)">${esc(cmd)}</span>`);
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function executeCommand(rawCmd) {
    const args = rawCmd.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    
    if (!cmd) return;

    if (cmd !== 'clear') {
        printPromptAndCommand(rawCmd);
    }

    switch (cmd) {
      case 'help':
        printLine(`
          Available commands:<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">help</span>       - List all commands<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">about</span>      - Print about summary<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">projects</span>   - List projects<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">projects &lt;n&gt;</span> - Show project details<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">skills</span>     - Print skills<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">contact</span>    - Print contact info<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">resume</span>     - Download resume<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">theme</span>      - Toggle light/dark mode (mock)<br>
          &nbsp;&nbsp;<span style="color:var(--monitor)">clear</span>      - Clear terminal output
        `);
        break;
      case 'about':
        const bioHtml = esc(content.about.bio).replace(/\\n/g, '<br>');
        printLine(`<strong>${esc(content.about.title)}</strong><br>${esc(content.about.tagline)}<br><br>${bioHtml}`);
        break;
      case 'projects':
        if (args.length === 1) {
          const list = content.projects.map((p, i) => `&nbsp;&nbsp;[${i + 1}] <span style="color:var(--monitor)">${esc(p.title)}</span> - ${esc(p.summary)}`).join('<br>');
          printLine(`Projects:<br>${list}<br><br><span style="color:var(--muted)">Type 'projects &lt;number&gt;' for details.</span>`);
        } else {
          const n = parseInt(args[1], 10);
          if (isNaN(n) || n < 1 || n > content.projects.length) {
            printLine(`<span style="color:#E06C75">Project not found.</span>`);
          } else {
            const p = content.projects[n - 1];
            printLine(`
              <strong>${esc(p.title)}</strong> (${esc(p.date)})<br>
              <em style="color:var(--muted)">${p.tech.map(t => esc(t)).join(', ')}</em><br><br>
              ${esc(p.description)}<br><br>
              ${p.links?.repo ? `Repo: <a href="${esc(p.links.repo)}" target="_blank" style="color:var(--lamp)">${esc(p.links.repo)}</a>` : ''}
              ${p.links?.live ? `<br>Live: <a href="${esc(p.links.live)}" target="_blank" style="color:var(--lamp)">${esc(p.links.live)}</a>` : ''}
            `);
          }
        }
        break;
      case 'skills':
        const byCat = {};
        (content.skills || []).forEach(s => {
          if (!byCat[s.category]) byCat[s.category] = [];
          byCat[s.category].push(s.name);
        });
        const out = Object.entries(byCat).map(([cat, skills]) => `<strong>${esc(cat)}</strong>: <span style="color:var(--muted)">${skills.map(s => esc(s)).join(', ')}</span>`).join('<br>');
        printLine(out || 'No skills found.');
        break;
      case 'contact':
        printLine(`
          Email: <a href="mailto:${esc(content.contact.email)}" style="color:var(--lamp)">${esc(content.contact.email)}</a><br>
          GitHub: <a href="${esc(content.contact.github)}" target="_blank" style="color:var(--lamp)">${esc(content.contact.github)}</a><br>
          LinkedIn: <a href="${esc(content.contact.linkedin)}" target="_blank" style="color:var(--lamp)">${esc(content.contact.linkedin)}</a>
        `);
        break;
      case 'resume':
        printLine(`Downloading resume...`);
        if (content.resume) {
          const a = document.createElement('a');
          a.href = content.resume;
          a.download = 'resume.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          printLine(`<span style="color:#E06C75">Resume link not found.</span>`);
        }
        break;
      case 'theme':
        printLine(`Theme switched to Light Mode. (Just kidding, Developers only work in the dark!)`);
        break;
      case 'clear':
        logEl.innerHTML = '';
        break;
      default:
        printLine(`<span style="color:#E06C75">Command not found: ${esc(cmd)}. Type 'help' for available commands.</span>`);
    }
    
    // Auto-scroll after command output
    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
    });
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      if (val.trim()) {
        history.push(val);
        historyIdx = history.length;
        executeCommand(val);
      }
      inputEl.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        inputEl.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        inputEl.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        inputEl.value = '';
      }
    }
  });

  // Focus input when clicking anywhere in terminal body
  container.addEventListener('click', () => {
    const selection = window.getSelection();
    if (!selection.toString()) {
      inputEl.focus();
    }
  });
}
