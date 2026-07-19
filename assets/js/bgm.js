(function () {
  var audio = document.getElementById("bgm-audio");
  var toggle = document.getElementById("bgm-toggle");
  if (!audio || !toggle) return;

  var MUTE_KEY = "bgm-muted";
  var TIME_KEY = "bgm-time";
  var userMuted = localStorage.getItem(MUTE_KEY) === "true";

  var savedTime = parseFloat(sessionStorage.getItem(TIME_KEY));
  if (!isNaN(savedTime)) {
    audio.addEventListener(
      "loadedmetadata",
      function () {
        if (audio.duration) audio.currentTime = savedTime % audio.duration;
      },
      { once: true }
    );
  }

  function updateIcon() {
    toggle.textContent = audio.muted ? "🔇" : "🔊";
    toggle.setAttribute("aria-label", audio.muted ? "Unmute background music" : "Mute background music");
  }

  // Browsers allow autoplay only when muted; unmute on first interaction
  // unless the visitor had already muted it themselves on a previous page.
  function unmuteOnFirstInteraction() {
    if (!userMuted) {
      audio.muted = false;
      updateIcon();
    }
    // Some browsers (notably iOS Safari) can end up paused even with the
    // autoplay attribute set, so make sure playback is actually running.
    audio.play().catch(function () {});
    document.removeEventListener("click", unmuteOnFirstInteraction);
    document.removeEventListener("keydown", unmuteOnFirstInteraction);
    document.removeEventListener("touchstart", unmuteOnFirstInteraction);
  }

  if (userMuted) {
    audio.muted = true;
  } else {
    document.addEventListener("click", unmuteOnFirstInteraction, { once: true });
    document.addEventListener("keydown", unmuteOnFirstInteraction, { once: true });
    document.addEventListener("touchstart", unmuteOnFirstInteraction, { once: true });
  }
  updateIcon();
  audio.play().catch(function () {});

  toggle.addEventListener("click", function () {
    audio.muted = !audio.muted;
    userMuted = audio.muted;
    localStorage.setItem(MUTE_KEY, audio.muted);
    updateIcon();
  });

  // Remember playback position so navigating between pages feels continuous.
  setInterval(function () {
    if (!audio.paused) {
      sessionStorage.setItem(TIME_KEY, audio.currentTime);
    }
  }, 3000);
})();
