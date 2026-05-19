/* =========================================
   CONFIGURACIÓN Y DATOS BASE
   ========================================= */

// CONTRASEÑA DEL ADMIN (Fácil de cambiar)
const ADMIN_PASSWORD = "admin"; 

// Episodios base inmutables (precargados)
const baseEpisodes = [
  {
    id: "ep-base-1",
    title: "Claves del núcleo común para la Procuraduría",
    subtitle: "Núcleo común · Componente de conocimiento",
    desc: "Fundamentos transversales para todos los cargos PGN",
    category: "general",
    emoji: "📚",
    file: "audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a",
    durationStr: "28:04",
    durationSec: 1684,
    isAdminAdded: false
  },
  {
    id: "ep-base-2",
    title: "Episodio 3 · Coordinación institucional",
    subtitle: "Gestión pública y coordinación",
    desc: "Articulación interinstitucional y roles del coordinador",
    category: "general",
    emoji: "🤝",
    file: "audios/Ep-3.m4a",
    durationStr: "19:49",
    durationSec: 1189,
    isAdminAdded: false
  },
  {
    id: "ep-base-3",
    title: "Estructura y funciones de la Procuraduría",
    subtitle: "Estructura orgánica PGN · Decreto-Ley",
    desc: "Organigrama, funciones macro y competencias por nivel",
    category: "general",
    emoji: "🏛️",
    file: "audios/Estructura_y_funciones_de_la_Procuraduría.m4a",
    durationStr: "30:34",
    durationSec: 1834,
    isAdminAdded: false
  }
];

// Variables de Estado
let episodes = [];
let userProgress = {}; // { epId: secondsPlayed }
let currentEpId = null;
let currentFilter = 'todos';
let audio = new Audio();
let isPlaying = false;
let sleepTimer = null;
let playbackRates = [1, 1.5, 2];
let currentRateIndex = 0;
let sleepTimes = [0, 15, 30, 45, 60];
let currentSleepIndex = 0;

/* =========================================
   INICIALIZACIÓN
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  registerServiceWorker();
});

function initApp() {
  loadData();
  setupTheme();
  renderEpisodes();
  updateGlobalStats();
  checkContinueListening();
  setupEventListeners();
  
  // Configuración inicial del audio
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('ended', handleAudioEnded);
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('time-total').textContent = formatTime(audio.duration);
    document.getElementById('seek-bar').max = audio.duration;
  });
}

function loadData() {
  // Cargar episodios del admin desde localStorage y combinar con base
  const adminEps = JSON.parse(localStorage.getItem('pgn_admin_eps')) || [];
  episodes = [...baseEpisodes, ...adminEps];
  
  // Cargar progreso
  userProgress = JSON.parse(localStorage.getItem('pgn_progress')) || {};
}

function saveData() {
  localStorage.setItem('pgn_progress', JSON.stringify(userProgress));
  updateGlobalStats();
}

/* =========================================
   UI & RENDERIZADO
   ========================================= */

const categoryColors = {
  general: { class: 'cat-general', text: 'General' },
  especifico: { class: 'cat-especifico', text: 'Específico' },
  comportamental: { class: 'cat-comportamental', text: 'Comportamental' }
};

