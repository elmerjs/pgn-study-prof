const APP_VERSION = '1.0.0';
const STORAGE_KEYS = {
  progress: 'pgn-study-pro-progress',
  theme: 'pgn-study-pro-theme',
  active: 'pgn-study-pro-active-episode',
  offlineReady: 'pgn-study-pro-offline-ready',
  sleep: 'pgn-study-pro-sleep-minutes'
};

const episodes = [
  {
    id: 'ep-1',
    title: 'Claves del núcleo común para la Procuraduría',
    file: 'audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a',
    category: 'comunes',
    categoryLabel: 'Conocimientos esenciales comunes',
    icon: '📚',
    subtitle: 'Podcast 1 · Episodio marco del núcleo común',
    duration: '28:04',
    focus: 'Panorama base para fijar conceptos transversales y orientar el resto del plan de estudio.'
  },
  {
    id: 'ep-2',
    title: 'Estructura y funciones de la Procuraduría',
    file: 'audios/Estructura_y_funciones_de_la_Procuraduría.m4a',
    category: 'comunes',
    categoryLabel: 'Conocimientos esenciales comunes',
    icon: '📚',
    subtitle: 'Podcast 2 · Organización institucional',
    duration: '30:34',
    focus: 'Repasa la arquitectura funcional de la PGN y la lógica de sus competencias principales.'
  },
  {
    id: 'ep-3',
    title: 'Podcast 3 · Núcleo común aplicado',
    file: 'audios/Ep-3.m4a',
    category: 'comunes',
    categoryLabel: 'Conocimientos esenciales comunes',
    icon: '📚',
    subtitle: 'Podcast 3 · Pendiente renombrar archivo',
    duration: '19:49',
    focus: 'Refuerzo corto para consolidar el bloque común con escucha ágil y repasable.'
  },
  {
    id: 'ep-4',
    title: 'La gestión documental evita la impunidad',
    file: 'audios/La_gestión_documental_evita_la_impunidad.m4a',
    category: 'comunes',
    categoryLabel: 'Conocimientos esenciales comunes',
    icon: '📚',
    subtitle: 'Podcast 4 · Gestión documental',
    duration: '25:41',
    focus: 'Conecta archivo, trazabilidad y función disciplinaria con ejemplos prácticos de valor institucional.'
  },
  {
    id: 'ep-5',
    title: 'Ofimática y ética digital en la PGN',
    file: 'audios/Ofimática_y_ética_digital_en_la_PGN.m4a',
    category: 'comunes',
    categoryLabel: 'Conocimientos esenciales comunes',
    icon: '📚',
    subtitle: 'Podcast 5 · Herramientas y criterio digital',
    duration: '15:47',
    focus: 'Resume hábitos digitales, uso ofimático y conducta tecnológica esperada en el contexto institucional.'
  },
  {
    id: 'ep-6',
    title: 'Lógica y pilares de la contratación estatal',
    file: 'audios/Lógica_y_pilares_de_la_contratación_estatal.m4a',
    category: 'especificos',
    categoryLabel: 'Conocimientos esenciales específicos',
    icon: '⚖️',
    subtitle: 'Podcast 6 · Contratación estatal',
    duration: '29:33',
    focus: 'Explica principios, etapas y racionalidad básica del régimen de contratación pública.'
  },
  {
    id: 'ep-7',
    title: 'La ruta legal del gasto público colombiano',
    file: 'audios/La_ruta_legal_del_gasto_público_colombiano.m4a',
    category: 'especificos',
    categoryLabel: 'Conocimientos esenciales específicos',
    icon: '⚖️',
    subtitle: 'Podcast 8 · Presupuesto y contabilidad pública',
    duration: '26:20',
    focus: 'Aterriza la secuencia jurídica y operativa del gasto público para preguntas de gestión y control.'
  },
  {
    id: 'ep-8',
    title: 'Estrategia psicométrica para el examen PGN',
    file: 'audios/Estrategia_psicométrica_para_el_examen_PGN.m4a',
    category: 'transversal',
    categoryLabel: 'Competencias comportamentales / transversal',
    icon: '🧠',
    subtitle: 'Episodio transversal · Estrategia psicométrica',
    duration: '18:32',
    focus: 'Te ayuda a responder con mejor criterio, ritmo y lectura de opciones en el componente psicométrico.'
  }
];

