// ── EPISODIOS BASE (los 3 que ya tienes) ─────────────────────────────────────
const EPISODIOS_BASE = [
  {
    id: 1,
    title: "Claves del núcleo común para la Procuraduría",
    file: "audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a",
    eje: "general",
    ejeNombre: "📚 Conocimiento General",
    icon: "📚",
    subtitulo: "Núcleo común · Componente de conocimiento",
    duracion: "28:04",
    foco: "Fundamentos transversales para todos los cargos PGN"
  },
  {
    id: 2,
    title: "Episodio 3 · Coordinación institucional",
    file: "audios/Ep-3.m4a",
    eje: "general",
    ejeNombre: "📚 Conocimiento General",
    icon: "📚",
    subtitulo: "Gestión pública y coordinación",
    duracion: "19:49",
    foco: "Articulación interinstitucional y roles del coordinador"
  },
  {
    id: 3,
    title: "Estructura y funciones de la Procuraduría",
    file: "audios/Estructura_y_funciones_de_la_Procuraduría.m4a",
    eje: "general",
    ejeNombre: "📚 Conocimiento General",
    icon: "🏛️",
    subtitulo: "Estructura orgánica PGN · Decreto-Ley",
    duracion: "30:34",
    foco: "Organigrama, funciones macro y competencias por nivel"
  }
];

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  progress:   "prof-progress",
  current:    "prof-current",
  theme:      "prof-theme",
  speed:      "prof-speed",
  episodes:   "prof-episodes-extra",   // episodios añadidos desde el admin
  adminAuth:  "prof-admin-auth"
};

const ADMIN_PASS = "pgn2026";  // ← CAMBIA ESTO antes de subir a GitHub

// ── ESTADO ────────────────────────────────────────────────────────────────────
let extraEpisodes  = JSON.parse(localStorage.getItem(STORAGE_KEYS.episodes) || "[]");
let episodes       = [...EPISODIOS_BASE, ...extraEpisodes];
let currentAudio   = null;
let currentEpisode = null;
let currentEje     = "all";
let isPlaying      = false;
let progressData   = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "{}");
let sleepTimeout   = null;
let adminLoggedIn  = false;

// ── REFS DOM ──────────────────────────────────────────────────────────────────
const episodesListEl  = document.getElementById("episodesList");
const playerEl        = document.getElementById("player");
const audioEl         = document.getElementById("audioPlayer");
const currentTitleEl  = document.getElementById("currentTitle");
const currentSubEl    = document.getElementById("currentSubtitulo");
const currentFocoEl   = document.getElementById("currentFoco");
const playerBadgeEl   = document.getElementById("playerEjeBadge");
const artworkEmojiEl  = document.getElementById("artworkEmoji");
const playPauseBtn    = document.getElementById("playPauseBtn");
const progressBar     = document.getElementById("progressBar");
const currentTimeEl   = document.getElementById("currentTime");
const durationEl      = document.getElementById("duration");
const closePlayerBtn  = document.getElementById("closePlayerBtn");
const rewindBtn       = document.getElementById("rewindBtn");
const forwardBtn      = document.getElementById("forwardBtn");
const toastEl         = document.getElementById("toast");
const continueBannerEl= document.getElementById("continueBanner");
const continueTitleEl = document.getElementById("continueTitle");
const continueBtnEl   = document.getElementById("continueBtn");
const progressCountEl = document.getElementById("progressCount");
const statsBarFillEl  = document.getElementById("statsBarFill");
const themeToggleBtn  = document.getElementById("themeToggle");
const miniPlayerEl    = document.getElementById("miniPlayer");
const miniArtworkEl   = document.getElementById("miniArtwork");
const miniTitleEl     = document.getElementById("miniTitle");
const miniProgressEl  = document.getElementById("miniProgressFill");
const miniPlayBtn     = document.getElementById("miniPlayBtn");
const miniExpandBtn   = document.getElementById("miniExpandBtn");
const sleepModalEl    = document.getElementById("sleepModal");
const sleepTimerBtn   = document.getElementById("sleepTimerBtn");
const cancelSleepBtn  = document.getElementById("cancelSleep");
const waveBarsEl      = document.getElementById("waveBars");

