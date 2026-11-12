export function parseMarketplaceHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mediaUrls = new Set();

    // Regex global para capturar URLs de imagens do CDN do Facebook
    const rawMatches = htmlString.match(/https?:\/\/[^"'\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s<>]*?)?/gi);
    
    if (rawMatches) {
        rawMatches.forEach(rawUrl => {
            const cleanUrl = rawUrl.replace(/\\u002F/g, '/').replace(/\\/g, '');
            
            const lower = cleanUrl.toLowerCase();
            const isValidImage = 
                (lower.includes('scontent') || lower.includes('fbcdn.net')) &&
                !lower.includes('profile') &&
                !lower.includes('emoji') &&
                !lower.includes('logo') &&
                !lower.includes('static') &&
                !lower.includes('rsrc.php') &&
                !lower.includes('.css') &&
                !lower.includes('.js') &&
                !lower.includes('.ico');

            if (isValidImage) {
                mediaUrls.add(cleanUrl);
            }
        });
    }

    return Array.from(mediaUrls);
}