const categories = [
  { slug: 'todos', label: 'Todos', icon: '🎙️' },
  { slug: 'comunes', label: 'Conocimientos esenciales comunes', icon: '📚' },
  { slug: 'especificos', label: 'Conocimientos esenciales específicos', icon: '⚖️' },
  { slug: 'transversal', label: 'Competencias comportamentales / transversal', icon: '🧠' }
];

const state = {
  activeCategory: 'todos',
  activeEpisodeId: '',
  deferredPrompt: null,
  progress: loadJSON(STORAGE_KEYS.progress, {}),
  offlineReady: localStorage.getItem(STORAGE_KEYS.offlineReady) === 'true',
  sleepTimerId: null,
  sleepEndsAt: null,
  installMode: 'unsupported'
};

const els = {
  audio: document.getElementById('audioPlayer'),
  tabs: document.getElementById('tabs'),
  episodeList: document.getElementById('episodeList'),
  continueCard: document.getElementById('continueCard'),
  completedCount: document.getElementById('completedCount'),
  completedMeta: document.getElementById('completedMeta'),
  globalProgressBar: document.getElementById('globalProgressBar'),
  globalProgressLabel: document.getElementById('globalProgressLabel'),
  installBtn: document.getElementById('installBtn'),
  installPanelBtn: document.getElementById('installPanelBtn'),
  installCopy: document.getElementById('installCopy'),
  offlineBtn: document.getElementById('offlineBtn'),
  offlinePanelBtn: document.getElementById('offlinePanelBtn'),
  offlineCopy: document.getElementById('offlineCopy'),
  offlineBadge: document.getElementById('offlineBadge'),
  connectionChip: document.getElementById('connectionChip'),
  miniPlayer: document.getElementById('miniPlayer'),
  miniPlayerOpen: document.getElementById('miniPlayerOpen'),
  miniPlayPause: document.getElementById('miniPlayPause'),
  miniTitle: document.getElementById('miniTitle'),
  miniSubtitle: document.getElementById('miniSubtitle'),
  playerSheet: document.getElementById('playerSheet'),
  closePlayer: document.getElementById('closePlayer'),
  playerTitle: document.getElementById('playerTitle'),
  playerCategory: document.getElementById('playerCategory'),
  playerFocus: document.getElementById('playerFocus'),
  seekBar: document.getElementById('seekBar'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  backwardBtn: document.getElementById('backwardBtn'),
  forwardBtn: document.getElementById('forwardBtn'),
  speedSelect: document.getElementById('speedSelect'),
  sleepSelect: document.getElementById('sleepSelect'),
  sheetProgressLabel: document.getElementById('sheetProgressLabel'),
  sheetStatusLabel: document.getElementById('sheetStatusLabel'),
  resumeBtn: document.getElementById('resumeBtn'),
  toastRegion: document.getElementById('toastRegion'),
  themeToggle: document.getElementById('themeToggle')
};

init();

function init() {
  setTheme(loadTheme());
  bindThemeToggle();
  renderTabs();
  restoreLastEpisode();
  renderEpisodes();
  updateDashboard();
  updateContinueListening();
  bindPlayerEvents();
  bindInstallEvents();
  bindOfflineControls();
  registerServiceWorker();
  updateConnectionState();
  hydrateSleepPreference();
  window.addEventListener('online', updateConnectionState);
  window.addEventListener('offline', updateConnectionState);
  window.addEventListener('appinstalled', () => {
    state.deferredPrompt = null;
    state.installMode = 'installed';
    updateInstallUI();
    showToast('App instalada correctamente.');
  });
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    state.installMode = 'prompt';
    updateInstallUI();
  });
  document.addEventListener('click', (event) => {
    if (event.target.dataset.closePlayer === 'true') closePlayerSheet();
  });
  navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
  updateInstallUI();
  refreshOfflineUI();
}

