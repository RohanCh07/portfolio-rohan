// Stacking skill cards: line up the bottoms of all cards so the whole stack lets go
// at the same moment. Without this, a card with more text than its minimum height
// scrolls away early and slides over the heading of the card above it.
(() => {
  const cards = [...document.querySelectorAll(".service")];
  if (cards.length < 2) return;
  function fit() {
    cards.forEach((c) => (c.style.minHeight = "0px"));             // measure the natural heights
    const tops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0);
    if (getComputedStyle(cards[0]).position !== "sticky") { cards.forEach((c) => (c.style.minHeight = "")); return; }
    const base = Math.max(window.innerHeight * 0.64, 420);        // how long each card lingers
    let bottom = 0;
    cards.forEach((c, i) => { bottom = Math.max(bottom, tops[i] + c.offsetHeight, tops[0] + (i === 0 ? base : 0)); });
    // the cards above the last one hold on a few pixels longer, so the last card can never
    // start scrolling away while the others are still stuck
    const last = cards.length - 1;
    cards.forEach((c, i) => (c.style.minHeight = `${Math.ceil(bottom - tops[i]) + (i < last ? 6 : 0)}px`));
  }
  let t;
  const later = () => { clearTimeout(t); t = setTimeout(fit, 120); };
  window.addEventListener("resize", later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("load", fit);
  fit();
})();
