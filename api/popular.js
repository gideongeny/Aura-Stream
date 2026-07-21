const { innertubeSearch } = require('./_innertube');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
  try {
    const videos = await innertubeSearch('most watched videos trending 2024');
    res.status(200).json(videos);
  } catch (e) {
    console.error('popular error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
