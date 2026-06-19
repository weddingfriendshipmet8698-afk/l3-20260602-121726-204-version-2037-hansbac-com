document.addEventListener("DOMContentLoaded", function () {
  var configNode = document.getElementById("movie-config");
  var player = document.querySelector("[data-player]");
  var video = document.querySelector("[data-video]");
  var overlay = document.querySelector("[data-play-overlay]");

  if (!configNode || !player || !video || !overlay) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configNode.textContent || "{}");
  } catch (error) {
    config = {};
  }

  var streamUrl = config.stream || "";
  var attached = false;

  function attachStream() {
    if (attached || !streamUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      player.hls = hls;
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachStream();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  overlay.addEventListener("click", beginPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
});
