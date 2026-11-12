export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // 1. Captura todas as tags <link rel="preload"> que o Facebook usa para carregar as fotos da galeria
    const preloadLinks = doc.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('scontent') || href.includes('fbcdn.net')) && (href.includes('.jpg') || href.includes('.png') || href.includes('.webp'))) {
            mediaUrls.add(href);
        }
    });

    // 2. Captura a imagem principal do Open Graph
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
        mediaUrls.add(ogImage.content);
    }

    // 3. Varre tags <img> convencionais
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-ije-src');
        if (src && (src.includes('scontent') || src.includes('fbcdn.net')) && !src.includes('profile') && !src.includes('emoji')) {
            mediaUrls.add(src);
        }
    });

    return Array.from(mediaUrls);
}