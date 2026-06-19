(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
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

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    var input = $('[data-search-input]');
    var select = $('[data-category-filter]');
    var cards = $all('[data-movie-card]');
    var empty = $('[data-empty-state]');
    if (!input && !select) {
      return;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var category = select ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCategory = card.getAttribute('data-category') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = !category || cardCategory === category;
        var show = matchQuery && matchCategory;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');
      if (queryValue) {
        input.value = queryValue;
      }
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  function setupPlayer() {
    var video = $('#movie-player');
    var overlay = $('[data-play-trigger]');
    var payload = $('#stream-payload');
    if (!video || !overlay || !payload) {
      return;
    }

    var data = {};
    try {
      data = JSON.parse(payload.textContent || '{}');
    } catch (error) {
      data = {};
    }
    var url = data.url;
    var started = false;
    var instance = null;

    function playVideo() {
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    function begin() {
      if (!url) {
        return;
      }
      overlay.classList.add('is-hidden');
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(url);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = url;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
    }

    overlay.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
