(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (carousel && slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function runFilter() {
        var input = document.querySelector('[data-card-search]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var cards = selectAll('.searchable-grid .card-item');
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedYear = !year || card.getAttribute('data-year') === year;
            var matched = matchedKeyword && matchedYear;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    var queryInput = document.querySelector('[data-query-input]');
    if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            queryInput.value = initialQuery;
        }
    }

    selectAll('[data-card-search], [data-year-filter]').forEach(function (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
    });
    runFilter();

    selectAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var hlsInstance = null;

        function attachStream() {
            if (!stream || video.getAttribute('data-ready') === '1') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', '1');
        }

        function startPlayback() {
            attachStream();
            overlay.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        video.addEventListener('error', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
