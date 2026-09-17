// اسلام اور سائنس — فہرست صفحات (مختصر سوالات، مقالہ سوالات، دہرائی، تمام موضوعات) کے لیے فلٹر/تلاش
(function () {
  "use strict";

  function pad(n) { return String(n).padStart(2, "0"); }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function populateTopicFilter(select) {
    if (!select || !window.TOPICS) return;
    window.TOPICS.forEach(function (t) {
      if (!t.available) return;
      var opt = document.createElement("option");
      opt.value = t.num;
      opt.textContent = "موضوع " + t.num + ": " + t.title;
      select.appendChild(opt);
    });
  }

  function matchesQuery(text, q) {
    return !q || (text || "").toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }

  /* ---------------- Short questions page ---------------- */
  function initShortQuestions() {
    var list = document.getElementById("sq-list");
    if (!list || !window.SHORT_QUESTIONS) return;
    var topicSelect = document.getElementById("sq-topic-filter");
    var searchInput = document.getElementById("sq-search");
    var countEl = document.getElementById("sq-count");
    var emptyEl = document.getElementById("sq-empty");
    populateTopicFilter(topicSelect);

    function render() {
      var topicVal = topicSelect ? topicSelect.value : "all";
      var q = searchInput ? searchInput.value.trim() : "";
      var items = window.SHORT_QUESTIONS.filter(function (item) {
        return (topicVal === "all" || String(item.topic) === String(topicVal)) &&
               (matchesQuery(item.question, q) || matchesQuery(item.answer, q));
      });
      list.innerHTML = items.map(function (item) {
        return (
          '<div class="qa-item">' +
            '<button type="button" class="qa-question" aria-expanded="false">' +
              '<span>' + escapeHtml(item.question) + ' <span class="badge-outline">موضوع ' + item.topic + '</span></span>' +
              '<span class="chevron">⌄</span>' +
            '</button>' +
            '<div class="qa-answer"><p>' + escapeHtml(item.answer) + '</p>' +
              '<a class="small" href="topics/topic-' + pad(item.topic) + '.html">مکمل موضوع دیکھیں ←</a>' +
            '</div>' +
          '</div>'
        );
      }).join("");
      if (countEl) countEl.textContent = items.length + " سوالات";
      if (emptyEl) emptyEl.classList.toggle("hidden", items.length !== 0);
      attachToggles();
    }

    function attachToggles() {
      list.querySelectorAll(".qa-question").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = btn.closest(".qa-item");
          var open = item.classList.toggle("open");
          btn.setAttribute("aria-expanded", open.toString());
        });
      });
    }

    if (topicSelect) topicSelect.addEventListener("change", render);
    if (searchInput) searchInput.addEventListener("input", render);
    render();
  }

  /* ---------------- Essay questions page ---------------- */
  function initEssayQuestions() {
    var list = document.getElementById("essay-list");
    if (!list || !window.ESSAY_QUESTIONS) return;
    var topicSelect = document.getElementById("essay-topic-filter");
    populateTopicFilter(topicSelect);

    // Deep-link support: topic.html links here with ?topic=N
    var params = new URLSearchParams(window.location.search);
    var topicParam = params.get("topic");
    if (topicParam && topicSelect) topicSelect.value = topicParam;

    function render() {
      var topicVal = topicSelect ? topicSelect.value : "all";
      var items = window.ESSAY_QUESTIONS.filter(function (item) {
        return topicVal === "all" || String(item.topic) === String(topicVal);
      });
      list.innerHTML = items.map(function (item) {
        var sectionsHtml = (item.examAnswerSections || []).map(function (sec) {
          var bodyHtml = (sec.paragraphs || []).map(function (p) {
            return "<p>" + escapeHtml(p) + "</p>";
          }).join("");
          return '<h4 class="exam-answer-heading">' + escapeHtml(sec.heading) + "</h4>" + bodyHtml;
        }).join("");
        return (
          '<div class="card exam-answer-card" id="topic-' + item.topic + '" style="margin-bottom:24px;">' +
            '<span class="topic-badge">موضوع ' + item.topic + '</span>' +
            '<h3>' + escapeHtml(item.question) + '</h3>' +
            '<p class="small" style="margin:6px 0 16px;"><a href="topics/topic-' + pad(item.topic) + '.html">مکمل مضمون پڑھیں ←</a></p>' +
            '<div class="exam-answer-body">' + sectionsHtml + '</div>' +
          '</div>'
        );
      }).join("");
    }
    if (topicSelect) topicSelect.addEventListener("change", render);
    render();
  }

  /* ---------------- Revision page ---------------- */
  function initRevision() {
    var list = document.getElementById("revision-list");
    if (!list || !window.REVISION) return;
    var topicSelect = document.getElementById("revision-topic-filter");
    populateTopicFilter(topicSelect);

    function render() {
      var topicVal = topicSelect ? topicSelect.value : "all";
      var items = window.REVISION.filter(function (item) {
        return topicVal === "all" || String(item.topic) === String(topicVal);
      });
      list.innerHTML = items.map(function (item) {
        var termsHtml = (item.keyTerms || []).map(function (t) { return '<span class="term-chip">' + escapeHtml(t) + '</span>'; }).join("");
        return (
          '<div class="card" style="margin-bottom:18px;">' +
            '<span class="topic-badge">موضوع ' + item.topic + ': ' + escapeHtml(item.title) + '</span>' +
            '<p>' + escapeHtml(item.summary) + '</p>' +
            (termsHtml ? ('<div style="margin-bottom:10px;">' + termsHtml + '</div>') : '') +
            '<p class="small"><a href="topics/topic-' + pad(item.topic) + '.html">مکمل مضمون اور سوالات ←</a></p>' +
          '</div>'
        );
      }).join("");
    }
    if (topicSelect) topicSelect.addEventListener("change", render);
    render();
  }

  /* ---------------- Topics listing page (topics.html) ---------------- */
  function initTopicsGrid() {
    var grid = document.getElementById("topics-grid");
    if (!grid || !window.TOPICS) return;
    var searchInput = document.getElementById("topics-search");

    function render() {
      var q = searchInput ? searchInput.value.trim() : "";
      var items = window.TOPICS.filter(function (t) {
        return matchesQuery(t.title, q) || matchesQuery(t.intro, q) || matchesQuery((t.keywords || []).join(" "), q);
      });
      grid.innerHTML = items.map(function (t) {
        if (!t.available) {
          return (
            '<div class="card topic-card unavailable">' +
              '<span class="topic-badge">موضوع ' + t.num + '</span>' +
              '<h3>' + escapeHtml(t.title) + '</h3>' +
              '<p class="status-note">اس موضوع کی مکمل مصدقہ دستاویز تک رسائی حاصل نہیں ہوسکی — تفصیل "کورس نصاب" اور README میں دیکھیں۔</p>' +
            '</div>'
          );
        }
        return (
          '<div class="card topic-card">' +
            '<span class="topic-badge">موضوع ' + t.num + '</span>' +
            '<h3>' + escapeHtml(t.title) + '</h3>' +
            (t.engTitle ? ('<div class="eng-title">' + escapeHtml(t.engTitle) + '</div>') : '') +
            '<p class="topic-desc">' + escapeHtml(t.intro) + '</p>' +
            '<div class="card-footer"><a class="btn btn-outline-dark btn-sm" href="topics/' + t.slug + '.html">مطالعہ کریں ←</a></div>' +
          '</div>'
        );
      }).join("");
    }
    if (searchInput) searchInput.addEventListener("input", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initShortQuestions();
    initEssayQuestions();
    initRevision();
    initTopicsGrid();
  });
})();
