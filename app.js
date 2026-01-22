let allChannels = [];
let watchLater = [];

// Load videos.json
fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allChannels = data.channels;
    renderChannels(allChannels);
    startReminder();
  });

// Render channels
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
      const iframe = document.createElement("iframe");
      iframe.width = "560";
      iframe.height = "315";
      iframe.src = video.url;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      // Watch later button
      const btn = document.createElement("button");
      btn.textContent = "Add to Watch Later";
      btn.onclick = () => addToWatchLater(video);

      // Flashcard trigger (simulate after play)
      iframe.onload = () => {
        iframe.addEventListener("ended", showFlashcard); // NOTE: YouTube iframe API needed for true ended event
      };

      channelDiv.appendChild(iframe);
      channelDiv.appendChild(btn);
    });

    container.appendChild(channelDiv);
  });
}

// Search
document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const filtered = allChannels.map(ch => ({
    ...ch,
    videos: ch.videos.filter(v => v.title.toLowerCase().includes(term))
  }));
  renderChannels(filtered);
});

// Shuffle
function shuffleVideos() {
  allChannels.forEach(ch => {
    ch.videos.sort(() => Math.random() - 0.5);
  });
  renderChannels(allChannels);
}

// Watch Later
function addToWatchLater(video) {
  watchLater.push(video);
  localStorage.setItem("watchLater", JSON.stringify(watchLater));
}

function showWatchLater() {
  const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
  renderChannels([{ name: "Watch Later", videos: saved }]);
}

// Reminder after 1 hour
function startReminder() {
  setTimeout(() => {
    document.getElementById("reminder").textContent = "⏰ You’ve been watching for 1 hour!";
  }, 3600000); // 1 hour
}

// Flashcard modal
function showFlashcard() {
  document.getElementById("flashcard").classList.remove("hidden");
}

function closeFlashcard() {
  document.getElementById("flashcard").classList.add("hidden");
}