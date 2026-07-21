import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, TrendingUp, BookMarked, History as HistoryIcon, Search, Play, Music, Gamepad2, Newspaper, Trophy, Menu } from 'lucide-react';
import './index.css';
import { fetchTrending, fetchSearch, fetchCategory, fetchSuggestions } from './api';
import type { Video, PaginatedResponse } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';

// --- COMPONENTS ---

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLFormElement>(null);

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

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '40px' }}>
        {/* Placeholder removed as requested */}
      </div>
    </nav>
  );
};

const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Close sidebar on mobile when navigating
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <Link to={to} className={`sidebar-item hover-lift ${isActive(to) ? 'active' : ''}`} style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', textDecoration: 'none',
      color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
      background: isActive(to) ? 'var(--bg-tertiary)' : 'transparent',
      fontWeight: isActive(to) ? 600 : 400
    }}>
      {icon}
      {label}
    </Link>
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={closeSidebar} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ width: '240px', height: '100%', borderRight: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <NavItem to="/" icon={<Home size={20} />} label="Home" />
        <NavItem to="/trending" icon={<TrendingUp size={20} />} label="Trending" />
        
        <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Categories</div>
        <NavItem to="/category/music" icon={<Music size={20} />} label="Music" />
        <NavItem to="/category/gaming" icon={<Gamepad2 size={20} />} label="Gaming" />
        <NavItem to="/category/news" icon={<Newspaper size={20} />} label="News" />
        <NavItem to="/category/sports" icon={<Trophy size={20} />} label="Sports" />

        <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
        <NavItem to="/library" icon={<BookMarked size={20} />} label="Library" />
        <NavItem to="/history" icon={<HistoryIcon size={20} />} label="History" />
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
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {video.channelAvatar ? (
            <img src={video.channelAvatar} alt={video.channel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Play size={16} color="var(--text-secondary)" />
          )}
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{video.channel}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{video.views} views • {video.timestamp}</p>
        </div>
      </div>
    </div>
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

const StoragePage = ({ storageKey, title, emptyMessage }: { storageKey: string, title: string, emptyMessage: string }) => {
  const [videos, setVideos] = useLocalStorage<Video[]>(storageKey, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{title}</h2>
        {videos.length > 0 && <button className="btn" onClick={() => setVideos([])}>Clear All</button>}
      </div>
      {videos.length === 0 ? (
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
  
  const isSaved = library.some(v => v.id === id);

  const toggleLibrary = () => {
    if (isSaved) {
      setLibrary(library.filter(v => v.id !== id));
    } else if (video) {
      setLibrary([video, ...library]);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              {video?.channelAvatar ? (
                <img src={video.channelAvatar} alt={video.channel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}></div>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{video?.channel || 'AuraStream Creator'}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ borderRadius: '24px', background: 'var(--bg-tertiary)' }}>👍 Like</button>
            <button className={`btn ${isSaved ? 'btn-primary' : ''}`} style={{ borderRadius: '24px', background: isSaved ? 'var(--accent-primary)' : 'var(--bg-tertiary)' }} onClick={toggleLibrary}>
              {isSaved ? '✓ Saved to Library' : '🔖 Save to Library'}
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
    <BrowserRouter>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="main-content" style={{ display: 'flex', flex: 1, marginTop: '70px', overflow: 'hidden' }}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          <main className="content-area" id="scrollable-content" style={{ flex: 1, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/trending" element={<HomePage />} />
              <Route path="/search/:query" element={<SearchPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/history" element={<StoragePage storageKey="aurastream_history" title="Watch History" emptyMessage="You haven't watched any videos yet." />} />
              <Route path="/library" element={<StoragePage storageKey="aurastream_library" title="Saved Library" emptyMessage="Your library is empty. Save some videos to watch later!" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
