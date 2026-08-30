import React, { useState, useCallback, useRef } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/* ── Venue categories with icons and search keywords ─────────────────────── */
const CATEGORIES = [
  { id:'asl-school',   label:'ASL Schools',         icon:'🏫', color:'#38bdf8', keyword:'ASL school deaf education' },
  { id:'deaf-center',  label:'Deaf Centers',         icon:'🤝', color:'#10b981', keyword:'Deaf community center' },
  { id:'interpreter',  label:'Interpreters',         icon:'🧏', color:'#f59e0b', keyword:'sign language interpreter service' },
  { id:'hospital',     label:'Accessible Hospitals', icon:'🏥', color:'#ef4444', keyword:'accessible hospital deaf services' },
  { id:'library',      label:'Libraries',            icon:'📚', color:'#8b5cf6', keyword:'public library accessible services' },
  { id:'university',   label:'Universities',         icon:'🎓', color:'#ec4899', keyword:'university disability services deaf' },
  { id:'practice',     label:'Practice Spaces',      icon:'🤲', color:'#06b6d4', keyword:'ASL practice group meetup' },
  { id:'government',   label:'Gov. Services',        icon:'🏛️', color:'#6366f1', keyword:'government accessible deaf services' },
];

/* ── Curated well-known venues (shown when no search active) ─────────────── */
const FEATURED_VENUES = [
  { name:'National Technical Institute for the Deaf',  city:'Rochester, NY',   type:'ASL School',    distance:'—',  rating:4.9, icon:'🏫', googleSearch:'NTID Rochester NY' },
  { name:'Gallaudet University',                        city:'Washington, DC',  type:'Deaf University',distance:'—',  rating:4.8, icon:'🎓', googleSearch:'Gallaudet University Washington DC' },
  { name:'California School for the Deaf',             city:'Fremont, CA',     type:'ASL School',    distance:'—',  rating:4.7, icon:'🏫', googleSearch:'California School for the Deaf Fremont' },
  { name:'Deaf Professional Arts Network',             city:'Chicago, IL',     type:'Deaf Center',   distance:'—',  rating:4.6, icon:'🤝', googleSearch:'DPAN Chicago' },
  { name:'Sign Language Center India',                 city:'Chennai, India',  type:'ASL School',    distance:'—',  rating:4.5, icon:'🧏', googleSearch:'Sign Language Center Chennai India' },
  { name:'Action on Hearing Loss',                     city:'London, UK',      type:'Deaf Center',   distance:'—',  rating:4.7, icon:'🤝', googleSearch:'Action on Hearing Loss London' },
];