// Admin refs
const adminToggleBtn  = document.getElementById("adminToggleBtn");
const adminPanel      = document.getElementById("adminPanel");
const adminLogin      = document.getElementById("adminLogin");
const adminMain       = document.getElementById("adminMain");
const adminPassword   = document.getElementById("adminPassword");
const adminLoginBtn   = document.getElementById("adminLoginBtn");
const adminLoginError = document.getElementById("adminLoginError");
const adminCloseBtn   = document.getElementById("adminCloseBtn");
const adminLogoutBtn  = document.getElementById("adminLogoutBtn");
const addEpisodeBtn   = document.getElementById("addEpisodeBtn");
const adminEpListEl   = document.getElementById("adminEpisodeList");

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  renderWaveBars();
  applySavedTheme();
  renderizarLista();
  bindTabs();
  bindControls();
  bindSpeedControls();
  bindSleepTimer();
  bindAdmin();
  restoreLastEpisode();
  updateContinueBanner();
  setTimeout(() => updateGlobalProgress(), 100);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function filtrarEpisodios() {
  return currentEje === "all" ? episodes : episodes.filter(ep => ep.eje === currentEje);
}

function getBadgeClass(eje) {
  const map = {
    general:       "badge-general",
    especifico:    "badge-especifico",
    comportamental:"badge-comportamental"
  };
  return map[eje] || "";
}

function getProgress(epId) {
  const saved = progressData[epId];
  return saved || { currentTime: 0, duration: 0, percent: 0, completed: false };
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── RENDER LISTA ──────────────────────────────────────────────────────────────
function renderizarLista() {
  const filtrados = filtrarEpisodios();
  episodesListEl.innerHTML = "";

  if (!filtrados.length) {
    episodesListEl.innerHTML = `<div class="empty-state">
      <p>No hay episodios en esta categoría todavía.</p>
      <p style="font-size:0.8rem;margin-top:8px;opacity:0.6">Agrega audios desde el panel de admin ⚙️</p>
    </div>`;
    return;
  }

  const agrupados = {};
  filtrados.forEach(ep => {
    if (!agrupados[ep.eje]) agrupados[ep.eje] = { nombre: ep.ejeNombre, episodios: [] };
    agrupados[ep.eje].episodios.push(ep);
  });

  Object.values(agrupados).forEach(grupo => {
    const header = document.createElement("div");
    header.className = "section-header";
    header.textContent = grupo.nombre;
    episodesListEl.appendChild(header);

    grupo.episodios.forEach(ep => {
      const p = getProgress(ep.id);
      const card = document.createElement("article");
      card.className = `episode-card ${currentEpisode?.id === ep.id ? "is-active" : ""}`;
      card.setAttribute("data-id", ep.id);
      card.setAttribute("aria-label", `Reproducir ${ep.title}`);
      card.innerHTML = `
        <div class="episode-icon">${ep.icon}</div>
        <div class="episode-info">
          <div class="episode-topline">
            <span class="eje-badge ${getBadgeClass(ep.eje)}">${ep.ejeNombre}</span>
          </div>
          <h3 class="episode-title">${ep.title}</h3>
          <p class="episode-subtitle">${ep.subtitulo}</p>
          <p class="episode-focus">${ep.foco}</p>
          <div class="episode-footer">
            <span class="episode-duration">${p.duration ? `${Math.round(p.percent)}% escuchado` : ep.duracion}</span>
          </div>
          <div class="card-progress">
            <div class="card-progress-fill" style="width:${p.percent || 0}%"></div>
          </div>
        </div>
        <div class="play-indicator">${currentEpisode?.id === ep.id && isPlaying ? "❚❚" : "▶"}</div>
      `;
      card.addEventListener("click", () => loadEpisode(ep, true));
      episodesListEl.appendChild(card);
    });
  });
}

// ── REPRODUCTOR ───────────────────────────────────────────────────────────────
function loadEpisode(ep, autoplay = false, resumeFromSaved = true) {
  currentEpisode = ep;
  currentAudio   = ep.file;
  audioEl.src    = ep.file;
  currentTitleEl.textContent = ep.title;
  currentSubEl.textContent   = ep.subtitulo;
  currentFocoEl.textContent  = ep.foco;
  currentFocoEl.classList.remove("hidden");
  playerBadgeEl.textContent  = ep.ejeNombre;
  artworkEmojiEl.textContent = ep.icon || "🎙️";
  miniArtworkEl.textContent  = ep.icon || "🎙️";
  miniTitleEl.textContent    = ep.title;
  playerEl.classList.remove("hidden");
  miniPlayerEl.classList.remove("hidden");
  saveCurrentEpisodeMeta(ep.id);

  audioEl.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audioEl.duration);
    const saved = getProgress(ep.id);
    if (resumeFromSaved && saved.currentTime && saved.currentTime < audioEl.duration - 5) {
      audioEl.currentTime = saved.currentTime;
      progressBar.value   = saved.percent || 0;
      currentTimeEl.textContent = formatTime(saved.currentTime);
    } else {
      progressBar.value = 0;
      currentTimeEl.textContent = "0:00";
    }
  }, { once: true });

  if (autoplay) playAudio(); else pauseAudio(false);
  renderizarLista();
}

