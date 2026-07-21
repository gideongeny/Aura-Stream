export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar?: string;
  views: string;
  timestamp: string;
  lengthSeconds: number;
}

export interface PaginatedResponse {
  videos: Video[];
  continuation: string | null;
}

const API_BASE = import.meta.env.PROD 
  ? 'https://aura-stream-six.vercel.app/api'
  : 'http://localhost:5000/api';

const mapVideo = (v: any): Video => ({
  id: v.videoId,
  title: v.title,
  thumbnail: v.thumbnail,
  channel: v.author,
  channelAvatar: v.channelThumbnail,
  views: v.viewCount,
  timestamp: v.publishedText,
  lengthSeconds: v.lengthSeconds || 0
});

export const fetchTrending = async (continuation?: string): Promise<PaginatedResponse> => {
  const url = continuation ? `${API_BASE}/popular?continuation=${encodeURIComponent(continuation)}` : `${API_BASE}/popular`;
  const res = await fetch(url);
  const data = await res.json();
  if (Array.isArray(data)) return { videos: data.map(mapVideo), continuation: null };
  return { videos: (data.videos || []).map(mapVideo), continuation: data.continuation };
};

export const fetchCategory = async (category: string, continuation?: string): Promise<PaginatedResponse> => {
  const url = continuation ? `${API_BASE}/category?name=${category}&continuation=${encodeURIComponent(continuation)}` : `${API_BASE}/category?name=${category}`;
  const res = await fetch(url);
  const data = await res.json();
  if (Array.isArray(data)) return { videos: data.map(mapVideo), continuation: null };
  return { videos: (data.videos || []).map(mapVideo), continuation: data.continuation };
};

export const fetchSearch = async (query: string, continuation?: string): Promise<PaginatedResponse> => {
  if (!query && !continuation) return { videos: [], continuation: null };
  const url = continuation ? `${API_BASE}/search?q=${encodeURIComponent(query)}&continuation=${encodeURIComponent(continuation)}` : `${API_BASE}/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (Array.isArray(data)) return { videos: data.map(mapVideo), continuation: null };
  return { videos: (data.videos || []).map(mapVideo), continuation: data.continuation };
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch (e) {
    console.error('autocomplete:', e);
    return [];
  }
};
