/* ============================================================
   PGN STUDY PRO · COORDINADOR - Lógica principal
   ============================================================ */

// ========== CONFIGURACIÓN ==========
// CONTRASEÑA ADMIN: admin123  <-- Cambiar por la deseada
const ADMIN_PASSWORD = 'admin123';

// Episodios base precargados
const BASE_EPISODES = [
  {
    id: 'base-1',
    title: 'Claves del núcleo común para la Procuraduría',
    subtitle: 'Núcleo común · Componente de conocimiento',
    description: 'Fundamentos transversales para todos los cargos PGN',
    category: 'general',
    emoji: '📚',
    file: 'audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a',
    duration: '28:04',
    durationSeconds: 28*60 + 4,
    isBase: true
  },
  {
    id: 'base-2',
    title: 'Episodio 3 · Coordinación institucional',
    subtitle: 'Gestión pública y coordinación',
    description: 'Articulación interinstitucional y roles del coordinador',
    category: 'general',
    emoji: '🎯',
    file: 'audios/Ep-3.m4a',
    duration: '19:49',
    durationSeconds: 19*60 + 49,
    isBase: true
  },
  {
    id: 'base-3',
    title: 'Estructura y funciones de la Procuraduría',
    subtitle: 'Estructura orgánica PGN · Decreto-Ley',
    description: 'Organigrama, funciones macro y competencias por nivel',
    category: 'general',
    emoji: '🏛️',
    file: 'audios/Estructura_y_funciones_de_la_Procuraduría.m4a',
    duration: '30:34',
    durationSeconds: 30*60 + 34,
    isBase: true
  }
];

// ========== ESTADO GLOBAL ==========
const state = {
  currentEpisodeId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  sleepTimerMinutes: null,
  sleepTimeoutId: null,
  activeCategory: 'all',
  adminAuthenticated: false,
  theme: 'dark'
};

