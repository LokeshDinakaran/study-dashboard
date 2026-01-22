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

    const row = document.createElement("div");
    row.className = "video-row";

    channel.videos.forEach(video => {
      const card = document.createElement("div");
      card.className = "video-card";

      const iframe = document.createElement("iframe");
      iframe.src = video.url;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      const btn = document.createElement("button");
      btn.textContent = "Add to Watch Later";
      btn.onclick = () => addToWatchLater(video);

      card.appendChild(iframe);
      card.appendChild(btn);
      row.appendChild(card);
    });

    channelDiv.appendChild(row);
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

// Dark mode toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.key === "/") {
    e.preventDefault();
    document.getElementById("search").focus();
  }
  if (e.key.toLowerCase() === "w") {
    showWatchLater();
  }
});