function renderTabs() {
  els.tabs.innerHTML = categories.map((category) => `
    <button class="tab-button ${state.activeCategory === category.slug ? 'active' : ''}" type="button" role="tab" aria-selected="${state.activeCategory === category.slug}" data-category="${category.slug}">
      ${category.icon} ${category.label}
    </button>
  `).join('');

  els.tabs.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      renderTabs();
      renderEpisodes();
    });
  });
}

function renderEpisodes() {
  const filtered = state.activeCategory === 'todos'
    ? episodes
    : episodes.filter((episode) => episode.category === state.activeCategory);

  els.episodeList.innerHTML = filtered.map((episode) => {
    const data = getEpisodeProgress(episode.id);
    const percent = Math.round(data.percent || 0);
    const completed = percent >= 95;
    const selected = state.activeEpisodeId === episode.id;

    return `
      <article class="episode-card glass-panel" aria-label="${episode.title}">
        <div class="episode-top">
          <div class="episode-icon" aria-hidden="true">${episode.icon}</div>
          <div>
            <h3 class="episode-title">${episode.title}</h3>
            <p class="episode-subtitle">${episode.subtitle}</p>
          </div>
        </div>

        <div class="episode-meta-row">
          <span class="episode-tag">${episode.categoryLabel}</span>
          <span class="episode-duration">${episode.duration}</span>
        </div>

        <p class="episode-focus">${episode.focus}</p>

        <div class="progress-block">
          <div class="progress-head">
            <span>${percent}% escuchado</span>
            ${completed ? '<span class="episode-complete">Completado</span>' : '<span>Progreso guardado automáticamente</span>'}
          </div>
          <div class="episode-progress-track" aria-hidden="true">
            <span class="episode-progress-fill" style="width:${percent}%"></span>
          </div>
        </div>

        <div class="episode-actions">
          <button class="card-action play" type="button" data-play-id="${episode.id}">${selected ? 'Escuchar ahora' : 'Reproducir'}</button>
          <button class="card-action outline" type="button" data-open-id="${episode.id}">${percent > 0 ? 'Retomar' : 'Ver reproductor'}</button>
        </div>
      </article>
    `;
  }).join('');

  els.episodeList.querySelectorAll('[data-play-id]').forEach((button) => {
    button.addEventListener('click', () => selectEpisode(button.dataset.playId, { autoplay: true, openSheet: true }));
  });

  els.episodeList.querySelectorAll('[data-open-id]').forEach((button) => {
    button.addEventListener('click', () => selectEpisode(button.dataset.openId, { autoplay: false, openSheet: true }));
  });
}

function selectEpisode(episodeId, options = {}) {
  const episode = episodes.find((item) => item.id === episodeId);
  if (!episode) return;

  const isNewSource = state.activeEpisodeId !== episodeId || !els.audio.src.includes(encodeURI(episode.file));
  state.activeEpisodeId = episodeId;
  localStorage.setItem(STORAGE_KEYS.active, episodeId);

  if (isNewSource) {
    els.audio.src = episode.file;
    els.audio.load();
  }

  updateEpisodeUI(episode);
  updateMiniPlayer(true);
  renderEpisodes();

  const progress = getEpisodeProgress(episodeId);
  if (isNewSource || Math.abs(els.audio.currentTime - (progress.currentTime || 0)) > 2) {
    els.audio.currentTime = progress.currentTime || 0;
  }

  if (options.openSheet) openPlayerSheet();
  if (options.autoplay) {
    els.audio.play().then(() => {
      document.body.classList.add('is-playing');
      syncPlayButtons();
    }).catch(() => {
      showToast('No se pudo iniciar automáticamente. Toca reproducir.');
      syncPlayButtons();
    });
  } else {
    syncPlayButtons();
  }
}

