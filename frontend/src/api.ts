const INVIDIOUS_INSTANCE = 'https://vid.puffyan.us';

export type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  thumbnail: string;
  lengthSeconds: number;
};

// Helper to format views
const formatViews = (views: number) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views.toString();
};

// Map Invidious response to our Video format
const mapVideo = (v: any): Video => ({
  id: v.videoId,
  title: v.title,
  channel: v.author,
  views: formatViews(v.viewCount || 0),
  timestamp: v.publishedText || 'Unknown',
  thumbnail: v.videoThumbnails?.find((t: any) => t.quality === 'high')?.url || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
  lengthSeconds: v.lengthSeconds || 0,
});

export const fetchTrending = async (): Promise<Video[]> => {
  try {
    const res = await fetch(`${INVIDIOUS_INSTANCE}/api/v1/popular`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    const data = await res.json();
    return data.map(mapVideo);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchSearch = async (query: string): Promise<Video[]> => {
  try {
    const res = await fetch(`${INVIDIOUS_INSTANCE}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
    if (!res.ok) throw new Error('Failed to search');
    const data = await res.json();
    return data.map(mapVideo);
  } catch (error) {
    console.error(error);
    return [];
  }
};
