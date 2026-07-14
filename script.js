import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

let pdfText = "";
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF upload
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
            // Sort by vertical position
            const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
            fullText += sortedItems.map(item => item.str).join("") + "\n";
        }
        pdfText = fullText;
        output.textContent = "";
        alert("PDF Processed!");
    };
    reader.readAsArrayBuffer(file);
});

// 4. Scrape logic
let isScraping = false;

notebook.addEventListener('touchstart', (e) => {
    // Only scrape if exactly 1 finger
    if (e.touches.length === 1) {
        isScraping = true;
    } else {
        isScraping = false;
    }
}, { passive: false });

notebook.addEventListener('touchmove', (e) => {
    if (isScraping && e.touches.length === 1) {
        e.preventDefault(); // Stop scrolling ONLY for one finger
        
        const rect = notebook.getBoundingClientRect();
        const relativeY = e.touches[0].clientY - rect.top + notebook.scrollTop;
        const progress = Math.min(Math.max(relativeY / notebook.scrollHeight, 0), 1);
        
        const index = Math.floor(progress * pdfText.length);
        output.textContent = pdfText.substring(0, index);
    } 
    // If e.touches.length > 1, we do NOTHING, letting browser handle scroll
}, { passive: false });
