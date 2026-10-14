// Experience timeline: adds the length of each role ("· 8 mos") next to its dates.
// Roles marked "Present" keep counting up on their own.
(() => {
  const months = (s, e) => (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  const fmt = (m) => {
    const y = Math.floor(m / 12), r = m % 12, out = [];
    if (y) out.push(`${y} yr${y > 1 ? "s" : ""}`);
    if (r) out.push(`${r} mo${r > 1 ? "s" : ""}`);
    return out.join(" ");
  };
  document.querySelectorAll(".xp-date[data-start]").forEach((el) => {
    const [sy, sm] = el.dataset.start.split("-").map(Number);
    const end = el.dataset.end ? el.dataset.end.split("-").map(Number) : null;
    const now = new Date();
    const m = months(new Date(sy, sm - 1), end ? new Date(end[0], end[1] - 1) : new Date(now.getFullYear(), now.getMonth()));
    const span = document.createElement("span");
    span.className = "xp-dur"; span.textContent = ` · ${fmt(m)}`;
    el.appendChild(span);
  });
})();
