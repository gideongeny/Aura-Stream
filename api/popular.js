const { innertubeSearch } = require('./_innertube');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
  try {
    const data = await innertubeSearch('most watched videos trending 2024', req.query.continuation);
    res.status(200).json(data);
  } catch (e) {
    console.error('popular error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
