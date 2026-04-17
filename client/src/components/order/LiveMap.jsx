import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RESTAURANT } from '../../utils/constants.js';
import riderService from '../../services/rider.service.js';

// ── Fix Leaflet default icon paths in Vite ────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom icons ──────────────────────────────────────────────
const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

// ── Re-centres map smoothly when rider moves ──────────────────
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
};

const LiveMap = ({ socket, orderId }) => {
  const [riderPos, setRiderPos] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // ── Initial position via REST ─────────────────────────────
  useEffect(() => {
    riderService.getRiderLocation()
      .then((data) => {
        setRiderPos({ lat: data.lat, lng: data.lng });
      })
      .catch(() => {
        // Rider not broadcasting yet — centre on restaurant
        setRiderPos({ lat: RESTAURANT.lat, lng: RESTAURANT.lng });
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Live updates via Socket.io ────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ lat, lng }) => {
      setRiderPos({ lat, lng });
    };

    socket.on('rider_location', onRiderLocation);

    return () => {
      socket.off('rider_location', onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex items-center
                      justify-center text-gray-400 text-sm animate-pulse">
        Loading map…
      </div>
    );
  }

  const center = riderPos
    ? [riderPos.lat, riderPos.lng]
    : [RESTAURANT.lat, RESTAURANT.lng];

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {riderPos && (
          <Marker
            position={[riderPos.lat, riderPos.lng]}
            icon={riderIcon}
          >
            <Popup>Your delivery rider</Popup>
          </Marker>
        )}

        <Marker
          position={[RESTAURANT.lat, RESTAURANT.lng]}
          icon={restaurantIcon}
        >
          <Popup>{RESTAURANT.name}</Popup>
        </Marker>

        {riderPos && (
          <MapUpdater center={[riderPos.lat, riderPos.lng]} />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;