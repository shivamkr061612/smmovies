export async function onRequest(context) {
  const { request } = context;
  const reqUrl = new URL(request.url);
  const baseUrl = 'https://smmmovies.online';
  const action = reqUrl.searchParams.get('action') || 'home';
  const q = (reqUrl.searchParams.get('q') || '').toLowerCase().trim();
  const url = reqUrl.searchParams.get('url') || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json; charset=utf-8'
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Referer': baseUrl
  };

  try {
    // 1. SIRF "WATCH ONLINE" STREAM LINK NIKALNE KE LIYE
    if (action === 'watch') {
      if (!url) {
        return new Response(JSON.stringify({ status: false, message: 'Movie URL required' }), { status: 400, headers: corsHeaders });
      }

      const res = await fetch(url, { headers });
      const html = await res.text();

      const embedMatch = html.match(/https?:\/\/[^\s"'<>]+?(?:embed|player|vid|stream|\.m3u8|\.mp4)[^\s"'<>]*/i);
      const watchBtnMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?WATCH\s*(?:ONLINE|NOW)[\s\S]*?<\/a>/i);
      const watchUrl = watchBtnMatch ? watchBtnMatch[1] : '';

      let finalStream = embedMatch ? embedMatch[0] : watchUrl;

      if (watchUrl && !embedMatch) {
        const playerRes = await fetch(watchUrl, { headers });
        const playerHtml = await playerRes.text();
        const iframeMatch = playerHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch) finalStream = iframeMatch[1];
      }

      return new Response(JSON.stringify({
        status: Boolean(finalStream),
        stream_url: finalStream,
        watch_page: watchUrl
      }), { headers: corsHeaders });
    }

    // 2. HOME / SEARCH (sitemap.xml se movies list)
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`, { headers });
    const sitemapXml = await sitemapRes.text();

    const locMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/gi)];
    let movies = locMatches
      .map(m => m[1].trim())
      .filter(link => link !== baseUrl && link !== `${baseUrl}/` && !link.includes('/category/'))
      .map(link => {
        const slug = link.replace(baseUrl, '').replace(/^\/|\/$/g, '');
        const title = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return {
          title,
          post_url: link
        };
      });

    if (action === 'search' && q) {
      movies = movies.filter(m => m.title.toLowerCase().includes(q));
    }

    return new Response(JSON.stringify({
      status: true,
      count: movies.length,
      movies: movies.slice(0, 50)
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ status: false, message: err.message }), { status: 500, headers: corsHeaders });
  }
}
