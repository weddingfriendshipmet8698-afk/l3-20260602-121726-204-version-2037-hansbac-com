(() => {
    const mobileButton = document.querySelector("[data-mobile-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    const sliders = document.querySelectorAll("[data-hero-slider]");

    sliders.forEach((slider) => {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const prev = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        const activate = (target) => {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        const restart = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => activate(index + 1), 6200);
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                activate(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                activate(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                activate(index + 1);
                restart();
            });
        }

        activate(0);
        restart();
    });

    const searchInputs = document.querySelectorAll("[data-search-input]");

    searchInputs.forEach((input) => {
        const scope = input.closest("section") || document;
        const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));
        const empty = scope.querySelector("[data-empty-state]");
        const clear = scope.querySelector("[data-clear-search]");

        const apply = () => {
            const value = input.value.trim().toLowerCase();
            let visible = 0;
            cards.forEach((card) => {
                const text = [
                    card.dataset.title || "",
                    card.dataset.meta || "",
                    card.dataset.tags || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                const matched = !value || text.includes(value);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        input.addEventListener("input", apply);

        if (clear) {
            clear.addEventListener("click", () => {
                input.value = "";
                apply();
                input.focus();
            });
        }
    });

    const players = document.querySelectorAll(".player[data-stream]");

    players.forEach((player) => {
        const video = player.querySelector("video");
        const cover = player.querySelector(".player-cover");
        const button = player.querySelector(".play-button");
        const stream = player.dataset.stream;
        let attached = false;
        let hls = null;

        if (!video || !stream) {
            return;
        }

        const playNow = () => {
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(() => {});
            }
        };

        const attach = () => {
            if (attached) {
                playNow();
                return;
            }

            attached = true;
            player.classList.add("is-playing");
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                playNow();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
                return;
            }

            video.src = stream;
            playNow();
        };

        const start = () => {
            player.classList.add("is-playing");
            attach();
        };

        if (cover) {
            cover.addEventListener("click", start);
            cover.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    start();
                }
            });
        }

        if (button) {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                start();
            });
        }

        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
