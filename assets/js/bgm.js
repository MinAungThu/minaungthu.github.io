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

  var INTERACTION_EVENTS = ["click", "keydown", "touchstart", "scroll", "mousemove", "wheel"];

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
    INTERACTION_EVENTS.forEach(function (evt) {
      document.removeEventListener(evt, unmuteOnFirstInteraction);
    });
  }

  if (userMuted) {
    audio.muted = true;
  } else {
    INTERACTION_EVENTS.forEach(function (evt) {
      document.addEventListener(evt, unmuteOnFirstInteraction, { once: true, passive: true });
    });
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
