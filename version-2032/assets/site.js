document.addEventListener("DOMContentLoaded", function () {
  bindMenu();
  bindHeroSlider();
  bindFilters();
  bindPlayer();
});

function bindMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function bindHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
  var prev = slider.querySelector("[data-hero-prev]");
  var next = slider.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      restart();
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      restart();
    });
  });
  restart();
}

function bindFilters() {
  var input = document.querySelector("[data-filter-input]");
  var year = document.querySelector("[data-filter-year]");
  var category = document.querySelector("[data-filter-category]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var empty = document.querySelector("[data-no-result]");
  if (!cards.length) {
    return;
  }

  function value(node) {
    return node ? node.value.trim().toLowerCase() : "";
  }

  function run() {
    var keyword = value(input);
    var selectedYear = value(year);
    var selectedCategory = value(category);
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-title") || "").toLowerCase();
      var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
      var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (selectedYear && cardYear !== selectedYear) {
        matched = false;
      }
      if (selectedCategory && cardCategory !== selectedCategory) {
        matched = false;
      }
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (input) {
    input.addEventListener("input", run);
  }
  if (year) {
    year.addEventListener("change", run);
  }
  if (category) {
    category.addEventListener("change", run);
  }
}

function bindPlayer() {
  var video = document.querySelector("[data-stream]");
  var button = document.querySelector(".play-layer");
  if (!video) {
    return;
  }

  function prepare() {
    var source = video.getAttribute("data-stream");
    if (!source || video.getAttribute("data-ready") === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.setAttribute("data-ready", "1");
  }

  function start() {
    prepare();
    if (button) {
      button.classList.add("is-hidden");
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