function updateEpisodeUI(episode) {
  const progress = getEpisodeProgress(episode.id);
  els.playerTitle.textContent = episode.title;
  els.playerCategory.textContent = `${episode.icon} ${episode.categoryLabel}`;
  els.playerFocus.textContent = episode.focus;
  els.miniTitle.textContent = episode.title;
  els.miniSubtitle.textContent = episode.subtitle;
  els.totalTime.textContent = episode.duration;
  updateProgressLabels(progress.percent || 0);
  els.seekBar.value = progress.percent || 0;
}

function bindPlayerEvents() {
  els.playPauseBtn.addEventListener('click', togglePlayback);
  els.miniPlayPause.addEventListener('click', togglePlayback);
  els.backwardBtn.addEventListener('click', () => jumpBy(-10));
  els.forwardBtn.addEventListener('click', () => jumpBy(10));
  els.seekBar.addEventListener('input', handleSeek);
  els.speedSelect.addEventListener('change', () => {
    els.audio.playbackRate = Number(els.speedSelect.value);
    showToast(`Velocidad ${els.speedSelect.value}× aplicada.`);
  });
  els.sleepSelect.addEventListener('change', handleSleepTimer);
  els.resumeBtn.addEventListener('click', resumeCurrentEpisode);
  els.miniPlayerOpen.addEventListener('click', openPlayerSheet);
  els.closePlayer.addEventListener('click', closePlayerSheet);

  els.audio.addEventListener('loadedmetadata', () => {
    const progress = getEpisodeProgress(state.activeEpisodeId);
    if (progress.currentTime && progress.currentTime < els.audio.duration) {
      els.audio.currentTime = progress.currentTime;
    }
    els.totalTime.textContent = formatTime(els.audio.duration);
    syncSeekbar();
  });

  els.audio.addEventListener('timeupdate', () => {
    if (!state.activeEpisodeId || !Number.isFinite(els.audio.duration) || els.audio.duration <= 0) return;
    const percent = (els.audio.currentTime / els.audio.duration) * 100;
    persistEpisodeProgress(state.activeEpisodeId, els.audio.currentTime, els.audio.duration, percent);
    els.currentTime.textContent = formatTime(els.audio.currentTime);
    els.totalTime.textContent = formatTime(els.audio.duration);
    syncSeekbar();
    updateDashboard();
    updateContinueListening();
    renderEpisodes();
  });

  els.audio.addEventListener('play', () => {
    document.body.classList.add('is-playing');
    syncPlayButtons();
  });

  els.audio.addEventListener('pause', () => {
    document.body.classList.remove('is-playing');
    syncPlayButtons();
  });

  els.audio.addEventListener('ended', () => {
    persistEpisodeProgress(state.activeEpisodeId, els.audio.duration, els.audio.duration, 100);
    document.body.classList.remove('is-playing');
    syncPlayButtons();
    updateDashboard();
    updateContinueListening();
    renderEpisodes();
    showToast('Episodio completado.');
  });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      togglePlayback();
    }
    if (event.key === 'Escape' && !els.playerSheet.classList.contains('hidden')) closePlayerSheet();
  });
}

function togglePlayback() {
  if (!state.activeEpisodeId) {
    selectEpisode(episodes[0].id, { autoplay: true, openSheet: true });
    return;
  }
  if (els.audio.paused) {
    els.audio.play().catch(() => showToast('No fue posible reproducir el audio.'));
  } else {
    els.audio.pause();
  }
}

function jumpBy(seconds) {
  if (!state.activeEpisodeId) return;
  els.audio.currentTime = Math.max(0, Math.min((els.audio.duration || 0), els.audio.currentTime + seconds));
}

