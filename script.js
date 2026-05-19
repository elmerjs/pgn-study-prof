/* ═══════════════════════════════════════════════════════════
   PGN STUDY — script.js
   Reproductor de podcasts educativos — Concurso de Méritos PGN
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── DATA ─────────────────────────────────────────────────── */
const EPISODES = [
  {
    id: 1,
    title: 'Claves del núcleo común para la Procuraduría',
    file: 'audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a',
    eje: 'estrategia',
    duration: '28:04',
    subtitulo: 'Núcleo común del concurso PGN',
    foco: 'Claves para abordar el núcleo común del examen',
  },
  {
    id: 2,
    title: 'Episodio 3 - Preparación PGN',
    file: 'audios/Ep-3.m4a',
    eje: 'estrategia',
    duration: '19:49',
    subtitulo: 'Episodio de preparación',
    foco: 'Estrategias de preparación para el concurso',
  },
  {
    id: 3,
    title: 'Estrategia psicométrica para el examen PGN',
    file: 'audios/Estrategia_psicométrica_para_el_examen_PGN.m4a',
    eje: 'estrategia',
    duration: '18:32',
    subtitulo: 'Componente psicométrico',
    foco: 'Evitar la trampa de la operatividad',
  },
  {
    id: 4,
    title: 'Estructura y funciones de la Procuraduría',
    file: 'audios/Estructura_y_funciones_de_la_Procuraduría.m4a',
    eje: 'estructura',
    duration: '30:34',
    subtitulo: 'Las cuatro funciones macro de la PGN',
    foco: 'Preventiva, Disciplinaria, Intervención y DD.HH.',
  },
  {
    id: 5,
    title: 'La gestión documental evita la impunidad',
    file: 'audios/La_gestión_documental_evita_la_impunidad.m4a',
    eje: 'funcional',
    duration: '25:41',
    subtitulo: 'Gestión documental en el Estado',
    foco: 'Cómo la gestión documental protege al servidor público',
  },
  {
    id: 6,
    title: 'La ruta legal del gasto público colombiano',
    file: 'audios/La_ruta_legal_del_gasto_público_colombiano.m4a',
    eje: 'funcional',
    duration: '26:20',
    subtitulo: 'Presupuesto público | Decreto 111 de 1996',
    foco: 'CDP, RP y PAC | Gestión financiera del Estado',
  },
  {
    id: 7,
    title: 'Lógica y pilares de la contratación estatal',
    file: 'audios/Lógica_y_pilares_de_la_contratación_estatal.m4a',
    eje: 'funcional',
    duration: '29:33',
    subtitulo: 'Ley 80 y Ley 1150 | Contratación Estatal',
    foco: 'Principios y modalidades de contratación',
  },
  {
    id: 8,
    title: 'Ofimática y ética digital en la PGN',
    file: 'audios/Ofimática_y_ética_digital_en_la_PGN.m4a',
    eje: 'funcional',
    duration: '15:47',
    subtitulo: 'Competencias digitales del servidor público',
    foco: 'Herramientas ofimáticas y ética en el uso de tecnología',
  },
];

/* ─── STORAGE KEYS ──────────────────────────────────────────── */
const STORAGE_KEY   = 'pgn_progress';   // { [id]: { position, completed } }
const STORAGE_THEME = 'pgn_theme';
const STORAGE_LAST  = 'pgn_last';       // { id, position }

/* ─── STATE ─────────────────────────────────────────────────── */
let state = {
  currentId:    null,
  playing:      false,
  speed:        1,
  filter:       'todos',
  sleepTimerId: null,
  sleepEndsAt:  null,
  progress:     {},   // loaded from localStorage
  lastPlayed:   null, // loaded from localStorage
};

const SPEED_CYCLE = [1, 1.5, 2];

/* ─── DOM REFS ──────────────────────────────────────────────── */
const audio             = document.getElementById('audioPlayer');
const episodesList      = document.getElementById('episodesList');
const globalProgressFill= document.getElementById('globalProgressFill');
const completedCount    = document.getElementById('completedCount');
const continueBanner    = document.getElementById('continueBanner');
const continueBannerTitle= document.getElementById('continueBannerTitle');
const continueBannerBtn = document.getElementById('continueBannerBtn');
const tabs              = document.querySelectorAll('.tab');

// Full player
const fullPlayer        = document.getElementById('fullPlayer');
const playerClose       = document.getElementById('playerClose');
const playPauseBtn      = document.getElementById('playPauseBtn');
const seekbar           = document.getElementById('seekbar');
const seekbarFill       = document.getElementById('seekbarFill');
const currentTimeEl     = document.getElementById('currentTime');
const totalTimeEl       = document.getElementById('totalTime');
const skipBack          = document.getElementById('skipBack');
const skipFwd           = document.getElementById('skipFwd');
const speedBtn          = document.getElementById('speedBtn');
const artDisc           = document.getElementById('artDisc');
const fpTitle           = document.getElementById('fpTitle');
const fpSub             = document.getElementById('fpSub');
const fpFoco            = document.getElementById('fpFoco');
const fpEje             = document.getElementById('fpEje');

