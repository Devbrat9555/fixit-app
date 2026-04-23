import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { io } from 'socket.io-client';

const containerStyle = { width: '100%', height: '300px', borderRadius: '1rem' };

const LiveTrackingMap = ({ bookingId, userLocation, isProvider }) => {
  const [uLoc, setULoc] = useState(userLocation || { lat: 19.0760, lng: 72.8777 });
  const [pLoc, setPLoc] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.emit('join_booking', bookingId);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const type = isProvider ? 'provider' : 'user';
        socket.emit('update_location', { bookingId, lat: latitude, lng: longitude, type });
        if (isProvider) setPLoc({ lat: latitude, lng: longitude });
        else setULoc({ lat: latitude, lng: longitude });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    socket.on('location_update', (data) => {
      if (data.type === 'provider') setPLoc({ lat: data.lat, lng: data.lng });
      if (data.type === 'user') setULoc({ lat: data.lat, lng: data.lng });
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, [bookingId, isProvider]);

  useEffect(() => {
    if (isLoaded && window.google && pLoc && uLoc) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pLoc,
          destination: uLoc,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
            setDistance(result.routes[0].legs[0].distance.text);
            setDuration(result.routes[0].legs[0].duration.text);
          }
        }
      );
    }
  }, [pLoc, uLoc, isLoaded]);

  if (!isLoaded) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>Loading Maps...</div>;

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%', borderRadius: '2rem', overflow: 'hidden', border: '1px solid var(--border-accent)', boxShadow: 'var(--brand-glow)' }}>
      {/* HUD Info - Luxury Amber Design */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 10, 
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)',
        padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid var(--border-accent)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: 200
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
           <div className="pulse" style={{ width:10, height:10, borderRadius:99, background:'var(--accent)' }} />
           <span style={{ fontSize:'0.7rem', fontWeight:900, color:'var(--accent)', letterSpacing:'0.1em' }}>LIVE TRACKING ACTIVE</span>
        </div>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 800 }}>ESTIMATED ARRIVAL</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{duration || '---'}</p>
        <div style={{ height:1, background:'var(--border-subtle)', margin:'12px 0' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
           <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Distance</span>
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{distance || '0.0 km'}</span>
        </div>
      </div>

      <GoogleMap 
        mapContainerStyle={{ width: '100%', height: '100%' }} 
        center={uLoc} 
        zoom={14} 
        options={{ 
          disableDefaultUI: true, 
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f1f1f" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#333333" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
          ] 
        }}
      >
        <Marker position={uLoc} label="U" />
        {pLoc && <Marker position={pLoc} label="P" />}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: { 
                strokeColor: '#facc15',
                strokeWeight: 6,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LiveTrackingMap;
