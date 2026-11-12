export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // 1. Varre todas as tags <link> (preload, image_src, etc.)
    doc.querySelectorAll('link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('scontent') || href.includes('fbcdn.net')) && !href.includes('profile')) {
            mediaUrls.add(href);
        }
    });

    // 2. Varre todas as meta tags (og:image e afins)
    doc.querySelectorAll('meta').forEach(meta => {
        const content = meta.getAttribute('content');
        if (content && (content.includes('scontent') || content.includes('fbcdn.net')) && !content.includes('profile')) {
            mediaUrls.add(content);
        }
    });

    // 3. Varre todas as tags <img> e seus atributos customizados
    doc.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-ije-src') || img.getAttribute('srcset');
        if (src) {
            // Se for srcset, pega todas as URLs separadas por vírgula
            const urls = src.split(',');
            urls.forEach(u => {
                const cleanUrl = u.trim().split(' ')[0];
                if (cleanUrl.includes('scontent') || cleanUrl.includes('fbcdn.net')) {
                    mediaUrls.add(cleanUrl);
                }
            });
        }
    });

    return Array.from(mediaUrls);
}