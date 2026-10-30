(function () {
  const S = window.SITE, CAPS = window.CAPABILITIES, P = window.PROJECTS, M = window.MODULES;
  const capOf = Object.fromEntries(CAPS.map(c => [c.key, c]));
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pos = g => Math.max(0, Math.min(100, (g - 80) / 20 * 100));
  const MO = window.MOTION || null;

  // ---------- static bits ----------
  $("#count-projects").textContent = P.length;
  $("#year").textContent = new Date().getFullYear();
  $("#mail").href = "mailto:" + S.email;
  $("#cv").href = S.cv;
  $("#li").href = S.linkedin;
  $("#meet").href = S.meeting;

  // ---------- capability index ----------
  $("#index").innerHTML = CAPS.map((c, i) => {
    const grades = c.modules.map(m => m[1]);
    const lo = Math.min(...grades), hi = Math.max(...grades);
    const projects = P.filter(p => p.cap === c.key);
    return `<li class="cap" style="--cap:${c.hue}">
      <button class="cap-row" aria-expanded="false" aria-controls="cap-${c.key}">
        <span class="cap-name">${esc(c.name)}<small>${c.modules.length} module${c.modules.length > 1 ? "s" : ""}, ${projects.length} projects</small></span>
        <span class="scale" aria-hidden="true">
          <span class="range" style="left:${pos(lo)}%;width:${Math.max(pos(hi) - pos(lo), 0.6)}%"></span>
          ${grades.map(g => `<span class="dot" style="left:${pos(g)}%"></span>`).join("")}
          ${i === 0 ? `<span class="tick" style="left:0">80</span><span class="tick" style="left:50%">90</span><span class="tick" style="left:100%">100</span>` : ""}
        </span>
        <span class="cap-top">${hi}%<span>top mark</span></span>
        <span class="chev" aria-hidden="true"></span>
      </button>
      <div class="cap-body" id="cap-${c.key}" hidden>
        <div>
          <p style="margin-bottom:22px">${esc(c.line)}</p>
          <blockquote><p>"${esc(c.quote)}"</p><footer>Professor feedback, ${esc(c.source)}</footer></blockquote>
        </div>
        <div>
          <ul class="cap-mods">${c.modules.map(m => `<li><span>${esc(m[0])}</span><b>${m[1]}%</b></li>`).join("")}</ul>
          <div class="cap-proj">${projects.map(p => `<a href="#/work/${p.slug}">${esc(p.client)}</a>`).join("")}</div>
        </div>
      </div>
    </li>`;
  }).join("");
  $("#index").addEventListener("click", e => {
    const b = e.target.closest(".cap-row"); if (!b) return;
    const open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    const body = $("#" + b.getAttribute("aria-controls"));
    if (MO) MO.toggle(body, !open); else body.hidden = open;
  });

  // ---------- work grid ----------
  let filter = "all";
  const filters = [["all", "All", P.length],
    ...CAPS.map(c => [c.key, c.name, P.filter(p => p.cap === c.key).length])];
  $("#filters").innerHTML = filters.map(([k, n, c]) =>
    `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${esc(n)}<span>${c}</span></button>`).join("");
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.f;
    $("#filters").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    renderGrid();
  });
  const order = (a, b) => (b.grade || 0) - (a.grade || 0);
  function card(p) {
    const c = capOf[p.cap];
    const grade = p.grade ? `<span class="cover-grade">${p.grade}%</span>` : `<span class="cover-grade none">Classwork</span>`;
    return `<li class="card" style="--cap:${c.hue}"><a href="#/work/${p.slug}" data-cursor="View">
      <div class="cover"><div class="cover-cap"><span>${esc(c.name)}</span><span>${p.year}</span></div>
        <div><div class="cover-client">${esc(p.client)}</div></div>
        <div class="cover-cap"><span>${esc(p.format)}</span>${grade}</div></div>
      <div class="card-text"><h3>${esc(p.title)}</h3><p>${esc(p.module)}</p></div></a></li>`;
  }
  function renderGrid() {
    const list = filter === "all" ? P.slice().sort(order) : P.filter(p => p.cap === filter).sort(order);
    $("#grid").innerHTML = list.map(card).join("");
    if (MO) MO.onGrid($("#grid"));
  }
  renderGrid();

  // ---------- selected work (horizontal track) ----------
  $("#sel").innerHTML = P.filter(p => p.featured).map((p, i, all) => {
    const c = capOf[p.cap];
    return `<li class="sel-card" style="--cap:${c.hue}"><a href="#/work/${p.slug}" data-cursor="View">
      <div class="sel-cover">
        <div class="cover-cap"><span>${esc(c.name)}</span><span>${String(i + 1).padStart(2, "0")} of ${String(all.length).padStart(2, "0")}</span></div>
        <div class="sel-client">${esc(p.client)}</div>
        <div class="cover-cap"><span>${esc(p.title)}</span>${p.grade ? `<span class="cover-grade">${p.grade}%</span>` : `<span class="cover-grade none">Classwork</span>`}</div>
      </div></a></li>`;
  }).join("");

  // ---------- marquee ----------
  const names = ["Bentley Motors", "Canada Goose", "vivo", "Airbnb", "Spotify", "Stella McCartney", "H&M", "Tesco", "Nykaa", "Reliance Jio", "BuzzBallz", "Long Lane", "DS Smith", "Jude's", "IKEA", "upGrad", "Monday.com", "JoJo's Vineyard", "FRED"];
  const run = names.map(n => `<span>${esc(n)}</span><i></i>`).join("");
  $("#marquee").innerHTML = `<div class="marquee-run">${run}</div><div class="marquee-run">${run}</div>`;

  // ---------- modules ----------
  $("#modules").innerHTML = M.map(([n, g]) =>
    `<li><span>${esc(n)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${pos(g)}%"></span></span><b>${g}%</b></li>`).join("");

  // ---------- project page ----------
  function renderProject(slug) {
    const i = P.findIndex(p => p.slug === slug);
    if (i < 0) return false;
    const p = P[i], c = capOf[p.cap], next = P[(i + 1) % P.length];
    const pdf = "reports/" + p.pdf;
    const gradeCell = p.grade
      ? `<div><dt>Module grade</dt><dd class="grade">${p.grade}%</dd></div>`
      : `<div><dt>Grade</dt><dd>Ungraded classwork</dd></div>`;
    $("#project").innerHTML = `
      <div class="p-cover" style="--cap:${c.hue}"><div class="p-cover-in">
        <a class="back" href="#/work">Back to all work</a>
        <p class="p-client">${esc(p.client)}</p>
        <h1 class="p-title">${esc(p.title)}</h1>
      </div></div>
      <dl class="p-meta">
        <div><dt>Capability</dt><dd>${esc(c.name)}</dd></div>
        <div><dt>Module</dt><dd>${esc(p.module)}</dd></div>
        ${gradeCell}
        <div><dt>Format</dt><dd>${esc(p.format)}</dd></div>
        <div><dt>Year</dt><dd>${p.year}</dd></div>
      </dl>
      <div class="p-body" style="--cap:${c.hue}">
        <div>
          <p class="p-summary">${esc(p.summary)}</p>
          <section class="p-block"><h2>What I did</h2><ul>${p.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
        </div>
        <aside class="p-side">
          ${p.quote ? `<blockquote class="p-quote"><p>"${esc(p.quote)}"</p><footer>Professor feedback${p.grade ? `, module grade ${p.grade}%` : ""}</footer></blockquote>` : ""}
          <a class="btn" href="${pdf}" target="_blank" rel="noopener">View full report</a>
          <p class="p-role"><b>My role</b>${esc(p.role)}</p>
          <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
        </aside>
      </div>
      <section class="viewer"><h2>Full report</h2>
        <iframe src="${pdf}#view=FitH" title="${esc(p.client)} report" loading="lazy"></iframe>
        <p>If the report doesn't display on your device, <a href="${pdf}" target="_blank" rel="noopener">open the PDF in a new tab</a>.</p>
      </section>
      <nav class="p-next" aria-label="Next project"><a href="#/work/${next.slug}"><small>Next project</small><strong>${esc(next.client)}</strong><span>${esc(next.title)}</span></a></nav>`;
    document.title = `${p.client}: ${p.title} — Hrithika Patalay`;
    if (MO) MO.onProject($("#project"));
    return true;
  }

  // ---------- router ----------
  const homeTitle = document.title;
  let lastView = null;
  function show() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a1, b1] = h.split("/");
    const home = $("#home"), proj = $("#project");
    document.querySelectorAll(".bar nav a").forEach(x => x.removeAttribute("aria-current"));
    if (a1 === "work" && b1 && renderProject(b1)) {
      home.hidden = true; proj.hidden = false;
      MO ? MO.top() : window.scrollTo(0, 0);
      $('.bar nav a[href="#/work"]').setAttribute("aria-current", "true");
      lastView = "project"; if (MO) MO.refresh(() => MO.top());
      return;
    }
    const wasProject = lastView === "project";
    proj.hidden = true; home.hidden = false; document.title = homeTitle; lastView = "home";
    if (MO && !a1) MO.refresh();
    const target = a1 && document.getElementById(a1);
    if (target) {
      $(`.bar nav a[href="#/${a1}"]`)?.setAttribute("aria-current", "true");
      requestAnimationFrame(() => MO ? MO.scrollTo(target, wasProject) : target.scrollIntoView());
    } else MO ? MO.top() : window.scrollTo(0, 0);
  }
  function route() {
    const goingToProject = /^#\/work\/.+/.test(location.hash);
    const switching = lastView && ((goingToProject && lastView === "home") || (!goingToProject && lastView === "project") || (goingToProject && lastView === "project"));
    if (MO && switching) MO.transition(show); else show();
  }
  window.addEventListener("hashchange", route);
  route();
  if (MO) MO.ready();

  const bar = $(".bar");
  window.addEventListener("scroll", () => bar.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
})();