function playAudio() {
  if (!audioEl.src) { showToast("Selecciona un audio primero"); return; }
  audioEl.play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.textContent = "❚❚";
      miniPlayBtn.textContent  = "❚❚";
      document.body.classList.add("is-playing");
    })
    .catch(() => showToast("No se pudo reproducir el audio"));
}

function pauseAudio(updateState = true) {
  audioEl.pause();
  if (updateState) isPlaying = false;
  playPauseBtn.textContent = "🎙️";
  miniPlayBtn.textContent  = "🎙️";
  document.body.classList.remove("is-playing");
}

function togglePlayPause() {
  if (!audioEl.src && episodes.length) { loadEpisode(episodes[0], true, false); return; }
  if (audioEl.paused) playAudio();
  else { isPlaying = false; pauseAudio(); }
  renderizarLista();
}

function saveProgress() {
  if (!currentEpisode || !isFinite(audioEl.duration) || audioEl.duration <= 0) return;
  const percent = (audioEl.currentTime / audioEl.duration) * 100;
  progressData[currentEpisode.id] = {
    currentTime: audioEl.currentTime,
    duration:    audioEl.duration,
    percent,
    completed:   percent >= 95
  };
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progressData));
  saveCurrentEpisodeMeta(currentEpisode.id);
  updateContinueBanner();
  updateGlobalProgress();
}

function saveCurrentEpisodeMeta(id) {
  localStorage.setItem(STORAGE_KEYS.current, JSON.stringify({ id }));
}

function restoreLastEpisode() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.current) || "null");
  if (!saved?.id) return;
  const ep = episodes.find(e => e.id === saved.id);
  if (ep) continueTitleEl.textContent = ep.title;
}

function updateContinueBanner() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.current) || "null");
  if (!saved?.id) { continueBannerEl.classList.add("hidden"); return; }
  const ep  = episodes.find(e => e.id === saved.id);
  const prg = ep ? getProgress(ep.id) : null;
  if (!ep || !prg || prg.percent <= 1 || prg.completed) { continueBannerEl.classList.add("hidden"); return; }
  continueTitleEl.textContent = `${ep.title} · ${Math.round(prg.percent)}%`;
  continueBannerEl.classList.remove("hidden");
}

function updateGlobalProgress() {
  if (!episodes.length) return;
  const total     = episodes.length;
  const completed = episodes.filter(ep => {
    const p = getProgress(ep.id);
    return p.completed || p.percent >= 95;
  }).length;
  if (progressCountEl) progressCountEl.textContent = `${completed}/${total} audios completados`;
  if (statsBarFillEl)  statsBarFillEl.style.width   = `${total ? (completed/total)*100 : 0}%`;
}

// ── TABS ──────────────────────────────────────────────────────────────────────
function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentEje = btn.dataset.eje;
      document.querySelectorAll(".tab-btn").forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      renderizarLista();
    });
  });
}

