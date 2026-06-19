(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));

  filterAreas.forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var select = area.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function updateCards() {
      var query = normalize(input ? input.value : '');
      var region = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var keywords = normalize(card.getAttribute('data-keywords'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchedText = !query || keywords.indexOf(query) !== -1;
        var matchedRegion = !region || cardRegion === region;
        card.classList.toggle('is-hidden', !(matchedText && matchedRegion));
      });
    }

    if (input) {
      input.addEventListener('input', updateCards);
    }

    if (select) {
      select.addEventListener('change', updateCards);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
      updateCards();
    }
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !streamUrl || attached) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }

      attached = true;
    }

    function startPlayback() {
      attachStream();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      player.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
