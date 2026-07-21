const { innertubeSearch } = require('./_innertube');

const CATEGORY_QUERIES = {
  trending:  'most watched videos 2024',
  music:     'top music hits 2024',
  gaming:    'best gaming videos 2024',
  news:      'latest world news today 2024',
  sports:    'best sports highlights 2024',
  film:      'best movies trailers 2024',
  tech:      'top technology videos 2024',
  fashion:   'style and fashion 2024',
  comedy:    'best comedy videos 2024',
  education: 'educational videos learn something 2024',
  travel:    'best travel destinations 2024',
  food:      'best food and cooking 2024',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
  
  const name = (req.query.name || 'trending').toLowerCase();
  const query = CATEGORY_QUERIES[name] || CATEGORY_QUERIES.trending;
  
  try {
    const videos = await innertubeSearch(query);
    res.status(200).json(videos);
  } catch (e) {
    console.error('category error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
