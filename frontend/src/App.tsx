import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, TrendingUp, BookMarked, History as HistoryIcon, Search, Play, Music, Gamepad2, Newspaper, Trophy, Menu, Tv, ListVideo, UserPlus, UserCheck, Download, ThumbsUp, Smartphone, Podcast, Radio, BookOpen, Film, LogOut, LogIn } from 'lucide-react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import './index.css';
import { fetchTrending, fetchSearch, fetchCategory, fetchSuggestions } from './api';
import type { Video, PaginatedResponse } from './api';
import { fetchGoogleProfile, fetchYouTubeSubscriptions, fetchLikedVideos } from './youtubeApi';
import { useLocalStorage } from './hooks/useLocalStorage';
import React from 'react';

// --- AUTH CONTEXT ---

type UserProfile = { name: string, picture: string, email: string };
type AuthContextType = {
  token: string | null;
  profile: UserProfile | null;
  login: () => void;
  logout: () => void;
};
export const AuthContext = React.createContext<AuthContextType>({
  token: null, profile: null, login: () => {}, logout: () => {}
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useLocalStorage<string | null>('aurastream_google_token', null);
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('aurastream_google_profile', null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setToken(tokenResponse.access_token);
      try {
        const prof = await fetchGoogleProfile(tokenResponse.access_token);
        setProfile(prof);
      } catch (e) {
        console.error(e);
      }
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const logout = () => {
    googleLogout();
    setToken(null);
    setProfile(null);
  };

  return <AuthContext.Provider value={{ token, profile, login, logout }}>{children}</AuthContext.Provider>;
};

// --- COMPONENTS ---

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLFormElement>(null);
  const { profile, login, logout } = React.useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      fetchSuggestions(query).then(data => setSuggestions(data));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent, selectedQuery?: string) => {
    e.preventDefault();
    const finalQuery = selectedQuery || query;
    if (finalQuery.trim()) {
      setShowSuggestions(false);
      setQuery(finalQuery);
      navigate(`/search/${encodeURIComponent(finalQuery)}`);
    }
  };

  return (
    <nav className="glass-panel navbar" style={{
      height: '70px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
      borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'none' }}>
          <Menu size={24} />
        </button>
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play fill="white" stroke="none" size={20} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800 }}>AuraStream</h1>
        </Link>
      </div>
      
      <form className="search-form" ref={searchRef} onSubmit={(e) => handleSearch(e)} style={{ position: 'relative', width: '400px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search millions of premium videos..." 
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontFamily: 'inherit' }} 
          />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '8px', overflow: 'hidden', zIndex: 10 }}>
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                onClick={(e) => handleSearch(e, s)}
                style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Search size={16} color="var(--text-muted)" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </form>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {profile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={profile.picture} alt={profile.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            <button className="btn hover-lift" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', borderRadius: '24px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <button className="btn btn-primary hover-lift" onClick={() => login()} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '24px' }}>
            <LogIn size={18} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [localSubscriptions] = useLocalStorage<Subscription[]>('aurastream_subscriptions', []);
  const { token } = React.useContext(AuthContext);
  const [youtubeSubs, setYoutubeSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    if (token) {
      fetchYouTubeSubscriptions(token).then(subs => setYoutubeSubs(subs));
    }
  }, [token]);

  const subscriptions = token ? youtubeSubs : localSubscriptions;

  // Close sidebar on mobile when navigating
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const NavItem = ({ to, icon, label, avatar }: { to: string, icon?: React.ReactNode, label: string, avatar?: string }) => (
    <Link to={to} className={`sidebar-item hover-lift ${isActive(to) ? 'active' : ''}`} style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', textDecoration: 'none',
      color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
      background: isActive(to) ? 'var(--bg-tertiary)' : 'transparent',
      fontWeight: isActive(to) ? 600 : 400
    }}>
      {avatar ? (
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
          {avatar !== '' ? <img src={avatar} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Play size={12} style={{ margin: '6px' }} />}
        </div>
      ) : icon}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </Link>
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={closeSidebar} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ width: '240px', height: '100%', borderRight: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <NavItem to="/" icon={<Home size={20} />} label="Home" />
        <NavItem to="/shorts" icon={<Smartphone size={20} />} label="Shorts" />
        <NavItem to="/trending" icon={<TrendingUp size={20} />} label="Trending" />
        
        <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Categories</div>
        <NavItem to="/category/music" icon={<Music size={20} />} label="Music" />
        <NavItem to="/category/gaming" icon={<Gamepad2 size={20} />} label="Gaming" />
        <NavItem to="/category/news" icon={<Newspaper size={20} />} label="News" />
        <NavItem to="/category/sports" icon={<Trophy size={20} />} label="Sports" />
        <NavItem to="/category/podcasts" icon={<Podcast size={20} />} label="Podcasts" />
        <NavItem to="/category/live" icon={<Radio size={20} />} label="Live" />
        <NavItem to="/category/education" icon={<BookOpen size={20} />} label="Education" />
        <NavItem to="/category/movies" icon={<Film size={20} />} label="Movies" />

        <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>You</div>
        <NavItem to="/history" icon={<HistoryIcon size={20} />} label="History" />
        <NavItem to="/library" icon={<BookMarked size={20} />} label="Library" />
        <NavItem to="/liked" icon={<ThumbsUp size={20} />} label="Liked videos" />

        <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Subscriptions</div>
        <NavItem to="/subscriptions" icon={<Tv size={20} />} label="All Subscriptions" />
        {subscriptions.map(sub => (
          <NavItem key={sub.name} to={`/channel/${encodeURIComponent(sub.name)}`} label={sub.name} avatar={sub.avatar} />
        ))}
      </aside>
    </>
  );
};

