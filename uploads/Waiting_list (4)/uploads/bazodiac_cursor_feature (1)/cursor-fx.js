/**
 * BAZODIAC Cursor FX — portable implementation.
 * No dependency required. GSAP is not required; RAF lerp approximates the original
 * GSAP timings: dot ≈ 0.1s, ring ≈ 0.2s, nebula lens ≈ 1.2s.
 */
(function () {
  const DEFAULTS = {
    root: document.body,
    autoCreate: true,
    dotSelector: "#custom-cursor, .cursorfx-dot",
    ringSelector: "#cursor-ring, .cursorfx-ring",
    lensSelector: "#nebula-lens, .cursorfx-nebula-lens",
    vignetteSelector: "#vignette, .cursorfx-vignette",
    grain: true,
    interactiveSelector: "a, button, [role='button'], .interactive",
    dotLerp: 0.45,
    ringLerp: 0.24,
    lensLerp: 0.045
  };

  function createLayer(className, id) {
    const el = document.createElement("div");
    if (id) el.id = id;
    el.className = className;
    document.body.appendChild(el);
    return el;
  }

  function setTransform(el, x, y) {
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  function isFinePointer() {
    return window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initCursorFX(options = {}) {
    const cfg = { ...DEFAULTS, ...options };
    if (!isFinePointer()) return { destroy() {} };

    const root = cfg.root || document.body;
    root.classList.add("cursorfx-enabled");

    let dot = document.querySelector(cfg.dotSelector);
    let ring = document.querySelector(cfg.ringSelector);
    let lens = document.querySelector(cfg.lensSelector);
    let vignette = document.querySelector(cfg.vignetteSelector);
    let grain = document.querySelector(".cursorfx-film-grain");

    if (cfg.autoCreate) {
      if (cfg.grain && !grain) grain = createLayer("cursorfx-film-grain");
      if (!vignette) vignette = createLayer("cursorfx-vignette", "vignette");
      if (!lens) lens = createLayer("cursorfx-nebula-lens", "nebula-lens");
      if (!dot) dot = createLayer("cursorfx-dot", "custom-cursor");
      if (!ring) ring = createLayer("cursorfx-ring", "cursor-ring");
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { ...target };
    const ringPos = { ...target };
    const lensPos = { ...target };
    let hasPointer = false;
    let raf = 0;

    function reveal() {
      if (hasPointer) return;
      hasPointer = true;
      [dot, ring, lens].forEach((el) => {
        if (el) el.style.opacity = "1";
      });
    }

    function onPointerMove(e) {
      target.x = e.clientX;
      target.y = e.clientY;
      root.style.setProperty("--cursorfx-x", `${e.clientX}px`);
      root.style.setProperty("--cursorfx-y", `${e.clientY}px`);
      reveal();
    }

    function bindInteractive(el) {
      el.addEventListener("mouseenter", onInteractiveEnter);
      el.addEventListener("mouseleave", onInteractiveLeave);
    }

    function unbindInteractive(el) {
      el.removeEventListener("mouseenter", onInteractiveEnter);
      el.removeEventListener("mouseleave", onInteractiveLeave);
    }

    function onInteractiveEnter() {
      if (ring) ring.classList.add("is-active", "active");
    }

    function onInteractiveLeave() {
      if (ring) ring.classList.remove("is-active", "active");
    }

    const interactive = Array.from(document.querySelectorAll(cfg.interactiveSelector));
    interactive.forEach(bindInteractive);

    function tick() {
      dotPos.x += (target.x - dotPos.x) * cfg.dotLerp;
      dotPos.y += (target.y - dotPos.y) * cfg.dotLerp;
      ringPos.x += (target.x - ringPos.x) * cfg.ringLerp;
      ringPos.y += (target.y - ringPos.y) * cfg.ringLerp;
      lensPos.x += (target.x - lensPos.x) * cfg.lensLerp;
      lensPos.y += (target.y - lensPos.y) * cfg.lensLerp;

      setTransform(dot, dotPos.x, dotPos.y);
      setTransform(ring, ringPos.x, ringPos.y);
      setTransform(lens, lensPos.x, lensPos.y);

      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return {
      destroy() {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        interactive.forEach(unbindInteractive);
        root.classList.remove("cursorfx-enabled");
      }
    };
  }

  class ConnectedCursorVortex {
    constructor(canvasOrSelector, config = {}) {
      this.canvas = typeof canvasOrSelector === "string"
        ? document.querySelector(canvasOrSelector)
        : canvasOrSelector;
      if (!this.canvas || !this.canvas.getContext) return;

      this.ctx = this.canvas.getContext("2d");
      this.nodes = [];
      this.mouse = { x: -2000, y: -2000 };
      this.config = {
        nodeCount: window.innerWidth < 768 ? 40 : 90,
        attractRadius: 450,
        tangentForce: 0.75,
        friction: 0.96,
        baseSpeed: 0.12,
        cursorLineColor: "99, 102, 241",
        dotColor: "212, 175, 55",
        maxCursorAlpha: 0.28,
        ...config
      };

      this.onResize = this.resize.bind(this);
      this.onMove = this.handlePointerMove.bind(this);
      this.resize();
      window.addEventListener("resize", this.onResize);
      window.addEventListener("pointermove", this.onMove, { passive: true });
      this.seed();
      this.animate();
    }

    resize() {
      const parent = this.canvas.parentElement || this.canvas;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }

    seed() {
      this.nodes.length = 0;
      for (let i = 0; i < this.config.nodeCount; i++) {
        this.nodes.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5
        });
      }
    }

    handlePointerMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.w, this.h);

      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        const dx = this.mouse.x - n.x;
        const dy = this.mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < this.config.attractRadius) {
          const pct = 1 - dist / this.config.attractRadius;
          n.vx += dx * pct * 0.003;
          n.vy += dy * pct * 0.003;
          n.vx += (dy / dist) * this.config.tangentForce * pct;
          n.vy -= (dx / dist) * this.config.tangentForce * pct;

          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${this.config.cursorLineColor}, ${pct * this.config.maxCursorAlpha})`;
          this.ctx.lineWidth = 0.7;
          this.ctx.moveTo(n.x, n.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }

        n.x += n.vx + this.config.baseSpeed;
        n.y += n.vy;
        n.vx *= this.config.friction;
        n.vy *= this.config.friction;

        if (n.x > this.w) n.x = 0;
        if (n.x < 0) n.x = this.w;
        if (n.y > this.h) n.y = 0;
        if (n.y < 0) n.y = this.h;

        this.ctx.fillStyle = `rgba(${this.config.dotColor}, 0.6)`;
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.raf = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("pointermove", this.onMove);
    }
  }

  window.BazodiacCursorFX = { init: initCursorFX, ConnectedCursorVortex };

  if (document.currentScript?.dataset.autoInit !== "false") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => initCursorFX());
    } else {
      initCursorFX();
    }
  }
})();
