/* =========================================
   CTA NAVIGATION - BOOK TEXTILE
   - Précédent = back si possible, sinon random
   - Suivant   = forward si possible, sinon random "sans répétition"
   - "Suivant" : ne répète pas avant d'avoir vu toutes les pages (cycle)
                + évite les N dernières pages quand c'est possible
   - Reset automatique du cycle quand toutes les pages ont été vues
   - Pour un site "tout à la racine"
   ========================================= */

   const pages = [
    "laine.html",
    "acrylique.html",
    "coton.html",
    "lin.html",
    "soie.html",
    "polyester.html",
    "polyamide.html",
    "viscose.html",
    "elasthanne.html",
    "bouclé.html",
    "flammé.html",
    "lamé.html",
    "toile.html",
    "sergé.html",
    "satin.html",
    "velours.html",
    "jacquard.html",
    "tweed.html",
    "tissé-teint.html",
    "pied-de-poule.html",
    "jersey.html",
    "jersey-piqué.html",
    "molleton.html",
    "maille-jacquard.html",
    "maille-jetée.html",
    "broderie.html",
    "dentelle.html",
    "non-tissé.html",
    "fixé.html",
    "floqué.html",
    "dévoré.html",
    "froissé.html",
    "gratté.html",
    "moiré.html"
  ];
  
  const KEY_STACK = "bt_history_stack";
  const KEY_INDEX = "bt_history_index";
  const KEY_POOL  = "bt_cycle_pool";
  
  const AVOID_RECENT = 3; // 2 ou 3
  
  function currentPath() {
    // ex: "/ifm-book-textile/laine.html" -> "laine.html"
    return decodeURI(window.location.pathname).split("/").pop();
  }
  
  function loadHistory() {
    const stack = JSON.parse(sessionStorage.getItem(KEY_STACK) || "[]");
    let index = parseInt(sessionStorage.getItem(KEY_INDEX) || "-1", 10);
    if (!Number.isFinite(index)) index = -1;
    return { stack, index };
  }
  
  function saveHistory(stack, index) {
    sessionStorage.setItem(KEY_STACK, JSON.stringify(stack));
    sessionStorage.setItem(KEY_INDEX, String(index));
  }
  
  function go(path) {
    // relatif au repo GitHub Pages (fonctionne aussi en local)
    window.location.href = new URL(path, window.location.href).href;
  }
  
  /* Pool anti-répétition (cycle) */
  
  function loadPool() {
    const pool = JSON.parse(sessionStorage.getItem(KEY_POOL) || "null");
    return Array.isArray(pool) ? pool : null;
  }
  
  function savePool(pool) {
    sessionStorage.setItem(KEY_POOL, JSON.stringify(pool));
  }
  
  function buildFreshPool(excludeCur) {
    return pages.filter(p => p !== excludeCur);
  }
  
  function recentPages(stack, index, n) {
    if (n <= 0) return [];
    const start = Math.max(0, index - (n - 1));
    return stack.slice(start, index + 1);
  }
  
  function pickRandomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
  
  function pickNextSmart(cur, stack, index) {
    let pool = loadPool();
    if (!pool) pool = buildFreshPool(cur);
  
    pool = pool.filter(p => p !== cur);
  
    // reset cycle quand tout a été vu
    if (pool.length === 0) {
      pool = buildFreshPool(cur);
    }
  
    const recent = new Set(recentPages(stack, index, AVOID_RECENT));
  
    let candidates = pool.filter(p => !recent.has(p));
    if (candidates.length === 0) candidates = pool.slice();
  
    const next = pickRandomFrom(candidates);
  
    pool = pool.filter(p => p !== next);
    savePool(pool);
  
    return next;
  }
  
  function registerPageView() {
    const cur = currentPath();
    let { stack, index } = loadHistory();
  
    const isSame = index >= 0 && stack[index] === cur;
  
    if (!isSame) {
      if (index < stack.length - 1) {
        stack = stack.slice(0, index + 1);
      }
      stack.push(cur);
      index = stack.length - 1;
      saveHistory(stack, index);
    }
  
    if (!loadPool()) {
      savePool(buildFreshPool(cur));
    }
  }
  
  function bindCTA() {
    const prevBtn = document.getElementById("prevProject");
    const nextBtn = document.getElementById("nextProject");
    if (!prevBtn || !nextBtn) return;
  
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const cur = currentPath();
      const { stack, index } = loadHistory();
  
      if (index > 0) {
        const newIndex = index - 1;
        saveHistory(stack, newIndex);
        go(stack[newIndex]);
        return;
      }
  
      const fallback = pages.filter(p => p !== cur);
      const prev = pickRandomFrom(fallback.length ? fallback : pages);
  
      const newStack = stack.slice(0, index + 1);
      newStack.push(prev);
      saveHistory(newStack, newStack.length - 1);
      go(prev);
    });
  
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const cur = currentPath();
      const { stack, index } = loadHistory();
  
      if (index < stack.length - 1) {
        const newIndex = index + 1;
        saveHistory(stack, newIndex);
        go(stack[newIndex]);
        return;
      }
  
      const next = pickNextSmart(cur, stack, index);
  
      const newStack = stack.slice(0, index + 1);
      newStack.push(next);
      saveHistory(newStack, newStack.length - 1);
      go(next);
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    registerPageView();
    bindCTA();
  });
  