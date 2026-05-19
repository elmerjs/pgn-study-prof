/* ============================================================
   PGN Study PRO - Lógica principal
   ============================================================ */

// ===== EPISODIOS (7 audios, orden recomendado) =====
const episodes = [
  {
    id: 1,
    title: 'Claves del núcleo común para la Procuraduría',
    subtitle: 'Fundamentos transversales',
    description: 'Conceptos esenciales comunes a todos los cargos de la PGN',
    category: 'comunes',
    emoji: '📚',
    file: 'audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a',
    duration: '28:04',
    durationSeconds: 1684
  },
  {
    id: 2,
    title: 'Estructura y funciones de la Procuraduría',
    subtitle: 'Organigrama y competencias',
    description: 'Decreto-Ley, funciones macro y estructura orgánica',
    category: 'comunes',
    emoji: '🏛️',
    file: 'audios/Estructura_y_funciones_de_la_Procuraduría.m4a',
    duration: '30:34',
    durationSeconds: 1834
  },
  {
    id: 3,
    title: 'Episodio 3 · Coordinación institucional',
    subtitle: 'Articulación interinstitucional',
    description: 'Roles del coordinador y gestión pública',
    category: 'comunes',
    emoji: '🎯',
    file: 'audios/Ep-3.m4a',
    duration: '19:49',
    durationSeconds: 1189
  },
  {
    id: 4,
    title: 'La gestión documental evita la impunidad',
    subtitle: 'Archivo y transparencia',
    description: 'Función disciplinaria y gestión documental en la PGN',
    category: 'comunes',
    emoji: '📄',
    file: 'audios/La_gestión_documental_evita_la_impunidad.m4a',
    duration: '25:41',
    durationSeconds: 1541
  },
  {
    id: 5,
    title: 'Ofimática y ética digital en la PGN',
    subtitle: 'Herramientas y principios',
    description: 'Competencias digitales y ética en el entorno laboral',
    category: 'comunes',
    emoji: '💻',
    file: 'audios/Ofimática_y_ética_digital_en_la_PGN.m4a',
    duration: '15:47',
    durationSeconds: 947
  },
  {
    id: 6,
    title: 'Lógica y pilares de la contratación estatal',
    subtitle: 'Contratación pública',
    description: 'Principios, etapas y normativa de la contratación',
    category: 'especificos',
    emoji: '📋',
    file: 'audios/Lógica_y_pilares_de_la_contratación_estatal.m4a',
    duration: '29:33',
    durationSeconds: 1773
  },
  {
    id: 7,
    title: 'Estrategia psicométrica para el examen PGN',
    subtitle: 'Pruebas comportamentales',
    description: 'Preparación para las pruebas psicotécnicas del concurso',
    category: 'comportamental',
    emoji: '🧠',
    file: 'audios/Estrategia_psicométrica_para_el_examen_PGN.m4a',
    duration: '18:32',
    durationSeconds: 1112
  }
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

let deferredPrompt = null;

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
  setTimeout(initProBanner, 1000);
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
  const map = {
    comunes: 'Comunes',
    especificos: 'Específicos',
    comportamental: 'Comportamental'
  };
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
  setTimeout(() => {
    dom.proBanner.style.opacity = '1';
    dom.proBanner.style.visibility = 'visible';
  }, 45000);
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