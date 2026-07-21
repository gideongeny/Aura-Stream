import { createClient } from 'redis';

const mockFeed = {
  videos: [
    {
      id: "dQw4w9WgXcQ",
      title: "Never Gonna Give You Up",
      channel: "Rick Astley",
      views: "1.4B",
      timestamp: "14 years ago",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    },
    {
      id: "jNQXAC9IVRw",
      title: "Me at the zoo",
      channel: "jawed",
      views: "270M",
      timestamp: "18 years ago",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg"
    }
  ],
  images: [
    {
      id: "img1",
      title: "Breathtaking Mountain View",
      author: "NatureLover",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      likes: "12K"
    },
    {
      id: "img2",
      title: "Cyberpunk Cityscape",
      author: "NeonDreams",
      url: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&w=800&q=80",
      likes: "8.5K"
    }
  ]
};

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Graceful Redis Connection for Vercel
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    // If no Redis URL is provided (e.g., initial deployment), fallback gracefully
    console.log("No REDIS_URL found. Serving direct data.");
    return res.status(200).json(mockFeed);
  }

  try {
    const redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    const cachedFeed = await redisClient.get('home_feed');
    
    if (cachedFeed) {
      console.log('Serving from Redis Cache');
      await redisClient.disconnect();
      return res.status(200).json(JSON.parse(cachedFeed));
    }

    console.log('Serving from Database & Caching');
    await redisClient.setEx('home_feed', 60, JSON.stringify(mockFeed));
    await redisClient.disconnect();
    
    return res.status(200).json(mockFeed);
  } catch (error) {
    console.error('API Error:', error);
    // Graceful fallback if Redis fails
    return res.status(200).json(mockFeed);
  }
}
