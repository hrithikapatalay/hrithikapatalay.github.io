// Motion layer: smooth scroll, loader, reveals, cursor, page transitions.
// Everything here is optional; the site works without it and with reduced motion.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasLibs = window.gsap && window.ScrollTrigger;
  if (reduce || !hasLibs) {
    document.documentElement.classList.add("no-motion");
    return; // app.js falls back to plain behaviour
  }
  document.documentElement.classList.add("motion");
  const gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const EASE = "expo.out";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // ---------- smooth scroll ----------
  let lenis = null;
  if (window.Lenis) {
    // slower, calmer scroll: lower lerp and a reduced wheel multiplier
    lenis = new window.Lenis({ lerp: 0.075, wheelMultiplier: 0.7, touchMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- helpers ----------
  function splitWords(el) {
    if (el.dataset.split) return $$(".w > span", el);
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    el.innerHTML = text.trim().split(/\s+/).map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(" ");
    el.dataset.split = "1";
    return $$(".w > span", el);
  }
  function revealHeading(el, delay = 0) {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    ST.create({ trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.06, delay }) });
  }
  function fadeUp(els, opts = {}) {
    els.forEach(el => {
      gsap.set(el, { y: 40, opacity: 0 });
      ST.create({ trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: EASE, delay: opts.delay || 0 }) });
    });
  }

  // ---------- loader + hero intro ----------
  function intro() {
    const loader = $(".loader");
    const lines = $$(".hero-line span");
    const linesInner = lines.map(l => { l.innerHTML = `<span class="hl">${l.textContent}</span>`; return l.firstChild; });
    gsap.set(linesInner, { yPercent: 115 });
    gsap.set(".hero-foot", { opacity: 0, y: 30 });
    gsap.set(".bar", { yPercent: -100 });
    let seen = false;
    try { seen = sessionStorage.getItem("hp-seen") === "1"; sessionStorage.setItem("hp-seen", "1"); } catch (e) {}
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    if (!seen && loader) {
      const n = { v: 0 };
      tl.to(".loader-name", { opacity: 1, y: 0, duration: .8 }, 0)
        .to(n, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => { $("#loader-n").textContent = Math.round(n.v); } }, 0)
        .to(loader, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=.1")
        .set(loader, { display: "none" });
    } else if (loader) {
      loader.style.display = "none";
    }
    tl.to(linesInner, { yPercent: 0, duration: 1.3, stagger: .1 }, seen ? 0 : "-=.55")
      .to(".bar", { yPercent: 0, duration: 1 }, "<.2")
      .to(".hero-foot", { opacity: 1, y: 0, duration: 1 }, "<.3");
    // count up the ledger figure
    const cnt = $("#count-projects"); const target = +cnt.textContent; const c = { v: 0 };
    tl.to(c, { v: target, duration: 1.4, ease: "power3.out", onUpdate: () => { cnt.textContent = Math.round(c.v); } }, "<");

    // gentle drift of hero lines while scrolling away
    gsap.to(lines[0], { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(lines[2], { xPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  // ---------- marquee with scroll velocity ----------
  function marquee() {
    const track = $("#marquee"); if (!track) return;
    let x = 0, speed = 0.6, boost = 0, w = 0;
    const measure = () => { w = track.firstElementChild ? track.firstElementChild.offsetWidth : 0; };
    measure(); window.addEventListener("resize", measure);
    if (lenis) lenis.on("scroll", e => { boost = Math.min(Math.abs(e.velocity) * 0.25, 8); });
    gsap.ticker.add(() => {
      x -= speed + boost; boost *= 0.92;
      if (w && -x >= w) x += w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  // ---------- capability map ----------
  function capabilities() {
    $$(".cm-row").forEach((li, i) => {
      gsap.set(li, { opacity: 0, y: 26 });
      ST.create({ trigger: li, start: "top 92%", once: true, onEnter: () => {
        gsap.to(li, { opacity: 1, y: 0, duration: .9, ease: EASE, delay: (i % 3) * .05 });
        gsap.from($$(".cm-ev li", li), { x: 18, opacity: 0, duration: .8, ease: EASE, stagger: .07, delay: .15 });
      } });
    });
  }

  // ---------- experience ----------
  function experience() {
    // count-up figures
    $$(".xp-stats b[data-count]").forEach(b => {
      const to = +b.dataset.count, pre = b.dataset.pre || "", suf = b.dataset.suf || "", o = { v: 0 };
      b.textContent = pre + "0" + suf;
      ST.create({ trigger: b, start: "top 90%", once: true, onEnter: () =>
        gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", onUpdate: () => { b.textContent = pre + Math.round(o.v) + suf; } }) });
    });
    fadeUp($$(".xp-stats li"));
    // the loop draws itself, then each step lights up in order
    const draw = $(".loop-draw"), steps = $$(".loop-steps li");
    if (draw) {
      gsap.set(draw, { strokeDashoffset: 1 });
      gsap.set(steps, { opacity: 0, scale: .9 });
      gsap.set(".loop-core", { opacity: 0 });
      ST.create({ trigger: ".loop", start: "top 75%", once: true, onEnter: () => {
        gsap.timeline()
          .to(draw, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" })
          .to(steps, { opacity: 1, scale: 1, duration: .6, ease: "back.out(1.6)", stagger: .3 }, .1)
          .to(".loop-core", { opacity: 1, duration: .8 }, "-=.4");
      } });
    }
    const week = $$(".week li");
    gsap.set(week, { opacity: 0, x: -20 });
    ST.create({ trigger: ".week", start: "top 85%", once: true,
      onEnter: () => gsap.to(week, { opacity: 1, x: 0, duration: .8, ease: EASE, stagger: .12 }) });
    fadeUp($$(".month, .plays li, .xp-role, .xp-more"));
    const more = $(".xp-more");
    if (more) more.addEventListener("toggle", () => { if (lenis) lenis.resize(); ST.refresh(); });
  }
  function toggle(body, open) {
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: .7, ease: "expo.out", onComplete: () => { body.style.height = ""; ST.refresh(); } });
      gsap.from($$("blockquote, .cap-mods li, .cap-proj a", body), { y: 16, opacity: 0, duration: .6, stagger: .03, ease: EASE, delay: .1 });
    } else {
      gsap.to(body, { height: 0, opacity: 0, duration: .45, ease: "power3.inOut", onComplete: () => { body.hidden = true; body.style.height = ""; ST.refresh(); } });
    }
  }

  // ---------- selected work: native side-scroll carousel (no scroll-jacking) ----------
  function selected() {
    const cards = $$(".sel-card");
    gsap.set(cards, { opacity: 0, x: 60 });
    ST.create({ trigger: ".selected", start: "top 85%", once: true,
      onEnter: () => gsap.to(cards, { opacity: 1, x: 0, duration: 1.1, ease: EASE, stagger: .08 }) });
  }

  // ---------- grid ----------
  function onGrid(grid) {
    const cards = $$(".card", grid);
    gsap.fromTo(cards, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: EASE, stagger: .05, clearProps: "transform" });
    if (fine) cards.forEach(tilt);
    requestAnimationFrame(() => ST.refresh());
  }
  function tilt(card) {
    const cover = $(".cover", card); if (!cover) return;
    const qx = gsap.quickTo(cover, "rotationY", { duration: .6, ease: "power3" });
    const qy = gsap.quickTo(cover, "rotationX", { duration: .6, ease: "power3" });
    card.addEventListener("mousemove", e => {
      const r = cover.getBoundingClientRect();
      qx(((e.clientX - r.left) / r.width - .5) * 8);
      qy(-((e.clientY - r.top) / r.height - .5) * 8);
    });
    card.addEventListener("mouseleave", () => { qx(0); qy(0); });
  }

  // ---------- custom cursor ----------
  function cursor() {
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");
    const dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-label");
    const dx = gsap.quickTo(dot, "x", { duration: .15, ease: "power3" }), dy = gsap.quickTo(dot, "y", { duration: .15, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: .5, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: .5, ease: "power3" });
    gsap.set([dot, ring], { opacity: 0 });
    let shown = false;
    window.addEventListener("mousemove", e => {
      if (!shown) { shown = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); gsap.to([dot, ring], { opacity: 1, duration: .3 }); }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener("click", e => {
      const row = e.target.closest(".cap-row");
      if (row) label.textContent = row.getAttribute("aria-expanded") === "true" ? "Close" : "Open";
    });
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-cursor], a, button");
      const root = document.documentElement;
      root.classList.remove("cur-label", "cur-link");
      if (!t) return;
      const txt = t.dataset.cursor || (t.classList.contains("cap-row") ? (t.getAttribute("aria-expanded") === "true" ? "Close" : "Open") : "");
      if (txt) { label.textContent = txt; root.classList.add("cur-label"); }
      else root.classList.add("cur-link");
    });
    document.addEventListener("mouseleave", () => gsap.to([dot, ring], { opacity: 0 }));
    document.addEventListener("mouseenter", () => gsap.to([dot, ring], { opacity: 1 }));
  }

  // ---------- magnetic buttons ----------
  function magnetic(root = document) {
    if (!fine) return;
    $$(".btn", root).forEach(b => {
      if (b.dataset.mag) return; b.dataset.mag = "1";
      const qx = gsap.quickTo(b, "x", { duration: .5, ease: "elastic.out(1, .4)" });
      const qy = gsap.quickTo(b, "y", { duration: .5, ease: "elastic.out(1, .4)" });
      b.addEventListener("mousemove", e => {
        const r = b.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .4);
      });
      b.addEventListener("mouseleave", () => { qx(0); qy(0); });
    });
  }

  // ---------- page transitions ----------
  let busy = false;
  function transition(swap) {
    if (busy) { swap(); return; }
    busy = true;
    const c = $(".curtain");
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(c, { display: "block", yPercent: 100 })
      .to(c, { yPercent: 0, duration: .65, ease: "expo.inOut" })
      .add(() => swap())
      .to(c, { yPercent: -100, duration: .75, ease: "expo.inOut" }, "+=.05")
      .set(c, { display: "none" });
  }
  function onProject(root) {
    ST.getAll().forEach(t => { if (t.trigger && !document.body.contains(t.trigger)) t.kill(); });
    const title = $(".p-title", root);
    const words = splitWords(title);
    gsap.set(words, { yPercent: 115 });
    gsap.timeline({ delay: .55 })
      .from($(".p-client", root), { y: 20, opacity: 0, duration: .8, ease: EASE })
      .to(words, { yPercent: 0, duration: 1.2, ease: EASE, stagger: .05 }, "<.1")
      .from($$(".p-meta > div", root), { y: 24, opacity: 0, duration: .8, ease: EASE, stagger: .06 }, "<.3");
    fadeUp($$(".p-summary, .p-block li, .p-quote, .p-side .btn, .p-role, .viewer, .p-next", root));
    gsap.to($(".p-cover-in", root), { yPercent: 18, opacity: .4, ease: "none",
      scrollTrigger: { trigger: $(".p-cover", root), start: "top top", end: "bottom top", scrub: true } });
    magnetic(root);
  }

  // ---------- misc reveals ----------
  function sections() {
    $$("#home .section-head h2, .contact h2").forEach(h => revealHeading(h));
    fadeUp($$("#home .section-head p, .sel-more, .contact p, .contact-links"));
    gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  }

  function scrollTo(el, fromProject) {
    ST.refresh();
    if (lenis) lenis.resize();
    const y = el.getBoundingClientRect().top + window.scrollY - 20;
    if (lenis) lenis.scrollTo(y, { immediate: !!fromProject, force: true, duration: 1.6 });
    else window.scrollTo(0, y);
  }
  function top() {
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    if (lenis) lenis.start();
    if (lenis) { lenis.resize(); lenis.scrollTo(0, { immediate: true, force: true }); }
  }
  function refresh(cb) { requestAnimationFrame(() => { if (lenis) lenis.resize(); ST.refresh(); if (cb) cb(); }); }

  window.MOTION = {
    toggle, onGrid, onProject, transition, scrollTo, top, refresh,
    ready() {
      intro(); marquee(); experience(); capabilities(); selected(); sections(); cursor(); magnetic();
      const fix = () => { ST.refresh(); if (!$("#project").hidden) top(); };
      fix(); setTimeout(fix, 400);
      document.fonts && document.fonts.ready.then(fix);
    },
  };
})();
