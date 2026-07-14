import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

let pdfText = "";
let startX, startY;
let mode = null; 
let baseIndex = 0; // The index where we started the swipe
let currentIndex = 0;

const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 1. Process PDF (Same as before)
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
            fullText += sortedItems.map(item => item.str).join("") + "\n";
        }
        pdfText = fullText;
        currentIndex = 0;
        output.textContent = "";
        alert("PDF Ready! Swipe right to reveal, drag up/down to navigate.");
    };
    reader.readAsArrayBuffer(file);
});

// 2. Gesture Detection
notebook.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    mode = null; 
    baseIndex = currentIndex; // Lock in the starting index
}, { passive: false });

notebook.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;

    // Determine mode
    if (!mode) {
        if (Math.abs(dx) > Math.abs(dy) + 10) { // Added threshold to avoid accidental triggers
            mode = 'reveal';
        } else if (Math.abs(dy) > 10) {
            mode = 'navigate';
        }
    }

    if (mode === 'reveal') {
        e.preventDefault();
        
        // SENSITIVITY: 10 pixels moved = 1 character revealed
        // Increase '10' to make it slower, decrease to make it faster
        const revealSpeed = 10; 
        const deltaIndex = Math.floor(dx / revealSpeed);
        
        currentIndex = Math.max(0, Math.min(baseIndex + deltaIndex, pdfText.length));
        output.textContent = pdfText.substring(0, currentIndex);
    }
}, { passive: false });

notebook.addEventListener('touchend', () => {
    mode = null;
});
