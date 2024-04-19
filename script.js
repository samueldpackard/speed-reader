document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const bookFile = params.get('book') + '.txt';
    const displayElement = document.getElementById('display');
    const progressBar = document.getElementById('progressBar');
    const wordsPerMinute = 200;
    const delay = (60 / wordsPerMinute) * 1000;
    let isPaused = true;
    let timeoutHandle = null;
    let chunks = [];
    let currentChunkIndex = 0;

    fetch('txtfiles/' + bookFile)
    .then(response => response.text())
    .then(text => {
        processTextIntoChunks(text);
        progressBar.max = chunks.length - 1;
        progressBar.style.visibility = 'visible';
        currentChunkIndex = localStorage.getItem(bookFile) ? parseInt(localStorage.getItem(bookFile), 10) : 0;
        progressBar.value = currentChunkIndex;
        displayElement.innerText = chunks[currentChunkIndex] || "End of text.";
    })
    .catch(error => {
        console.error('Error loading the text file:', error);
        displayElement.innerText = "Failed to load text.";
    });

    progressBar.addEventListener('input', function() {
        currentChunkIndex = parseInt(this.value, 10);
        displayElement.innerText = chunks[currentChunkIndex];
        localStorage.setItem(bookFile, currentChunkIndex);
    });

    function processTextIntoChunks(text) {
        const words = text.split(/\s+/);
        let startIndex = 0;
        while (startIndex < words.length) {
            let chunkEndIndex = startIndex + 3;
            for (let i = startIndex; i < startIndex + 3 && i < words.length; i++) {
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
            if (!isPaused) {
                timeoutHandle = setTimeout(startDisplay, delay);
            }
            localStorage.setItem(bookFile, currentChunkIndex);
            currentChunkIndex++;
        } else {
            displayElement.innerText = "End of text.";
        }
    }

    document.body.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            event.preventDefault();
            isPaused = !isPaused;
            if (!isPaused) {
                startDisplay();
            } else if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        } else if (event.key === 'ArrowRight') {
            if (currentChunkIndex < chunks.length) {
                currentChunkIndex++;
                progressBar.value = currentChunkIndex;
                displayElement.innerText = chunks[currentChunkIndex];
                localStorage.setItem(bookFile, currentChunkIndex);
            }
        } else if (event.key === 'ArrowLeft') {
            if (currentChunkIndex > 0) {
                currentChunkIndex--;
                progressBar.value = currentChunkIndex;
                displayElement.innerText = chunks[currentChunkIndex];
                localStorage.setItem(bookFile, currentChunkIndex);
            }
        }
    });
});

