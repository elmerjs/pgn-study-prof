/* ============================================================
   PGN Study PRO - Lógica principal
   ============================================================ */

// ===== EPISODIOS PRECARGADOS =====
const episodes = [
  { id: 1, title: 'Constitución Política', subtitle: 'Fundamentos constitucionales', description: 'Artículos clave para el concurso de la PGN', category: 'constitucion', emoji: '📜', file: 'audios/1.m4a', duration: '28:04', durationSeconds: 1684 },
  { id: 2, title: 'Estructura de la PGN', subtitle: 'Organigrama y funciones', description: 'Decreto-Ley y competencias', category: 'estructura', emoji: '🏛️', file: 'audios/2.m4a', duration: '30:34', durationSeconds: 1834 },
  { id: 5, title: 'Ley 1437 (CPACA)', subtitle: 'Procedimiento administrativo', description: 'Aplicación en la Procuraduría', category: 'cpaca', emoji: '📋', file: 'audios/5.m4a', duration: '19:49', durationSeconds: 1189 },
  { id: 7, title: 'Control fiscal y funcional', subtitle: 'Competencias funcionales', description: 'Funciones misionales y de control', category: 'funcional', emoji: '⚙️', file: 'audios/7.m4a', duration: '22:15', durationSeconds: 1335 },
  { id: 8, title: 'Planeación estratégica', subtitle: 'Enfoque estratégico PGN', description: 'Plan estratégico y gestión por resultados', category: 'estrategia', emoji: '🧠', file: 'audios/8.m4a', duration: '25:10', durationSeconds: 1510 }
];

// ===== ESTADO GLOBAL =====
const state = {
  currentEpisodeId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  sleepTimerMinutes: null,
  sleepTimeoutId: null,
  activeCategory: 'todos',
  theme: 'dark'
};

let deferredPrompt = null;   // para beforeinstallprompt

// ===== ELEMENTOS DEL DOM =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  themeToggle: $('#themeToggle'),
  globalProgressBar: $('.global-progress-bar'),
  globalProgressText: $('#globalProgressText'),
  continueBanner: $('#continueBanner'),
  continueTitle: $('#continueTitle'),
  continueProgressFill: $('#continueProgressFill'),
  continuePlayBtn: $('#continuePlayBtn'),
  categoryTabs: $$('.cat-tab'),
  episodesList: $('#episodesList'),
  emptyState: $('#emptyState'),
  miniPlayer: $('#miniPlayer'),
  miniPlayerTrigger: $('#miniPlayerTrigger'),
  miniArtwork: $('#miniArtwork'),
  miniTitle: $('#miniTitle'),
  miniProgressFill: $('#miniProgressFill'),
  miniPlayBtn: $('#miniPlayBtn'),
  expandedPlayer: $('#expandedPlayer'),
  collapsePlayer: $('#collapsePlayer'),
  artworkRing1: $('#artworkRing1'),
  artworkRing2: $('#artworkRing2'),
  artworkRing3: $('#artworkRing3'),
  artworkEmoji: $('#artworkEmoji'),
  waveBars: $('#waveBars'),
  playerTitle: $('#playerTitle'),
  playerSubtitle: $('#playerSubtitle'),
  currentTime: $('#currentTime'),
  totalTime: $('#totalTime'),
  progressBarContainer: $('#progressBarContainer'),
  progressBarFill: $('#progressBarFill'),
  progressThumb: $('#progressThumb'),
  playPauseBtn: $('#playPauseBtn'),
  playIcon: $('#playIcon'),
  pauseIcon: $('#pauseIcon'),
  rewindBtn: $('#rewindBtn'),
  forwardBtn: $('#forwardBtn'),
  speedBtn: $('#speedBtn'),
  sleepTimerBtn: $('#sleepTimerBtn'),
  sleepOptions: $('#sleepOptions'),
  audio: $('#audioPlayer'),
  toastContainer: $('#toastContainer'),
  installBtn: $('#installBtn'),
  proBanner: $('#proBanner'),
  proCloseBtn: $('#proCloseBtn'),
  proWhatsAppBtn: $('#proWhatsAppBtn')
};

// ===== INICIALIZACIÓN =====
function init() {
  loadTheme();
  loadProgressFromStorage();
  updateGlobalProgress();
  renderEpisodes();
  renderContinueBanner();
  setupEventListeners();
  setupAudioListeners();
  bindInstallBtn();
  setTimeout(initProBanner, 1000);   // Se ejecuta después de 1s (el propio banner espera 45s más)
}

