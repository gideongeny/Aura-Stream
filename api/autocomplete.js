export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  
  const query = req.query.q || '';
  if (!query) return res.status(200).json([]);
  
  try {
    const response = await fetch(`http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    const data = await response.json();
    // YouTube suggest API with client=firefox returns [query, [suggestions...]]
    const suggestions = data[1] || [];
    res.status(200).json(suggestions);
  } catch (e) {
    console.error('autocomplete error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
