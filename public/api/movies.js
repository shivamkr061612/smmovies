export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const baseUrl = 'https://smmmovies.online';
  const { action = 'home', page = '1', q = '', url = '' } = req.query;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
  };

  try {
    // 1. SIRF "WATCH ONLINE" LINK EXTRACTOR
    if (action === 'watch') {
      if (!url) {
        return res.status(400).json({ status: false, message: 'Post URL required' });
      }

      const response = await fetch(url, { headers });
      const html = await response.text();

      // WATCH ONLINE button ka link dhundhein
      const watchMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?WATCH\s*(?:ONLINE|NOW)[\s\S]*?<\/a>/i);
      const watchPageUrl = watchMatch ? watchMatch[1] : '';

      let streamUrl = '';
      const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (iframeMatch && !iframeMatch[1].includes('ads')) {
        streamUrl = iframeMatch[1];
      }

      // Agar WATCH ONLINE second page par le jata hai toh wahan se embed iframe nikalein
      if (!streamUrl && watchPageUrl) {
        const playerRes = await fetch(watchPageUrl, { headers });
        const playerHtml = await playerRes.text();
        const playerIframe = playerHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (playerIframe) {
          streamUrl = playerIframe[1];
        } else {
          const videoMatch = playerHtml.match(/<(?:video|source)[^>]+src=["']([^"']+)["']/i);
          if (videoMatch) streamUrl = videoMatch[1];
        }
      }

      return res.status(200).json({
        status: Boolean(streamUrl || watchPageUrl),
        stream_url: streamUrl || watchPageUrl,
        watch_page: watchPageUrl
      });
    }

    // 2. HOME / LATEST MOVIES & SEARCH
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    let targetUrl = pageNum > 1 ? `${baseUrl}/page/${pageNum}/` : baseUrl;

    if (action === 'search' && q.trim()) {
      const query = encodeURIComponent(q.trim());
      targetUrl = pageNum > 1 ? `${baseUrl}/page/${pageNum}/?s=${query}` : `${baseUrl}/?s=${query}`;
    }

    const response = await fetch(targetUrl, { headers });
    const html = await response.text();

    const movies = [];
    const articleRegex = /<article[\s\S]*?<\/article>/gi;
    const articles = html.match(articleRegex) || [];

    for (const article of articles) {
      const linkMatch = article.match(/<h[23][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      const imgMatch = article.match(/<img[^>]+(?:data-lazy-src|data-src|src)=["']([^"']+)["']/i);

      if (linkMatch) {
        movies.push({
          title: linkMatch[2].replace(/<[^>]+>/g, '').trim(),
          poster: imgMatch ? imgMatch[1] : '',
          post_url: linkMatch[1]
        });
      }
    }

    return res.status(200).json({
      status: true,
      page: pageNum,
      count: movies.length,
      movies
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
}
