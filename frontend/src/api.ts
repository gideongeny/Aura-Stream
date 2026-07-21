export type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  thumbnail: string;
  lengthSeconds: number;
};

const mapVideo = (v: any): Video => ({
  id: v.videoId,
  title: v.title || 'Unknown Title',
  channel: v.author || 'Unknown Channel',
  views: String(v.viewCount || ''),
  timestamp: v.publishedText || '',
  thumbnail: v.thumbnail ||
    v.videoThumbnails?.[0]?.url ||
    `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
  lengthSeconds: v.lengthSeconds || 0,
});

export const fetchTrending = async (): Promise<Video[]> => {
  try {
    const res = await fetch('/api/popular');
    if (!res.ok) throw new Error('Failed to fetch trending');
    const data = await res.json();
    return Array.isArray(data) ? data.filter(v => v.videoId).map(mapVideo) : [];
  } catch (error) {
    console.error('fetchTrending:', error);
    return [];
  }
};

export const fetchCategory = async (category: string): Promise<Video[]> => {
  try {
    const res = await fetch(`/api/category?name=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch category');
    const data = await res.json();
    return Array.isArray(data) ? data.filter(v => v.videoId).map(mapVideo) : [];
  } catch (error) {
    console.error('fetchCategory:', error);
    return [];
  }
};

export const fetchSearch = async (query: string): Promise<Video[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    const data = await res.json();
    return Array.isArray(data) ? data.filter(v => v.videoId).map(mapVideo) : [];
  } catch (error) {
    console.error('fetchSearch:', error);
    return [];
  }
};
