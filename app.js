// Simple in-browser summarizer for generating a fiche de révision

const frenchStopwords = new Set([
    'alors','au','aucuns','aussi','autre','avant','avec','avoir','bon','car','ce','cela','ces','ceux','chaque','ci','comme','comment','dans','de','des','du','dedans','dehors','depuis','devrait','doit','donc','dos','début','elle','elles','en','encore','essai','est','et','eu','fait','faites','fois','font','hors','ici','il','ils','je','juste','la','le','les','leur','là','ma','maintenant','mais','mes','mine','moins','mon','mot','même','ni','nommés','notre','nous','nouveaux','par','parce','parole','pas','personnes','peut','peu','pièce','plupart','pour','pourquoi','quand','que','quel','quelle','quelles','quels','qui','sa','sans','ses','seulement','si','sien','son','sont','sous','soyez','sujet','sur','ta','tandis','tellement','tels','tes','ton','tous','tout','trop','très','tu','valeur','voie','voient','vont','votre','vous','vu','étaient','état','étions','étais','être'
]);

function splitIntoSentences(text) {
    // split on punctuation while keeping abbreviations and decimals roughly
    const sentences = text
        .replace(/\n+/g, ' ') // newlines -> spaces
        .match(/[^.!?]+[.!?]?/g) || [];
    return sentences.map(s => s.trim()).filter(Boolean);
}

