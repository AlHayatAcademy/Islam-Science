// اسلام اور سائنس — کلائنٹ سائیڈ سرچ (بغیر سرور/ڈیٹا بیس)
(function () {
  "use strict";

  function buildIndex() {
    var index = [];
    if (window.TOPICS) {
      window.TOPICS.forEach(function (t) {
        if (!t.available) return;
        index.push({
          type: "موضوع",
          title: "موضوع " + t.num + ": " + t.title,
          excerpt: t.intro,
          url: "topics/" + t.slug + ".html",
          topic: t.num,
          haystack: (t.title + " " + t.intro + " " + (t.keywords || []).join(" ") + " " + (t.articleText || "")).toLowerCase()
        });
      });
    }
    if (window.SHORT_QUESTIONS) {
      window.SHORT_QUESTIONS.forEach(function (q) {
        index.push({
          type: "مختصر سوال",
          title: q.question,
          excerpt: q.answer,
          url: "topics/topic-" + pad(q.topic) + ".html#short-questions",
          topic: q.topic,
          haystack: (q.question + " " + q.answer).toLowerCase()
        });
      });
    }
    if (window.MCQS) {
      window.MCQS.forEach(function (q) {
        index.push({
          type: "MCQ",
          title: q.question,
          excerpt: q.explanation,
          url: "topics/topic-" + pad(q.topic) + ".html#mcqs",
          topic: q.topic,
          haystack: (q.question + " " + q.options.join(" ") + " " + q.explanation).toLowerCase()
        });
      });
    }
    if (window.ESSAY_QUESTIONS) {
      window.ESSAY_QUESTIONS.forEach(function (q) {
        index.push({
          type: "مقالہ سوال",
          title: q.question,
          excerpt: (q.points || []).join("، "),
          url: "topics/topic-" + pad(q.topic) + ".html#essay-question",
          topic: q.topic,
          haystack: (q.question + " " + (q.points || []).join(" ")).toLowerCase()
        });
      });
    }
    if (window.REVISION) {
      window.REVISION.forEach(function (r) {
        index.push({
          type: "دہرائی",
          title: "دہرائی: موضوع " + r.topic,
          excerpt: r.summary,
          url: "topics/topic-" + pad(r.topic) + ".html#revision",
          topic: r.topic,
          haystack: (r.summary + " " + (r.keyTerms || []).join(" ")).toLowerCase()
        });
      });
    }
    return index;
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function highlight(text, term) {
    if (!term) return escapeHtml(text);
    var esc = escapeHtml(text);
    var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return esc.replace(re, "<mark>$1</mark>");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function excerptAround(text, term, len) {
    text = text || "";
    if (!term) return text.slice(0, len) + (text.length > len ? "…" : "");
    var idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text.slice(0, len) + (text.length > len ? "…" : "");
    var start = Math.max(0, idx - Math.floor(len / 2));
    var snippet = text.slice(start, start + len);
    return (start > 0 ? "…" : "") + snippet + (start + len < text.length ? "…" : "");
  }

  function runSearch() {
    var input = document.getElementById("search-input");
    var resultsEl = document.getElementById("search-results");
    var emptyEl = document.getElementById("search-empty");
    var countEl = document.getElementById("search-count");
    if (!input || !resultsEl) return;

    var term = input.value.trim();
    var idx = window.__SEARCH_INDEX__;
    resultsEl.innerHTML = "";

    if (!term) {
      if (emptyEl) emptyEl.classList.remove("hidden");
      if (countEl) countEl.textContent = "";
      return;
    }

    var lower = term.toLowerCase();
    var matches = idx.filter(function (item) {
      return item.haystack.indexOf(lower) !== -1;
    }).slice(0, 60);

    if (countEl) countEl.textContent = matches.length + " نتائج ملے";

    if (matches.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove("hidden");
        emptyEl.querySelector(".empty-text").textContent = "“" + term + "” کے لیے کوئی نتیجہ نہیں ملا۔ دوسرے الفاظ سے تلاش کریں۔";
      }
      return;
    }
    if (emptyEl) emptyEl.classList.add("hidden");

    matches.forEach(function (m) {
      var div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML =
        '<span class="result-type">' + m.type + (m.topic ? (" · موضوع " + m.topic) : "") + '</span>' +
        '<h3><a href="' + m.url + '">' + highlight(m.title, term) + '</a></h3>' +
        '<p class="text-muted">' + highlight(excerptAround(m.excerpt || "", term, 160), term) + '</p>';
      resultsEl.appendChild(div);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("search-input");
    var form = document.getElementById("search-form");
    var clearBtn = document.getElementById("search-clear");
    if (!input) return;

    window.__SEARCH_INDEX__ = buildIndex();

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        runSearch();
      });
    }
    input.addEventListener("input", function () { runSearch(); });
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        runSearch();
        input.focus();
      });
    }

    // Support ?q= query param and topics.html "site search" mini widget
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      input.value = params.get("q");
      runSearch();
    } else {
      runSearch();
    }
  });
})();
