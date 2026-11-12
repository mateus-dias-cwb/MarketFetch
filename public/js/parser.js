export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // Log para inspecionar o HTML bruto se necessário
    console.log("[Parser] HTML inspecionado. Tamanho total:", htmlString.length);

    // 1. Varre tags <link rel="preload"> focando nas imagens do visualizador do Marketplace
    doc.querySelectorAll('link[rel="preload"]').forEach(link => {
        const href = link.getAttribute('href');
        const preloader = link.getAttribute('data-preloader') || '';
        
        if (href && (preloader.includes('Marketplace') || href.includes('t39.30808') || href.includes('scontent'))) {
            if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(href) || href.includes('stp=')) {
                mediaUrls.add(href);
            }
        }
    });

    // 2. Captura a imagem principal do Open Graph
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
        mediaUrls.add(ogImage.content);
    }

    // 3. Filtro rigoroso: remove qualquer URL que seja .css, .js ou fonte
    return Array.from(mediaUrls).filter(url => {
        const lower = url.toLowerCase();
        return !lower.includes('.css') && !lower.includes('.js') && !lower.includes('.woff') && !lower.includes('emoji');
    });
}