const VideoCard = ({ video }: { video: Video }) => {
  const [history, setHistory] = useLocalStorage<Video[]>('aurastream_history', []);
  const navigate = useNavigate();

  const formatLength = (seconds: number) => {
    if (!seconds) return 'Live';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    const newHistory = [video, ...history.filter(v => v.id !== video.id)].slice(0, 100);
    setHistory(newHistory);
    navigate(`/watch/${video.id}`, { state: { video } });
  };

  return (
    <div className="hover-lift" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={handleClick}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
        <img src={video.thumbnail} alt={video.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
          {formatLength(video.lengthSeconds)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }} onClick={(e) => { e.stopPropagation(); navigate(`/channel/${encodeURIComponent(video.channel)}`); }}>
        <div className="hover-lift" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {video.channelAvatar ? (
            <img src={video.channelAvatar} alt={video.channel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Play size={16} color="var(--text-secondary)" />
          )}
        </div>
        <div className="hover-lift">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <Link to={`/channel/${encodeURIComponent(video.channel)}`} state={{ channelAvatar: video.channelAvatar }} onClick={e => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-lift">{video.channel}</Link>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{video.views} views • {video.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

type Subscription = { name: string, avatar: string };

const SubscribeButton = ({ channelName, channelAvatar }: { channelName: string, channelAvatar: string }) => {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('aurastream_subscriptions', []);
  const isSubscribed = subscriptions.some(s => s.name === channelName);

  const toggleSubscription = () => {
    if (isSubscribed) {
      setSubscriptions(subscriptions.filter(s => s.name !== channelName));
    } else {
      setSubscriptions([{ name: channelName, avatar: channelAvatar }, ...subscriptions]);
    }
  };

  return (
    <button 
      className="btn hover-lift" 
      onClick={toggleSubscription}
      style={{ 
        display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '24px', 
        background: isSubscribed ? 'var(--bg-tertiary)' : 'var(--text-primary)', 
        color: isSubscribed ? 'var(--text-primary)' : 'var(--bg-primary)',
        fontWeight: 600 
      }}
    >
      {isSubscribed ? <><UserCheck size={18} /> Subscribed</> : <><UserPlus size={18} /> Subscribe</>}
    </button>
  );
};

// --- PAGES ---

const FeedPage = ({ fetchFunction, title }: { fetchFunction: (continuation?: string) => Promise<PaginatedResponse>, title: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && continuation) {
        setLoadingMore(true);
        fetchFunction(continuation).then(data => {
          setVideos(prev => [...prev, ...data.videos]);
          setContinuation(data.continuation);
          setHasMore(!!data.continuation);
          setLoadingMore(false);
        }).catch(() => setLoadingMore(false));
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, continuation, fetchFunction]);

  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setContinuation(null);
    setHasMore(true);
    fetchFunction().then(data => {
      setVideos(data.videos);
      setContinuation(data.continuation);
      setHasMore(!!data.continuation);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchFunction]); // Re-run if the fetch function changes (e.g. route changes)

  if (loading) return (
    <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid var(--bg-tertiary)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading {title}...</p>
    </div>
  );

  if (videos.length === 0) return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>No videos found. Check your connection or try again.</p>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>{title}</h2>
      <div className="video-grid">
        {videos.map((v, i) => {
          if (videos.length === i + 1) {
            return (
              <div ref={lastVideoElementRef} key={`${v.id}-${i}`}>
                <VideoCard video={v} />
              </div>
            );
          }
          return <VideoCard key={`${v.id}-${i}`} video={v} />;
        })}
      </div>
      {loadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid var(--bg-tertiary)', borderTop: '2px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const fetchFunc = useCallback((c?: string) => fetchTrending(c), []);
  return <FeedPage fetchFunction={fetchFunc} title="Trending Now" />;
};

const SearchPage = () => {
  const { query } = useParams();
  const fetchFunc = useCallback((c?: string) => fetchSearch(query || '', c), [query]);
  return <FeedPage fetchFunction={fetchFunc} title={`Search Results for "${query}"`} />;
};

const CategoryPage = () => {
  const { category } = useParams();
  const fetchFunc = useCallback((c?: string) => fetchCategory(category || 'music', c), [category]);
  return <FeedPage fetchFunction={fetchFunc} title={`${category?.charAt(0).toUpperCase()}${category?.slice(1)} Content`} />;
};

const ShortsPage = () => {
  const fetchFunc = useCallback((c?: string) => fetchSearch('#shorts', c), []);
  return <FeedPage fetchFunction={fetchFunc} title="Shorts" />;
};

const ChannelPage = () => {
  const { channelName } = useParams();
  const location = useLocation();
  const channelAvatar = location.state?.channelAvatar;
  const fetchFunc = useCallback((c?: string) => fetchSearch(channelName || '', c), [channelName]);
  return (
    <div>
      <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {channelAvatar ? (
            <img src={channelAvatar} alt={channelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Play size={40} fill="white" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channelName}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Explore premium videos from {channelName}</p>
        </div>
        <SubscribeButton channelName={channelName || ''} channelAvatar={channelAvatar || ''} />
      </div>
      <FeedPage fetchFunction={fetchFunc} title="Latest Videos" />
    </div>
  );
};

const SubscriptionsPage = () => {
  const [localSubscriptions] = useLocalStorage<Subscription[]>('aurastream_subscriptions', []);
  const { token } = React.useContext(AuthContext);
  const [youtubeSubs, setYoutubeSubs] = useState<Subscription[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchYouTubeSubscriptions(token).then(subs => {
        setYoutubeSubs(subs);
      });
    }
  }, [token]);

  const subscriptions = token ? youtubeSubs : localSubscriptions;

  useEffect(() => {
    if (!token && localSubscriptions.length === 0) {
      setLoading(false);
      return;
    }
    if (token && youtubeSubs.length === 0) return; // Wait for subs to load if logged in

    setLoading(true);
    const topSubs = subscriptions.slice(0, 10);
    if (topSubs.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(topSubs.map(sub => fetchSearch(sub.name))).then(results => {
      const mixed: Video[] = [];
      const maxLength = Math.max(...results.map(r => r.videos.length));
      for(let i = 0; i < maxLength; i++) {
        for(let r of results) {
          if (r.videos[i]) mixed.push(r.videos[i]);
        }
      }
      setVideos(mixed);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [subscriptions]);

  if (loading) return (
    <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid var(--bg-tertiary)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading your subscriptions feed...</p>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ListVideo size={28} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Your Subscriptions</h2>
      </div>
      {subscriptions.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '16px' }}>
          <Tv size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No subscriptions yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {token ? "You don't have any YouTube subscriptions." : "Subscribe to your favorite channels to see their latest videos here."}
          </p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v, i) => <VideoCard key={`${v.id}-${i}`} video={v} />)}
        </div>
      )}
    </div>
  );
};

const StoragePage = ({ storageKey, title, emptyMessage, useYouTubeLikes = false }: { storageKey: string, title: string, emptyMessage: string, useYouTubeLikes?: boolean }) => {
  const [localVideos, setVideos] = useLocalStorage<Video[]>(storageKey, []);
  const { token } = React.useContext(AuthContext);
  const [youtubeLikes, setYoutubeLikes] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useYouTubeLikes && token) {
      setLoading(true);
      fetchLikedVideos(token).then(vids => {
        setYoutubeLikes(vids);
        setLoading(false);
      });
    }
  }, [useYouTubeLikes, token]);

  const videos = (useYouTubeLikes && token) ? youtubeLikes : localVideos;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{title}</h2>
        {(!useYouTubeLikes || !token) && videos.length > 0 && <button className="btn" onClick={() => setVideos([])}>Clear All</button>}
      </div>
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Syncing from YouTube...</p>
      ) : videos.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
      ) : (
        <div className="video-grid">
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
};

const WatchPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const video = location.state?.video as Video;
  const [library, setLibrary] = useLocalStorage<Video[]>('aurastream_library', []);
  const [likedVideos, setLikedVideos] = useLocalStorage<Video[]>('aurastream_liked_videos', []);
  
  const isSaved = library.some(v => v.id === id);
  const isLiked = likedVideos.some(v => v.id === id);

  const toggleLibrary = () => {
    if (isSaved) {
      setLibrary(library.filter(v => v.id !== id));
    } else if (video) {
      setLibrary([video, ...library]);
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      setLikedVideos(likedVideos.filter(v => v.id !== id));
    } else if (video) {
      setLikedVideos([video, ...likedVideos]);
    }
  };

  if (!id) return <div>Invalid Video ID</div>;

  return (
    <div style={{ padding: '24px', display: 'flex', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: 'black', boxShadow: 'var(--shadow-glow)' }}>
          <iframe 
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></iframe>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '20px 0 10px 0' }}>{video?.title || 'Premium Video Stream'}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              {video?.channelAvatar ? (
                <img src={video.channelAvatar} alt={video.channel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}></div>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}><Link to={`/channel/${encodeURIComponent(video?.channel || '')}`} state={{ channelAvatar: video?.channelAvatar }} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-lift">{video?.channel || 'AuraStream Creator'}</Link></h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={`btn hover-lift ${isLiked ? 'btn-primary' : ''}`} style={{ borderRadius: '24px', background: isLiked ? 'var(--accent-primary)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={toggleLike}>
              <ThumbsUp size={18} /> {isLiked ? 'Liked' : 'Like'}
            </button>
            <SubscribeButton channelName={video?.channel || ''} channelAvatar={video?.channelAvatar || ''} />
            <button className={`btn hover-lift ${isSaved ? 'btn-primary' : ''}`} style={{ borderRadius: '24px', background: isSaved ? 'var(--accent-primary)' : 'var(--bg-tertiary)' }} onClick={toggleLibrary}>
              {isSaved ? '✓ Saved' : '🔖 Save'}
            </button>
            <button className="btn hover-lift" style={{ borderRadius: '24px', background: 'var(--bg-tertiary)', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => window.open(`https://ssyoutube.com/watch?v=${id}`, '_blank')}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>
        <div className="glass-panel" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)' }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{video?.views} views • {video?.timestamp}</p>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Premium ad-reduced playback powered by AuraStream.</p>
        </div>
      </div>
    </div>
  );
};

// --- APP ---

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main-content" style={{ display: 'flex', flex: 1, marginTop: '70px', overflow: 'hidden' }}>
            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
            <main className="content-area" id="scrollable-content" style={{ flex: 1, overflowY: 'auto' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shorts" element={<ShortsPage />} />
                <Route path="/trending" element={<HomePage />} />
                <Route path="/search/:query" element={<SearchPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/channel/:channelName" element={<ChannelPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/history" element={<StoragePage storageKey="aurastream_history" title="Watch History" emptyMessage="You haven't watched any videos yet." />} />
                <Route path="/library" element={<StoragePage storageKey="aurastream_library" title="Saved Library" emptyMessage="Your library is empty. Save some videos to watch later!" />} />
                <Route path="/liked" element={<StoragePage storageKey="aurastream_liked_videos" title="Liked Videos" emptyMessage="You haven't liked any videos yet." useYouTubeLikes={true} />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
