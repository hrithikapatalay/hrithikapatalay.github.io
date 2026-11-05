(function () {
  const S = window.SITE, CAPS = window.CAPABILITIES, P = window.PROJECTS;
  const CMAP = window.CAPABILITY_MAP || [], BRANDS = window.BRANDS || [];
  const capOf = Object.fromEntries(CAPS.map(c => [c.key, c]));
  const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MO = window.MOTION || null;
  const formatLabel = p => p.format === "Client" ? "Client project" : p.format;

  // ---------- static bits ----------
  $("#count-projects").textContent = P.length;
  $("#count-all").textContent = P.length;
  $("#year").textContent = new Date().getFullYear();
  $("#mail").href = "mailto:" + S.email;
  $("#cv").href = S.cv;
  $("#li").href = S.linkedin;
  $("#meet").href = S.meeting;

  // name or official logo (logos are only used for Hult case-study brands)
  const mark = (name, logo, cls) => logo
    ? `<img class="${cls}-logo" src="${esc(logo)}" alt="${esc(name)}">`
    : esc(name);
  const badges = p => [
    `<span class="chip">${esc(formatLabel(p))}</span>`,
    p.live ? `<span class="chip chip-live">Live brief</span>` : "",
  ].join("");

  // ---------- capability map ----------
  $("#cmap").innerHTML = CMAP.map((c, i) => `<li class="cm-row">
      <span class="cm-n">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="cm-name">${esc(c.name)}</h3>
      <ul class="cm-ev">${c.ev.map(e => {
        const tag = `<span class="src src-${e.src.toLowerCase()}">${esc(e.src)}</span>`;
        const live = e.live ? ` <span class="chip chip-live">Live brief</span>` : "";
        const body = e.slug && bySlug[e.slug]
          ? `<a href="#/work/${e.slug}" data-cursor="Open">${esc(e.text)}</a>`
          : esc(e.text);
        return `<li>${tag}<span>${body}${live}</span></li>`;
      }).join("")}</ul>
    </li>`).join("");

  // ---------- work tab: grid of everything ----------
  let filter = "all";
  const used = CAPS.filter(c => P.some(p => p.cap === c.key));
  const filters = [["all", "All", P.length], ...used.map(c => [c.key, c.name, P.filter(p => p.cap === c.key).length])];
  $("#filters").innerHTML = filters.map(([k, n, c]) =>
    `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${esc(n)}<span>${c}</span></button>`).join("");
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.f;
    $("#filters").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    renderGrid();
  });
  const order = (a, b) => (a.featured || 99) - (b.featured || 99) || b.year - a.year;
  function card(p) {
    const c = capOf[p.cap];
    return `<li class="card" style="--cap:${c.hue}"><a href="#/work/${p.slug}" data-cursor="View">
      <div class="cover"><div class="cover-cap"><span>${esc(c.name)}</span><span>${p.year}</span></div>
        <div><div class="cover-client">${mark(p.client, p.logo, "cover")}</div></div>
        <div class="cover-cap cover-chips">${badges(p)}</div></div>
      <div class="card-text"><h3>${esc(p.title)}</h3><p>${esc(p.module)}</p></div></a></li>`;
  }
  function renderGrid() {
    const list = (filter === "all" ? P : P.filter(p => p.cap === filter)).slice().sort(order);
    $("#grid").innerHTML = list.map(card).join("");
    if (MO) MO.onGrid($("#grid"));
  }
  renderGrid();

  // ---------- selected work: six Hult case studies ----------
  const six = P.filter(p => p.featured).sort((a, b) => a.featured - b.featured);
  $("#sel").innerHTML = six.map((p, i) => {
    const c = capOf[p.cap];
    return `<li class="sel-card" style="--cap:${c.hue}"><a href="#/work/${p.slug}" data-cursor="View">
      <div class="sel-cover">
        <div class="cover-cap"><span>${esc(c.name)}</span><span>${String(i + 1).padStart(2, "0")} of ${String(six.length).padStart(2, "0")}</span></div>
        <div class="sel-mid">
          <div class="sel-client">${mark(p.client, p.logo, "sel")}</div>
          <p class="sel-title">${esc(p.title)}</p>
        </div>
        <blockquote class="sel-quote"><p>“${esc(p.quote)}”</p><footer><span>Professor feedback</span><span class="sel-chips">${badges(p)}</span></footer></blockquote>
      </div></a></li>`;
  }).join("");

  // ---------- marquee ----------
  const run = BRANDS.map(b => `<span>${mark(b.name, b.logo, "mq")}</span><i></i>`).join("");
  $("#marquee").innerHTML = `<div class="marquee-run">${run}</div><div class="marquee-run">${run}</div>`;

  // ---------- project page ----------
  function renderProject(slug) {
    const i = P.findIndex(p => p.slug === slug);
    if (i < 0) return false;
    const list = P.slice().sort(order);
    const k = list.findIndex(p => p.slug === slug);
    const p = P[i], c = capOf[p.cap], next = list[(k + 1) % list.length];
    const pdf = p.pdf ? "reports/" + p.pdf : null;
    const credit = p.format === "Client" ? "" : "Professor feedback";
    $("#project").innerHTML = `
      <div class="p-cover" style="--cap:${c.hue}"><div class="p-cover-in">
        <a class="back" href="#/work">Back to all work</a>
        <p class="p-client">${esc(p.client)}${p.live ? ` <span class="chip chip-live">Live brief</span>` : ""}</p>
        <h1 class="p-title">${esc(p.title)}</h1>
      </div></div>
      <dl class="p-meta">
        <div><dt>Discipline</dt><dd>${esc(c.name)}</dd></div>
        <div><dt>${p.format === "Client" ? "Type" : "Module"}</dt><dd>${esc(p.module)}</dd></div>
        <div><dt>Format</dt><dd>${esc(formatLabel(p))}</dd></div>
        <div><dt>Year</dt><dd>${p.year}</dd></div>
      </dl>
      <div class="p-body" style="--cap:${c.hue}">
        <div>
          <p class="p-summary">${esc(p.summary)}</p>
          <section class="p-block"><h2>What I did</h2><ul>${p.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
        </div>
        <aside class="p-side">
          ${p.quote ? `<blockquote class="p-quote"><p>“${esc(p.quote)}”</p><footer>${credit}</footer></blockquote>` : ""}
          ${pdf ? `<a class="btn" href="${pdf}" target="_blank" rel="noopener">View full report</a>` : `<p class="p-note">The full report belongs to the client and is available on request.</p>`}
          <p class="p-role"><b>My role</b>${esc(p.role)}</p>
          <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
        </aside>
      </div>
      ${pdf ? `<section class="viewer"><h2>Full report</h2>
        <iframe src="${pdf}#view=FitH" title="${esc(p.client)} report" loading="lazy"></iframe>
        <p>If the report doesn't display on your device, <a href="${pdf}" target="_blank" rel="noopener">open the PDF in a new tab</a>.</p>
      </section>` : ""}
      <nav class="p-next" aria-label="Next project"><a href="#/work/${next.slug}"><small>Next project</small><strong>${esc(next.client)}</strong><span>${esc(next.title)}</span></a></nav>`;
    document.title = `${p.client}: ${p.title} — Hrithika Patalay`;
    if (MO) MO.onProject($("#project"));
    return true;
  }

  // ---------- router ----------
  // #/                 home
  // #/experience etc.  home, scrolled to that section
  // #/work             the Work tab: every project
  // #/work/<slug>      one project
  const homeTitle = document.title;
  let lastView = null;
  const viewOf = h => /^#\/work\/.+/.test(h) ? "project" : /^#\/work\/?$/.test(h) ? "archive" : "home";
  function show() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a1, b1] = h.split("/");
    const home = $("#home"), proj = $("#project"), arch = $("#archive");
    document.querySelectorAll(".bar nav a").forEach(x => x.removeAttribute("aria-current"));
    const v = viewOf(location.hash);
    if (v === "project" && renderProject(b1)) {
      home.hidden = true; arch.hidden = true; proj.hidden = false;
      MO ? MO.top() : window.scrollTo(0, 0);
      $('.bar nav a[href="#/work"]').setAttribute("aria-current", "true");
      lastView = "project"; if (MO) MO.refresh(() => MO.top());
      return;
    }
    if (v === "archive") {
      home.hidden = true; proj.hidden = true; arch.hidden = false;
      document.title = "All work — Hrithika Patalay";
      $('.bar nav a[href="#/work"]').setAttribute("aria-current", "true");
      MO ? MO.top() : window.scrollTo(0, 0);
      if (MO) { MO.onGrid($("#grid")); MO.refresh(() => MO.top()); }
      lastView = "archive";
      return;
    }
    const wasAway = lastView && lastView !== "home";
    proj.hidden = true; arch.hidden = true; home.hidden = false; document.title = homeTitle; lastView = "home";
    if (MO && (!a1 || wasAway)) MO.refresh();
    const target = a1 && document.getElementById(a1);
    if (target) {
      $(`.bar nav a[href="#/${a1}"]`)?.setAttribute("aria-current", "true");
      requestAnimationFrame(() => MO ? MO.scrollTo(target, wasAway) : target.scrollIntoView());
    } else MO ? MO.top() : window.scrollTo(0, 0);
  }
  function route() {
    const v = viewOf(location.hash);
    const switching = lastView && (v !== lastView || v === "project");
    if (MO && switching) MO.transition(show); else show();
  }
  window.addEventListener("hashchange", route);
  route();
  if (MO) MO.ready();

  const bar = $(".bar");
  window.addEventListener("scroll", () => bar.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
})();