// ========== ELEMENTOS DEL DOM ==========
const dom = {
  // Header
  themeToggle: document.getElementById('themeToggle'),
  adminTrigger: document.getElementById('adminTrigger'),
  globalProgressBar: document.querySelector('.global-progress-bar'),
  globalProgressText: document.getElementById('globalProgressText'),

  // Continue banner
  continueBanner: document.getElementById('continueBanner'),
  continueTitle: document.getElementById('continueTitle'),
  continueProgressFill: document.getElementById('continueProgressFill'),
  continuePlayBtn: document.getElementById('continuePlayBtn'),

  // Tabs
  categoryTabs: document.querySelectorAll('.cat-tab'),

  // Episodes list
  episodesList: document.getElementById('episodesList'),
  emptyState: document.getElementById('emptyState'),

  // Mini player
  miniPlayer: document.getElementById('miniPlayer'),
  miniPlayerTrigger: document.getElementById('miniPlayerTrigger'),
  miniArtwork: document.getElementById('miniArtwork'),
  miniTitle: document.getElementById('miniTitle'),
  miniProgressFill: document.getElementById('miniProgressFill'),
  miniPlayBtn: document.getElementById('miniPlayBtn'),

  // Expanded player
  expandedPlayer: document.getElementById('expandedPlayer'),
  collapsePlayer: document.getElementById('collapsePlayer'),
  artworkRing1: document.getElementById('artworkRing1'),
  artworkRing2: document.getElementById('artworkRing2'),
  artworkRing3: document.getElementById('artworkRing3'),
  artworkEmoji: document.getElementById('artworkEmoji'),
  waveBars: document.getElementById('waveBars'),
  playerTitle: document.getElementById('playerTitle'),
  playerSubtitle: document.getElementById('playerSubtitle'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  progressBarContainer: document.getElementById('progressBarContainer'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressThumb: document.getElementById('progressThumb'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  playIcon: document.getElementById('playIcon'),
  pauseIcon: document.getElementById('pauseIcon'),
  rewindBtn: document.getElementById('rewindBtn'),
  forwardBtn: document.getElementById('forwardBtn'),
  speedBtn: document.getElementById('speedBtn'),
  sleepTimerBtn: document.getElementById('sleepTimerBtn'),
  sleepOptions: document.getElementById('sleepOptions'),

  // Admin
  adminModal: document.getElementById('adminModal'),
  closeAdmin: document.getElementById('closeAdmin'),
  adminAuth: document.getElementById('adminAuth'),
  adminPassword: document.getElementById('adminPassword'),
  adminLoginBtn: document.getElementById('adminLoginBtn'),
  adminError: document.getElementById('adminError'),
  adminContent: document.getElementById('adminContent'),
  newTitle: document.getElementById('newTitle'),
  newSubtitle: document.getElementById('newSubtitle'),
  newDesc: document.getElementById('newDesc'),
  newCategory: document.getElementById('newCategory'),
  newEmoji: document.getElementById('newEmoji'),
  newFileName: document.getElementById('newFileName'),
  newDuration: document.getElementById('newDuration'),
  addEpisodeBtn: document.getElementById('addEpisodeBtn'),
  adminEpisodeList: document.getElementById('adminEpisodeList'),

  // Audio
  audio: document.getElementById('audioPlayer'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ========== INICIALIZACIÓN ==========
function init() {
  loadTheme();
  loadProgressFromStorage();
  loadAdminEpisodes();
  updateGlobalProgress();
  renderEpisodes();
  renderContinueBanner();
  setupEventListeners();
  setupAudioListeners();
  // Si hay un sleep timer guardado, no lo restauramos (decisión de diseño)
}

// ========== TEMA ==========
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

// ========== GESTIÓN DE EPISODIOS (base + admin) ==========
function getAllEpisodes() {
  const adminEpisodes = getAdminEpisodesFromStorage();
  return [...BASE_EPISODES, ...adminEpisodes];
}

function getAdminEpisodesFromStorage() {
  try {
    const data = localStorage.getItem('pgn-admin-episodes');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function loadAdminEpisodes() {
  // Nada que cargar en estado, se leen bajo demanda
}

function saveAdminEpisodes(episodes) {
  localStorage.setItem('pgn-admin-episodes', JSON.stringify(episodes));
}

// ========== PROGRESO DE AUDIOS (localStorage) ==========
function getProgressFromStorage() {
  try {
    const data = localStorage.getItem('pgn-progress');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveProgressToStorage(progress) {
  localStorage.setItem('pgn-progress', JSON.stringify(progress));
}

function getEpisodeProgress(episodeId) {
  const all = getProgressFromStorage();
  return all[episodeId] || { position: 0, completed: false };
}

function setEpisodeProgress(episodeId, position, durationSeconds) {
  const all = getProgressFromStorage();
  const completed = (position / durationSeconds) >= 0.95;
  all[episodeId] = { position, completed };
  // Guardar último episodio escuchado
  if (position > 0) {
    localStorage.setItem('pgn-last-episode', episodeId);
  }
  saveProgressToStorage(all);
  updateGlobalProgress();
}

function getCompletedCount() {
  const all = getProgressFromStorage();
  let count = 0;
  Object.values(all).forEach(p => {
    if (p.completed) count++;
  });
  return count;
}

function updateGlobalProgress() {
  const total = getAllEpisodes().length;
  const completed = getCompletedCount();
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  dom.globalProgressBar.style.setProperty('--progress-width', percent + '%');
  dom.globalProgressBar.style.setProperty('width', '100%'); /* necesario? usamos pseudo */
  // Actualizar el pseudo-elemento via estilo inline? Mejor actualizamos el width del after manipulando una variable
  dom.globalProgressBar.style.setProperty('--progress-fill', percent + '%');
  // Usaremos un style inline en el pseudo con CSS custom property
  document.documentElement.style.setProperty('--global-progress-width', percent + '%');
  dom.globalProgressText.textContent = `${percent}% completado (${completed}/${total})`;
  // También actualizar aria
  dom.globalProgressBar.parentElement.querySelector('.global-progress-bar')?.setAttribute?.('aria-valuenow', percent);
}

// ========== CONTINUAR ESCUCHANDO ==========
function renderContinueBanner() {
  const lastId = localStorage.getItem('pgn-last-episode');
  if (!lastId) {
    dom.continueBanner.classList.add('hidden');
    return;
  }
  const progress = getEpisodeProgress(lastId);
  if (!progress || progress.position <= 0 || progress.completed) {
    dom.continueBanner.classList.add('hidden');
    return;
  }
  const episode = getAllEpisodes().find(ep => ep.id === lastId);
  if (!episode) {
    dom.continueBanner.classList.add('hidden');
    return;
  }
  const percent = Math.min(100, (progress.position / episode.durationSeconds) * 100);
  dom.continueTitle.textContent = episode.title;
  dom.continueProgressFill.style.width = percent + '%';
  dom.continueBanner.classList.remove('hidden');
  // Guardar referencia para el click
  dom.continueBanner.dataset.episodeId = lastId;
}

// ========== RENDERIZAR EPISODIOS ==========
function renderEpisodes(category = 'all') {
  const all = getAllEpisodes();
  const filtered = category === 'all' ? all : all.filter(ep => ep.category === category);
  dom.episodesList.innerHTML = '';

  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    dom.episodesList.classList.add('hidden');
  } else {
    dom.emptyState.classList.add('hidden');
    dom.episodesList.classList.remove('hidden');
  }

  filtered.forEach(ep => {
    const progress = getEpisodeProgress(ep.id);
    const percent = ep.durationSeconds ? Math.min(100, (progress.position / ep.durationSeconds) * 100) : 0;
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${ep.title}, ${ep.category}`);
    card.dataset.id = ep.id;
    card.innerHTML = `
      <div class="episode-emoji">${ep.emoji || '🎧'}</div>
      <div class="episode-content">
        <span class="episode-badge badge-${ep.category}">${getCategoryName(ep.category)}</span>
        <h3 class="episode-title">${ep.title}</h3>
        <p class="episode-subtitle">${ep.subtitle || ''}</p>
        <p class="episode-desc">${ep.description || ''}</p>
        <div class="episode-meta">
          <span class="episode-duration">⏱️ ${ep.duration}</span>
          ${progress.completed ? '<span style="color:var(--accent)">✓ Completado</span>' : ''}
        </div>
        <div class="episode-progress-individual">
          <div class="episode-progress-fill" style="width:${percent}%"></div>
        </div>
      </div>
    `;
    card.addEventListener('click', () => selectEpisode(ep.id));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectEpisode(ep.id); });
    dom.episodesList.appendChild(card);
  });
}

function getCategoryName(slug) {
  const map = {
    'general': 'Conocimiento General',
    'especifico': 'Conocimiento Específico',
    'comportamental': 'Comportamental'
  };
  return map[slug] || slug;
}

// ========== SELECCIÓN Y REPRODUCCIÓN ==========
function selectEpisode(episodeId, startPosition = null) {
  const episode = getAllEpisodes().find(ep => ep.id === episodeId);
  if (!episode) return;

  // Si ya está seleccionado y no se fuerza posición, solo toggle play/pausa
  if (state.currentEpisodeId === episodeId && startPosition === null) {
    togglePlayPause();
    return;
  }

  // Actualizar estado
  state.currentEpisodeId = episodeId;
  state.currentTime = startPosition !== null ? startPosition : getEpisodeProgress(episodeId).position;

  // Cargar audio
  dom.audio.src = episode.file;
  dom.audio.load();

  // Actualizar UI
  updatePlayerUI(episode);
  showMiniPlayer();
  dom.expandedPlayer.classList.add('active');
  dom.expandedPlayer.classList.remove('hidden');

  // Intentar reproducir
  dom.audio.play().then(() => {
    state.isPlaying = true;
    updatePlayPauseButton();
    startArtworkAnimation();
    startWaveAnimation();
  }).catch(err => {
    console.warn('Reproducción automática bloqueada:', err);
    state.isPlaying = false;
    updatePlayPauseButton();
  });
}

function updatePlayerUI(episode) {
  dom.miniArtwork.textContent = episode.emoji || '🎧';
  dom.miniTitle.textContent = episode.title;
  dom.artworkEmoji.textContent = episode.emoji || '🎧';
  dom.playerTitle.textContent = episode.title;
  dom.playerSubtitle.textContent = episode.subtitle || '';
  dom.totalTime.textContent = episode.duration;
}

function showMiniPlayer() {
  dom.miniPlayer.classList.remove('hidden');
}

function hideMiniPlayer() {
  dom.miniPlayer.classList.add('hidden');
  dom.expandedPlayer.classList.add('hidden');
  dom.expandedPlayer.classList.remove('active');
}

// ========== CONTROLES DE REPRODUCCIÓN ==========
function togglePlayPause() {
  if (!state.currentEpisodeId) return;
  if (state.isPlaying) {
    dom.audio.pause();
    state.isPlaying = false;
    stopArtworkAnimation();
    stopWaveAnimation();
  } else {
    dom.audio.play().then(() => {
      state.isPlaying = true;
      startArtworkAnimation();
      startWaveAnimation();
    }).catch(() => {});
  }
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
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
  dom.speedBtn.textContent = rate === 1 ? '1×' : rate + '×';
}

function setSleepTimer(minutes) {
  // Limpiar anterior
  if (state.sleepTimeoutId) {
    clearTimeout(state.sleepTimeoutId);
    state.sleepTimeoutId = null;
  }
  state.sleepTimerMinutes = minutes;
  if (minutes > 0) {
    state.sleepTimeoutId = setTimeout(() => {
      if (state.isPlaying) {
        dom.audio.pause();
        state.isPlaying = false;
        updatePlayPauseButton();
        stopArtworkAnimation();
        stopWaveAnimation();
        showToast('⏰ Temporizador: reproducción pausada');
      }
      state.sleepTimerMinutes = null;
    }, minutes * 60 * 1000);
    showToast(`⏳ Temporizador: ${minutes} minutos`);
  } else {
    showToast('Temporizador cancelado');
  }
  dom.sleepOptions.classList.add('hidden');
}

// ========== MANEJO DE AUDIO (eventos) ==========
function setupAudioListeners() {
  const audio = dom.audio;

  audio.addEventListener('loadedmetadata', () => {
    state.duration = audio.duration;
    // Si hay posición guardada y es la primera carga
    if (state.currentEpisodeId && state.currentTime > 0) {
      audio.currentTime = state.currentTime;
    }
    // Mostrar duración real si difiere
    updateTimeDisplay();
  });

  audio.addEventListener('timeupdate', () => {
    if (!state.currentEpisodeId) return;
    state.currentTime = audio.currentTime;
    updateTimeDisplay();
    updateProgressBars();
    // Guardar progreso periódicamente (cada 5 segundos aprox.)
    if (Math.floor(audio.currentTime) % 5 === 0) {
      const ep = getAllEpisodes().find(e => e.id === state.currentEpisodeId);
      if (ep) setEpisodeProgress(state.currentEpisodeId, audio.currentTime, ep.durationSeconds);
    }
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    updatePlayPauseButton();
    stopArtworkAnimation();
    stopWaveAnimation();
    // Marcar como completado
    if (state.currentEpisodeId) {
      const ep = getAllEpisodes().find(e => e.id === state.currentEpisodeId);
      if (ep) setEpisodeProgress(state.currentEpisodeId, ep.durationSeconds, ep.durationSeconds);
    }
    updateGlobalProgress();
    renderEpisodes(state.activeCategory);
    renderContinueBanner();
    showToast('✅ Episodio completado');
  });

  audio.addEventListener('pause', () => {
    // Guardar progreso al pausar
    if (state.currentEpisodeId) {
      const ep = getAllEpisodes().find(e => e.id === state.currentEpisodeId);
      if (ep) setEpisodeProgress(state.currentEpisodeId, audio.currentTime, ep.durationSeconds);
    }
  });
}

function updateTimeDisplay() {
  const current = dom.audio.currentTime || 0;
  dom.currentTime.textContent = formatTime(current);
  // Total time from episode metadata or audio
  const ep = state.currentEpisodeId ? getAllEpisodes().find(e => e.id === state.currentEpisodeId) : null;
  if (ep) {
    dom.totalTime.textContent = ep.duration;
  } else if (dom.audio.duration) {
    dom.totalTime.textContent = formatTime(dom.audio.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateProgressBars() {
  if (!state.currentEpisodeId) return;
  const ep = getAllEpisodes().find(e => e.id === state.currentEpisodeId);
  if (!ep) return;
  const percent = Math.min(100, (state.currentTime / ep.durationSeconds) * 100);
  // Barra expandida
  dom.progressBarFill.style.width = percent + '%';
  dom.progressThumb.style.left = percent + '%';
  dom.progressBarContainer.setAttribute('aria-valuenow', Math.round(percent));
  // Mini barra
  dom.miniProgressFill.style.width = percent + '%';
  // Actualizar tarjeta correspondiente (si visible)
  const card = document.querySelector(`.episode-card[data-id="${state.currentEpisodeId}"]`);
  if (card) {
    const fill = card.querySelector('.episode-progress-fill');
    if (fill) fill.style.width = percent + '%';
  }
}

// ========== ANIMACIONES ==========
function startArtworkAnimation() {
  dom.artworkRing1.classList.add('animate');
  dom.artworkRing2.classList.add('animate');
  dom.artworkRing3.classList.add('animate');
}

function stopArtworkAnimation() {
  dom.artworkRing1.classList.remove('animate');
  dom.artworkRing2.classList.remove('animate');
  dom.artworkRing3.classList.remove('animate');
}

function startWaveAnimation() {
  dom.waveBars.classList.add('animating');
}

function stopWaveAnimation() {
  dom.waveBars.classList.remove('animating');
}

// ========== SCRUBBING ==========
function setupScrubbing() {
  const container = dom.progressBarContainer;
  let dragging = false;

  function moveToPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    const ep = state.currentEpisodeId ? getAllEpisodes().find(e => e.id === state.currentEpisodeId) : null;
    if (ep && ep.durationSeconds) {
      const newTime = percent * ep.durationSeconds;
      dom.audio.currentTime = newTime;
    }
  }

  container.addEventListener('mousedown', (e) => {
    dragging = true;
    moveToPosition(e.clientX);
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (dragging) moveToPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  // Touch events
  container.addEventListener('touchstart', (e) => {
    dragging = true;
    moveToPosition(e.touches[0].clientX);
    e.preventDefault();
  });

  container.addEventListener('touchmove', (e) => {
    if (dragging) moveToPosition(e.touches[0].clientX);
  });

  container.addEventListener('touchend', () => {
    dragging = false;
  });

  // Keyboard
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 5 : -5;
      seek(step);
    }
  });
}

// ========== EVENT LISTENERS GENERALES ==========
function setupEventListeners() {
  // Tema
  dom.themeToggle.addEventListener('click', toggleTheme);

  // Admin trigger
  dom.adminTrigger.addEventListener('click', () => {
    openAdminModal();
  });

  // Cerrar admin
  dom.closeAdmin.addEventListener('click', closeAdminModal);
  dom.adminModal.querySelector('.admin-overlay').addEventListener('click', closeAdminModal);

  // Admin login
  dom.adminLoginBtn.addEventListener('click', handleAdminLogin);
  dom.adminPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdminLogin();
  });

  // Admin agregar episodio
  dom.addEpisodeBtn.addEventListener('click', handleAddEpisode);

  // Pestañas de categoría
  dom.categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dom.categoryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.activeCategory = tab.dataset.category;
      renderEpisodes(state.activeCategory);
    });
  });

  // Mini player
  dom.miniPlayBtn.addEventListener('click', togglePlayPause);
  dom.miniPlayerTrigger.addEventListener('click', () => {
    dom.expandedPlayer.classList.add('active');
    dom.expandedPlayer.classList.remove('hidden');
  });

  // Colapsar player expandido
  dom.collapsePlayer.addEventListener('click', () => {
    dom.expandedPlayer.classList.remove('active');
    // No ocultar mini player
    setTimeout(() => {
      if (!dom.expandedPlayer.classList.contains('active')) {
        dom.expandedPlayer.classList.add('hidden');
      }
    }, 400);
  });

  // Controles expandidos
  dom.playPauseBtn.addEventListener('click', togglePlayPause);
  dom.rewindBtn.addEventListener('click', () => seek(-10));
  dom.forwardBtn.addEventListener('click', () => seek(10));
  dom.speedBtn.addEventListener('click', () => {
    const rates = [1, 1.5, 2];
    const currentIdx = rates.indexOf(state.playbackRate);
    const nextIdx = (currentIdx + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  });
  dom.sleepTimerBtn.addEventListener('click', () => {
    dom.sleepOptions.classList.toggle('hidden');
  });

  // Sleep options
  dom.sleepOptions.querySelectorAll('.sleep-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes);
      setSleepTimer(minutes);
    });
  });

  // Continue banner
  dom.continuePlayBtn.addEventListener('click', () => {
    const episodeId = dom.continueBanner.dataset.episodeId;
    if (episodeId) {
      const progress = getEpisodeProgress(episodeId);
      selectEpisode(episodeId, progress.position);
    }
  });

  // Configurar scrubbing
  setupScrubbing();

  // Teclado global
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
    }
  });
}

// ========== ADMIN ==========
function openAdminModal() {
  dom.adminModal.classList.remove('hidden');
  dom.adminPassword.value = '';
  dom.adminError.classList.add('hidden');
  if (state.adminAuthenticated) {
    showAdminPanel();
  } else {
    dom.adminAuth.classList.remove('hidden');
    dom.adminContent.classList.add('hidden');
  }
}

function closeAdminModal() {
  dom.adminModal.classList.add('hidden');
}

function handleAdminLogin() {
  const pass = dom.adminPassword.value.trim();
  if (pass === ADMIN_PASSWORD) {
    state.adminAuthenticated = true;
    dom.adminError.classList.add('hidden');
    showAdminPanel();
  } else {
    dom.adminError.classList.remove('hidden');
  }
}

function showAdminPanel() {
  dom.adminAuth.classList.add('hidden');
  dom.adminContent.classList.remove('hidden');
  renderAdminEpisodeList();
}

function renderAdminEpisodeList() {
  const all = getAllEpisodes();
  dom.adminEpisodeList.innerHTML = '';
  all.forEach(ep => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="episode-info">
        <strong>${ep.emoji || ''} ${ep.title}</strong> 
        <span style="color:var(--text-muted)">(${getCategoryName(ep.category)})</span>
        <br><small>${ep.file}</small>
      </span>
      ${!ep.isBase ? '<button class="delete-btn" data-id="'+ep.id+'">🗑️ Eliminar</button>' : '<span style="font-size:0.7rem;color:var(--text-muted)">Base</span>'}
    `;
    dom.adminEpisodeList.appendChild(li);
  });

  // Eventos para eliminar
  dom.adminEpisodeList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteAdminEpisode(btn.dataset.id);
    });
  });
}

function handleAddEpisode() {
  const title = dom.newTitle.value.trim();
  const subtitle = dom.newSubtitle.value.trim();
  const description = dom.newDesc.value.trim();
  const category = dom.newCategory.value;
  const emoji = dom.newEmoji.value.trim() || '🎧';
  const fileName = dom.newFileName.value.trim();
  const durationStr = dom.newDuration.value.trim();

  if (!title || !fileName || !durationStr) {
    showToast('❌ Completa título, archivo y duración');
    return;
  }

  // Validar formato duración
  const durParts = durationStr.split(':');
  if (durParts.length !== 2 || isNaN(durParts[0]) || isNaN(durParts[1])) {
    showToast('❌ Formato de duración inválido (mm:ss)');
    return;
  }
  const durationSeconds = parseInt(durParts[0])*60 + parseInt(durParts[1]);

  const newEpisode = {
    id: 'admin-' + Date.now(),
    title,
    subtitle,
    description,
    category,
    emoji,
    file: `audios/${fileName}`,
    duration: durationStr,
    durationSeconds,
    isBase: false
  };

  const adminEpisodes = getAdminEpisodesFromStorage();
  adminEpisodes.push(newEpisode);
  saveAdminEpisodes(adminEpisodes);

  // Limpiar formulario
  dom.newTitle.value = '';
  dom.newSubtitle.value = '';
  dom.newDesc.value = '';
  dom.newFileName.value = '';
  dom.newDuration.value = '';
  dom.newEmoji.value = '';

  renderAdminEpisodeList();
  renderEpisodes(state.activeCategory);
  updateGlobalProgress();
  showToast('✅ Episodio agregado correctamente');
}

function deleteAdminEpisode(episodeId) {
  let adminEpisodes = getAdminEpisodesFromStorage();
  adminEpisodes = adminEpisodes.filter(ep => ep.id !== episodeId);
  saveAdminEpisodes(adminEpisodes);
  renderAdminEpisodeList();
  renderEpisodes(state.activeCategory);
  updateGlobalProgress();
  showToast('🗑️ Episodio eliminado');
  // Si el episodio eliminado era el actual, detener reproducción
  if (state.currentEpisodeId === episodeId) {
    dom.audio.pause();
    dom.audio.src = '';
    state.currentEpisodeId = null;
    state.isPlaying = false;
    updatePlayPauseButton();
    hideMiniPlayer();
    stopArtworkAnimation();
    stopWaveAnimation();
  }
}

// ========== TOAST ==========
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ========== INICIAR APP ==========
document.addEventListener('DOMContentLoaded', init);