function renderEpisodes() {
  const list = document.getElementById('episodes-list');
  list.innerHTML = '';
  
  const filteredEps = currentFilter === 'todos' 
    ? episodes 
    : episodes.filter(ep => ep.category === currentFilter);
    
  filteredEps.forEach(ep => {
    const progress = userProgress[ep.id] || 0;
    const percentage = ep.durationSec > 0 ? (progress / ep.durationSec) * 100 : 0;
    const catStyle = categoryColors[ep.category] || categoryColors.general;
    
    // Status text (Completado o tiempo restante/duración)
    let metaText = ep.durationStr;
    if (percentage >= 95) {
      metaText = "✅ Completado";
    } else if (progress > 10) {
      metaText = `${Math.floor(percentage)}% completado`;
    }

    const card = document.createElement('div');
    card.className = 'episode-card';
    card.onclick = () => loadAndPlayEpisode(ep.id);
    
    card.innerHTML = `
      <div class="ep-emoji">${ep.emoji}</div>
      <div class="ep-info">
        <span class="ep-cat-badge ${catStyle.class}">${catStyle.text}</span>
        <h3 class="ep-title">${ep.title}</h3>
        <p class="ep-subtitle">${ep.subtitle}</p>
        <div class="ep-meta">
          <span>▶️ Reproducir</span>
          <span>${metaText}</span>
        </div>
      </div>
      <div class="ep-progress-bg">
        <div class="ep-progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;
    list.appendChild(card);
  });
}

function checkContinueListening() {
  const lastPlayedId = localStorage.getItem('pgn_last_played');
  if (!lastPlayedId) return;
  
  const ep = episodes.find(e => e.id === lastPlayedId);
  const progress = userProgress[lastPlayedId] || 0;
  
  if (ep && progress > 5 && (progress / ep.durationSec) < 0.95) {
    const section = document.getElementById('continue-section');
    const card = document.getElementById('continue-card');
    section.classList.remove('hidden');
    
    const percentage = (progress / ep.durationSec) * 100;
    const catStyle = categoryColors[ep.category] || categoryColors.general;
    
    card.onclick = () => loadAndPlayEpisode(ep.id);
    card.innerHTML = `
      <div class="ep-emoji">${ep.emoji}</div>
      <div class="ep-info">
        <span class="ep-cat-badge ${catStyle.class}">Continuar · ${Math.floor(percentage)}%</span>
        <h3 class="ep-title">${ep.title}</h3>
        <p class="ep-subtitle">${ep.subtitle}</p>
      </div>
      <div class="ep-progress-bg">
        <div class="ep-progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;
  }
}

function updateGlobalStats() {
  let completed = 0;
  episodes.forEach(ep => {
    const prog = userProgress[ep.id] || 0;
    if ((prog / ep.durationSec) >= 0.95) completed++;
  });
  
  const total = episodes.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  document.getElementById('global-progress').style.width = `${percentage}%`;
  document.getElementById('global-text').textContent = `${completed} / ${total} audios completados`;
}

/* =========================================
   LÓGICA DEL REPRODUCTOR
   ========================================= */

function loadAndPlayEpisode(id) {
  const ep = episodes.find(e => e.id === id);
  if (!ep) return;
  
  // Si ya es el track actual, solo abrir player y toggle play
  if (currentEpId === id) {
    document.getElementById('expanded-player').classList.remove('hidden');
    if (!isPlaying) togglePlay();
    return;
  }
  
  currentEpId = id;
  localStorage.setItem('pgn_last_played', id);
  
  // Set UI
  document.getElementById('mini-player').classList.remove('hidden');
  document.getElementById('expanded-player').classList.remove('hidden');
  
  document.getElementById('mini-title').textContent = ep.title;
  document.getElementById('mini-subtitle').textContent = ep.subtitle;
  document.getElementById('player-title').textContent = ep.title;
  document.getElementById('player-subtitle').textContent = ep.subtitle;
  document.getElementById('player-emoji').textContent = ep.emoji;
  
  const catStyle = categoryColors[ep.category];
  document.getElementById('player-category-badge').textContent = catStyle ? catStyle.text : 'Audio';
  
  // Set Audio
  audio.src = ep.file;
  audio.playbackRate = playbackRates[currentRateIndex];
  
  // Restore progress
  if (userProgress[id]) {
    audio.currentTime = userProgress[id];
  } else {
    audio.currentTime = 0;
  }
  
  togglePlay(true);
}

function togglePlay(forcePlay = null) {
  if (forcePlay === true || audio.paused) {
    audio.play().then(() => {
      isPlaying = true;
      updatePlayBtns(true);
      document.getElementById('artwork-pulse').parentElement.classList.add('playing');
      document.getElementById('wave-container').classList.add('active');
    }).catch(e => {
      console.error("Error reproduciendo:", e);
      showToast("Error al cargar el audio. ¿Estás offline sin caché?");
    });
  } else {
    audio.pause();
    isPlaying = false;
    updatePlayBtns(false);
    document.getElementById('artwork-pulse').parentElement.classList.remove('playing');
    document.getElementById('wave-container').classList.remove('active');
    saveData(); // Guardar progreso al pausar
  }
}

function updatePlayBtns(isPlaying) {
  const icon = isPlaying ? '⏸️' : '▶️';
  document.getElementById('mini-play-btn').textContent = icon;
  document.getElementById('play-pause-btn').textContent = icon;
}

// Throttle save progress to avoid excessive localStorage writing
let lastSaveTime = 0;
function handleTimeUpdate() {
  const current = audio.currentTime;
  const total = audio.duration;
  
  // Update UI
  document.getElementById('time-current').textContent = formatTime(current);
  document.getElementById('seek-bar').value = current;
  
  if (total > 0) {
    const percentage = (current / total) * 100;
    document.getElementById('mini-progress-fill').style.width = `${percentage}%`;
  }
  
  // Save progress every 5 seconds
  const now = Date.now();
  if (now - lastSaveTime > 5000 && currentEpId) {
    userProgress[currentEpId] = current;
    saveData();
    lastSaveTime = now;
  }
}

function handleAudioEnded() {
  isPlaying = false;
  updatePlayBtns(false);
  document.getElementById('wave-container').classList.remove('active');
  document.getElementById('artwork-pulse').parentElement.classList.remove('playing');
  
  if (currentEpId) {
    // Marcar como completo (durationSec si está disponible, o fallback current)
    const ep = episodes.find(e => e.id === currentEpId);
    userProgress[currentEpId] = ep ? ep.durationSec : audio.currentTime;
    saveData();
    renderEpisodes(); // actualizar UI
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/* =========================================
   EVENT LISTENERS
   ========================================= */

function setupEventListeners() {
  // Theme Toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('pgn_theme', newTheme);
    
    // Cambiar color barra navegación móvil
    document.getElementById('meta-theme-color').content = newTheme === 'dark' ? '#121212' : '#f3f4f6';
  });

  // Filters
  document.getElementById('categories-tabs').addEventListener('click', e => {
    if (e.target.classList.contains('cat-btn')) {
      document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-cat');
      renderEpisodes();
    }
  });

  // Player Interactions
  document.getElementById('mini-expand-trigger').addEventListener('click', () => {
    document.getElementById('expanded-player').classList.remove('hidden');
  });
  
  document.getElementById('close-player-btn').addEventListener('click', () => {
    document.getElementById('expanded-player').classList.add('hidden');
    renderEpisodes(); // Refresh list to show updated progress bars
    checkContinueListening();
  });

  document.getElementById('mini-play-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  
  document.getElementById('play-pause-btn').addEventListener('click', () => togglePlay());
  
  document.getElementById('skip-back-btn').addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  document.getElementById('skip-fwd-btn').addEventListener('click', () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); });
  
  // Seek bar
  const seekBar = document.getElementById('seek-bar');
  seekBar.addEventListener('input', () => {
    audio.currentTime = seekBar.value;
    document.getElementById('time-current').textContent = formatTime(seekBar.value);
  });

  // Speed
  document.getElementById('speed-btn').addEventListener('click', (e) => {
    currentRateIndex = (currentRateIndex + 1) % playbackRates.length;
    const rate = playbackRates[currentRateIndex];
    audio.playbackRate = rate;
    e.target.textContent = rate + 'x';
    showToast(`Velocidad: ${rate}x`);
  });

  // Sleep Timer
  document.getElementById('sleep-btn').addEventListener('click', () => {
    currentSleepIndex = (currentSleepIndex + 1) % sleepTimes.length;
    const minutes = sleepTimes[currentSleepIndex];
    
    if (sleepTimer) clearTimeout(sleepTimer);
    
    if (minutes === 0) {
      showToast('Sleep timer desactivado');
      document.getElementById('sleep-btn').style.color = 'inherit';
    } else {
      showToast(`El audio se pausará en ${minutes} min`);
      document.getElementById('sleep-btn').style.color = 'var(--primary-color)';
      sleepTimer = setTimeout(() => {
        if (!audio.paused) togglePlay();
        showToast('Temporizador completado. Audio pausado.');
        currentSleepIndex = 0;
        document.getElementById('sleep-btn').style.color = 'inherit';
      }, minutes * 60 * 1000);
    }
  });

  // Admin Modals
  document.getElementById('admin-btn').addEventListener('click', () => {
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-pass').value = '';
  });
  
  document.getElementById('close-admin-btn').addEventListener('click', () => {
    document.getElementById('admin-modal').classList.add('hidden');
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    const pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASSWORD) {
      document.getElementById('admin-login-view').classList.add('hidden');
      document.getElementById('admin-dashboard-view').classList.remove('hidden');
      renderAdminEpisodes();
    } else {
      showToast("Contraseña incorrecta");
    }
  });
  
  // Admin Form Submit
  document.getElementById('add-episode-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addNewEpisode();
  });
}

