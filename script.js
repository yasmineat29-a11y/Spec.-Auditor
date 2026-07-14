// 1. Import PDF.js
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// 2. State variables
let pdfText = "";
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF file selection and extraction
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File detected:", file.name);
    const reader = new FileReader();
    
    reader.onload = async function() {
        console.log("Processing PDF...");
        try {
            const typedarray = new Uint8Array(this.result);
            
            // FIX IS HERE: Wrapped typedarray in { data: ... }
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise; 
            
            const page = await pdf.getPage(1);
            // Replace your extraction logic with this:
const content = await page.getTextContent();

// Sort by vertical position (y) first, then horizontal (x)
const sortedItems = content.items.sort((a, b) => {
    // If y-positions are close (same line), sort by x (left to right)
    if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
        return a.transform[4] - b.transform[4];
    }
    // Otherwise, sort by y (top to bottom)
    return b.transform[5] - a.transform[5];
});

            console.log("Text successfully extracted:", pdfText.substring(0, 50) + "...");
            alert("File processed! Touch the notebook to write.");
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("Error: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// 4. Animation function
function startWriting() {
    if (!pdfText) {
        alert("Please upload a PDF file first!");
        return;
    }
    
    output.innerHTML = ""; // Clear existing text
    
    let i = 0;
    function type() {
        if (i < pdfText.length) {
            output.innerHTML += pdfText.charAt(i);
            i++;
            setTimeout(type, 30); 
        }
    }
    type();
}

// 5. Trigger on touch (mobile) or click (desktop)
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    startWriting();
}, { passive: false });

notebook.addEventListener('click', startWriting);
