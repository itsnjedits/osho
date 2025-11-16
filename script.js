document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";

    const playlist = [];
    let songs = [];
    let currentIndex = 0;
    let isPlaylist = false;
    let isLooping = false;
    let currentPlaybackRate = 1.0;

    const elements = {
        title: document.querySelector('.title'),
        heading: document.querySelector('.without-ads'),
        playlistButton: document.querySelector('.yourPlaylist'),
        arrayDiv: document.querySelector('.array'),
        playPauseButton: document.getElementById('play-pause'),
        prevButton: document.getElementById('prev'),
        nextButton: document.getElementById('next'),
        songImage: document.getElementById('song-image'),
        songTitle: document.querySelector('.song-title'),
        songArtist: document.querySelector('.song-artist'),
        progress: document.getElementById('progress'),
        timeCompleted: document.getElementById('timecompleted'),
        timeTotal: document.getElementById('timetotal'),
        songDescription: document.querySelector('.song-description'),
        speedSelect: document.getElementById('speed'),
        forward: document.getElementById('forward'),
        rewind: document.getElementById('rewind'),
        volumeSlider: document.querySelector('.volume-slider'),
        musicplayer: document.getElementsByClassName('musicplayer')[0],
        mainContainer: document.getElementsByTagName("main")[0]
    };

    const {
        title,
        heading,
        playlistButton,
        arrayDiv,
        playPauseButton,
        prevButton,
        nextButton,
        forward,
        rewind,
        songImage,
        songTitle,
        songArtist,
        progress,
        timeCompleted,
        timeTotal,
        songDescription,
        speedSelect,
        volumeSlider,
        musicplayer,
        mainContainer
    } = elements;

    musicplayer.style.animationPlayState = 'paused';

    // RECORDING SECTION
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let timerInterval;
let seconds = 0;

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return (m < 10 ? "0"+m : m) + ":" + (s < 10 ? "0"+s : s);
}

// AUDIO SETUP
const audioContext = new AudioContext();
audio.crossOrigin = "anonymous";    // <-- IMPORTANT
const sourceNode = audioContext.createMediaElementSource(audio);
const destination = audioContext.createMediaStreamDestination();
sourceNode.connect(destination);
sourceNode.connect(audioContext.destination);

const recordBtn = document.querySelector(".recordBtn");
const pauseBtn = document.querySelector(".pauseBtn");
const resumeBtn = document.querySelector(".resumeBtn");
const stopBtn = document.querySelector(".stopBtn");
const timerBtn = document.querySelector(".timerBtn");
const timeText = document.querySelector(".timeText");

recordBtn.addEventListener("click", () => {

    if (isRecording) return;
    isRecording = true;

    mediaRecorder = new MediaRecorder(destination.stream);
    audioChunks = [];
    seconds = 0;
    timeText.innerText = "00:00";

    timerBtn.classList.remove("hidden");

    timerInterval = setInterval(() => {
        seconds++;
        timeText.innerText = formatTime(seconds);
    }, 1000);

    mediaRecorder.start();

    recordBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
});

pauseBtn.addEventListener("click", () => {
    if (mediaRecorder?.state === "recording") {
        mediaRecorder.pause();

        // TIMER STOP
        clearInterval(timerInterval);

        pauseBtn.classList.add("hidden");
        resumeBtn.classList.remove("hidden");
    }
});

resumeBtn.addEventListener("click", () => {
    if (mediaRecorder?.state === "paused") {
        mediaRecorder.resume();

        // TIMER RESUME
        timerInterval = setInterval(() => {
            seconds++;
            timeText.innerText = formatTime(seconds);
        }, 1000);

        resumeBtn.classList.add("hidden");
        pauseBtn.classList.remove("hidden");
    }
});

