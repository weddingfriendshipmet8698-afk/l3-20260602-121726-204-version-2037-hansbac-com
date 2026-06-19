(function () {
    var body = document.body;
    var rootPrefix = body.getAttribute("data-root-prefix") || "./";

    function resolvePath(path) {
        return rootPrefix + path;
    }

    function closeSearchPanels() {
        document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
            panel.classList.remove("is-open");
        });
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initSearch() {
        var data = window.MOVIE_INDEX || [];
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            var input = form.querySelector("[data-search-input]");
            var panel = form.querySelector("[data-search-panel]");
            if (!input || !panel) {
                return;
            }

            function render() {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var results = data.filter(function (item) {
                    return item.text.indexOf(query) !== -1;
                }).slice(0, 12);
                if (!results.length) {
                    panel.innerHTML = '<a href="' + resolvePath("categories.html") + '"><strong>查看更多分类</strong><span>换个关键词继续浏览</span></a>';
                    panel.classList.add("is-open");
                    return;
                }
                panel.innerHTML = results.map(function (item) {
                    return '<a href="' + resolvePath(item.path) + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></a>';
                }).join("");
                panel.classList.add("is-open");
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var first = panel.querySelector("a");
                if (first) {
                    window.location.href = first.href;
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest("[data-search-form]")) {
                closeSearchPanels();
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            bar.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter]");
                if (!button) {
                    return;
                }
                var filter = button.getAttribute("data-filter");
                bar.querySelectorAll("[data-filter]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var tags = card.getAttribute("data-tags") || "";
                    var visible = filter === "all" || tags.indexOf(filter) !== -1;
                    card.classList.toggle("is-filter-hidden", !visible);
                });
            });
        });
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function attachVideo(video, url) {
        if (video.dataset.ready === "1") {
            return Promise.resolve();
        }
        video.dataset.ready = "1";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
        }).catch(function () {
            video.src = url;
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var url = video.getAttribute("data-video-url");
            if (!url) {
                return;
            }

            function start() {
                attachVideo(video, url).then(function () {
                    button.classList.add("is-hidden");
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {});
                    }
                });
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearch();
        initHero();
        initFilters();
        initPlayers();
    });
})();