// ===== TEMA =====
function loadTheme() {
  const saved = localStorage.getItem('pgn-theme');
  if (saved === 'light') {
    state.theme = 'light';
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    state.theme = 'dark';
    document.documentElement.removeAttribute('data-theme');
  }
}

function toggleTheme() {
  if (state.theme === 'dark') {
    state.theme = 'light';
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    state.theme = 'dark';
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('pgn-theme', state.theme);
}

// ===== PROGRESO =====
function getProgressFromStorage() {
  try { return JSON.parse(localStorage.getItem('pgn-progress')) || {}; } catch (e) { return {}; }
}
function saveProgress(progress) { localStorage.setItem('pgn-progress', JSON.stringify(progress)); }
function getEpisodeProgress(epId) {
  const all = getProgressFromStorage();
  return all[epId] || { position: 0, completed: false };
}
function setEpisodeProgress(epId, position, durationSeconds) {
  const all = getProgressFromStorage();
  const completed = (position / durationSeconds) >= 0.95;
  all[epId] = { position, completed };
  if (position > 0) localStorage.setItem('pgn-last-episode', epId);
  saveProgress(all);
  updateGlobalProgress();
}

function getCompletedCount() {
  const all = getProgressFromStorage();
  let count = 0;
  Object.values(all).forEach(p => { if (p.completed) count++; });
  return count;
}

function updateGlobalProgress() {
  const total = episodes.length;
  const completed = getCompletedCount();
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  dom.globalProgressBar.innerHTML = `<div class="global-progress-fill" style="width:${percent}%"></div>`;
  dom.globalProgressText.textContent = `${percent}% completado (${completed}/${total})`;
}

// ===== CONTINUAR ESCUCHANDO =====
function renderContinueBanner() {
  const lastId = localStorage.getItem('pgn-last-episode');
  if (!lastId) { dom.continueBanner.classList.add('hidden'); return; }
  const progress = getEpisodeProgress(lastId);
  if (!progress || progress.position <= 0 || progress.completed) {
    dom.continueBanner.classList.add('hidden'); return;
  }
  const ep = episodes.find(e => e.id == lastId);
  if (!ep) { dom.continueBanner.classList.add('hidden'); return; }
  const percent = Math.min(100, (progress.position / ep.durationSeconds) * 100);
  dom.continueTitle.textContent = ep.title;
  dom.continueProgressFill.style.width = percent + '%';
  dom.continueBanner.classList.remove('hidden');
  dom.continueBanner.dataset.episodeId = lastId;
}

// ===== RENDERIZAR EPISODIOS =====
function renderEpisodes(category = 'todos') {
  const filtered = category === 'todos' ? episodes : episodes.filter(ep => ep.category === category);
  dom.episodesList.innerHTML = '';
  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    dom.episodesList.classList.add('hidden');
    return;
  }
  dom.emptyState.classList.add('hidden');
  dom.episodesList.classList.remove('hidden');

  filtered.forEach(ep => {
    const progress = getEpisodeProgress(ep.id);
    const percent = Math.min(100, (progress.position / ep.durationSeconds) * 100);
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = ep.id;
    card.innerHTML = `
      <div class="episode-emoji">${ep.emoji}</div>
      <div class="episode-content">
        <span class="episode-badge" style="background:var(--cat-${ep.category})">${categoryName(ep.category)}</span>
        <h3 class="episode-title">${ep.title}</h3>
        <p class="episode-subtitle">${ep.subtitle}</p>
        <div class="episode-meta">
          <span>⏱️ ${ep.duration}</span>
          ${progress.completed ? '<span style="color:var(--accent)">✓ Completado</span>' : ''}
        </div>
        <div class="episode-progress-individual">
          <div class="episode-progress-fill" style="width:${percent}%"></div>
        </div>
      </div>
    `;
    card.addEventListener('click', () => selectEpisode(ep.id));
    dom.episodesList.appendChild(card);
  });
}

function categoryName(slug) {
  const map = { constitucion: 'Constitución', estructura: 'Estructura', cpaca: 'CPACA', funcional: 'Funcional', estrategia: 'Estrategia' };
  return map[slug] || slug;
}

