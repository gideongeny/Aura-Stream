export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path = 'popular', query = '' } = req.query;
  const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.jing.rocks',
    'https://invidious.nerdvpn.de',
    'https://yt.artemislena.eu'
  ];

  let url = '';
  if (path === 'popular') {
    url = '/api/v1/popular';
  } else if (path === 'search') {
    url = `/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
  } else {
    return res.status(400).json({ error: 'Invalid path' });
  }

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(`${instance}${url}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (e) {
      console.log(`Failed to fetch from ${instance}`);
      continue;
    }
  }

  return res.status(500).json({ error: 'All instances failed' });
}
