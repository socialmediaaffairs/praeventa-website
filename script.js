/* PRÄVENTA — Interaktionen: Scroll Experience, Mouse Effects, Consent */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Header: Zustand beim Scrollen */
  const header = document.querySelector(".site-header");
  let lastY = window.scrollY;

  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    if (y > 400 && y > lastY + 6) header.classList.add("is-hidden");
    else if (y < lastY - 6) header.classList.remove("is-hidden");
    lastY = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile Navigation */
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* Scroll Reveal (IntersectionObserver) */
  const revealTargets = document.querySelectorAll(
    ".reveal, .u-mark, [data-hl], .mission-shield, .deescalation-line, .nrw-map, .relief-scene, .value-item"
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );
  revealTargets.forEach((el) => io.observe(el));

  /* Leistungen: aktueller Block + Fortschritt */
  const serviceBlocks = document.querySelectorAll("[data-service]");
  const progressBars = document.querySelectorAll(".services-progress i");
  if (serviceBlocks.length) {
    const serviceIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            serviceBlocks.forEach((b) => b.classList.remove("is-current"));
            entry.target.classList.add("is-current");
            const idx = Array.from(serviceBlocks).indexOf(entry.target);
            progressBars.forEach((bar, i) => bar.classList.toggle("is-active", i <= idx));
          }
        });
      },
      { rootMargin: "-38% 0px -38% 0px" }
    );
    serviceBlocks.forEach((b) => serviceIO.observe(b));
  }

  /* Prozess-Timeline */
  const processTrack = document.querySelector("[data-process]");
  if (processTrack) {
    const steps = processTrack.querySelectorAll("[data-step]");
    const processIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processTrack.classList.add("in-view");
            steps.forEach((step, i) =>
              setTimeout(() => step.classList.add("is-lit"), prefersReducedMotion ? 0 : 250 * i)
            );
            processIO.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    processIO.observe(processTrack);
  }
  /* Scroll-Parallax */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !prefersReducedMotion) {
    let ticking = false;
    function applyParallax() {
      parallaxEls.forEach((el) => {
        const factor = parseFloat(el.dataset.parallax) || 0.1;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * factor;
        el.style.transform = "translateY(" + (-offset).toFixed(1) + "px)";
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(applyParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    applyParallax();
  }

  /* Mouse-Parallax — nur Desktop */
  const mouseEls = document.querySelectorAll("[data-mouse-parallax]");
  if (mouseEls.length && finePointer && !prefersReducedMotion) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
    (function loopMouse() {
      cx += (mx - cx) * 0.045;
      cy += (my - cy) * 0.045;
      mouseEls.forEach((el) => {
        const depth = parseFloat(el.dataset.mouseParallax) || 10;
        el.style.transform =
          "translate(" + (cx * depth).toFixed(2) + "px," + (cy * depth).toFixed(2) + "px)";
      });
      requestAnimationFrame(loopMouse);
    })();
  }

  /* Magnetic Buttons — nur Desktop */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.18 + "px," + y * 0.22 + "px)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        btn.style.transform = "";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });
  }

  /* Custom Cursor — nur Desktop */
  const cursor = document.querySelector(".cursor-dot");
  if (cursor && finePointer && !prefersReducedMotion) {
    document.body.classList.add("has-cursor");
    const label = cursor.querySelector(".cursor-label");
    let tx = -100, ty = -100, px = -100, py = -100;

    window.addEventListener(
      "mousemove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    (function loopCursor() {
      px += (tx - px) * 0.22;
      py += (ty - py) * 0.22;
      cursor.style.transform = "translate(" + px + "px," + py + "px) translate(-50%,-50%)";
      requestAnimationFrame(loopCursor);
    })();

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        if (label) label.textContent = el.dataset.cursor || "→";
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        if (label) label.textContent = "";
      });
    });
  }

  /* Cookie Consent — keine Cookies ohne Zustimmung */
  const banner = document.getElementById("cookieBanner");
  if (banner) {
    const KEY = "praeventa_consent_v1";
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* Storage nicht verfügbar */ }

    if (!stored) {
      setTimeout(() => banner.classList.add("is-visible"), 1200);
    }

    function saveConsent(value) {
      try { localStorage.setItem(KEY, JSON.stringify({ v: value, t: Date.now() })); } catch (e) {}
      banner.classList.remove("is-visible");
      /* Hier später: Statistik-Skripte NUR laden, wenn value.stats === true */
    }

    banner.querySelectorAll("[data-consent]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.consent;
        if (mode === "all") saveConsent({ necessary: true, stats: true });
        else if (mode === "necessary") saveConsent({ necessary: true, stats: false });
      });
    });

    const toggle = banner.querySelector("[data-consent-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const showing = banner.classList.toggle("show-options");
        if (showing) {
          toggle.textContent = "Auswahl speichern";
        } else {
          const stats = !!document.getElementById("consentStats")?.checked;
          saveConsent({ necessary: true, stats: stats });
        }
      });
    }
  }

  /* Kontaktformular (Opt-in-Validierung + Versand über Web3Forms) */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("formStatus");
      const consent = document.getElementById("privacyConsent");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (!consent.checked) {
        status.className = "form-status err";
        status.textContent = "Bitte bestätigen Sie die Datenschutzerklärung, damit wir Ihre Anfrage bearbeiten dürfen.";
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      data.delete("privacyConsent");
      data.set("subject", data.get("subject") || "Neue Anfrage über die PRÄVENTA-Website");
      data.set("Datenschutz-Einwilligung", "Ja, erteilt am " + new Date().toLocaleString("de-DE"));

      submitBtn.disabled = true;
      status.className = "form-status";
      status.textContent = "Ihre Anfrage wird gesendet …";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            status.className = "form-status ok";
            status.textContent = "Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.";
            form.reset();
          } else {
            throw new Error(json.message || "Unbekannter Fehler");
          }
        })
        .catch(() => {
          status.className = "form-status err";
          status.textContent = "Leider konnte Ihre Anfrage nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@praeventa-praevention.de.";
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    });
  }

  /* Jahr im Footer */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
