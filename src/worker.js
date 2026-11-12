export default {
  async fetch(request, env, ctx) {
    const requestUrl = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Rota do Proxy tratada por substring para evitar qualquer erro de parse de parâmetros
    if (requestUrl.pathname === "/proxy") {
      const fullUrl = request.url;
      const queryIndex = fullUrl.indexOf("?url=");
      
      if (queryIndex === -1) {
        return new Response(JSON.stringify({ error: "Parâmetro ?url= ausente" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const targetUrl = decodeURIComponent(fullUrl.substring(queryIndex + 5));

      try {
        const response = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          redirect: "follow",
        });

        const body = await response.text();

        return new Response(body, {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": response.headers.get("Content-Type") || "text/html; charset=utf-8",
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Serve os arquivos estáticos
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};