document.addEventListener('DOMContentLoaded', function() {
    const displayElement = document.getElementById('display');
    const wordsPerMinute = 200;
    const delay = (60 / wordsPerMinute) * 1000; // delay between chunks
    let isPaused = true; // Start in a paused state
    let timeoutHandle = null;
    let chunks = [];
    let currentChunkIndex = 0;

    fetch('txtfiles/7habits.txt')
    .then(response => response.text())
    .then(text => {
        processTextIntoChunks(text);
        // Check for a stored bookmark
        currentChunkIndex = localStorage.getItem('bookmark') ? parseInt(localStorage.getItem('bookmark'), 10) : 0;
        displayElement.innerText = chunks[currentChunkIndex] || "End of text."; // Display the first chunk or stored bookmark
    })
    .catch(error => {
        console.error('Error loading the text file:', error);
        displayElement.innerText = "Failed to load text.";
    });

    function processTextIntoChunks(text) {
        const words = text.split(/\s+/);
        let startIndex = 0;
        while (startIndex < words.length) {
            let chunkEndIndex = startIndex + 3; // Default next chunk end index
            for (let i = startIndex; i < startIndex + 3 && i < words.length; i++) {
                if (words[i].includes('.')) {
                    chunkEndIndex = i + 1; // Adjust chunk end index if period is found
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
            if (!isPaused) {
                timeoutHandle = setTimeout(startDisplay, delay);
            }
            localStorage.setItem('bookmark', currentChunkIndex); // Update bookmark every time a new chunk is displayed
            currentChunkIndex++;
        } else {
            displayElement.innerText = "End of text."; // End of the chunks
        }
    }

    document.body.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            event.preventDefault(); // Prevent the default action of the spacebar
            isPaused = !isPaused; // Toggle the paused state
            if (!isPaused) {
                startDisplay(); // Start displaying text if not paused
            } else if (timeoutHandle) {
                clearTimeout(timeoutHandle); // Clear the timeout if paused
                timeoutHandle = null;
            }
        } else if (event.key === 'ArrowRight') {
            if (currentChunkIndex < chunks.length) {
                displayElement.innerText = chunks[currentChunkIndex];
                localStorage.setItem('bookmark', currentChunkIndex); // Update bookmark on manual navigation
                currentChunkIndex++;
            }
        } else if (event.key === 'ArrowLeft') {
            if (currentChunkIndex > 1) { // Ensure there's a previous chunk to display
                currentChunkIndex--;
                displayElement.innerText = chunks[currentChunkIndex - 1];
                localStorage.setItem('bookmark', currentChunkIndex - 1); // Update bookmark on manual navigation
            }
        }
    });
});