stopBtn.addEventListener("click", () => {

    if (!isRecording) return;
    isRecording = false;

    clearInterval(timerInterval);

    mediaRecorder.stop();

    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "recorded_" + Date.now() + ".webm";
        a.click();
    };

    recordBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.add("hidden");
    stopBtn.classList.add("hidden");
    timerBtn.classList.add("hidden");

    timeText.innerText = "00:00";
});


    const trimAndDecodeURL = (url) => {
        const baseURL = 'https://itsnjedits.github.io/osho/';
        if (typeof url !== 'string') return '';
        return url.startsWith(baseURL) ? decodeURIComponent(url.slice(baseURL.length)) : url;
    };

    const renderSongs = (songArray, allowRemoval = false) => {
        arrayDiv.innerHTML = '';
        songArray.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'item flex justify-between items-center bg-gray-700 rounded-xl p-2 max-md:p-1 mx-4 max-md:mx-2 min-md:hover:bg-gray-600 duration-300 cursor-pointer';
            item.dataset.index = index;
            item.innerHTML = `
                <div class="text-white flex items-center gap-x-4 max-md:gap-x-2">
                    <div class="w-32 max-md:w-24 aspect-[4/3] overflow-hidden rounded-lg">
                        <img src="${song.image}" class="w-full h-full object-cover" alt="${song.title}">
                    </div>
                    <div class="text">
                        <h2 class="max-md:text-base song-title font-semibold text-xl max-[500px]:text-[13.5px]">${song.title}</h2>
                        <p class="song-artist max-md:text-sm text-gray-300 max-[500px]:text-[12px]">${song.artist}</p>
                    </div>
                </div>
                <div class="song-play flex items-center gap-x-2 mr-3 max-md:mr-2 max-md:gap-x-1">
                    <div class="visualizer hidden">
                        ${Array.from({ length: 5 }, (_, i) => `<div class="bar max-md:w-[2px] bar${i + 1}"></div>`).join('')}
                    </div>
                    <p class="text-5xl ${allowRemoval ? 'remove-from-playlist' : 'add-to-playlist'} text-[#2b8bff] cursor-pointer hover:text-[#29ecfe] max-md:text-2xl "><i class='bx bx-${allowRemoval ? 'minus' : 'plus'}'></i></p>
                </div>`;

            item.querySelector(`.${allowRemoval ? 'remove-from-playlist' : 'add-to-playlist'}`).addEventListener('click', (e) => {
                e.stopPropagation();
                allowRemoval ? removeFromPlaylist(index) : addToPlaylist(e);
            });

            item.addEventListener('click', () => playSong(index));
            arrayDiv.appendChild(item);
        });
    };

    const removeFromPlaylist = (index) => {
        playlist.splice(index, 1);
        songs = [...new Set(playlist.map(JSON.stringify))].map(JSON.parse);
        renderSongs(songs, true);
    };

    const addToPlaylist = (event) => {
        const button = event.target.closest('.add-to-playlist');
        const parent = button.closest('.item');
        const image = trimAndDecodeURL(parent.querySelector('img')?.src || '');
        const title = parent.querySelector('.song-title')?.textContent || 'Unknown Title';
        const artist = parent.querySelector('.song-artist')?.textContent || 'Unknown Artist';
        const file = `https://itsnjedits.github.io/soundaura/Audio/${title}.mp3`;

        const songData = { image, title, artist, file };
        playlist.push(songData);
        console.log("Added song to playlist:", songData);
    };

    const fetching = (filename) => {
        fetch(filename)
            .then(res => res.json())
            .then(seriesList => {
                songs = seriesList.flatMap(series => {
                    return series.files
                        .slice()
                        .sort((a, b) => parseInt(a.match(/(\d+)\.mp3$/)?.[1] || '0') - parseInt(b.match(/(\d+)\.mp3$/)?.[1] || '0'))
                        .map(file => {
                            const num = file.match(/(\d+)\.mp3$/)?.[1] || '00';
                            return {
                                title: `${series.series} ${num}`,
                                artist: series.artist,
                                image: series.image,
                                file
                            };
                        });
                });
                renderSongs(songs);
            })
            .catch(err => console.error('Error fetching songs:', err));
    };

    title?.addEventListener('click', () => {
        isPlaylist = false;
        fetching('Osho.json');
        heading.innerHTML = `Osho Audio Discourses 🔥`;
    });

    playlistButton?.addEventListener('click', () => {
        isPlaylist = true;
        songs = [...new Set(playlist.map(song => song.title))]
            .map(title => playlist.find(song => song.title === title));
        renderSongs(songs, true);
        heading.innerHTML = `Your Playlist 🔥`;
    });

    fetching('Osho.json');

    function disableAllButtons() {
        playPauseButton.disabled = true;
        playPauseButton.classList.remove('hover:min-md:bg-blue-400');
        prevButton.disabled = true;
        prevButton.classList.remove('min-md:hover:bg-gray-500');
        nextButton.disabled = true;
        nextButton.classList.remove('min-md:hover:bg-gray-500');
        forward.disabled = true;
        forward.classList.remove('min-md:hover:bg-gray-500');
        rewind.disabled = true;
        rewind.classList.remove('min-md:hover:bg-gray-500');
    }

    function enableAllButtons() {
        playPauseButton.disabled = false;
        playPauseButton.classList.add('hover:min-md:bg-blue-400');
        prevButton.disabled = false;
        prevButton.classList.add('min-md:hover:bg-gray-500');
        nextButton.disabled = false;
        nextButton.classList.add('min-md:hover:bg-gray-500');
        forward.disabled = false;
        forward.classList.add('min-md:hover:bg-gray-500');
        rewind.disabled = false;
        rewind.classList.add('min-md:hover:bg-gray-500');
    }

    disableAllButtons();

    function playSong(index) {
        mainContainer.classList.remove("mb-28", "max-md:mb-20");
        if (window.innerWidth < 768) {
            mainContainer.classList.add("mb-32");
            mainContainer.classList.remove("mb-56");
        } else {
            mainContainer.classList.add("mb-56");
            mainContainer.classList.remove("mb-32");
        }

        if (index < 0 || index >= songs.length) return;

        currentIndex = index;
        const song = songs[currentIndex];

        if (!audio.paused) audio.pause();
        audio.onended = null;

        audio.src = isPlaylist
            ? song.file.replace("https://itsnjedits.github.io/osho", "https://itsnjedits.github.io/soundaura")
            : `https://itsnjedits.github.io/soundaura/${song.file}`;

        audio.load();
        audio.playbackRate = currentPlaybackRate;

        audio.play().then(() => {
            musicplayer.style.animationPlayState = 'running';
        }).catch(console.error);

        updatePlayer(song);
        enableAllButtons();

        audio.onended = () => {
            if (currentIndex === songs.length - 1 && !isLooping) return;
            playSong(currentIndex + 1);
        };
    }

    function updatePlayer(song) {
        songImage.src = song.image;
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        songDescription.textContent = song.title;
    }

    function updatePlayer(song) {
        songImage.src = song.image;
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        songDescription.classList.remove('opacity-0'); // Show the song description
        songDescription.style.display = 'flex'; // Show the music player
        playPauseButton.innerHTML = `<i class='bx bx-pause' ></i>`;
        updateButtons();
        updateTime();
        updateVisualizers(); // Update visualizers
        highlightCurrentSong(); // Highlight the current song
    }

    function updateButtons() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === songs.length - 1;
        prevButton.style.backgroundColor = prevButton.disabled ? '' : 'bg-gray-600';
        nextButton.style.backgroundColor = nextButton.disabled ? '' : 'bg-gray-600';
    }

    function updateTime() {
        const update = () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration;
            const formattedCurrentTime = formatTime(currentTime);
            const formattedDuration = formatTime(duration);
            timeCompleted.textContent = formattedCurrentTime;
            timeTotal.textContent = formattedDuration;
            progress.max = duration;
            progress.value = currentTime;
        };

        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        update();
        audio.addEventListener('timeupdate', update);
    }

    function seek() {
        audio.currentTime = progress.value;
    }

    function changeTime(amount) {
        audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), audio.duration);
    }

    function playNextSong() {
        if (currentIndex < songs.length - 1) {
            playSong(currentIndex + 1);
        }
    }

    function playPrevSong() {
        if (currentIndex > 0) {
            playSong(currentIndex - 1);
        }
    }

    function updateVisualizers() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const visualizer = item.querySelector('.visualizer');
            if (parseInt(item.dataset.index) === currentIndex || songDescription.style.display === 'flex' && item.querySelector('.song-title').textContent === songTitle.textContent) {
                visualizer.classList.remove('hidden');

            } else {
                visualizer.classList.add('hidden');
            }
        });
    }

    function highlightCurrentSong() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const songTitleElement = item.querySelector('.song-title');
            item.classList.remove('bg-gray-700', 'bg-gray-600'); // Add border class

            if (songTitleElement.textContent === songTitle.textContent) {
                item.classList.add('border-[1px]', 'border-[#29ecfe]', 'bg-gray-600'); // Add border class
            } else {
                item.classList.remove('border-[1px]', 'border-[#29ecfe]'); // Remove border class
            }
        });
    }


    playPauseButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseButton.innerHTML = `<i class='bx bx-pause' ></i>`;
            musicplayer.style.animationPlayState = 'running';
        } else {
            audio.pause();
            playPauseButton.innerHTML = `<i class='bx bx-play'></i>`;
            musicplayer.style.animationPlayState = 'paused';
        }
    });

    prevButton.addEventListener('click', playPrevSong);
    nextButton.addEventListener('click', playNextSong);
    forward.addEventListener('click', () => changeTime(10));
    rewind.addEventListener('click', () => changeTime(-10));
    volumeSlider.addEventListener('input', (e) => audio.volume = e.target.value / 100); // Add volume control
    speedSelect.addEventListener('change', (e) => {
        currentPlaybackRate = parseFloat(e.target.value);
        audio.playbackRate = currentPlaybackRate;
    });
    progress.addEventListener('input', seek);


    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        const actions = {
            KeyN: () => nextButton.click(),
            KeyP: () => prevButton.click(),
            KeyM: () => {
                audio.volume = audio.volume ? 0 : 0.6;
                slider.value = audio.volume * 100;
            },
            ArrowRight: () => changeTime(10),
            ArrowLeft: () => changeTime(-10),
            Space: () => playPauseButton.click()
        };

        if (!isInput && actions[event.code]) {
            event.preventDefault();
            actions[event.code]();
        }
    });


    // Auto-next feature
    audio.addEventListener('ended', playNextSong);

    function highlightElement(el) {
        el.children[0].children[1].children[0].style.color = 'yellow';
        el.children[0].children[1].children[1].style.color = 'yellow';
        el.classList.add('bg-gray-900');

        const yOffset = el.offsetTop + (el.offsetHeight / 2) - (window.innerHeight / 2);
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
});
