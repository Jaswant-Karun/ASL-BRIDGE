import React, { useState } from 'react';

const categories = ['ASL schools', 'Deaf community', 'Interpreters', 'Accessible services', 'Practice spaces'];

export default function MapsPage() {
  const [category, setCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocation('Location is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`),
      () => setLocation('Location permission was denied. You can search manually.')
    );
  }

  const mapQuery = encodeURIComponent(query || `${category} near me`);
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapUrl = googleMapsKey
    ? `https://www.google.com/maps/embed/v1/search?key=${googleMapsKey}&q=${mapQuery}`
    : `https://www.openstreetmap.org/export/embed.html?search=${mapQuery}`;
  return (
    <div className="maps-page">
      <p className="eyebrow">DISCOVERY TOOLS</p>
      <h1>ASL Maps & Resources</h1>
      <p className="dashboard-intro">Explore places and services that support Deaf and signing communities. Configure Google Maps with `VITE_GOOGLE_MAPS_API_KEY`, or use the local OpenStreetMap fallback.</p>
      <div className="maps-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city, place, or service" aria-label="Search map" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Resource category">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button type="button" onClick={useMyLocation}>Use my location</button>
        <a href={`https://www.openstreetmap.org/search?query=${mapQuery}`} target="_blank" rel="noreferrer">Open search ↗</a>
      </div>
      {location && <p className="maps-location" role="status">{location}</p>}
      <div className="maps-layout">
        <div className="maps-frame-wrap">
          <iframe title={`${googleMapsKey ? 'Google Maps' : 'OpenStreetMap'} ASL resource search`} src={mapUrl} loading="lazy" />
        </div>
        <aside className="maps-resource-panel">
          <p className="panel-kicker">RESOURCE CATEGORIES</p>
          {categories.map((item) => <button type="button" className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}<span>→</span></button>)}
          <p className="maps-note">Map data is provided by OpenStreetMap. Verify hours, availability, and accessibility directly with each destination.</p>
        </aside>
      </div>
    </div>
  );
}