// ── CONTROLES ─────────────────────────────────────────────────────────────────
function bindControls() {
  playPauseBtn.addEventListener("click", togglePlayPause);
  miniPlayBtn.addEventListener("click",  togglePlayPause);

  rewindBtn.addEventListener("click", () => {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
    showToast("⏪ -10 seg");
  });
  forwardBtn.addEventListener("click", () => {
    audioEl.currentTime = Math.min(audioEl.duration || 0, audioEl.currentTime + 10);
    showToast("⏩ +10 seg");
  });

  closePlayerBtn.addEventListener("click",  () => playerEl.classList.add("hidden"));
  miniExpandBtn.addEventListener("click",   () => {
    playerEl.classList.remove("hidden");
    playerEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  continueBtnEl.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.current) || "null");
    if (!saved?.id) return;
    const ep = episodes.find(e => e.id === saved.id);
    if (ep) loadEpisode(ep, true, true);
  });

  progressBar.addEventListener("input", () => {
    if (!audioEl.duration) return;
    audioEl.currentTime = (progressBar.value / 100) * audioEl.duration;
  });

  audioEl.addEventListener("timeupdate", () => {
    if (!audioEl.duration) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    progressBar.value = pct;
    currentTimeEl.textContent = formatTime(audioEl.currentTime);
    durationEl.textContent    = formatTime(audioEl.duration);
    miniProgressEl.style.width = `${pct}%`;
    saveProgress();
  });

  audioEl.addEventListener("play",  () => {
    isPlaying = true;
    document.body.classList.add("is-playing");
    playPauseBtn.textContent = "❚❚";
    miniPlayBtn.textContent  = "❚❚";
    renderizarLista();
  });
  audioEl.addEventListener("pause", () => {
    isPlaying = false;
    document.body.classList.remove("is-playing");
    playPauseBtn.textContent = "▶";
    miniPlayBtn.textContent  = "▶";
    renderizarLista();
  });
  audioEl.addEventListener("ended", () => {
    saveProgress();
    showToast("✅ Audio completado");
    renderizarLista();
    updateContinueBanner();
  });
  audioEl.addEventListener("error", () => showToast("⚠️ Error al cargar el audio"));

  document.addEventListener("visibilitychange", saveProgress);
  window.addEventListener("beforeunload", saveProgress);
}

// ── VELOCIDAD ─────────────────────────────────────────────────────────────────
function bindSpeedControls() {
  const saved = Number(localStorage.getItem(STORAGE_KEYS.speed) || "1");
  audioEl.playbackRate = saved;
  document.querySelectorAll(".speed-btn").forEach(btn => {
    if (Number(btn.dataset.speed) === saved) btn.classList.add("active");
    btn.addEventListener("click", () => {
      const spd = Number(btn.dataset.speed);
      audioEl.playbackRate = spd;
      localStorage.setItem(STORAGE_KEYS.speed, String(spd));
      document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showToast(`Velocidad ${spd}×`);
    });
  });
}

// ── SLEEP TIMER ───────────────────────────────────────────────────────────────
function bindSleepTimer() {
  sleepTimerBtn.addEventListener("click", () => sleepModalEl.classList.remove("hidden"));
  cancelSleepBtn.addEventListener("click", () => {
    sleepModalEl.classList.add("hidden");
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
    showToast("Sleep timer cancelado");
  });
  document.querySelectorAll(".sleep-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const min = Number(btn.dataset.min);
      sleepModalEl.classList.add("hidden");
      clearTimeout(sleepTimeout);
      sleepTimeout = setTimeout(() => { pauseAudio(); showToast("Sleep timer finalizado"); }, min * 60000);
      showToast(`Se detendrá en ${min} min`);
    });
  });
  sleepModalEl.addEventListener("click", e => {
    if (e.target === sleepModalEl) sleepModalEl.classList.add("hidden");
  });
}

// ── WAVE BARS ─────────────────────────────────────────────────────────────────
function renderWaveBars() {
  waveBarsEl.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement("span");
    bar.className = "wave-bar";
    bar.style.animationDelay = `${i * 0.05}s`;
    bar.style.height = `${8 + (i % 6) * 3}px`;
    waveBarsEl.appendChild(bar);
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

// ── TEMA ──────────────────────────────────────────────────────────────────────
function applySavedTheme() {
  const t = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  document.body.classList.toggle("light-theme", t === "light");
  themeToggleBtn.textContent = t === "light" ? "☀️" : "🌙";
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
    themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
    showToast(`Tema ${isLight ? "claro" : "oscuro"}`);
  });
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function bindAdmin() {
  // Abrir panel
  adminToggleBtn.addEventListener("click", () => {
    adminPanel.classList.remove("hidden");
    if (adminLoggedIn) { adminLogin.classList.add("hidden"); adminMain.classList.remove("hidden"); renderAdminList(); }
    else               { adminLogin.classList.remove("hidden"); adminMain.classList.add("hidden"); }
  });

  // Cerrar panel (cruz en login)
  adminCloseBtn.addEventListener("click",  closeAdmin);
  // Cerrar / logout
  adminLogoutBtn.addEventListener("click", () => { adminLoggedIn = false; closeAdmin(); });

  // Cerrar al click fuera
  adminPanel.addEventListener("click", e => { if (e.target === adminPanel) closeAdmin(); });

  // Login
  adminLoginBtn.addEventListener("click", doLogin);
  adminPassword.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

  // Agregar episodio
  addEpisodeBtn.addEventListener("click", addEpisode);
}

