// --- REFERENCIAS A ELEMENTOS DEL DOM ---
const loadMp3Btn = document.getElementById('load-mp3');
const audioPlayer = document.getElementById('audio-player');
const statusElement = document.getElementById('status');
const nowPlayingElement = document.getElementById('now-playing');
const playlistUI = document.getElementById('playlist-ui');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');

// --- ESTADO DEL REPRODUCTOR ---
let playlist = [];
let currentTrackIndex = -1;
let repeatMode = 'none'; // 'none', 'one', 'all'

// --- FUNCIONES DE LA PLAYLIST ---

// Añade una pista a la playlist, evitando duplicados.
async function addTrack(filePath) {
    if (playlist.some(track => track.source === filePath)) {
        statusElement.textContent = 'Error: El archivo ya está en la lista.';
        return;
    }
    const fileName = filePath.split('\\').pop().split('/').pop();
    const track = { source: filePath, title: decodeURI(fileName) };
    playlist.push(track);
    updatePlaylistUI();
    statusElement.textContent = `"${track.title}" añadido.`;
    if (currentTrackIndex === -1) {
        playTrack(0);
    }
}

// Elimina una pista de la playlist.
function deleteTrack(index) {
    playlist.splice(index, 1);
    if (index === currentTrackIndex) {
        audioPlayer.pause();
        audioPlayer.src = '';
        nowPlayingElement.textContent = "Ahora suena: Nada";
        currentTrackIndex = -1;
    } else if (index < currentTrackIndex) {
        currentTrackIndex--;
    }
    updatePlaylistUI();
}

// Reproduce una pista de la playlist según su índice.
function playTrack(index) {
    if (index < 0 || index >= playlist.length) {
        currentTrackIndex = -1;
        nowPlayingElement.textContent = "Ahora suena: Nada";
        audioPlayer.src = "";
        updatePlaylistUI();
        return;
    }
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    nowPlayingElement.textContent = `Ahora suena: ${track.title}`;
    audioPlayer.src = track.source;
    audioPlayer.play();
    updatePlaylistUI();
}

// Actualiza la lista visual de la playlist en el HTML.
function updatePlaylistUI() {
    playlistUI.innerHTML = '';
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        const titleSpan = document.createElement('span');
        titleSpan.className = 'track-title';
        titleSpan.textContent = `${index + 1}. ${track.title}`;
        titleSpan.onclick = () => playTrack(index);
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'X';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteTrack(index);
        };
        if (index === currentTrackIndex) {
            li.classList.add('playing');
        }
        li.appendChild(titleSpan);
        li.appendChild(deleteButton);
        playlistUI.appendChild(li);
    });
}

// --- EVENT LISTENERS ---

loadMp3Btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
        addTrack(filePath);
    }
});

nextBtn.addEventListener('click', () => playTrack((currentTrackIndex + 1) % playlist.length));
prevBtn.addEventListener('click', () => playTrack((currentTrackIndex - 1 + playlist.length) % playlist.length));
repeatBtn.addEventListener('click', () => {
    if (repeatMode === 'none') {
        repeatMode = 'all';
        repeatBtn.textContent = 'Repetir: Todo 🔁';
    } else if (repeatMode === 'all') {
        repeatMode = 'one';
        repeatBtn.textContent = 'Repetir: Uno 🔂';
    } else {
        repeatMode = 'none';
        repeatBtn.textContent = 'Repetir: No 🔁';
    }
});

audioPlayer.addEventListener('ended', () => {
    if (repeatMode === 'one') {
        playTrack(currentTrackIndex);
    } else if (repeatMode === 'all') {
        playTrack((currentTrackIndex + 1) % playlist.length);
    } else if (currentTrackIndex < playlist.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        currentTrackIndex = -1;
        updatePlaylistUI();
    }
});