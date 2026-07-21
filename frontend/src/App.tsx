import { useState, useEffect } from 'react'
import './index.css'

// Types
type Video = {
  id: string
  title: string
  channel: string
  views: string
  timestamp: string
  thumbnail: string
}

type ImagePost = {
  id: string
  title: string
  author: string
  url: string
  likes: string
}

function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'images'>('all');
  const [feedData, setFeedData] = useState<{ videos: Video[], images: ImagePost[] }>({ videos: [], images: [] });
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    // Fetch data from our Vercel Serverless API
    fetch('/api/feed')
      .then(res => res.json())
      .then(data => {
        setFeedData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch feed", err);
        setLoading(false);
      });
  }, []);

  const renderNavbar = () => (
    <nav className="glass-panel" style={{
      height: '70px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setPlayingVideo(null)}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800 }}>AuraStream</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '24px', width: '400px', border: '1px solid var(--border-color)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search for premium content..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button className="btn">Sign In</button>
        <button className="btn btn-primary">Go Premium</button>
      </div>
    </nav>
  );

  const renderSidebar = () => (
    <aside style={{
      width: '240px',
      height: '100%',
      borderRight: '1px solid var(--border-color)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div className="sidebar-item" style={{ color: 'var(--accent-primary)', fontWeight: 600, padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', cursor: 'pointer' }}>🏠 Home</div>
      <div className="sidebar-item hover-lift" style={{ color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>🔥 Trending</div>
      <div className="sidebar-item hover-lift" style={{ color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>📺 Subscriptions</div>
      <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
      <div className="sidebar-item hover-lift" style={{ color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>📚 Library</div>
      <div className="sidebar-item hover-lift" style={{ color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>⏱️ History</div>
    </aside>
  );

  const renderFeed = () => {
    let items: any[] = [];
    if (activeTab === 'all' || activeTab === 'videos') {
      items = [...items, ...feedData.videos.map(v => ({ ...v, type: 'video' }))];
    }
    if (activeTab === 'all' || activeTab === 'images') {
      items = [...items, ...feedData.images.map(i => ({ ...i, type: 'image' }))];
    }
    
    // Shuffle for mixed feed
    if (activeTab === 'all') {
      items.sort(() => Math.random() - 0.5);
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {items.map(item => (
          item.type === 'video' ? (
            <div key={`vid-${item.id}`} className="hover-lift" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={() => setPlayingVideo(item as Video)}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                <img src={item.thumbnail} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>10:42</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', flexShrink: 0 }}></div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.channel}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.views} views • {item.timestamp}</p>
                </div>
              </div>
            </div>
          ) : (
            <div key={`img-${item.id}`} className="hover-lift glass-panel" style={{ cursor: 'pointer', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-secondary)' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{item.author} <span style={{ color: 'var(--text-muted)' }}>posted an image</span></p>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 500 }}>{item.title}</h3>
              <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                <img src={item.url} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>❤️ {item.likes}</div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>💬 Reply</div>
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  const renderPlayer = () => {
    if (!playingVideo) return null;
    return (
      <div style={{ display: 'flex', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        <div style={{ flex: '1' }}>
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: 'black', boxShadow: 'var(--shadow-glow)' }}>
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${playingVideo.id}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            ></iframe>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '20px 0 10px 0' }}>{playingVideo.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{playingVideo.channel}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>1.2M subscribers</p>
              </div>
              <button className="btn btn-primary" style={{ marginLeft: '16px', borderRadius: '24px' }}>Subscribe</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" style={{ borderRadius: '24px', background: 'var(--bg-tertiary)' }}>👍 124K | 👎</button>
              <button className="btn" style={{ borderRadius: '24px', background: 'var(--bg-tertiary)' }}>↗️ Share</button>
            </div>
          </div>
          <div className="glass-panel" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)' }}>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>{playingVideo.views} views • {playingVideo.timestamp}</p>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Premium ad-reduced playback powered by StreamLux nocookie embedding technology.</p>
          </div>
        </div>
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Up Next</h3>
          {feedData.videos.filter(v => v.id !== playingVideo.id).map(item => (
            <div key={`next-${item.id}`} className="hover-lift" style={{ display: 'flex', gap: '12px', cursor: 'pointer' }} onClick={() => setPlayingVideo(item)}>
              <div style={{ width: '168px', height: '94px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.channel}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {renderNavbar()}
      
      <div className="main-content">
        {!playingVideo && renderSidebar()}
        
        <main className="content-area">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div className="gradient-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading Premium Experience...</div>
            </div>
          ) : (
            playingVideo ? renderPlayer() : (
              <>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <button className={`btn ${activeTab === 'all' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('all')}>All Content</button>
                  <button className={`btn ${activeTab === 'videos' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('videos')}>Videos Only</button>
                  <button className={`btn ${activeTab === 'images' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('images')}>Images Only</button>
                </div>
                {renderFeed()}
              </>
            )
          )}
        </main>
      </div>
    </div>
  )
}

export default App
