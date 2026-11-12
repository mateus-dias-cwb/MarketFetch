import { parseMarketplaceHtml } from './parser.js';

const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const statusBox = document.getElementById('statusBox');
const resultsSection = document.getElementById('resultsSection');
const mediaGrid = document.getElementById('mediaGrid');
const mediaCount = document.getElementById('mediaCount');

function showStatus(message, type = 'info') {
    statusBox.textContent = message;
    statusBox.className = `text-xs px-3 py-2 rounded-lg border block ${
        type === 'error' 
            ? 'bg-red-950/50 border-red-800 text-red-300' 
            : type === 'success'
            ? 'bg-green-950/50 border-green-800 text-green-300'
            : 'bg-slate-950 border-slate-800 text-slate-300'
    }`;
}

fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();

    if (!url) {
        showStatus('Por favor, insira uma URL válida do Facebook Marketplace.', 'error');
        return;
    }

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Extraindo...';
    showStatus('Buscando dados via proxy da borda...', 'info');
    resultsSection.classList.add('hidden');
    mediaGrid.innerHTML = '';

    try {
        // Chamada direta para a rota de proxy do nosso próprio domínio na Cloudflare
        const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            throw new Error(`Falha na requisição (Status: ${response.status})`);
        }

        const html = await response.text();
        const extractedImages = parseMarketplaceHtml(html);

        if (extractedImages.length === 0) {
            showStatus('Nenhuma imagem encontrada. Verifique se o link é público e correto.', 'error');
            return;
        }

        // Renderiza as imagens encontradas na grid
        mediaCount.textContent = extractedImages.length;
        extractedImages.forEach((imgUrl, index) => {
            const card = document.createElement('div');
            card.className = 'bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col group';
            card.innerHTML = `
                <div class="aspect-square bg-slate-950 overflow-hidden relative">
                    <img src="${imgUrl}" alt="Mídia ${index + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-3 flex items-center justify-between bg-slate-900/90">
                    <span class="text-xs text-slate-400 font-mono">Item #${index + 1}</span>
                    <a href="${imgUrl}" target="_blank" rel="noopener noreferrer" 
                        class="text-xs bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                        Abrir original
                    </a>
                </div>
            `;
            mediaGrid.appendChild(card);
        });

        resultsSection.classList.remove('hidden');
        showStatus(`Extração concluída com sucesso! ${extractedImages.length} mídias localizadas.`, 'success');

    } catch (err) {
        showStatus(`Erro ao processar: ${err.message}`, 'error');
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Extrair Mídia';
    }
});