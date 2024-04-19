document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const bookFile = params.get('book') + '.txt';
    const displayElement = document.getElementById('display');
    const progressBar = document.getElementById('progressBar');
    const indexDisplay = document.getElementById('indexDisplay');
    const wordsPerMinute = 200;
    const delay = (60 / wordsPerMinute) * 1000;
    let isPaused = true;
    let timeoutHandle = null;
    let chunks = [];
    let currentChunkIndex = 0;

    function processTextIntoChunks(text) {
        const words = text.split(/\s+/);
        let startIndex = 0;

        while (startIndex < words.length) {
            let chunkEndIndex = startIndex + 3;
            for (let i = startIndex; i < Math.min(startIndex + 3, words.length); i++) {
                if (words[i].includes('.')) {
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
            currentChunkIndex++;
            if (!isPaused) {
                timeoutHandle = setTimeout(startDisplay, delay);
            }
        } else {
            displayElement.innerText = "End of text.";
            isPaused = true;
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error('Error attempting to enable full-screen mode:', e);
            });
            progressBar.style.visibility = 'hidden'; // Hide progress bar in full-screen
            indexDisplay.style.visibility = 'hidden'; // Hide index number in full-screen
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                progressBar.style.visibility = 'visible'; // Show progress bar when exiting full-screen
                indexDisplay.style.visibility = 'visible'; // Show index number when exiting full-screen
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
            if (!isPaused) {
                isPaused = true;
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
            }
            if (event.key === 'ArrowRight' && currentChunkIndex < chunks.length - 1) {
                currentChunkIndex++;
            } else if (event.key === 'ArrowLeft' && currentChunkIndex > 0) {
                currentChunkIndex--;
            }
            displayElement.innerText = chunks[currentChunkIndex];
            progressBar.value = currentChunkIndex;
            indexDisplay.value = currentChunkIndex + 1;
            localStorage.setItem(bookFile, currentChunkIndex);
        } else if (event.key === 'f') {
            toggleFullScreen();
        }
    });

    console.log('Attempting to load:', 'txtfiles/' + bookFile);

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

