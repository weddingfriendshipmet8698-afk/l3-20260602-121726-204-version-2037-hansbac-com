document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var searchInputs = document.querySelectorAll(".page-search, .section-search");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var noResults = document.querySelector("[data-no-results]");

  function filterCards(value) {
    var query = value.trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var matched = query === "" || haystack.indexOf(query) !== -1;
      card.classList.toggle("is-hidden-by-search", !matched);
      if (matched) {
        shown += 1;
      }
    });

    if (noResults) {
      noResults.style.display = shown === 0 ? "block" : "none";
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input.value);
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }
});
