(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video[data-hls]");
    var button = shell.querySelector(".play-overlay");
    var message = shell.querySelector(".player-message");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-hls");
    var attached = false;
    var hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachSource() {
      if (attached || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("当前网络环境暂时无法加载播放源，请稍后重试。");
            button.classList.remove("is-hidden");
          }
        });
        attached = true;
        return;
      }
      video.src = source;
      video.load();
      attached = true;
    }

    function playVideo() {
      attachSource();
      setMessage("正在加载播放源...");
      var request = video.play();
      if (request && typeof request.then === "function") {
        request.then(function () {
          setMessage("");
        }).catch(function () {
          setMessage("点击视频区域可继续播放。");
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      playVideo();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        button.classList.add("is-hidden");
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll(".video-shell").forEach(initPlayer);
  });
})();
