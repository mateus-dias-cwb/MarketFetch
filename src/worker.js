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

    if (requestUrl.pathname === "/proxy") {
      const fullUrl = request.url;
      console.log("[Worker] Requisição de proxy recebida para URL bruta:", fullUrl);

      const queryIndex = fullUrl.indexOf("?url=");
      
      if (queryIndex === -1) {
        console.error("[Worker Error] Parâmetro ?url= não encontrado na query string.");
        return new Response(JSON.stringify({ error: "Parâmetro ?url= ausente na requisição" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const targetUrl = decodeURIComponent(fullUrl.substring(queryIndex + 5));
      console.log("[Worker] Alvo decodificado com sucesso:", targetUrl);

      try {
        const response = await fetch(targetUrl.replace('www.facebook.com', 'm.facebook.com'), {
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
          },
          redirect: "follow",
        });

        console.log(`[Worker] Resposta do alvo recebida. Status: ${response.status}`);
        const body = await response.text();

        return new Response(body, {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": response.headers.get("Content-Type") || "text/html; charset=utf-8",
          },
        });
      } catch (err) {
        console.error("[Worker Catch Error]:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};