export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // 1. Captura a imagem principal do Open Graph
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
        mediaUrls.add(ogImage.content);
    }

    // 2. Varre todas as tags <img> buscando referências do CDN do Facebook
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-ije-src');
        if (src && (src.includes('scontent') || src.includes('fbcdn.net')) && !src.includes('profile') && !src.includes('emoji')) {
            mediaUrls.add(src);
        }
    });

    // 3. Varre blocos de script (o Facebook armazena o array de fotos do carrossel em JSON dentro de tags script)
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => {
        const content = script.textContent || '';
        // Regex para capturar URLs de imagens do facebook contidas nos dados de script
        const matches = content.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
        if (matches) {
            matches.forEach(url => {
                // Decodifica barras escapadas no JSON (\u002F -> /)
                const cleanUrl = url.replace(/\\u002F/g, '/');
                if ((cleanUrl.includes('scontent') || cleanUrl.includes('fbcdn.net')) && !cleanUrl.includes('profile')) {
                    mediaUrls.add(cleanUrl);
                }
            });
        }
    });

    return Array.from(mediaUrls);
}