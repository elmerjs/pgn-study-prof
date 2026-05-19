// script.js
let episodes = [
    {
        id: 1,
        title: "Claves del núcleo común para la Procuraduría",
        subtitle: "Núcleo común · Componente de conocimiento",
        description: "Fundamentos transversales para todos los cargos PGN",
        file: "audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a",
        category: "general",
        emoji: "📚",
        duration: "28:04"
    },
    {
        id: 2,
        title: "Episodio 3 · Coordinación institucional",
        subtitle: "Gestión pública y coordinación",
        description: "Articulación interinstitucional y roles del coordinador",
        file: "audios/Ep-3.m4a",
        category: "general",
        emoji: "🤝",
        duration: "19:49"
    },
    {
        id: 3,
        title: "Estructura y funciones de la Procuraduría",
        subtitle: "Estructura orgánica PGN · Decreto-Ley",
        description: "Organigrama, funciones macro y competencias por nivel",
        file: "audios/Estructura_y_funciones_de_la_Procuraduría.m4a",
        category: "general",
        emoji: "🏛️",
        duration: "30:34"
    }
];

let currentEpisode = null;
let audio = new Audio();
let isPlaying = false;
let currentSpeed = 1;
let sleepTimer = null;
let progressInterval = null;
let lastPlayedId = null;

const ADMIN_PASSWORD = "coordinador2026"; // Cambia esto fácilmente

// Cargar episodios guardados
function loadSavedEpisodes() {
    const saved = localStorage.getItem('pgn_episodes');
    if (saved) {
        const parsed = JSON.parse(saved);
        episodes = [...episodes, ...parsed];
    }
}

function saveEpisodes() {
    const userEpisodes = episodes.filter(ep => ep.id > 3);
    localStorage.setItem('pgn_episodes', JSON.stringify(userEpisodes));
}

// Progreso
function saveProgress(id, currentTime, duration) {
    const progress = JSON.parse(localStorage.getItem('pgn_progress') || '{}');
    progress[id] = { currentTime, duration, timestamp: Date.now() };
    localStorage.setItem('pgn_progress', JSON.stringify(progress));
}

function getProgress(id) {
    const progress = JSON.parse(localStorage.getItem('pgn_progress') || '{}');
    return progress[id] || { currentTime: 0, percentage: 0 };
}

function getCompletedCount() {
    const progress = JSON.parse(localStorage.getItem('pgn_progress') || '{}');
    return Object.values(progress).filter(p => (p.currentTime / p.duration) >= 0.95).length;
}

// Renderizar episodios
function renderEpisodes(filteredEpisodes) {
    const grid = document.getElementById('episodes-grid');
    grid.innerHTML = '';

    filteredEpisodes.forEach(ep => {
        const progress = getProgress(ep.id);
        const perc = ep.duration ? Math.min(Math.round((progress.currentTime / (progress.duration || 1)) * 100), 100) : 0;

        const card = document.createElement('div');
        card.className = 'episode-card';
        card.innerHTML = `
            <div class="card-emoji">${ep.emoji}</div>
            <div class="card-content">
                <span class="card-category ${ep.category}">${ep.category === 'general' ? '📚 General' : ep.category === 'especifico' ? '🎯 Específico' : '🧠 Comportamental'}</span>
                <div class="card-title">${ep.title}</div>
                <div class="card-subtitle">${ep.subtitle}</div>
                <div class="progress-small"><div class="progress-small-fill" style="width: ${perc}%"></div></div>
                <small style="color: var(--text-secondary); margin-top: 6px; display: block;">${ep.duration} • ${perc}% completado</small>
            </div>
        `;
        card.onclick = () => playEpisode(ep);
        grid.appendChild(card);
    });
}

// Filtros
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            document.getElementById('section-title').textContent = category === 'all' ? 'Todos los episodios' : btn.textContent;
            
            let filtered = episodes;
            if (category !== 'all') {
                filtered = episodes.filter(ep => ep.category === category);
            }
            renderEpisodes(filtered);
        });
    });
}

