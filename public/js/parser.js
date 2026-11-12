export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    console.log("[Parser] Iniciando varredura profunda de URLs no HTML...");

    // 1. Regex global para capturar qualquer URL de imagem do CDN do Facebook no texto cru do HTML/scripts
    // O Facebook costuma escapar barras em JSON como \u002F ou usar barras normais /
    const rawMatches = htmlString.match(/https?:\/\/[^"'\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s<>]*?)?/gi);
    
    if (rawMatches) {
        rawMatches.forEach(rawUrl => {
            // Limpa caracteres de escape comuns do JSON (\u002F -> / e barras invertidas)
            const cleanUrl = rawUrl.replace(/\\u002F/g, '/').replace(/\\/g, '');
            
            if (
                (cleanUrl.includes('scontent') || cleanUrl.includes('fbcdn.net')) &&
                !cleanUrl.includes('profile') &&
                !cleanUrl.includes('emoji') &&
                !cleanUrl.toLowerCase().includes('.css') &&
                !cleanUrl.toLowerCase().includes('.js') &&
                !cleanUrl.toLowerCase().includes('.woff')
            ) {
                mediaUrls.add(cleanUrl);
            }
        });
    }

    // 2. Garante captação da Open Graph principal caso venha isolada
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
        mediaUrls.add(ogImage.content);
    }

    console.log(`[Parser] Total de mídias únicas extraídas: ${mediaUrls.size}`);
    return Array.from(mediaUrls);
}