// Mini player
const miniPlayer        = document.getElementById('miniPlayer');
const miniTitle         = document.getElementById('miniTitle');
const miniSub           = document.getElementById('miniSub');
const miniPlay          = document.getElementById('miniPlay');
const miniProgressFill  = document.getElementById('miniProgressFill');
const miniLeft          = document.getElementById('miniLeft');

// Sleep
const sleepBtn          = document.getElementById('sleepBtn');
const sleepMenu         = document.getElementById('sleepMenu');
const sleepBadge        = document.getElementById('sleepBadge');
const sleepCancel       = document.getElementById('sleepCancel');
const sleepOptions      = document.querySelectorAll('.sleep-option[data-min]');

// Theme
const themeToggle       = document.getElementById('themeToggle');

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
function init() {
  loadFromStorage();
  applyTheme();
  renderEpisodes();
  updateGlobalProgress();
  showContinueBanner();
  registerServiceWorker();
  bindEvents();
}

/* ─── STORAGE ───────────────────────────────────────────────── */
function loadFromStorage() {
  try {
    state.progress   = JSON.parse(localStorage.getItem(STORAGE_KEY))  || {};
    state.lastPlayed = JSON.parse(localStorage.getItem(STORAGE_LAST)) || null;
  } catch {
    state.progress   = {};
    state.lastPlayed = null;
  }
  // Theme
  const savedTheme = localStorage.getItem(STORAGE_THEME);
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
}

function saveProgress(id, position, completed = false) {
  const prev = state.progress[id] || {};
  state.progress[id] = {
    position: position,
    completed: completed || prev.completed || false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function saveLastPlayed(id, position) {
  state.lastPlayed = { id, position };
  localStorage.setItem(STORAGE_LAST, JSON.stringify(state.lastPlayed));
}

/* ─── THEME ─────────────────────────────────────────────────── */
function applyTheme() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  localStorage.setItem(STORAGE_THEME, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_THEME, next);
}

/* ─── CONTINUE BANNER ───────────────────────────────────────── */
function showContinueBanner() {
  if (!state.lastPlayed) return;
  const { id, position } = state.lastPlayed;
  const ep = EPISODES.find(e => e.id === id);
  if (!ep || !position || position < 5) return;
  // Don't show if completed
  if (state.progress[id]?.completed) return;

  continueBannerTitle.textContent = ep.title;
  continueBanner.hidden = false;
}

/* ─── RENDER EPISODES ───────────────────────────────────────── */
function renderEpisodes() {
  const filtered = state.filter === 'todos'
    ? EPISODES
    : EPISODES.filter(e => e.eje === state.filter);

  episodesList.innerHTML = '';

  if (filtered.length === 0) {
    episodesList.innerHTML = '<div class="empty-state">No hay episodios en esta categoría.</div>';
    return;
  }

  filtered.forEach(ep => {
    const prog = state.progress[ep.id] || {};
    const pct  = prog.position && ep._totalSeconds
      ? Math.min(100, (prog.position / ep._totalSeconds) * 100)
      : 0;
    const isPlaying   = state.currentId === ep.id && state.playing;
    const isCompleted = prog.completed;

    const card = document.createElement('div');
    card.className = [
      'episode-card',
      isPlaying   ? 'playing'   : '',
      isCompleted ? 'completed' : '',
    ].filter(Boolean).join(' ');
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', ep.title);
    card.dataset.id = ep.id;

    card.innerHTML = `
      <div class="ep-number">
        ${isPlaying
          ? `<div class="playing-anim" aria-hidden="true"><span></span><span></span><span></span></div>`
          : isCompleted
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<span>${ep.id}</span>`
        }
      </div>
      <div class="ep-info">
        <div class="ep-tag-row">
          <span class="ep-tag ${ep.eje}">${ep.eje}</span>
        </div>
        <div class="ep-title">${ep.title}</div>
        <div class="ep-sub">${ep.subtitulo}</div>
      </div>
      <div class="ep-right">
        <span class="ep-duration">${ep.duration}</span>
        <div class="ep-progress">
          <div class="ep-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectEpisode(ep.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectEpisode(ep.id); } });

    episodesList.appendChild(card);
  });
}

/* ─── GLOBAL PROGRESS ───────────────────────────────────────── */
function updateGlobalProgress() {
  const done = Object.values(state.progress).filter(p => p.completed).length;
  const pct  = (done / EPISODES.length) * 100;
  completedCount.textContent = done;
  globalProgressFill.style.width = pct + '%';
  globalProgressFill.closest('[role="progressbar"]').setAttribute('aria-valuenow', done);
}

