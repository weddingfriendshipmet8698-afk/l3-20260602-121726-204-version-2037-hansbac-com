(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var show = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6000);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var yearButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]'));
        var activeYear = '';
        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var year = card.getAttribute('data-year') || '';
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !activeYear || year === activeYear;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
            });
        };
        if (input) {
            if (input.hasAttribute('data-url-query')) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get(input.getAttribute('data-url-query'));
                if (q) {
                    input.value = q;
                }
            }
            input.addEventListener('input', apply);
        }
        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || '';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('[data-video]');
        var button = player.querySelector('[data-play]');
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var load = function () {
            if (loaded || !stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }
            loaded = true;
        };
        var play = function () {
            load();
            player.classList.add('is-playing');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };
        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.currentTime) {
                player.classList.remove('is-playing');
            }
        });
    });
})();