// Player
function playEpisode(ep) {
    currentEpisode = ep;
    lastPlayedId = ep.id;
    
    audio.src = ep.file;
    audio.currentTime = getProgress(ep.id).currentTime || 0;
    
    document.getElementById('player-title').textContent = ep.title;
    document.getElementById('player-subtitle').textContent = ep.subtitle;
    document.getElementById('player-description').textContent = ep.description;
    document.getElementById('artwork').textContent = ep.emoji;
    document.getElementById('mini-artwork').textContent = ep.emoji;
    document.getElementById('mini-title').textContent = ep.title;
    document.getElementById('mini-subtitle').textContent = ep.subtitle;
    
    document.getElementById('full-player').classList.remove('hidden');
    document.getElementById('mini-player').classList.remove('hidden');
    
    audio.play().then(() => {
        isPlaying = true;
        document.getElementById('play-main').textContent = '❚❚';
        document.getElementById('mini-play').textContent = '❚❚';
        document.getElementById('full-player').classList.add('playing');
    }).catch(console.error);
    
    updateProgress();
}

function updateProgress() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (!audio.duration) return;
        
        const percent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress-bar').value = percent;
        document.getElementById('current-time').textContent = formatTime(audio.currentTime);
        document.getElementById('total-time').textContent = formatTime(audio.duration);
        
        document.getElementById('mini-progress-bar').style.width = percent + '%';
        
        saveProgress(currentEpisode.id, audio.currentTime, audio.duration);
        
        // Actualizar continue card
        updateContinueSection();
    }, 1000);
}

function formatTime(seconds) {
    if (!seconds) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// CONTINUAR ESCUCHANDO
function updateContinueSection() {
    const progressData = JSON.parse(localStorage.getItem('pgn_progress') || '{}');
    const latest = Object.keys(progressData).sort((a,b) => progressData[b].timestamp - progressData[a].timestamp)[0];
    
    if (!latest) {
        document.getElementById('continue-section').classList.add('hidden');
        return;
    }
    
    const ep = episodes.find(e => e.id == latest);
    if (!ep) return;
    
    const p = progressData[latest];
    const perc = Math.round((p.currentTime / p.duration) * 100);
    
    const cardHTML = `
        <div class="episode-card" style="margin:0">
            <div class="card-emoji">${ep.emoji}</div>
            <div class="card-content">
                <div class="card-title">${ep.title}</div>
                <div style="color:var(--accent); font-weight:600;">${perc}% • ${formatTime(p.currentTime)}</div>
            </div>
        </div>
    `;
    
    document.getElementById('continue-card').innerHTML = cardHTML;
    document.getElementById('continue-card').onclick = () => playEpisode(ep);
    document.getElementById('continue-section').classList.remove('hidden');
}

// Controles del player
function setupPlayerControls() {
    const playMain = document.getElementById('play-main');
    const miniPlay = document.getElementById('mini-play');
    const progressBar = document.getElementById('progress-bar');
    
    playMain.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            isPlaying = true;
            playMain.textContent = '❚❚';
            miniPlay.textContent = '❚❚';
        } else {
            audio.pause();
            isPlaying = false;
            playMain.textContent = '▶';
            miniPlay.textContent = '▶';
        }
    });
    
    miniPlay.addEventListener('click', () => playMain.click());
    
    document.getElementById('rewind-btn').addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    
    document.getElementById('forward-btn').addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });
    
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });
    
    // Velocidad
    const speedBtn = document.getElementById('speed-btn');
    speedBtn.addEventListener('click', () => {
        const speeds = [1, 1.5, 2];
        let idx = speeds.indexOf(currentSpeed);
        currentSpeed = speeds[(idx + 1) % 3];
        audio.playbackRate = currentSpeed;
        speedBtn.textContent = currentSpeed + "×";
    });
    
    // Sleep timer
    document.getElementById('sleep-btn').addEventListener('click', () => {
        document.getElementById('sleep-options').classList.toggle('hidden');
    });
    
    document.querySelectorAll('#sleep-options button').forEach(btn => {
        btn.addEventListener('click', () => {
            const mins = parseInt(btn.dataset.min);
            document.getElementById('sleep-options').classList.add('hidden');
            
            if (sleepTimer) clearTimeout(sleepTimer);
            
            if (mins > 0) {
                showToast(`Sleep timer: ${mins} minutos`);
                sleepTimer = setTimeout(() => {
                    audio.pause();
                    showToast('Sleep timer finalizado');
                }, mins * 60000);
            } else {
                showToast('Sleep timer cancelado');
            }
        });
    });
    
    document.getElementById('close-player').addEventListener('click', () => {
        document.getElementById('full-player').classList.add('hidden');
    });
}

