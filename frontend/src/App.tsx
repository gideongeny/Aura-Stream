import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, TrendingUp, BookMarked, History as HistoryIcon, Search, Play, Music, Gamepad2, Newspaper, Trophy } from 'lucide-react';
import './index.css';
import { fetchTrending, fetchSearch, fetchCategory } from './api';
import type { Video } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';

// --- COMPONENTS ---

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="glass-panel" style={{
      height: '70px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
      borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play fill="white" stroke="none" size={20} />
        </div>
        <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800 }}>AuraStream</h1>
      </Link>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '24px', width: '400px', border: '1px solid var(--border-color)' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search millions of premium videos..." 
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontFamily: 'inherit' }} 
        />
      </form>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-secondary)' }} />
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
    <aside style={{ width: '240px', height: '100%', borderRight: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
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
    // Add to history (remove if exists, then prepend)
    const newHistory = [video, ...history.filter(v => v.id !== video.id)].slice(0, 100);
    setHistory(newHistory);
    // Use state to pass the full video object to the watch page
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
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={16} color="var(--text-secondary)" />
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

const FeedPage = ({ fetchFunction, title }: { fetchFunction: () => Promise<Video[]>, title: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFunction().then(data => {
      setVideos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
};

const HomePage = () => <FeedPage fetchFunction={fetchTrending} title="Trending Now" />;

const SearchPage = () => {
  const { query } = useParams();
  const fetchFunc = () => fetchSearch(query || '');
  return <FeedPage fetchFunction={fetchFunc} title={`Search Results for "${query}"`} />;
};

const CategoryPage = () => {
  const { category } = useParams();
  const fetchFunc = () => fetchCategory(category || 'music');
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
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
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}></div>
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
  return (
    <BrowserRouter>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Navbar />
        <div className="main-content" style={{ display: 'flex', flex: 1, marginTop: '70px', overflow: 'hidden' }}>
          <Sidebar />
          <main className="content-area" style={{ flex: 1, overflowY: 'auto' }}>
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
