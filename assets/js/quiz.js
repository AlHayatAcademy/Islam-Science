// اسلام اور سائنس — MCQ کوئز انجن (Vanilla JS، بغیر کسی بیرونی لائبریری کے)
(function () {
  "use strict";

  var shell = document.getElementById("quiz-shell");
  if (!shell || typeof window.MCQS === "undefined") return;

  var setupView = shell.querySelector(".quiz-setup");
  var playView = shell.querySelector(".quiz-play");
  var resultView = shell.querySelector(".quiz-result");

  var topicSelect = document.getElementById("quiz-topic");
  var countSelect = document.getElementById("quiz-count");
  var startBtn = document.getElementById("quiz-start");
  var modeButtons = document.querySelectorAll(".mode-toggle button");

  var state = {
    mode: "practice", // practice | exam
    pool: [],
    index: 0,
    score: 0,
    answers: [], // {question, chosenIndex, correctIndex, correct}
    locked: false
  };

  function populateTopics() {
    if (!topicSelect || typeof window.TOPICS === "undefined") return;
    window.TOPICS.forEach(function (t) {
      if (!t.available) return;
      var opt = document.createElement("option");
      opt.value = t.num;
      opt.textContent = "موضوع " + t.num + ": " + t.title;
      topicSelect.appendChild(opt);
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  modeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.mode = btn.getAttribute("data-mode");
    });
  });

  function startQuiz() {
    var topicVal = topicSelect ? topicSelect.value : "all";
    var count = countSelect ? parseInt(countSelect.value, 10) : 10;

    var filtered = window.MCQS.filter(function (q) {
      return topicVal === "all" || String(q.topic) === String(topicVal);
    });
    filtered = shuffle(filtered);
    state.pool = filtered.slice(0, Math.min(count, filtered.length));
    state.index = 0;
    state.score = 0;
    state.answers = [];

    if (state.pool.length === 0) {
      alert("اس انتخاب کے لیے کوئی سوال موجود نہیں۔");
      return;
    }

    setupView.classList.add("hidden");
    resultView.classList.add("hidden");
    playView.classList.remove("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    state.locked = false;
    var q = state.pool[state.index];
    var total = state.pool.length;

    playView.innerHTML =
      '<div class="quiz-progress">' +
        '<span>سوال ' + (state.index + 1) + ' از ' + total + '</span>' +
        '<span>سکور: ' + state.score + '</span>' +
      '</div>' +
      '<div class="progress-bar"><span style="width:' + (((state.index) / total) * 100) + '%"></span></div>' +
      '<div class="quiz-question">' + escapeHtml(q.question) + '</div>' +
      '<ul class="quiz-options" role="listbox"></ul>' +
      '<div class="quiz-feedback-area"></div>' +
      '<div class="quiz-actions">' +
        '<button type="button" class="btn btn-outline-dark btn-sm" id="quiz-quit">کوئز ختم کریں</button>' +
        '<button type="button" class="btn btn-primary" id="quiz-next" disabled>' + (state.index + 1 === total ? 'نتیجہ دیکھیں' : 'اگلا سوال') + '</button>' +
      '</div>';

    var optionsList = playView.querySelector(".quiz-options");
    q.options.forEach(function (opt, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = opt;
      btn.setAttribute("data-index", i);
      btn.addEventListener("click", function () { selectAnswer(i); });
      li.appendChild(btn);
      optionsList.appendChild(li);
    });

    document.getElementById("quiz-next").addEventListener("click", nextQuestion);
    document.getElementById("quiz-quit").addEventListener("click", function () {
      if (confirm("کیا آپ واقعی کوئز ختم کرنا چاہتے ہیں؟ اب تک کا سکور محفوظ نہیں ہوگا۔")) {
        resetToSetup();
      }
    });
  }

  function selectAnswer(i) {
    if (state.locked) return;
    var q = state.pool[state.index];
    var buttons = playView.querySelectorAll(".quiz-options button");
    var correct = i === q.answer;

    state.locked = true;
    state.answers.push({
      question: q.question,
      options: q.options,
      chosenIndex: i,
      correctIndex: q.answer,
      correct: correct,
      explanation: q.explanation
    });
    if (correct) state.score++;

    if (state.mode === "practice") {
      buttons.forEach(function (b) {
        var idx = parseInt(b.getAttribute("data-index"), 10);
        b.disabled = true;
        if (idx === q.answer) b.classList.add("correct");
        else if (idx === i) b.classList.add("incorrect");
      });
      var feedbackArea = playView.querySelector(".quiz-feedback-area");
      feedbackArea.innerHTML =
        '<div class="quiz-feedback ' + (correct ? "correct" : "incorrect") + '">' +
          (correct ? "درست جواب! ✔" : "غلط جواب ✘") +
        '</div>' +
        '<p class="quiz-explain">' + escapeHtml(q.explanation || "") + '</p>';
    } else {
      buttons.forEach(function (b) {
        var idx = parseInt(b.getAttribute("data-index"), 10);
        b.disabled = true;
        if (idx === i) b.classList.add("selected");
      });
    }
    document.getElementById("quiz-next").disabled = false;
  }

  function nextQuestion() {
    if (state.index + 1 < state.pool.length) {
      state.index++;
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    playView.classList.add("hidden");
    resultView.classList.remove("hidden");
    var total = state.pool.length;
    var pct = Math.round((state.score / total) * 100);

    var reviewHtml = state.answers.map(function (a, i) {
      var status = a.correct ? "درست" : "غلط";
      return (
        '<div class="qa-item open">' +
          '<div class="qa-question" style="cursor:default;">' +
            (i + 1) + '. ' + escapeHtml(a.question) +
            '<span class="badge-outline">' + status + '</span>' +
          '</div>' +
          '<div class="qa-answer">' +
            '<p><strong>آپ کا جواب:</strong> ' + escapeHtml(a.options[a.chosenIndex]) + '</p>' +
            (a.correct ? "" : '<p><strong>درست جواب:</strong> ' + escapeHtml(a.options[a.correctIndex]) + '</p>') +
            '<p class="text-muted">' + escapeHtml(a.explanation || "") + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    resultView.innerHTML =
      '<div class="score-circle"><span class="score-num">' + pct + '%</span><span class="small">' + state.score + ' / ' + total + '</span></div>' +
      '<h2>آپ کا نتیجہ</h2>' +
      '<p class="text-muted">' + resultMessage(pct) + '</p>' +
      '<div class="quiz-actions" style="justify-content:center; margin-bottom:24px;">' +
        '<button type="button" class="btn btn-primary" id="quiz-restart">دوبارہ کوئز شروع کریں</button>' +
        '<button type="button" class="btn btn-outline-dark" id="quiz-review-toggle">غلط/تمام جوابات کا جائزہ</button>' +
      '</div>' +
      '<div class="review-list hidden">' + reviewHtml + '</div>';

    document.getElementById("quiz-restart").addEventListener("click", resetToSetup);
    document.getElementById("quiz-review-toggle").addEventListener("click", function (e) {
      resultView.querySelector(".review-list").classList.toggle("hidden");
    });
  }

  function resultMessage(pct) {
    if (pct >= 80) return "بہت عمدہ! آپ نے اس موضوع کو اچھی طرح سمجھ لیا ہے۔";
    if (pct >= 50) return "ٹھیک کارکردگی۔ متعلقہ موضوع کو دوبارہ دیکھ لیں تاکہ سمجھ مکمل ہو۔";
    return "اس موضوع کو دوبارہ پڑھیں اور دہرائی کے صفحے سے مدد لیں، پھر دوبارہ کوئز دیں۔";
  }

  function resetToSetup() {
    resultView.classList.add("hidden");
    playView.classList.add("hidden");
    setupView.classList.remove("hidden");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  populateTopics();
  if (startBtn) startBtn.addEventListener("click", startQuiz);
})();
