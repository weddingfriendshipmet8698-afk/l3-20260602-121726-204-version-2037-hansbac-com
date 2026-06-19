(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".site-search");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function initFiltering() {
    var input = document.getElementById("movie-search");
    var sort = document.querySelector(".movie-sort");
    var target = document.querySelector(".filter-target");
    if (!target) {
      return;
    }
    var cards = Array.prototype.slice.call(target.children);
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function matches(card, keyword) {
      if (!keyword) {
        return true;
      }
      var hay = card.getAttribute("data-search") || "";
      return hay.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim() : "";
      cards.forEach(function (card) {
        card.classList.toggle("is-filtered-out", !matches(card, keyword));
      });
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        if (mode === "hot") {
          return Number(b.getAttribute("data-hot") || 0) - Number(a.getAttribute("data-hot") || 0);
        }
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      });
      sorted.forEach(function (card) {
        target.appendChild(card);
      });
      cards = sorted;
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFiltering();
  });
})();
