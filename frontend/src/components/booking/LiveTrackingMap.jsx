import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

// Fix for default Leaflet markers not loading in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const providerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png', // Van icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const LiveTrackingMap = ({ bookingId, userLocation, isProvider }) => {
  // Default coordinates (Mumbai as fallback)
  const defaultUserLoc = userLocation || [19.0760, 72.8777]; 
  
  // Provider starts slightly away
  const [providerLoc, setProviderLoc] = useState([defaultUserLoc[0] - 0.01, defaultUserLoc[1] - 0.01]);
  const [route, setRoute] = useState([defaultUserLoc, [defaultUserLoc[0] - 0.01, defaultUserLoc[1] - 0.01]]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.emit('join_booking', bookingId);

    if (isProvider) {
      // Mocking live location updates for presentation
      let currentLat = providerLoc[0];
      let currentLng = providerLoc[1];
      
      const interval = setInterval(() => {
        // Move 10% closer to user every 2 seconds
        currentLat += (defaultUserLoc[0] - currentLat) * 0.1;
        currentLng += (defaultUserLoc[1] - currentLng) * 0.1;
        
        socket.emit('update_location', { bookingId, lat: currentLat, lng: currentLng });
        setProviderLoc([currentLat, currentLng]);
      }, 2000);

      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    } else {
      socket.on('location_update', (data) => {
        setProviderLoc([data.lat, data.lng]);
        setRoute(prev => [...prev, [data.lat, data.lng]]);
      });

      return () => socket.disconnect();
    }
  }, [bookingId, isProvider]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <MapContainer center={defaultUserLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User Location */}
        <Marker position={defaultUserLoc}>
          <Popup>Service Location</Popup>
        </Marker>

        {/* Provider Location */}
        <Marker position={providerLoc} icon={providerIcon}>
          <Popup>Provider is on the way!</Popup>
        </Marker>

        {/* Route Line */}
        <Polyline positions={[defaultUserLoc, providerLoc]} color="#6366f1" weight={4} dashArray="10, 10" />
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