/* ═══════════════════════════════════════════════════════════
   PLAYER
   ═══════════════════════════════════════════════════════════ */
function selectEpisode(id) {
  const ep = EPISODES.find(e => e.id === id);
  if (!ep) return;

  if (state.currentId === id) {
    // Toggle play/pause
    if (state.playing) pauseAudio();
    else playAudio();
    openFullPlayer();
    return;
  }

  // New episode
  state.currentId = id;
  audio.src = ep.file;
  audio.playbackRate = state.speed;

  const savedPos = state.progress[id]?.position || 0;
  if (savedPos > 5) audio.currentTime = savedPos;

  updateFullPlayerUI(ep);
  updateMiniPlayer(ep);
  showMiniPlayer();
  openFullPlayer();

  audio.play().then(() => {
    state.playing = true;
    updatePlayButtons(true);
    startDiscSpin();
  }).catch(err => {
    console.warn('Playback error:', err);
  });

  renderEpisodes();
}

function playAudio() {
  audio.play().then(() => {
    state.playing = true;
    updatePlayButtons(true);
    startDiscSpin();
  }).catch(console.warn);
}

function pauseAudio() {
  audio.pause();
  state.playing = false;
  updatePlayButtons(false);
  stopDiscSpin();
}

function updatePlayButtons(playing) {
  // Full player
  playPauseBtn.querySelector('.icon-play').hidden  =  playing;
  playPauseBtn.querySelector('.icon-pause').hidden = !playing;
  // Mini player
  miniPlay.querySelector('.icon-play').hidden  =  playing;
  miniPlay.querySelector('.icon-pause').hidden = !playing;
}

function startDiscSpin() { artDisc.classList.add('spinning'); }
function stopDiscSpin()  { artDisc.classList.remove('spinning'); }

/* ─── FULL PLAYER UI ────────────────────────────────────────── */
function updateFullPlayerUI(ep) {
  fpTitle.textContent = ep.title;
  fpSub.textContent   = ep.subtitulo;
  fpFoco.textContent  = ep.foco;
  fpEje.textContent   = ep.eje.charAt(0).toUpperCase() + ep.eje.slice(1);
}

function openFullPlayer() {
  fullPlayer.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeFullPlayer() {
  fullPlayer.hidden = true;
  document.body.style.overflow = '';
}

/* ─── MINI PLAYER ───────────────────────────────────────────── */
function showMiniPlayer() {
  miniPlayer.hidden = false;
}

function updateMiniPlayer(ep) {
  miniTitle.textContent = ep.title;
  miniSub.textContent   = ep.subtitulo;
}

/* ─── AUDIO EVENTS ──────────────────────────────────────────── */
audio.addEventListener('timeupdate', onTimeUpdate);
audio.addEventListener('loadedmetadata', onLoadedMetadata);
audio.addEventListener('ended', onEnded);
audio.addEventListener('pause', () => {
  if (state.currentId && audio.currentTime > 0) {
    saveProgress(state.currentId, audio.currentTime, state.progress[state.currentId]?.completed);
    saveLastPlayed(state.currentId, audio.currentTime);
  }
});

function onTimeUpdate() {
  if (!audio.duration) return;

  const current  = audio.currentTime;
  const duration = audio.duration;
  const pct      = (current / duration) * 100;

  // Seekbar
  seekbar.value = pct;
  seekbarFill.style.width = pct + '%';
  miniProgressFill.style.width = pct + '%';

  // Time display
  currentTimeEl.textContent = formatTime(current);

  // Auto-save every 5 seconds
  if (Math.floor(current) % 5 === 0 && state.currentId) {
    saveProgress(state.currentId, current, state.progress[state.currentId]?.completed);
    saveLastPlayed(state.currentId, current);
    updateCardProgress(state.currentId, pct);
  }

  // Mark complete at 95%
  if (pct >= 95 && state.currentId) {
    const wasCompleted = state.progress[state.currentId]?.completed;
    if (!wasCompleted) {
      saveProgress(state.currentId, current, true);
      updateGlobalProgress();
      updateCardProgress(state.currentId, pct, true);
    }
  }

  // Sleep timer check
  if (state.sleepEndsAt && Date.now() >= state.sleepEndsAt) {
    pauseAudio();
    clearSleepTimer();
  }
}

function onLoadedMetadata() {
  const duration = audio.duration;
  totalTimeEl.textContent = formatTime(duration);

  // Store total seconds on the episode object for progress calculation
  if (state.currentId) {
    const ep = EPISODES.find(e => e.id === state.currentId);
    if (ep) ep._totalSeconds = duration;
  }
}

function onEnded() {
  state.playing = false;
  updatePlayButtons(false);
  stopDiscSpin();

  if (state.currentId) {
    saveProgress(state.currentId, audio.duration || 0, true);
    updateGlobalProgress();
    renderEpisodes();
    saveLastPlayed(state.currentId, 0);
  }
}

/* ─── CARD PROGRESS UPDATE (live) ──────────────────────────── */
function updateCardProgress(id, pct, completed = false) {
  const card = episodesList.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  const fill = card.querySelector('.ep-progress-fill');
  if (fill) fill.style.width = pct + '%';
  if (completed) card.classList.add('completed');
}

/* ─── SEEKBAR ───────────────────────────────────────────────── */
let isSeeking = false;
seekbar.addEventListener('mousedown',  () => { isSeeking = true; });
seekbar.addEventListener('touchstart', () => { isSeeking = true; });
seekbar.addEventListener('input', () => {
  const pct = parseFloat(seekbar.value);
  seekbarFill.style.width = pct + '%';
  if (audio.duration) {
    currentTimeEl.textContent = formatTime((pct / 100) * audio.duration);
  }
});
seekbar.addEventListener('change', () => {
  if (audio.duration) {
    audio.currentTime = (parseFloat(seekbar.value) / 100) * audio.duration;
  }
  isSeeking = false;
});

/* ─── SKIP ──────────────────────────────────────────────────── */
skipBack.addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
skipFwd.addEventListener('click',  () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30); });

