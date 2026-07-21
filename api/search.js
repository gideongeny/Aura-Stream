const { innertubeSearch } = require('./_innertube');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  
  const query = req.query.q || '';
  if (!query) return res.status(200).json([]);
  
  try {
    const videos = await innertubeSearch(query);
    res.status(200).json(videos);
  } catch (e) {
    console.error('search error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