// ===== SELECCIÓN Y REPRODUCCIÓN =====
function selectEpisode(epId, startPos = null) {
  const ep = episodes.find(e => e.id == epId);
  if (!ep) return;
  if (state.currentEpisodeId === epId && startPos === null) {
    togglePlayPause();
    return;
  }
  state.currentEpisodeId = epId;
  state.currentTime = startPos !== null ? startPos : getEpisodeProgress(epId).position;
  dom.audio.src = ep.file;
  dom.audio.load();
  updatePlayerUI(ep);
  showMiniPlayer();
  dom.expandedPlayer.classList.add('active');
  dom.expandedPlayer.classList.remove('hidden');
  dom.audio.play().then(() => {
    state.isPlaying = true;
    updatePlayPauseBtn();
    startAnimations();
  }).catch(() => { state.isPlaying = false; updatePlayPauseBtn(); });
}

function updatePlayerUI(ep) {
  dom.miniArtwork.textContent = ep.emoji;
  dom.miniTitle.textContent = ep.title;
  dom.artworkEmoji.textContent = ep.emoji;
  dom.playerTitle.textContent = ep.title;
  dom.playerSubtitle.textContent = ep.subtitle;
  dom.totalTime.textContent = ep.duration;
}

function showMiniPlayer() { dom.miniPlayer.classList.remove('hidden'); }
function hideMiniPlayer() { dom.miniPlayer.classList.add('hidden'); dom.expandedPlayer.classList.add('hidden'); dom.expandedPlayer.classList.remove('active'); }

function togglePlayPause() {
  if (!state.currentEpisodeId) return;
  if (state.isPlaying) {
    dom.audio.pause();
    state.isPlaying = false;
    stopAnimations();
  } else {
    dom.audio.play().then(() => { state.isPlaying = true; startAnimations(); }).catch(() => {});
  }
  updatePlayPauseBtn();
}

function updatePlayPauseBtn() {
  if (state.isPlaying) {
    dom.playIcon.classList.add('hidden');
    dom.pauseIcon.classList.remove('hidden');
    dom.miniPlayBtn.textContent = '⏸️';
  } else {
    dom.playIcon.classList.remove('hidden');
    dom.pauseIcon.classList.add('hidden');
    dom.miniPlayBtn.textContent = '▶️';
  }
}

function seek(seconds) {
  if (!dom.audio.src) return;
  dom.audio.currentTime = Math.max(0, Math.min(dom.audio.duration || 0, dom.audio.currentTime + seconds));
}

function setPlaybackRate(rate) {
  state.playbackRate = rate;
  dom.audio.playbackRate = rate;
  dom.speedBtn.textContent = rate + '×';
}

function setSleepTimer(minutes) {
  if (state.sleepTimeoutId) { clearTimeout(state.sleepTimeoutId); state.sleepTimeoutId = null; }
  state.sleepTimerMinutes = minutes;
  if (minutes > 0) {
    state.sleepTimeoutId = setTimeout(() => {
      if (state.isPlaying) { dom.audio.pause(); state.isPlaying = false; updatePlayPauseBtn(); stopAnimations(); showToast('⏰ Reproducción pausada por temporizador'); }
      state.sleepTimerMinutes = null;
    }, minutes * 60000);
    showToast(`⏳ Temporizador: ${minutes} minutos`);
  } else {
    showToast('Temporizador cancelado');
  }
  dom.sleepOptions.classList.add('hidden');
}

// ===== EVENTOS DEL AUDIO =====
function setupAudioListeners() {
  dom.audio.addEventListener('loadedmetadata', () => {
    if (state.currentEpisodeId && state.currentTime > 0) dom.audio.currentTime = state.currentTime;
    updateTimeDisplay();
  });
  dom.audio.addEventListener('timeupdate', () => {
    state.currentTime = dom.audio.currentTime;
    updateTimeDisplay();
    updateProgressBars();
    if (Math.floor(dom.audio.currentTime) % 5 === 0) {
      const ep = episodes.find(e => e.id == state.currentEpisodeId);
      if (ep) setEpisodeProgress(state.currentEpisodeId, dom.audio.currentTime, ep.durationSeconds);
    }
  });
  dom.audio.addEventListener('ended', () => {
    state.isPlaying = false;
    updatePlayPauseBtn();
    stopAnimations();
    const ep = episodes.find(e => e.id == state.currentEpisodeId);
    if (ep) setEpisodeProgress(state.currentEpisodeId, ep.durationSeconds, ep.durationSeconds);
    updateGlobalProgress();
    renderEpisodes(state.activeCategory);
    renderContinueBanner();
    showToast('✅ Episodio completado');
  });
}

