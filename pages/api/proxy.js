export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, User-Agent, Referer');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  try {
    // Decode the URL in case it was encoded
    const targetUrl = decodeURIComponent(url);
    
    // Validate that it's a reasonable URL
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }

    // Prepare headers for the request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // Forward Range header if present (for video seeking)
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    // Add referer if it's a vidsrc URL to appear more legitimate
    if (targetUrl.includes('vidsrc') || targetUrl.includes('autoembed')) {
      headers.Referer = 'https://vidsrc.xyz/';
    }

    console.log(`[PROXY] Fetching: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`[PROXY] Error: ${response.status} ${response.statusText}`);
      res.status(response.status).json({ 
        error: `Upstream server error: ${response.status} ${response.statusText}` 
      });
      return;
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Forward important headers
    res.setHeader('Content-Type', contentType);
    
    if (response.headers.get('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length'));
    }
    
    if (response.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', response.headers.get('accept-ranges'));
    }
    
    if (response.headers.get('content-range')) {
      res.setHeader('Content-Range', response.headers.get('content-range'));
    }

    // Set appropriate status code (important for range requests)
    res.status(response.status);

    // Stream the response
    const body = response.body;
    if (body) {
      const reader = body.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
    }
    
    res.end();

  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request',
      details: error.message 
    });
  }
}
