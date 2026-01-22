let allChannels = [];
let watchLater = [];
let globalShowAll = false; // false = Random 8 per channel, true = All videos per channel

// Load saved Watch Later from localStorage
const savedWL = localStorage.getItem("watchLater");
if (savedWL) {
  try {
    watchLater = JSON.parse(savedWL);
  } catch {
    watchLater = [];
  }
}

// Load videos.json and initialize
fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allChannels = data.channels || [];
    renderChannels(allChannels);
    startReminder();
  })
  .catch(err => {
    console.error("Error loading videos.json", err);
  });

// Utility: random subset of an array
function sampleArray(arr, n) {
  if (!n || n >= arr.length) return [...arr];
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// Render all channels using globalShowAll setting
function renderChannels(channels) {
  const container = document.getElementById("channels-container");
  container.innerHTML = "";

  if (!channels.length) {
    const msg = document.createElement("p");
    msg.textContent = "No videos to show.";
    container.appendChild(msg);
    return;
  }

  channels.forEach(channel => {
    if (!channel.videos || !channel.videos.length) return;

    const channelDiv = document.createElement("div");
    channelDiv.className = "channel";

    const header = document.createElement("div");
    header.className = "channel-header";

    const title = document.createElement("h2");
    title.className = "channel-title";
    title.textContent = channel.name;

    const controls = document.createElement("div");
    controls.className = "channel-controls";

    const viewModeBtn = document.createElement("button");
    viewModeBtn.className = "pill-btn secondary";
    viewModeBtn.textContent = globalShowAll
      ? "Show Random 8"
      : "Show All";
    viewModeBtn.onclick = () => {
      const ch = allChannels.find(c => c.name === channel.name);
      if (!ch) return;
      const modeAll = viewModeBtn.textContent === "Show Random 8";
      const vids = modeAll ? ch.videos : sampleArray(ch.videos, 8);
      // Update globalShowAll is not changed here; this is local override.
      renderSingleChannel(channelDiv, channel.name, vids, modeAll);
    };

    const shuffleBtn = document.createElement("button");
    shuffleBtn.className = "pill-btn secondary";
    shuffleBtn.textContent = "Shuffle Channel";
    shuffleBtn.onclick = () => {
      const ch = allChannels.find(c => c.name === channel.name);
      if (!ch) return;
      const shuffled = [...ch.videos].sort(() => Math.random() - 0.5);
      const vids = globalShowAll
        ? shuffled
        : sampleArray(shuffled, 8);
      renderSingleChannel(channelDiv, channel.name, vids, globalShowAll);
    };

    controls.appendChild(viewModeBtn);
    controls.appendChild(shuffleBtn);

    header.appendChild(title);
    header.appendChild(controls);
    channelDiv.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "video-grid";

    const videosToShow = globalShowAll
      ? channel.videos
      : sampleArray(channel.videos, 8);

    videosToShow.forEach(video => {
      const card = createVideoCard(video);
      grid.appendChild(card);
    });

    channelDiv.appendChild(grid);
    container.appendChild(channelDiv);
  });
}

// Re-render a single channel block (used for per-channel toggle / shuffle)
function renderSingleChannel(channelDiv, channelName, videos, showAllForThisChannel) {
  channelDiv.innerHTML = "";

  const header = document.createElement("div");
  header.className = "channel-header";

  const title = document.createElement("h2");
  title.className = "channel-title";
  title.textContent = channelName;

  const controls = document.createElement("div");
  controls.className = "channel-controls";

  const viewModeBtn = document.createElement("button");
  viewModeBtn.className = "pill-btn secondary";
  viewModeBtn.textContent = showAllForThisChannel
    ? "Show Random 8"
    : "Show All";
  viewModeBtn.onclick = () => {
    const channel = allChannels.find(ch => ch.name === channelName);
    if (!channel) return;
    const modeAll = viewModeBtn.textContent === "Show Random 8";
    const vids = modeAll ? channel.videos : sampleArray(channel.videos, 8);
    renderSingleChannel(channelDiv, channelName, vids, modeAll);
  };

  const shuffleBtn = document.createElement("button");
  shuffleBtn.className = "pill-btn secondary";
  shuffleBtn.textContent = "Shuffle Channel";
  shuffleBtn.onclick = () => {
    const channel = allChannels.find(ch => ch.name === channelName);
    if (!channel) return;
    const shuffled = [...channel.videos].sort(() => Math.random() - 0.5);
    const vids = showAllForThisChannel
      ? shuffled
      : sampleArray(shuffled, 8);
    renderSingleChannel(channelDiv, channelName, vids, showAllForThisChannel);
  };

  controls.appendChild(viewModeBtn);
  controls.appendChild(shuffleBtn);

  header.appendChild(title);
  header.appendChild(controls);
  channelDiv.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "video-grid";
  videos.forEach(video => {
    const card = createVideoCard(video);
    grid.appendChild(card);
  });
  channelDiv.appendChild(grid);
}

// Create a single video card
function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  const wrapper = document.createElement("div");
  wrapper.className = "player-wrapper";

  const iframe = document.createElement("iframe");
  iframe.src = video.url;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;

  wrapper.appendChild(iframe);
  card.appendChild(wrapper);

  const info = document.createElement("div");
  info.className = "video-info";

  const titleEl = document.createElement("p");
  titleEl.className = "video-title";
  titleEl.textContent = video.title || "Untitled video";

  const actions = document.createElement("div");
  actions.className = "video-actions";

  const watchLaterBtn = document.createElement("button");
  watchLaterBtn.className = "pill-btn secondary";
  watchLaterBtn.textContent = "Add to Watch Later";
  watchLaterBtn.onclick = () => addToWatchLater(video);

  const reflectBtn = document.createElement("button");
  reflectBtn.className = "pill-btn secondary";
  reflectBtn.textContent = "Reflect";
  reflectBtn.onclick = showFlashcard;

  actions.appendChild(watchLaterBtn);
  actions.appendChild(reflectBtn);

  info.appendChild(titleEl);
  info.appendChild(actions);
  card.appendChild(info);

  return card;
}