/* ─── SPEED ─────────────────────────────────────────────────── */
speedBtn.addEventListener('click', () => {
  const idx  = SPEED_CYCLE.indexOf(state.speed);
  state.speed = SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length];
  audio.playbackRate = state.speed;
  speedBtn.textContent = state.speed === 1 ? '1×' : state.speed + '×';
  speedBtn.classList.toggle('active', state.speed !== 1);
});

/* ─── SLEEP TIMER ───────────────────────────────────────────── */
sleepBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sleepMenu.hidden = !sleepMenu.hidden;
});

sleepOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const min = parseInt(btn.dataset.min, 10);
    setSleepTimer(min);
    sleepMenu.hidden = true;
  });
});

sleepCancel.addEventListener('click', () => {
  clearSleepTimer();
  sleepMenu.hidden = true;
});

function setSleepTimer(minutes) {
  if (state.sleepTimerId) clearTimeout(state.sleepTimerId);
  state.sleepEndsAt  = Date.now() + minutes * 60 * 1000;
  sleepBadge.hidden  = false;
  sleepCancel.hidden = false;

  state.sleepTimerId = setTimeout(() => {
    pauseAudio();
    clearSleepTimer();
  }, minutes * 60 * 1000);
}

function clearSleepTimer() {
  if (state.sleepTimerId) clearTimeout(state.sleepTimerId);
  state.sleepTimerId = null;
  state.sleepEndsAt  = null;
  sleepBadge.hidden  = true;
  sleepCancel.hidden = true;
}

/* ─── CLOSE SLEEP MENU ON OUTSIDE CLICK ────────────────────── */
document.addEventListener('click', (e) => {
  if (!sleepMenu.hidden && !sleepBtn.contains(e.target) && !sleepMenu.contains(e.target)) {
    sleepMenu.hidden = true;
  }
});

/* ═══════════════════════════════════════════════════════════
   BIND EVENTS
   ═══════════════════════════════════════════════════════════ */
function bindEvents() {
  // Theme
  themeToggle.addEventListener('click', toggleTheme);

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.filter = tab.dataset.filter;
      renderEpisodes();
    });
  });

  // Full player close
  playerClose.addEventListener('click', closeFullPlayer);

  // Full player play/pause
  playPauseBtn.addEventListener('click', () => {
    if (state.playing) pauseAudio();
    else playAudio();
  });

  // Mini player — left area opens full player
  miniLeft.addEventListener('click', () => {
    if (state.currentId) openFullPlayer();
  });

  // Mini play button
  miniPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.playing) pauseAudio();
    else playAudio();
  });

  // Continue banner
  continueBannerBtn.addEventListener('click', () => {
    if (state.lastPlayed) {
      selectEpisode(state.lastPlayed.id);
      continueBanner.hidden = true;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentId) {
        if (state.playing) pauseAudio();
        else playAudio();
      }
    }
    if (e.code === 'ArrowLeft')  { audio.currentTime = Math.max(0, audio.currentTime - 15); }
    if (e.code === 'ArrowRight') { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30); }
    if (e.code === 'Escape' && !fullPlayer.hidden) { closeFullPlayer(); }
  });
}

/* ═══════════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════════ */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ═══════════════════════════════════════════════════════════
   SERVICE WORKER
   ═══════════════════════════════════════════════════════════ */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PGN] SW registrado:', reg.scope))
      .catch(err => console.warn('[PGN] SW error:', err));
  }
}

/* ─── START ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
