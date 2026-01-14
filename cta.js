/* =========================================
   CTA NAVIGATION - BOOK TEXTILE
   - Précédent = back si possible, sinon random
   - Suivant   = forward si possible, sinon random "sans répétition"
   - "Suivant" : ne répète pas avant d'avoir vu toutes les pages (cycle)
                + évite les N dernières pages quand c'est possible
   - Reset automatique du cycle quand toutes les pages ont été vues (≈ 35)
   - Compatible Live Server + noms avec accents
   ========================================= */

   const pages = [
    "Pages/laine.html",
    "Pages/acrylique.html",
    "Pages/coton.html",
    "Pages/lin.html",
    "Pages/soie.html",
    "Pages/polyester.html",
    "Pages/polyamide.html",
    "Pages/viscose.html",
    "Pages/elasthanne.html",
    "Pages/bouclé.html",
    "Pages/flammé.html",
    "Pages/lamé.html",
    "Pages/toile.html",
    "Pages/sergé.html",
    "Pages/satin.html",
    "Pages/velours.html",
    "Pages/jacquard.html",
    "Pages/tweed.html",
    "Pages/tissé-teint.html",
    "Pages/pied-de-poule.html",
    "Pages/jersey.html",
    "Pages/jersey-piqué.html",
    "Pages/molleton.html",
    "Pages/maille-jacquard.html",
    "Pages/maille-jetée.html",
    "Pages/broderie.html",
    "Pages/dentelle.html",
    "Pages/non-tissé.html",
    "Pages/fixé.html",
    "Pages/floqué.html",
    "Pages/dévoré.html",
    "Pages/froissé.html",
    "Pages/gratté.html",
    "Pages/moiré.html"
  ];
  
  const KEY_STACK = "bt_history_stack";
  const KEY_INDEX = "bt_history_index";
  
  /* Pool anti-répétition (cycle) */
  const KEY_POOL = "bt_cycle_pool";
  
  /* Combien de pages récentes on évite (si possible) */
  const AVOID_RECENT = 3; // mets 2 ou 3
  
  function currentPath() {
    // On récupère juste ".../Pages/xxx.html" sans le préfixe "/nom-du-repo/"
    const full = decodeURI(window.location.pathname);
    const i = full.indexOf("/Pages/");
    return i >= 0 ? full.slice(i + 1) : full.replace(/^\//, ""); // ex: "Pages/jacquard.html"
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
    // navigation relative (fonctionne en local + GitHub Pages dans un sous-dossier)
    window.location.href = new URL(path, window.location.href).href;
  }
  
  
  /* -------------------------
     Cycle pool helpers
     ------------------------- */
  
  function loadPool() {
    const pool = JSON.parse(sessionStorage.getItem(KEY_POOL) || "null");
    return Array.isArray(pool) ? pool : null;
  }
  
  function savePool(pool) {
    sessionStorage.setItem(KEY_POOL, JSON.stringify(pool));
  }
  
  function buildFreshPool(excludeCur) {
    // toutes les pages sauf la courante
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
  
  /**
   * Choix "suivant" :
   * - utilise un pool (pas de répétition avant d'avoir tout vu)
   * - reset automatique quand le pool est vide (=> tour complet)
   * - évite les N dernières pages quand c'est possible (fallback sinon)
   */
  function pickNextSmart(cur, stack, index) {
    let pool = loadPool();
  
    // init pool si absent
    if (!pool) pool = buildFreshPool(cur);
  
    // sécurité: jamais la page courante dans le pool
    pool = pool.filter(p => p !== cur);
  
    // RESET: si pool vide => tu as vu toutes les autres pages, on recommence un cycle
    if (pool.length === 0) {
      pool = buildFreshPool(cur);
    }
  
    const recent = new Set(recentPages(stack, index, AVOID_RECENT));
  
    // 1) priorité: pool sans les pages récentes
    let candidates = pool.filter(p => !recent.has(p));
  
    // 2) si impossible (ex: il ne reste que des pages "récentes"), on relâche l'anti-récent
    if (candidates.length === 0) {
      candidates = pool.slice();
    }
  
    const next = pickRandomFrom(candidates);
  
    // retire la page choisie du pool (elle est "vue" dans ce cycle)
    pool = pool.filter(p => p !== next);
    savePool(pool);
  
    return next;
  }
  
  /* -------------------------
     Register page view
     ------------------------- */
  function registerPageView() {
    const cur = currentPath();
    let { stack, index } = loadHistory();
  
    const isSame = index >= 0 && stack[index] === cur;
  
    if (!isSame) {
      // si on avait fait "précédent", on coupe le futur (comme un navigateur)
      if (index < stack.length - 1) {
        stack = stack.slice(0, index + 1);
      }
  
      stack.push(cur);
      index = stack.length - 1;
      saveHistory(stack, index);
    }
  
    // init pool si absent (propre)
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
  
      // Retour réel si possible
      if (index > 0) {
        const newIndex = index - 1;
        saveHistory(stack, newIndex);
        go(stack[newIndex]);
        return;
      }
  
      // Sinon : random simple (hors page courante)
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
  
      // Avance réelle si on a un futur (après un retour arrière)
      if (index < stack.length - 1) {
        const newIndex = index + 1;
        saveHistory(stack, newIndex);
        go(stack[newIndex]);
        return;
      }
  
      // Sinon : suivant smart (cycle sans répétition + anti-récent si possible)
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
  