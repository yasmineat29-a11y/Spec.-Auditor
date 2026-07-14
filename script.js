import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

let pdfText = "";
let startX, startY;
let mode = null; // null, 'reveal', or 'navigate'

const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 1. Process PDF
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
        output.textContent = "";
        alert("PDF Ready!");
    };
    reader.readAsArrayBuffer(file);
});

// 2. Gesture Detection
notebook.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    mode = null; 
}, { passive: false });

notebook.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;

    // Determine mode based on first movement
    if (!mode) {
        if (Math.abs(dx) > Math.abs(dy)) {
            mode = 'reveal'; // Horizontal movement
        } else {
            mode = 'navigate'; // Vertical movement
        }
    }

    if (mode === 'reveal') {
        e.preventDefault();
        // Reveal text based on how far right you've swiped
        const progress = Math.min(Math.max(dx / notebook.clientWidth, 0), 1);
        const index = Math.floor(progress * pdfText.length);
        output.textContent = pdfText.substring(0, index);
    }
    // If mode === 'navigate', we do nothing, letting default scroll happen
}, { passive: false });

notebook.addEventListener('touchend', () => {
    mode = null; // Reset when finger is removed
});
