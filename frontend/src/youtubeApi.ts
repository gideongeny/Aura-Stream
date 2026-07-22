import type { Video } from './api';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const fetchGoogleProfile = async (accessToken: string) => {
  const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export const fetchYouTubeSubscriptions = async (accessToken: string) => {
  let subscriptions: { name: string, avatar: string, channelId: string }[] = [];
  let nextPageToken = '';
  
  for (let i = 0; i < 2; i++) {
    const url = `${YOUTUBE_API_BASE}/subscriptions?part=snippet&mine=true&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) break;
    const data = await res.json();
    
    const pageSubs = data.items.map((item: any) => ({
      name: item.snippet.title,
      avatar: item.snippet.thumbnails?.default?.url || '',
      channelId: item.snippet.resourceId.channelId,
    }));
    subscriptions = [...subscriptions, ...pageSubs];
    
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }
  
  return subscriptions;
};

export const fetchLikedVideos = async (accessToken: string): Promise<Video[]> => {
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&myRating=like&maxResults=50`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  
  const data = await res.json();
  return data.items.map((item: any) => ({
    id: item.id,
    videoId: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    views: parseInt(item.statistics?.viewCount || '0').toLocaleString(),
    timestamp: new Date(item.snippet.publishedAt).toLocaleDateString(),
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
    lengthSeconds: parseISO8601Duration(item.contentDetails?.duration),
    channelAvatar: '' 
  }));
};

function parseISO8601Duration(duration: string) {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  return hours * 3600 + minutes * 60 + seconds;
}