function getTopSentences(text, maxSentences = 5) {
    const sentences = splitIntoSentences(text);
    const freq = {};
    const words = text.toLowerCase().replace(/[^\p{L}\s'-]+/gu, ' ').split(/\s+/).filter(Boolean);
    for (const w of words) {
        if (frenchStopwords.has(w)) continue;
        freq[w] = (freq[w] || 0) + 1;
    }
    const sentenceScores = sentences.map(s => {
        const sWords = s.toLowerCase().replace(/[^\p{L}\s'-]+/gu, ' ').split(/\s+/).filter(Boolean);
        let score = 0;
        for (const w of sWords) {
            if (frenchStopwords.has(w)) continue;
            score += (freq[w] || 0);
        }
        score = score / Math.sqrt(sWords.length || 1);
        return { sentence: s, score };
    });
    sentenceScores.sort((a,b) => b.score - a.score);
    return sentenceScores.slice(0,maxSentences).map(s => s.sentence);
}

function extractHeadings(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const headings = lines.filter(l => /^#{1,3}\s+/.test(l) || /^(Chapitre|Section|Partie)\b/i.test(l) || /^[A-Z][A-Z\s\-\d]{4,}$/.test(l));
    return headings;
}

function extractDefinitions(text) {
    const defs = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
        if (/\b(Définition|définition|On appelle|est appelé|se définit|s'appelle|signifie)\b/.test(l)) {
            defs.push(l);
        } else if (/^\w[\w\s-]{2,}(:|-)\s*[A-Z]/.test(l)) {
            // probable term: definition pattern like "Terme: ..."
            defs.push(l);
        }
    }
    return defs;
}

function extractKeyTerms(text, topN = 6) {
    const words = text.toLowerCase().replace(/[^\p{L}\s'-]+/gu, ' ').split(/\s+/).filter(Boolean);
    const freq = {};
    for (const w of words) {
        if (frenchStopwords.has(w) || w.length < 3) continue;
        freq[w] = (freq[w] || 0) + 1;
    }
    const keys = Object.keys(freq).sort((a,b) => freq[b] - freq[a]).slice(0, topN);
    return keys;
}

function formatFiche({ title, headings, keyTerms, definitions, importantPoints }) {
    const div = document.createElement('div');
    div.className = 'fiche';

    const main = document.createElement('div');
    main.className = 'main';

    const aside = document.createElement('div');
    aside.className = 'aside';

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.innerText = title || 'Fiche de révision';
    main.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<div>Source: cours</div><div>Longueur: ${document.getElementById('lengthSelect').value}</div>`;
    main.appendChild(meta);

    if (importantPoints.length) {
        const sec = document.createElement('div');
        sec.className = 'section';
        sec.innerHTML = '<h3>Résumé — Points clés</h3><ul>' + importantPoints.map(p => `<li>${p}</li>`).join('\n') + '</ul>';
        main.appendChild(sec);
    }

    if (headings.length) {
        const sec = document.createElement('div');
        sec.className = 'section';
        sec.innerHTML = '<h3>Plan (détecté)</h3>' + headings.map(h => `<p>• ${h}</p>`).join('\n');
        main.appendChild(sec);
    }

    // Aside: terms & definitions
    if (keyTerms.length) {
        const block = document.createElement('div');
        block.className = 'section';
        block.innerHTML = '<h3>Termes-clés</h3>' + keyTerms.map(t => `<span class="term-tag">${t}</span>`).join('');
        aside.appendChild(block);
    }

    if (definitions.length) {
        const defBlock = document.createElement('div');
        defBlock.className = 'section';
        defBlock.innerHTML = '<h3>Définitions</h3>' + definitions.map(d => `<p>${d}</p>`).join('\n');
        aside.appendChild(defBlock);
    }

    div.appendChild(main);
    div.appendChild(aside);
    return div;
}

function generateFicheFromText(text, lengthOption) {
    const title = (text.split('\n').find(l => l.trim().length > 0) || '').replace(/[#\r\n]+/g,'').slice(0,100);
    const headings = extractHeadings(text);
    const definitions = extractDefinitions(text);
    const keyTerms = extractKeyTerms(text, 8);
    let maxSentences = 5;
    if (lengthOption === 'short') maxSentences = 4;
    if (lengthOption === 'medium') maxSentences = 7;
    if (lengthOption === 'long') maxSentences = 12;
    const importantPoints = getTopSentences(text, maxSentences);
    return { title, headings, definitions, keyTerms, importantPoints };
}

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const printBtn = document.getElementById('printBtn');
    const fileInput = document.getElementById('fileInput');
    const controlsEl = document.querySelector('.controls');
    const out = document.getElementById('output');
    const inputText = document.getElementById('inputText');
    const lengthSelect = document.getElementById('lengthSelect');
    // example button removed from UI

    console.log('Fiche generator — DOM ready');

    if (!generateBtn) { console.error('generateBtn introuvable'); return; }

        generateBtn.addEventListener('click', () => {
            try {
                const text = inputText.value;
                if (!text || !text.trim()) { alert("Colle d'abord ton cours !"); return; }
                const lengthOption = lengthSelect.value;
                // show loading spinner
                out.classList.add('loading');
                out.innerText = '';
                generateBtn.disabled = true;
                if (copyBtn) { copyBtn.disabled = true; copyBtn.setAttribute('aria-disabled','true'); }
                if (printBtn) { printBtn.disabled = true; printBtn.setAttribute('aria-disabled','true'); }
                console.log('Bouton Générer cliqué');

                setTimeout(() => {
                    try {
                        const fiche = generateFicheFromText(text, lengthOption);
                        const formatted = formatFiche(fiche);
                        out.innerHTML = '';
                        out.appendChild(formatted);
                        // reveal animation
                        const f = out.querySelector('.fiche');
                        if (f) requestAnimationFrame(() => f.classList.add('visible'));
                        // enable actions
                        if (copyBtn) { copyBtn.disabled = false; copyBtn.removeAttribute('aria-disabled'); }
                        if (printBtn) { printBtn.disabled = false; printBtn.removeAttribute('aria-disabled'); }
                        // on small screens, bring the fiche into view
                        try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){}
                    } catch (e) {
                        console.error('Erreur génération:', e);
                        alert("Une erreur s\u0027est produite lors de la génération. Ouvre la console pour plus d\u0027infos.");
                    } finally {
                        generateBtn.disabled = false;
                        out.classList.remove('loading');
                    }
                }, 150);
            } catch (err) {
                console.error('Erreur handler generateBtn:', err);
                alert("Erreur inattendue — ouvre la console du navigateur pour plus d\u0027infos.");
            }
        });
    // File input handler: accept .txt and .pdf
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    out.innerText = '⏳ Extraction du texte depuis le PDF (patienter)...';
                    const pdfText = await extractTextFromPDF(file);
                    inputText.value = pdfText;
                    out.innerText = '';
                } else if (file.name.toLowerCase().endsWith('.txt')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { inputText.value = ev.target.result; };
                    reader.readAsText(file, 'utf-8');
                } else {
                    alert("Format de fichier non supporté. Utilise .txt ou .pdf.");
                }
            } catch (err) {
                console.error('Erreur lecture fichier:', err);
                alert("Impossible de lire le fichier. Ouvre la console pour plus d'info.");
            }
        });
    }

    // Drag & drop: allow dropping files on the controls area
    if (controlsEl) {
        controlsEl.addEventListener('dragover', (e) => { e.preventDefault(); controlsEl.classList.add('dragover'); });
        controlsEl.addEventListener('dragleave', (e) => { controlsEl.classList.remove('dragover'); });
        controlsEl.addEventListener('drop', async (e) => {
            e.preventDefault(); controlsEl.classList.remove('dragover');
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file && fileInput) {
                fileInput.files = e.dataTransfer.files;
                const ev = new Event('change');
                fileInput.dispatchEvent(ev);
            }
        });
    }

// Copy to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                if (!out.innerText.trim()) { alert("Rien à copier — génère d'abord une fiche."); return; }
                await navigator.clipboard.writeText(out.innerText);
                alert("Fiche copiée dans le presse-papiers.");
            } catch (e) {
                console.error('Erreur copie:', e);
                alert("Impossible de copier. Ouvre la console pour plus d\u0027infos.");
            }
        });
    }

    // Example button removed; if in the future we add test content injection, it will be wired here.

    // Print/Download
    if (printBtn) printBtn.addEventListener('click', () => { window.print(); });
});

// Extract text from a PDF using pdfjs (client-side)
async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(' ') + '\n\n';
        }
        return fullText;
    } catch (err) {
        console.error('Erreur extraction PDF:', err);
        throw err;
    }
}

// Paste sample: add a small helper to fill example content if nothing
document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('inputText');
    if (inputEl && !inputEl.value.trim()) {
        inputEl.placeholder = 'Colle ton cours ici (ou dépose un fichier .txt). Exemple :\n\nCHAPITRE 1\nDéfinition: La photosynthèse est le processus ...';
    }
});