function handleSeek() {
  if (!state.activeEpisodeId || !Number.isFinite(els.audio.duration) || els.audio.duration <= 0) return;
  const target = (Number(els.seekBar.value) / 100) * els.audio.duration;
  els.audio.currentTime = target;
}

function syncSeekbar() {
  if (!Number.isFinite(els.audio.duration) || els.audio.duration <= 0) return;
  const percent = (els.audio.currentTime / els.audio.duration) * 100;
  els.seekBar.value = percent;
  updateProgressLabels(percent);
}

function syncPlayButtons() {
  const isPlaying = !els.audio.paused;
  els.playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
  els.miniPlayPause.textContent = isPlaying ? '❚❚' : '▶';
  els.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
  els.miniPlayPause.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
}

function updateProgressLabels(percent) {
  const rounded = Math.round(percent || 0);
  els.sheetProgressLabel.textContent = `${rounded}% escuchado`;
  els.sheetStatusLabel.textContent = rounded >= 95 ? 'Completado' : rounded > 0 ? 'En progreso' : 'Sin completar';
}

function persistEpisodeProgress(id, currentTime, duration, percent) {
  if (!id) return;
  const safePercent = Math.min(100, Math.max(0, percent || 0));
  state.progress[id] = {
    currentTime: Number(currentTime) || 0,
    duration: Number(duration) || 0,
    percent: safePercent,
    completed: safePercent >= 95,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
}

function getEpisodeProgress(id) {
  return state.progress[id] || { currentTime: 0, duration: 0, percent: 0, completed: false };
}

function updateDashboard() {
  const all = episodes.map((episode) => getEpisodeProgress(episode.id));
  const completed = all.filter((item) => item.completed).length;
  const totalPercent = all.reduce((sum, item) => sum + (item.percent || 0), 0);
  const average = Math.round(totalPercent / episodes.length);
  els.completedCount.textContent = String(completed);
  els.completedMeta.textContent = `${average}% del plan escuchado`;
  els.globalProgressBar.style.width = `${average}%`;
  els.globalProgressLabel.textContent = average > 0
    ? `Has cubierto ${average}% del recorrido de estudio en audio.`
    : 'Aún no has iniciado tu plan de estudio.';
}

function updateContinueListening() {
  const ranked = episodes
    .map((episode) => ({ episode, progress: getEpisodeProgress(episode.id) }))
    .filter(({ progress }) => progress.percent > 0 && progress.percent < 100)
    .sort((a, b) => new Date(b.progress.updatedAt || 0) - new Date(a.progress.updatedAt || 0));

  if (!ranked.length) {
    els.continueCard.className = 'continue-card glass-panel empty-state-card';
    els.continueCard.innerHTML = '<p>Aún no has comenzado un episodio. Elige uno para iniciar tu ruta de estudio.</p>';
    return;
  }

  const { episode, progress } = ranked[0];
  els.continueCard.className = 'continue-card glass-panel';
  els.continueCard.innerHTML = `
    <div class="continue-layout">
      <div>
        <p class="eyebrow">Último episodio activo</p>
        <h3 class="episode-title">${episode.title}</h3>
        <p class="episode-focus">${episode.focus}</p>
        <div class="progress-line" aria-hidden="true"><span style="width:${Math.round(progress.percent)}%"></span></div>
        <div class="progress-copy">
          <span>${Math.round(progress.percent)}% escuchado</span>
          <span>${formatTime(progress.currentTime || 0)} de ${episode.duration}</span>
        </div>
      </div>
      <button class="button primary" type="button" id="continueBtn">Continuar</button>
    </div>
  `;

  document.getElementById('continueBtn')?.addEventListener('click', () => {
    selectEpisode(episode.id, { autoplay: true, openSheet: true });
  });
}

function updateMiniPlayer(show = false) {
  if (!state.activeEpisodeId && !show) {
    els.miniPlayer.classList.add('hidden');
    return;
  }
  els.miniPlayer.classList.remove('hidden');
}

function openPlayerSheet() {
  if (!state.activeEpisodeId) return;
  els.playerSheet.classList.remove('hidden');
  els.playerSheet.setAttribute('aria-hidden', 'false');
}

function closePlayerSheet() {
  els.playerSheet.classList.add('hidden');
  els.playerSheet.setAttribute('aria-hidden', 'true');
}

function resumeCurrentEpisode() {
  if (!state.activeEpisodeId) return;
  const progress = getEpisodeProgress(state.activeEpisodeId);
  els.audio.currentTime = progress.currentTime || 0;
  els.audio.play().catch(() => showToast('No fue posible reanudar.'));
}

function restoreLastEpisode() {
  const lastId = localStorage.getItem(STORAGE_KEYS.active) || episodes[0].id;
  const episode = episodes.find((item) => item.id === lastId) || episodes[0];
  selectEpisode(episode.id, { autoplay: false, openSheet: false });
  els.currentTime.textContent = formatTime(getEpisodeProgress(episode.id).currentTime || 0);
}

function bindInstallEvents() {
  const action = () => triggerInstall();
  els.installBtn.addEventListener('click', action);
  els.installPanelBtn.addEventListener('click', action);
}

async function triggerInstall() {
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (state.installMode === 'prompt' && state.deferredPrompt) {
    state.deferredPrompt.prompt();
    const choice = await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    state.installMode = choice.outcome === 'accepted' ? 'installed' : 'dismissed';
    updateInstallUI();
    showToast(choice.outcome === 'accepted' ? 'Instalación iniciada.' : 'Puedes instalar la app más tarde desde este botón.');
    return;
  }

  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    state.installMode = 'installed';
    updateInstallUI();
    showToast('La app ya está instalada en este dispositivo.');
    return;
  }

  if (isiOS) {
    state.installMode = 'ios';
    updateInstallUI();
    showToast('En iPhone o iPad usa Compartir → Añadir a pantalla de inicio.');
    return;
  }

  showToast('Tu navegador no mostró el prompt ahora. Usa el menú del navegador para instalar la app.');
}

