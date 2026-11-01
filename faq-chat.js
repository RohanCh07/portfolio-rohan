// =========================================================
// FAQ as a chat: opening a question shows a typing indicator,
// then the answer appears word by word like a chat reply.
// =========================================================
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".faq .acc").forEach((d) => {
    const body = d.querySelector(".acc-body");
    if (!body) return;
    // wrap the answer in a chat bubble with an avatar and a typing indicator
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    while (body.firstChild) bubble.appendChild(body.firstChild);
    const avatar = document.createElement("span");
    avatar.className = "chat-avatar"; avatar.setAttribute("aria-hidden", "true");
    avatar.innerHTML = '<img src="assets/avatar.jpg" alt="" onerror="this.remove()"><span>RC</span>';
    const dots = document.createElement("span");
    dots.className = "chat-typing"; dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<i></i><i></i><i></i>";
    body.classList.add("chat");
    body.append(avatar, dots, bubble);

    // split text into words so they can appear one after another
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span"); s.className = "w"; s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(bubble);

    let timers = [];
    d.addEventListener("toggle", () => {
      timers.forEach(clearTimeout); timers = [];
      if (!d.open) { body.classList.remove("typing", "replied"); words.forEach((w) => w.classList.remove("on")); return; }
      if (reduce) { body.classList.add("replied"); words.forEach((w) => w.classList.add("on")); return; }
      body.classList.add("typing"); body.classList.remove("replied");
      timers.push(setTimeout(() => {
        body.classList.remove("typing"); body.classList.add("replied");
        words.forEach((w, i) => timers.push(setTimeout(() => w.classList.add("on"), i * 28)));
      }, 650));
    });
  });
})();