function setupTheme() {
  const savedTheme = localStorage.getItem('pgn_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('meta-theme-color').content = savedTheme === 'dark' ? '#121212' : '#f3f4f6';
}

/* =========================================
   ADMINISTRACIÓN
   ========================================= */

function renderAdminEpisodes() {
  const list = document.getElementById('admin-episodes-list');
  list.innerHTML = '';
  
  episodes.forEach(ep => {
    const li = document.createElement('li');
    li.className = 'admin-ep-item';
    
    let html = `<div><strong>${ep.title}</strong> <br><small>${ep.file}</small></div>`;
    
    if (ep.isAdminAdded) {
      html += `<button class="delete-btn" onclick="deleteEpisode('${ep.id}')" aria-label="Eliminar">🗑️</button>`;
    } else {
      html += `<span style="font-size: 0.8rem; color: var(--text-muted)">Base</span>`;
    }
    
    li.innerHTML = html;
    list.appendChild(li);
  });
}

function addNewEpisode() {
  // Convertir duración MM:SS a segundos
  const durStr = document.getElementById('add-dur').value;
  let durSec = 0;
  if (durStr.includes(':')) {
    const parts = durStr.split(':');
    durSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  const newEp = {
    id: 'ep-admin-' + Date.now(),
    title: document.getElementById('add-title').value,
    subtitle: document.getElementById('add-subtitle').value,
    desc: document.getElementById('add-desc').value,
    category: document.getElementById('add-cat').value,
    emoji: document.getElementById('add-emoji').value,
    file: document.getElementById('add-file').value,
    durationStr: durStr,
    durationSec: durSec,
    isAdminAdded: true
  };

  // Guardar en array local
  episodes.push(newEp);
  
  // Guardar en localStorage (Solo los agregados por admin)
  const adminEps = episodes.filter(ep => ep.isAdminAdded);
  localStorage.setItem('pgn_admin_eps', JSON.stringify(adminEps));
  
  // Reset UI
  document.getElementById('add-episode-form').reset();
  showToast("Episodio guardado exitosamente");
  renderAdminEpisodes();
  renderEpisodes();
  updateGlobalStats();
}

window.deleteEpisode = function(id) { // expuesto al window para el onclick inline
  if (!confirm('¿Seguro que deseas eliminar este episodio?')) return;
  
  episodes = episodes.filter(ep => ep.id !== id);
  const adminEps = episodes.filter(ep => ep.isAdminAdded);
  localStorage.setItem('pgn_admin_eps', JSON.stringify(adminEps));
  
  showToast("Episodio eliminado");
  renderAdminEpisodes();
  renderEpisodes();
  updateGlobalStats();
};

/* =========================================
   UTILITIES & PWA
   ========================================= */

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  
  // Limpiar DOM después de la animación (3s aprox)
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, 3000);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado', reg.scope))
        .catch(err => console.log('Error al registrar SW:', err));
    });
  }
}