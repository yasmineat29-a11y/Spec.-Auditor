// 1. Import PDF.js
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// 2. State variables
let pdfText = "";
let isWriting = false; 
let currentIndex = 0; 
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF file selection
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
                fullText += sortedItems.map(item => item.str).join(" ") + " ";
            }
            
            pdfText = fullText;
            currentIndex = 0; 
            output.innerHTML = "";
            alert("File processed! Touch the notebook to start, pause, or resume.");
        } catch (error) {
            alert("Error processing PDF: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// ... keep your existing imports and PDF processing ...

// 4. Improved Animation & Navigation
let animationTimeout = null;

function type() {
    if (currentIndex < pdfText.length && isWriting) {
        // Use textContent instead of innerHTML to prevent layout shifts/spacing issues
        output.textContent = pdfText.substring(0, currentIndex + 1);
        currentIndex++;
        
        // Auto-scroll logic: only scroll if the user isn't actively reading higher up
        if (notebook.scrollHeight - notebook.scrollTop < notebook.clientHeight + 100) {
            notebook.scrollTop = notebook.scrollHeight;
        }
        
        animationTimeout = setTimeout(type, 30); 
    } else {
        isWriting = false;
    }
}

function startWriting() {
    if (!pdfText) return;
    
    if (isWriting) {
        isWriting = false;
        clearTimeout(animationTimeout); // Stop the loop
    } else {
        isWriting = true;
        type();
    }
}

// 5. Add a Scroll Listener to allow manual navigation
notebook.addEventListener('scroll', () => {
    // Optional: Calculate current index based on scroll position 
    // to allow user to "jump" and resume from there
    const percentage = notebook.scrollTop / (notebook.scrollHeight - notebook.clientHeight);
    if (!isNaN(percentage)) {
        currentIndex = Math.floor(percentage * pdfText.length);
    }
});


// 6. Trigger events
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    startWriting();
}, { passive: false });

notebook.addEventListener('click', startWriting);
