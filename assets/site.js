(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function initTheme() {
    var button = document.createElement("button");
    button.className = "theme-toggle";
    button.type = "button";

    function apply(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      button.innerHTML = theme === "dark"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("title", button.getAttribute("aria-label"));
    }

    var saved = "dark";
    try {
      saved = localStorage.getItem("theme") || "dark";
    } catch (error) {}

    apply(saved);
    button.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (error) {}
      apply(next);
    });

    document.body.appendChild(button);
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initBibtex() {
    document.querySelectorAll("[data-bibtex-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-bibtex-toggle"));
        if (!target) return;
        var isOpen = target.classList.toggle("is-open");
        var icon = button.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-chevron-down", !isOpen);
          icon.classList.toggle("fa-chevron-up", isOpen);
        }
      });
    });
  }

  function initCardSpotlight() {
    document.querySelectorAll(".project-card, .pub-card").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width * 100) + "%");
        card.style.setProperty("--my", ((event.clientY - rect.top) / rect.height * 100) + "%");
      });
    });
  }

  function initHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var points = [];
    var raf = 0;

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(42, Math.min(90, Math.floor(window.innerWidth / 18)));
      points = Array.from({ length: count }, function (_, index) {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 1.2 + Math.random() * 2.8,
          phase: Math.random() * Math.PI * 2,
          speed: 0.001 + Math.random() * 0.0018,
          drift: (index % 2 ? 1 : -1) * (0.12 + Math.random() * 0.28)
        };
      });
    }

    function draw(time) {
      var width = window.innerWidth;
      var height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      var gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(94, 224, 214, 0.14)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.03)");
      gradient.addColorStop(1, "rgba(94, 224, 214, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      points.forEach(function (point, index) {
        var wobble = Math.sin(time * point.speed + point.phase);
        point.x += point.drift * 0.25;
        point.y += wobble * 0.08;
        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = index % 4 === 0 ? "rgba(255,255,255,0.52)" : "rgba(94,224,214,0.58)";
        ctx.fill();
      });

      ctx.lineWidth = 1;
      for (var i = 0; i < points.length; i += 1) {
        for (var j = i + 1; j < points.length; j += 1) {
          var dx = points[i].x - points[j].x;
          var dy = points[i].y - points[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 145) {
            ctx.strokeStyle = "rgba(94,224,214," + (0.14 * (1 - dist / 145)) + ")";
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    window.addEventListener("pagehide", function () {
      cancelAnimationFrame(raf);
    });
  }

  ready(function () {
    initTheme();
    initReveal();
    initBibtex();
    initCardSpotlight();
    initHeroCanvas();
  });
})();