function closeAdmin() {
  adminPanel.classList.add("hidden");
  adminPassword.value = "";
  adminLoginError.classList.add("hidden");
}

function doLogin() {
  if (adminPassword.value === ADMIN_PASS) {
    adminLoggedIn = true;
    adminLoginError.classList.add("hidden");
    adminLogin.classList.add("hidden");
    adminMain.classList.remove("hidden");
    renderAdminList();
  } else {
    adminLoginError.classList.remove("hidden");
    adminPassword.value = "";
    adminPassword.focus();
  }
}

function addEpisode() {
  const title    = document.getElementById("newTitle").value.trim();
  const subtitulo= document.getElementById("newSubtitulo").value.trim();
  const foco     = document.getElementById("newFoco").value.trim();
  const eje      = document.getElementById("newEje").value;
  const icon     = document.getElementById("newIcon").value.trim() || "📚";
  const file     = document.getElementById("newFile").value.trim();
  const duracion = document.getElementById("newDuracion").value.trim() || "—";

  const ejeNombres = {
    general:       "📚 Conocimiento General",
    especifico:    "🎯 Conocimiento Específico",
    comportamental:"🧠 Comportamental"
  };

  if (!title || !file) { showToast("⚠️ Título y archivo son obligatorios"); return; }

  const newId  = Date.now();
  const newEp  = { id: newId, title, subtitulo, foco, eje, ejeNombre: ejeNombres[eje], icon, file, duracion };
  extraEpisodes.push(newEp);
  localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(extraEpisodes));

  episodes = [...EPISODIOS_BASE, ...extraEpisodes];

  // Limpiar form
  ["newTitle","newSubtitulo","newFoco","newFile","newDuracion"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("newIcon").value = "📚";

  showToast(`✅ Episodio "${title}" agregado`);
  renderAdminList();
  renderizarLista();
  updateGlobalProgress();
}

function deleteEpisode(id) {
  if (!confirm("¿Eliminar este episodio de la app?")) return;
  extraEpisodes = extraEpisodes.filter(ep => ep.id !== id);
  localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(extraEpisodes));
  episodes = [...EPISODIOS_BASE, ...extraEpisodes];
  renderAdminList();
  renderizarLista();
  updateGlobalProgress();
  showToast("🗑️ Episodio eliminado");
}

function renderAdminList() {
  adminEpListEl.innerHTML = "";
  if (!episodes.length) {
    adminEpListEl.innerHTML = `<p class="admin-empty">No hay episodios aún.</p>`;
    return;
  }
  episodes.forEach(ep => {
    const isBase = EPISODIOS_BASE.find(b => b.id === ep.id);
    const row = document.createElement("div");
    row.className = "admin-ep-row";
    row.innerHTML = `
      <span class="admin-ep-icon">${ep.icon}</span>
      <div class="admin-ep-info">
        <strong>${ep.title}</strong>
        <small>${ep.ejeNombre} · ${ep.duracion}</small>
        <small class="admin-ep-file">${ep.file}</small>
      </div>
      ${isBase
        ? `<span class="admin-ep-base-tag">Base</span>`
        : `<button class="admin-ep-del" data-id="${ep.id}" aria-label="Eliminar">🗑️</button>`
      }
    `;
    if (!isBase) {
      row.querySelector(".admin-ep-del").addEventListener("click", () => deleteEpisode(ep.id));
    }
    adminEpListEl.appendChild(row);
  });
}

// ── START ─────────────────────────────────────────────────────────────────────
init();
