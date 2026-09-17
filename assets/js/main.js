// اسلام اور سائنس — عمومی صفحہ سکرپٹ (سوال جواب کھولنا/بند کرنا، پرنٹ، ریڈنگ کنٹرولز)
(function () {
  "use strict";

  // Expand/collapse for any .qa-item (short questions, essay bank, revision FAQs)
  function initQAToggles() {
    document.querySelectorAll(".qa-question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".qa-item");
        if (!item) return;
        var wasOpen = item.classList.contains("open");
        item.classList.toggle("open");
        btn.setAttribute("aria-expanded", (!wasOpen).toString());
      });
    });

    var expandAllBtn = document.querySelector("[data-action='expand-all']");
    var collapseAllBtn = document.querySelector("[data-action='collapse-all']");
    if (expandAllBtn) {
      expandAllBtn.addEventListener("click", function () {
        document.querySelectorAll(".qa-item").forEach(function (item) {
          item.classList.add("open");
          var b = item.querySelector(".qa-question");
          if (b) b.setAttribute("aria-expanded", "true");
        });
      });
    }
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener("click", function () {
        document.querySelectorAll(".qa-item").forEach(function (item) {
          item.classList.remove("open");
          var b = item.querySelector(".qa-question");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  // Mini MCQ reveal-answer buttons on topic pages (non-interactive quiz, just show correct option)
  function initMiniMcqReveal() {
    document.querySelectorAll(".mcq-mini .reveal-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wrap = btn.closest(".mcq-mini");
        var body = wrap.querySelector(".mcq-body");
        if (body) {
          body.hidden = false;
        }
        btn.hidden = true;
      });
    });
  }

  // Print button
  function initPrint() {
    document.querySelectorAll("[data-action='print']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.print();
      });
    });
  }

  // Reading controls: font-size +/- and reset, persisted only for this page view (in-memory)
  function initReadingControls() {
    var root = document.querySelector(".article");
    if (!root) return;
    var sizeSteps = [17, 19, 21, 23, 25];
    var current = 1; // matches default 19px set in CSS body

    function apply() {
      root.style.fontSize = sizeSteps[current] + "px";
    }

    var incBtn = document.querySelector("[data-action='font-increase']");
    var decBtn = document.querySelector("[data-action='font-decrease']");
    var resetBtn = document.querySelector("[data-action='font-reset']");

    if (incBtn) incBtn.addEventListener("click", function () {
      current = Math.min(current + 1, sizeSteps.length - 1);
      apply();
    });
    if (decBtn) decBtn.addEventListener("click", function () {
      current = Math.max(current - 1, 0);
      apply();
    });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      current = 1;
      apply();
    });
  }

  // Current year in footer
  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQAToggles();
    initMiniMcqReveal();
    initPrint();
    initReadingControls();
    initYear();
  });
})();