function updateTimeDisplay() {
  const cur = dom.audio.currentTime || 0;
  dom.currentTime.textContent = formatTime(cur);
}
function formatTime(sec) {
  if (isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateProgressBars() {
  if (!state.currentEpisodeId) return;
  const ep = episodes.find(e => e.id == state.currentEpisodeId);
  if (!ep) return;
  const percent = Math.min(100, (state.currentTime / ep.durationSeconds) * 100);
  dom.progressBarFill.style.width = percent + '%';
  dom.progressThumb.style.left = percent + '%';
  dom.miniProgressFill.style.width = percent + '%';
  const card = document.querySelector(`.episode-card[data-id="${state.currentEpisodeId}"]`);
  if (card) {
    const fill = card.querySelector('.episode-progress-fill');
    if (fill) fill.style.width = percent + '%';
  }
}

// ===== ANIMACIONES =====
function startAnimations() {
  dom.artworkRing1.classList.add('animate');
  dom.artworkRing2.classList.add('animate');
  dom.artworkRing3.classList.add('animate');
  dom.waveBars.classList.add('animating');
}
function stopAnimations() {
  dom.artworkRing1.classList.remove('animate');
  dom.artworkRing2.classList.remove('animate');
  dom.artworkRing3.classList.remove('animate');
  dom.waveBars.classList.remove('animating');
}

// ===== SCRUBBING =====
function setupScrubbing() {
  const container = dom.progressBarContainer;
  let dragging = false;
  function moveTo(clientX) {
    const rect = container.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    const ep = episodes.find(e => e.id == state.currentEpisodeId);
    if (ep) dom.audio.currentTime = percent * ep.durationSeconds;
  }
  container.addEventListener('mousedown', e => { dragging = true; moveTo(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', e => { if (dragging) moveTo(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  container.addEventListener('touchstart', e => { dragging = true; moveTo(e.touches[0].clientX); e.preventDefault(); });
  container.addEventListener('touchmove', e => { if (dragging) moveTo(e.touches[0].clientX); });
  container.addEventListener('touchend', () => { dragging = false; });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dom.categoryTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected','true');
      state.activeCategory = tab.dataset.category;
      renderEpisodes(state.activeCategory);
    });
  });
  dom.miniPlayBtn.addEventListener('click', togglePlayPause);
  dom.miniPlayerTrigger.addEventListener('click', () => {
    dom.expandedPlayer.classList.add('active'); dom.expandedPlayer.classList.remove('hidden');
  });
  dom.collapsePlayer.addEventListener('click', () => {
    dom.expandedPlayer.classList.remove('active');
    setTimeout(() => { if (!dom.expandedPlayer.classList.contains('active')) dom.expandedPlayer.classList.add('hidden'); }, 400);
  });
  dom.playPauseBtn.addEventListener('click', togglePlayPause);
  dom.rewindBtn.addEventListener('click', () => seek(-10));
  dom.forwardBtn.addEventListener('click', () => seek(10));
  dom.speedBtn.addEventListener('click', () => {
    const rates = [1, 1.5, 2];
    const idx = rates.indexOf(state.playbackRate);
    setPlaybackRate(rates[(idx + 1) % rates.length]);
  });
  dom.sleepTimerBtn.addEventListener('click', () => dom.sleepOptions.classList.toggle('hidden'));
  dom.sleepOptions.querySelectorAll('.sleep-option').forEach(btn => {
    btn.addEventListener('click', () => setSleepTimer(parseInt(btn.dataset.minutes)));
  });
  dom.continuePlayBtn.addEventListener('click', () => {
    const epId = dom.continueBanner.dataset.episodeId;
    if (epId) {
      const progress = getEpisodeProgress(epId);
      selectEpisode(epId, progress.position);
    }
  });
  setupScrubbing();
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ') { e.preventDefault(); togglePlayPause(); }
  });

  // Cerrar banner PRO
  dom.proCloseBtn.addEventListener('click', () => {
    dom.proBanner.style.opacity = '0';
    dom.proBanner.style.visibility = 'hidden';
  });
}

// ===== INSTALACIÓN PWA =====
function bindInstallBtn() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    dom.installBtn.style.display = 'inline-block';
  });

  dom.installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        dom.installBtn.style.display = 'none';
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    dom.installBtn.style.display = 'none';
    showToast('¡App instalada!');
  });
}

// ===== BANNER PRO =====
function initProBanner() {
  // Aparece a los 45 segundos (después de que se llame a esta función)
  setTimeout(() => {
    dom.proBanner.style.opacity = '1';
    dom.proBanner.style.visibility = 'visible';
  }, 45000);

  // El botón "Ver PRO" ya tiene el enlace en HTML
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== ARRANQUE =====
document.addEventListener('DOMContentLoaded', init);