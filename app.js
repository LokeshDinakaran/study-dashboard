// app.js  (use type="module" in index.html)

let videos = [];
let searchText = "";
let filterTopic = "ALL"; // ALL | Thermal | FEM
let sortMode = "DEFAULT"; // DEFAULT | TITLE
let watchLater = new Set();

// DOM elements
const videoRow = document.getElementById("videoRow");
const searchInput = document.getElementById("searchInput");
const filterThermal = document.getElementById("filterThermal");
const filterFEM = document.getElementById("filterFEM");
const sortBtn = document.getElementById("sortBtn");
const sortText = document.getElementById("sortText");
const toggleTheme = document.getElementById("toggleTheme");
const resetAll = document.getElementById("resetAll");
const shuffleOne = document.getElementById("shuffleOne");
const startSession = document.getElementById("startSession");
const clearWatchLater = document.getElementById("clearWatchLater");

const statTotal = document.getElementById("statTotal");
const statThermal = document.getElementById("statThermal");
const statFEM = document.getElementById("statFEM");
const statWatchLater = document.getElementById("statWatchLater");
const sessionStatus = document.getElementById("sessionStatus");
const countChip = document.getElementById("countChip");

// --- Load videos from videos.json ---
async function loadVideos() {
  try {
    const res = await fetch("videos.json");
    videos = await res.json();
    renderVideos();
  } catch (err) {
    console.error("Failed to load videos.json", err);
  }
}

// --- Stats ---
function updateStats(filteredList) {
  statTotal.textContent = videos.length;
  statThermal.textContent = videos.filter((v) => v.topic === "Thermal").length;
  statFEM.textContent = videos.filter((v) => v.topic === "FEM").length;
  statWatchLater.textContent = watchLater.size;
  countChip.textContent = `${filteredList.length} videos`;
}

// --- Render cards ---
function renderVideos() {
  if (!Array.isArray(videos)) return;

  let list = [...videos];

  if (filterTopic !== "ALL") {
    list = list.filter((v) => v.topic === filterTopic);
  }

  const txt = searchText.trim().toLowerCase();
  if (txt) {
    list = list.filter((v) => {
      const target =
        (v.title + " " + v.topic + " " + v.tags.join(" ")).toLowerCase();
      return target.includes(txt);
    });
  }

  if (sortMode === "TITLE") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  videoRow.innerHTML = "";

  list.forEach((v) => {
    const card = document.createElement("article");
    card.className = "video-card";

    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      window.open(v.url, "_blank");
    });

    const thumb = document.createElement("div");
    thumb.className = "thumbnail";

    const iframe = document.createElement("iframe");
    iframe.src = v.url.replace("watch?v=", "embed/");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const topicChip = document.createElement("span");
    topicChip.className = "chip accent";
    topicChip.textContent = v.topic;

    badgeRow.appendChild(topicChip);
    thumb.appendChild(iframe);
    thumb.appendChild(badgeRow);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = v.title;

    const metaRow = document.createElement("div");
    metaRow.className = "card-meta-row";

    const metaTags = document.createElement("div");
    metaTags.className = "card-meta-tags";
    (v.tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      metaTags.appendChild(span);
    });

    const duration = document.createElement("span");
    duration.className = "duration";
    duration.textContent = v.duration || "";

    metaRow.appendChild(metaTags);
    metaRow.appendChild(duration);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const leftActions = document.createElement("div");
    leftActions.className = "card-actions-left";

    const watchBtn = document.createElement("button");
    watchBtn.className = "btn-mini watch";
    watchBtn.textContent = "⭐ Watch later";

    if (watchLater.has(v.id)) {
      watchBtn.classList.add("active");
      watchBtn.textContent = "★ In Watch later";
    }

    watchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (watchLater.has(v.id)) {
        watchLater.delete(v.id);
      } else {
        watchLater.add(v.id);
      }
      renderVideos();
    });

    leftActions.appendChild(watchBtn);
    actions.appendChild(leftActions);

    body.appendChild(title);
    body.appendChild(metaRow);
    body.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(body);

    videoRow.appendChild(card);
  });

  updateStats(list);
}

// --- Event listeners ---

searchInput.addEventListener("input", (e) => {
  searchText = e.target.value;
  renderVideos();
});

filterThermal.addEventListener("click", () => {
  filterTopic = filterTopic === "Thermal" ? "ALL" : "Thermal";
  filterThermal.classList.toggle("active", filterTopic === "Thermal");
  filterFEM.classList.remove("active");
  renderVideos();
});

filterFEM.addEventListener("click", () => {
  filterTopic = filterTopic === "FEM" ? "ALL" : "FEM";
  filterFEM.classList.toggle("active", filterTopic === "FEM");
  filterThermal.classList.remove("active");
  renderVideos();
});

sortBtn.addEventListener("click", () => {
  sortMode = sortMode === "DEFAULT" ? "TITLE" : "DEFAULT";
  sortText.textContent =
    sortMode === "DEFAULT" ? "Sort: Default" : "Sort: Title A→Z";
  renderVideos();
});

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

resetAll.addEventListener("click", () => {
  searchText = "";
  filterTopic = "ALL";
  sortMode = "DEFAULT";
  watchLater.clear();

  searchInput.value = "";
  filterThermal.classList.remove("active");
  filterFEM.classList.remove("active");
  sortText.textContent = "Sort: Default";
  sessionStatus.textContent = "Idle";
  sessionStatus.style.color = "";

  renderVideos();
});

shuffleOne.addEventListener("click", () => {
  if (!videos.length) return;
  const random = videos[Math.floor(Math.random() * videos.length)];
  window.open(random.url, "_blank");
});

startSession.addEventListener("click", () => {
  sessionStatus.textContent = "Focus session running";
  sessionStatus.style.color = "#22c55e";
});

clearWatchLater.addEventListener("click", () => {
  watchLater.clear();
  renderVideos();
});

// --- Start ---
loadVideos();