// Admin
function setupAdmin() {
    const adminBtn = document.getElementById('admin-btn');
    const modal = document.getElementById('admin-modal');
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    
    adminBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    
    document.getElementById('close-admin').addEventListener('click', () => {
        modal.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        document.getElementById('admin-password').value = '';
    });
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const pass = document.getElementById('admin-password').value;
        if (pass === ADMIN_PASSWORD) {
            loginScreen.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            renderAdminList();
        } else {
            showToast('Contraseña incorrecta', true);
        }
    });
    
    // Agregar episodio
    document.getElementById('add-episode-btn').addEventListener('click', () => {
        const title = document.getElementById('new-title').value.trim();
        const fileName = document.getElementById('new-file').value.trim();
        
        if (!title || !fileName) {
            showToast('Título y archivo son obligatorios', true);
            return;
        }
        
        const newEp = {
            id: Date.now(),
            title: title,
            subtitle: document.getElementById('new-subtitle').value.trim() || "Sin subtítulo",
            description: document.getElementById('new-desc').value.trim() || "Sin descripción",
            file: fileName,
            category: document.getElementById('new-category').value,
            emoji: document.getElementById('new-emoji').value.trim() || "📖",
            duration: document.getElementById('new-duration').value.trim() || "00:00"
        };
        
        episodes.push(newEp);
        saveEpisodes();
        renderEpisodes(episodes);
        renderAdminList();
        
        // Limpiar formulario
        document.getElementById('new-title').value = '';
        document.getElementById('new-subtitle').value = '';
        document.getElementById('new-desc').value = '';
        document.getElementById('new-file').value = '';
        
        showToast('Episodio agregado correctamente');
    });
}

function renderAdminList() {
    const container = document.getElementById('episode-list-admin');
    container.innerHTML = '<h3>Episodios agregados</h3>';
    
    const userEps = episodes.filter(ep => ep.id > 3);
    
    userEps.forEach(ep => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:12px; background:#1e2937; margin:8px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;';
        div.innerHTML = `
            <div>
                <strong>${ep.emoji} ${ep.title}</strong><br>
                <small>${ep.file}</small>
            </div>
            <button class="delete-btn" data-id="${ep.id}" style="color:#ef4444; background:none; border:none; font-size:18px;">🗑</button>
        `;
        container.appendChild(div);
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar este episodio?')) {
                episodes = episodes.filter(ep => ep.id != btn.dataset.id);
                saveEpisodes();
                renderEpisodes(episodes);
                renderAdminList();
            }
        });
    });
}

// Toast
function showToast(message, error = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = error ? '#b91c1c' : '#1e2937';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2800);
}

// Service Worker
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registrado'))
            .catch(err => console.log('SW fallo:', err));
    }
}

// Tema
function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        toggle.textContent = '☀️';
    }
    
    toggle.addEventListener('click', () => {
        if (document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.removeAttribute('data-theme');
            toggle.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            toggle.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Init
function init() {
    loadSavedEpisodes();
    renderEpisodes(episodes);
    setupFilters();
    setupPlayerControls();
    setupAdmin();
    setupTheme();
    registerSW();
    updateContinueSection();
    
    // Audio ended
    audio.addEventListener('ended', () => {
        showToast('Episodio finalizado');
        document.getElementById('play-main').textContent = '▶';
        document.getElementById('mini-play').textContent = '▶';
    });
    
    console.log('%cPGN Study PRO · Coordinador cargada correctamente', 'color:#22d3ee; font-weight:bold');
}

window.onload = init;