function updateInstallUI() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (standalone || state.installMode === 'installed') {
    els.installCopy.textContent = 'La app ya está instalada o ejecutándose en modo aplicación.';
    els.installBtn.textContent = 'App instalada';
    els.installPanelBtn.textContent = 'Instalada';
    els.installBtn.disabled = true;
    els.installPanelBtn.disabled = true;
    return;
  }

  els.installBtn.disabled = false;
  els.installPanelBtn.disabled = false;

  if (state.deferredPrompt) {
    els.installCopy.textContent = 'Tu navegador permite instalarla ahora mismo para abrirla como una app independiente.';
    els.installBtn.textContent = 'Instalar app';
    els.installPanelBtn.textContent = 'Instalar';
    return;
  }

  if (isiOS) {
    els.installCopy.textContent = 'En iPhone o iPad puedes instalarla desde Compartir → Añadir a pantalla de inicio.';
    els.installBtn.textContent = 'Ver guía iPhone/iPad';
    els.installPanelBtn.textContent = 'Cómo instalar';
    return;
  }

  els.installCopy.textContent = 'Si no aparece el aviso automático, usa el menú del navegador y selecciona “Instalar app” o “Añadir a pantalla de inicio”.';
  els.installBtn.textContent = 'Cómo instalar';
  els.installPanelBtn.textContent = 'Ver opción';
}

function bindOfflineControls() {
  els.offlineBtn.addEventListener('click', requestOfflineDownload);
  els.offlinePanelBtn.addEventListener('click', requestOfflineDownload);
}

async function requestOfflineDownload() {
  if (!navigator.serviceWorker?.controller) {
    showToast('Espera un momento mientras la PWA termina de activarse.');
    return;
  }

  if (!navigator.onLine && !state.offlineReady) {
    showToast('Necesitas conexión inicial para guardar los audios offline.');
    return;
  }

  navigator.serviceWorker.controller.postMessage({ type: 'CACHE_ALL_AUDIO' });
  setOfflineUI('downloading', 'Descargando audios y preparando la biblioteca para uso sin conexión...');
}

