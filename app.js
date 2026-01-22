let allChannels = [];
let watchLater = [];

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allChannels = data.channels;
    renderChannels(allChannels);
    startReminder();
  });

function renderChannels(channels) {
  const container = document.getElementById("channels-container");
  container.innerHTML = "";

  channels.forEach(channel => {
    const channelDiv = document.createElement("div");
    channelDiv.className = "channel";

    const title = document.createElement("h2");
    title.textContent = channel.name;
    channelDiv.appendChild(title);

    channel.videos.forEach(video => {
      const card = document.createElement("div");
      card.className = "video-card";

      const videoTitle = document.createElement("div");
      videoTitle.className = "video-title";
      videoTitle.textContent = video.title;

      const iframe = document.createElement("iframe");
      iframe.height = "315";
      iframe.src = video.url;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      const btn = document.createElement("button");
      btn.textContent = "Add to Watch Later";
      btn.onclick = () => addToWatchLater(video);

      const actions = document.createElement("div");
      actions.className = "video-actions";
      actions.appendChild(btn);

      card.appendChild(videoTitle);
      card.appendChild(iframe);
      card.appendChild(actions);
      channelDiv.appendChild(card);
    });

    container.appendChild(channelDiv);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const filtered = allChannels.map(ch => ({
    ...ch,
    videos: ch.videos.filter(v => v.title.toLowerCase().includes(term))
  }));
  renderChannels(filtered);
});

function shuffleVideos() {
  allChannels.forEach(ch => {
    ch.videos.sort(() => Math.random() - 0.5);
  });
  renderChannels(allChannels);
}

function addToWatchLater(video) {
  watchLater.push(video);
  localStorage.setItem("watchLater", JSON.stringify(watchLater));
}

function showWatchLater() {
  const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
  renderChannels([{ name: "Watch Later", videos: saved }]);
}

function startReminder() {
  setTimeout(() => {
    document.getElementById("reminder").textContent = "⏰ You’ve been watching for 1 hour!";
  }, 3600000);
}

function showFlashcard() {
  document.getElementById("flashcard").classList.remove("hidden");
}

function closeFlashcard() {
  document.getElementById("flashcard").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeBtn").addEventListener("click", closeFlashcard);
});

function onYouTubeIframeAPIReady() {
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe, index) => {
    new YT.Player(iframe, {
      events: {
        'onStateChange': event => {
          if (event.data === YT.PlayerState.ENDED) {
            showFlashcard();
          }
        }
      }
    });
  });
}
