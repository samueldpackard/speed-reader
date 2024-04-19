document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const bookFile = params.get('book') + '.txt';
    const displayElement = document.getElementById('display');
    const progressBar = document.getElementById('progressBar');
    const indexDisplay = document.getElementById('indexDisplay');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsButton = document.getElementById('settingsButton');
    let wordsPerMinute = localStorage.getItem('wordsPerMinute') ? parseInt(localStorage.getItem('wordsPerMinute'), 10) : 200;
    let fontSize = localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize'), 10) : 24;
    let delay = (60 / wordsPerMinute) * 1000;
    let isPaused = true;
    let timeoutHandle = null;
    let chunks = [];
    let currentChunkIndex = 0;

    displayElement.style.fontSize = `${fontSize}px`;

    function processTextIntoChunks(text) {
        const words = text.split(/\s+/);
        let startIndex = 0;

        while (startIndex < words.length) {
            let chunkEndIndex = startIndex + 3;
            for (let i = startIndex; i < Math.min(startIndex + 3, words.length); i++) {
                if (words[i].includes('.') || words[i].includes(';') || words[i].includes('?') || words[i].includes('!')) {
                    chunkEndIndex = i + 1;
                    break;
                }
            }
            chunks.push(words.slice(startIndex, chunkEndIndex).join(' '));
            startIndex = chunkEndIndex;
        }
    }

    function startDisplay() {
        if (currentChunkIndex < chunks.length) {
            displayElement.innerText = chunks[currentChunkIndex];
            progressBar.value = currentChunkIndex;
            indexDisplay.value = currentChunkIndex + 1;
            localStorage.setItem(bookFile, currentChunkIndex);
            if (!isPaused) {
                timeoutHandle = setTimeout(function() {
                    currentChunkIndex++;
                    startDisplay();
                }, delay);
            }
        } else {
            displayElement.innerText = "End of text.";
            isPaused = true;
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                progressBar.style.visibility = 'hidden';
                indexDisplay.style.visibility = 'hidden';
                settingsButton.style.visibility = 'hidden';
                if (settingsPanel.style.display !== 'none') {
                    settingsPanel.style.display = 'none';
                }
            }).catch((e) => {
                console.error('Error attempting to enable full-screen mode:', e);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    progressBar.style.visibility = 'visible';
                    indexDisplay.style.visibility = 'visible';
                    settingsButton.style.visibility = 'visible';
                });
            }
        }
    }

    indexDisplay.addEventListener('change', function() {
        const newIndex = parseInt(this.value, 10) - 1;
        if (newIndex >= 0 && newIndex < chunks.length) {
            currentChunkIndex = newIndex;
            displayElement.innerText = chunks[currentChunkIndex];
            progressBar.value = currentChunkIndex;
        }
    });

    document.body.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            event.preventDefault();
            isPaused = !isPaused;
            if (!isPaused && currentChunkIndex < chunks.length) {
                startDisplay();
            } else if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            if (!isPaused) {
                isPaused = true;
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            } else {
                if (event.key === 'ArrowRight' && currentChunkIndex < chunks.length - 1) {
                    currentChunkIndex++;
                } else if (event.key === 'ArrowLeft' && currentChunkIndex > 0) {
                    currentChunkIndex--;
                }
                displayElement.innerText = chunks[currentChunkIndex];
                progressBar.value = currentChunkIndex;
                indexDisplay.value = currentChunkIndex + 1;
                localStorage.setItem(bookFile, currentChunkIndex);
            }
        } else if (event.key === 'f') {
            toggleFullScreen();
        }
    });

    document.getElementById('settingsButton').addEventListener('click', function() {
        settingsPanel.style.display = (settingsPanel.style.display === 'none' ? 'block' : 'none');
    });

    document.getElementById('saveSettingsButton').addEventListener('click', function() {
        wordsPerMinute = parseInt(document.getElementById('wordsPerMinuteInput').value, 10);
        fontSize = parseInt(document.getElementById('fontSizeInput').value, 10);

        delay = (60 / wordsPerMinute) * 1000;
        displayElement.style.fontSize = `${fontSize}px`;

        settingsPanel.style.display = 'none';

        localStorage.setItem('wordsPerMinute', wordsPerMinute);
        localStorage.setItem('fontSize', fontSize);

        if (!isPaused) {
            clearTimeout(timeoutHandle);
            startDisplay();
        }
    });

    document.getElementById('wordsPerMinuteInput').value = wordsPerMinute;
    document.getElementById('fontSizeInput').value = fontSize;

    fetch('txtfiles/' + bookFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            processTextIntoChunks(text);
            progressBar.max = chunks.length - 1;
            progressBar.style.visibility = 'visible';
            currentChunkIndex = localStorage.getItem(bookFile) ? parseInt(localStorage.getItem(bookFile), 10) : 0;
            progressBar.value = currentChunkIndex;
            displayElement.innerText = chunks[currentChunkIndex] || "End of text.";
            indexDisplay.value = currentChunkIndex + 1;
        })
        .catch(error => {
            console.error('Error fetching/loading the text file:', error);
            displayElement.innerText = "Failed to load text.";
        });

    progressBar.addEventListener('input', function() {
        currentChunkIndex = parseInt(this.value, 10);
        displayElement.innerText = chunks[currentChunkIndex];
        indexDisplay.value = currentChunkIndex + 1;
        localStorage.setItem(bookFile, currentChunkIndex);
    });
});