function handleServiceWorkerMessage(event) {
  const { type, payload } = event.data || {};
  if (type === 'OFFLINE_CACHE_STATUS') {
    if (payload?.status === 'ready') {
      state.offlineReady = true;
      localStorage.setItem(STORAGE_KEYS.offlineReady, 'true');
      setOfflineUI('ready', 'Tus audios están disponibles offline. Puedes seguir estudiando sin internet.');
      showToast('Audios guardados para uso offline.');
    } else if (payload?.status === 'downloading') {
      setOfflineUI('downloading', payload.message || 'Preparando descarga offline...');
    } else if (payload?.status === 'error') {
      setOfflineUI('pending', 'No se pudo completar la descarga offline. Inténtalo de nuevo con conexión estable.');
      showToast(payload.message || 'Falló la descarga offline.');
    }
  }
}

function refreshOfflineUI() {
  if (!navigator.onLine && state.offlineReady) {
    setOfflineUI('ready', 'Estás sin internet, pero tus audios descargados siguen disponibles.');
    return;
  }
  if (!navigator.onLine && !state.offlineReady) {
    setOfflineUI('offline', 'Estás sin internet y todavía no habías descargado los audios para offline.');
    return;
  }
  if (state.offlineReady) {
    setOfflineUI('ready', 'Tus audios están disponibles offline. La app quedó lista para estudio sin conexión.');
    return;
  }
  setOfflineUI('pending', 'Todavía no has guardado los audios. Descárgalos para escuchar sin conexión.');
}

function setOfflineUI(mode, text) {
  els.offlineCopy.textContent = text;
  els.offlineBadge.className = `offline-badge ${mode}`;
  const labels = {
    pending: 'Pendiente',
    downloading: 'Descargando',
    ready: 'Offline listo',
    offline: 'Sin respaldo'
  };
  els.offlineBadge.textContent = labels[mode] || 'Pendiente';
  els.offlineBtn.textContent = mode === 'ready' ? 'Offline listo' : mode === 'downloading' ? 'Descargando...' : 'Guardar audios offline';
  els.offlinePanelBtn.textContent = mode === 'ready' ? 'Listo' : mode === 'downloading' ? 'Procesando' : 'Descargar ahora';
  els.offlineBtn.disabled = mode === 'downloading';
  els.offlinePanelBtn.disabled = mode === 'downloading';
}

function updateConnectionState() {
  const online = navigator.onLine;
  els.connectionChip.textContent = online ? 'En línea' : 'Sin internet';
  els.connectionChip.className = `connection-chip ${online ? 'online' : 'offline'}`;
  refreshOfflineUI();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) {
    showToast('No fue posible registrar el modo offline.');
  }
}

function handleSleepTimer() {
  clearTimeout(state.sleepTimerId);
  const minutes = Number(els.sleepSelect.value);
  localStorage.setItem(STORAGE_KEYS.sleep, String(minutes));
  if (!minutes) {
    state.sleepEndsAt = null;
    showToast('Sleep timer desactivado.');
    return;
  }
  state.sleepEndsAt = Date.now() + minutes * 60_000;
  state.sleepTimerId = window.setTimeout(() => {
    els.audio.pause();
    showToast(`Sleep timer finalizado tras ${minutes} min.`);
    els.sleepSelect.value = '0';
    localStorage.setItem(STORAGE_KEYS.sleep, '0');
  }, minutes * 60_000);
  showToast(`Sleep timer activado por ${minutes} min.`);
}

function hydrateSleepPreference() {
  const minutes = localStorage.getItem(STORAGE_KEYS.sleep) || '0';
  els.sleepSelect.value = minutes;
}

function bindThemeToggle() {
  els.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
  });
}

function loadTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hrs > 0
    ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  els.toastRegion.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