/* ── Build the map embed URL ─────────────────────────────────────────────── */
function buildMapUrl({ query, lat, lng, zoom = 13 }) {
  if (API_KEY) {
    const params = new URLSearchParams({ key: API_KEY, q: query });
    if (lat && lng) { params.set('center', `${lat},${lng}`); params.set('zoom', zoom); }
    return `https://www.google.com/maps/embed/v1/search?${params}`;
  }
  // OpenStreetMap fallback
  if (lat && lng) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lng}`;
  }
  return `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(query)}`;
}

function buildDirectionsUrl(destination, origin = '') {
  const base = 'https://www.google.com/maps/dir/';
  return origin
    ? `${base}${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`
    : `${base}/${encodeURIComponent(destination)}`;
}

export default function MapsPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchText,     setSearchText]     = useState('');
  const [userCity,       setUserCity]        = useState('');
  const [userCoords,     setUserCoords]      = useState(null);
  const [locLoading,     setLocLoading]      = useState(false);
  const [locError,       setLocError]        = useState('');
  const [mapQuery,       setMapQuery]        = useState(`${CATEGORIES[0].keyword} near me`);
  const [selectedVenue,  setSelectedVenue]   = useState(null);
  const [fromAddr,       setFromAddr]        = useState('');
  const [toAddr,         setToAddr]          = useState('');
  const mapRef = useRef(null);

  /* ── Geolocation ─────────────────────────────────────────────────────── */
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported.'); return; }
    setLocLoading(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        // Reverse geocode city name
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'your location';
          setUserCity(city);
          setFromAddr(`${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`);
        } catch { setUserCity('your location'); }
        setLocLoading(false);
      },
      (err) => { setLocError('Location access denied. Please search manually.'); setLocLoading(false); }
    );
  }, []);

  /* ── Search / category change → update map ──────────────────────────── */
  function search(e) {
    if (e) e.preventDefault();
    const q = searchText.trim()
      ? `${searchText} ${userCity ? `near ${userCity}` : ''}`
      : `${activeCategory.keyword} ${userCity ? `near ${userCity}` : 'near me'}`;
    setMapQuery(q);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pickCategory(cat) {
    setActiveCategory(cat);
    const q = `${cat.keyword} ${userCity ? `near ${userCity}` : 'near me'}`;
    setMapQuery(q);
  }

  function openVenue(venue) {
    setSelectedVenue(venue);
    setMapQuery(venue.googleSearch);
    setToAddr(venue.name + ', ' + venue.city);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const mapSrc = buildMapUrl({
    query: mapQuery,
    lat: userCoords?.lat,
    lng: userCoords?.lng,
  });

  return (
    <div className="maps-page-v2">

      {/* ── Hero header ── */}
      <header className="maps-hero">
        <div className="maps-hero-text">
          <span className="rainbow-kicker">🗺️ VENUE NAVIGATION</span>
          <h2 className="maps-hero-title">Find Deaf &amp; ASL Venues Near You</h2>
          <p className="maps-hero-desc">
            Discover ASL schools, Deaf community centers, sign language interpreters,
            accessible hospitals, libraries and government services — with turn-by-turn directions.
          </p>
        </div>

        {/* Location pill */}
        <div className="maps-location-box">
          <button type="button" className={`maps-locate-btn ${locLoading?'loading':''}`} onClick={getLocation} disabled={locLoading}>
            {locLoading ? <><span className="maps-locate-spinner"/>Detecting…</> : <>📍 {userCity||'Use My Location'}</>}
          </button>
          {locError && <p className="maps-loc-error">{locError}</p>}
          {userCity && !locError && <p className="maps-loc-success">📍 Showing results near <strong>{userCity}</strong></p>}
        </div>
      </header>

      {/* ── Category grid ── */}
      <section className="maps-category-grid">
        {CATEGORIES.map(cat => (
          <button key={cat.id} type="button"
            className={`maps-cat-card ${activeCategory.id===cat.id?'maps-cat-card--active':''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => pickCategory(cat)}>
            <span className="maps-cat-icon">{cat.icon}</span>
            <span className="maps-cat-label">{cat.label}</span>
            {activeCategory.id===cat.id && <span className="maps-cat-active-dot"/>}
          </button>
        ))}
      </section>

      {/* ── Search bar ── */}
      <form className="maps-search-bar" onSubmit={search}>
        <div className="maps-search-input-wrap">
          <span className="maps-search-icon">🔍</span>
          <input type="text" className="maps-search-input"
            placeholder={`Search ${activeCategory.label} in any city…`}
            value={searchText} onChange={e => setSearchText(e.target.value)} />
          {searchText && (
            <button type="button" className="maps-search-clear" onClick={() => setSearchText('')}>✕</button>
          )}
        </div>
        <button type="submit" className="maps-search-btn">Search</button>
        <a className="maps-open-link"
          href={`https://www.google.com/maps/search/${encodeURIComponent(mapQuery)}`}
          target="_blank" rel="noreferrer">
          Open in Google Maps ↗
        </a>
      </form>

      {/* ── Main layout: map + sidebar ── */}
      <div className="maps-main-layout" ref={mapRef}>

        {/* Map iframe */}
        <div className="maps-iframe-col">
          <div className="maps-iframe-wrap">
            <iframe
              key={mapQuery}
              title="Venue map"
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            {!API_KEY && (
              <div className="maps-api-badge">
                🔑 Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to .env for Google Maps
              </div>
            )}
          </div>

          {/* ── Directions builder ── */}
          <div className="maps-directions-card">
            <span className="rainbow-kicker" style={{marginBottom:'0.5rem',display:'block'}}>🧭 GET DIRECTIONS</span>
            <div className="maps-directions-inputs">
              <div className="maps-dir-field">
                <label>From</label>
                <input type="text" placeholder="Your address or 'My Location'"
                  value={fromAddr} onChange={e => setFromAddr(e.target.value)}
                  className="maps-dir-input" />
              </div>
              <div className="maps-dir-arrow">↓</div>
              <div className="maps-dir-field">
                <label>To (venue)</label>
                <input type="text" placeholder="Venue name or address"
                  value={toAddr} onChange={e => setToAddr(e.target.value)}
                  className="maps-dir-input" />
              </div>
            </div>
            <div className="maps-directions-actions">
              <a className="maps-dir-btn maps-dir-btn--drive"
                href={buildDirectionsUrl(toAddr||activeCategory.label, fromAddr)}
                target="_blank" rel="noreferrer">
                🚗 Drive
              </a>
              <a className="maps-dir-btn maps-dir-btn--transit"
                href={`${buildDirectionsUrl(toAddr||activeCategory.label, fromAddr)}&travelmode=transit`}
                target="_blank" rel="noreferrer">
                🚌 Transit
              </a>
              <a className="maps-dir-btn maps-dir-btn--walk"
                href={`${buildDirectionsUrl(toAddr||activeCategory.label, fromAddr)}&travelmode=walking`}
                target="_blank" rel="noreferrer">
                🚶 Walk
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="maps-sidebar">

          {/* Active search info */}
          <div className="maps-search-info">
            <span className="rainbow-kicker">SEARCHING</span>
            <p className="maps-active-query">"{mapQuery}"</p>
          </div>

          {/* Selected venue detail */}
          {selectedVenue && (
            <div className="maps-venue-detail-card">
              <div className="maps-venue-detail-header">
                <span className="maps-venue-icon-lg">{selectedVenue.icon}</span>
                <div>
                  <strong className="maps-venue-detail-name">{selectedVenue.name}</strong>
                  <p className="maps-venue-detail-city">📍 {selectedVenue.city}</p>
                </div>
                <button type="button" className="maps-venue-close" onClick={() => setSelectedVenue(null)}>✕</button>
              </div>
              <div className="maps-venue-detail-row">
                <span className="maps-venue-type-chip">{selectedVenue.type}</span>
                <span className="maps-rating">⭐ {selectedVenue.rating}</span>
              </div>
              <div className="maps-venue-detail-actions">
                <a className="maps-dir-btn maps-dir-btn--drive"
                  href={buildDirectionsUrl(`${selectedVenue.name} ${selectedVenue.city}`)}
                  target="_blank" rel="noreferrer">🧭 Get Directions</a>
                <a className="maps-dir-btn maps-dir-btn--transit"
                  href={`https://www.google.com/maps/search/${encodeURIComponent(selectedVenue.googleSearch)}`}
                  target="_blank" rel="noreferrer">🗺 View on Map</a>
              </div>
            </div>
          )}

          {/* Featured venues */}
          <div className="maps-venues-list">
            <span className="rainbow-kicker" style={{marginBottom:'0.6rem',display:'block'}}>FEATURED VENUES</span>
            {FEATURED_VENUES.map(v => (
              <button key={v.name} type="button"
                className={`maps-venue-card ${selectedVenue?.name===v.name?'maps-venue-card--active':''}`}
                onClick={() => openVenue(v)}>
                <span className="maps-venue-icon">{v.icon}</span>
                <div className="maps-venue-info">
                  <strong className="maps-venue-name">{v.name}</strong>
                  <span className="maps-venue-city">📍 {v.city}</span>
                  <span className="maps-venue-type">{v.type}</span>
                </div>
                <div className="maps-venue-meta">
                  <span className="maps-rating">⭐ {v.rating}</span>
                  <span className="maps-dir-arrow-icon">→</span>
                </div>
              </button>
            ))}
          </div>

          {/* Accessibility tips */}
          <div className="maps-tips-card">
            <span className="rainbow-kicker" style={{marginBottom:'0.5rem',display:'block'}}>♿ ACCESSIBILITY TIPS</span>
            <ul className="maps-tips-list">
              <li>Call ahead to confirm an interpreter is available</li>
              <li>Ask about video relay service (VRS) at the venue</li>
              <li>Check for induction loops or hearing loops</li>
              <li>Request written communication when needed</li>
              <li>Many libraries offer free ASL practice sessions</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
