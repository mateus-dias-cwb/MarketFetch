export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // O Facebook Marketplace costuma armazenar imagens em tags <img> com alta resolução ou em meta tags og:image
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const src = img.src || img.getAttribute('data-src');
        // Filtramos imagens que pareçam ser do catálogo do produto (evita avatares de perfil e ícones)
        if (src && (src.includes('scontent') || src.includes('fbcdn.net')) && !src.includes('profile')) {
            mediaUrls.add(src);
        }
    });

    // Buscamos também nas meta tags Open Graph (capa principal do anúncio)
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
        mediaUrls.add(ogImage.content);
    }

    return Array.from(mediaUrls);
}