// Search filter
document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();

  if (!term) {
    renderChannels(allChannels);
    return;
  }

  const filtered = allChannels
    .map(ch => ({
      name: ch.name,
      videos: ch.videos.filter(v =>
        (v.title || "").toLowerCase().includes(term)
      )
    }))
    .filter(ch => ch.videos.length > 0);

  renderChannels(filtered);
});

// Shuffle videos across all channels (global)
document.getElementById("shuffleBtn").addEventListener("click", () => {
  const flattened = [];
  allChannels.forEach(ch => {
    ch.videos.forEach(v => flattened.push({ ...v, _channel: ch.name }));
  });

  flattened.sort(() => Math.random() - 0.5);

  const grouped = {};
  flattened.forEach(v => {
    if (!grouped[v._channel]) grouped[v._channel] = [];
    grouped[v._channel].push({ title: v.title, url: v.url });
  });

  const shuffledChannels = Object.keys(grouped).map(name => ({
    name,
    videos: grouped[name]
  }));

  renderChannels(shuffledChannels);
});

// Refresh button: reload the page
document.getElementById("refreshBtn").addEventListener("click", () => {
  window.location.reload();
});

// Global mode toggle: All vs Random 8
document.getElementById("globalModeBtn").addEventListener("click", e => {
  globalShowAll = !globalShowAll;
  e.target.textContent = globalShowAll
    ? "Show Random 8 (per channel)"
    : "View All (per channel)";
  renderChannels(allChannels);
});

// Watch Later logic
function addToWatchLater(video) {
  if (!watchLater.find(v => v.url === video.url)) {
    watchLater.push(video);
    localStorage.setItem("watchLater", JSON.stringify(watchLater));
  }
  alert("Added to Watch Later.");
}

document.getElementById("watchLaterBtn").addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");
  const wlChannel = [{ name: "Watch Later", videos: saved }];
  renderChannels(wlChannel);
});

// Reminder after 1 hour
function startReminder() {
  setTimeout(() => {
    const rem = document.getElementById("reminder");
    rem.textContent =
      "⏰ You’ve been watching for 1 hour. Consider a short break.";
  }, 3600000); // 1 hour
}

// Flashcard modal
function showFlashcard() {
  document.getElementById("flashcard").classList.remove("hidden");
}

function closeFlashcard() {
  const overlay = document.getElementById("flashcard");
  const textarea = document.getElementById("flashcardAnswer");
  textarea.value = "";
  overlay.classList.add("hidden");
}

document
  .getElementById("closeFlashcardBtn")
  .addEventListener("click", closeFlashcard);
