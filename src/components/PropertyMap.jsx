import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { LOCALITIES } from '../data/localities';

const pinIcon = (active) =>
  L.divIcon({
    className: 'onreal-pin',
    html: `<div class="op ${active ? 'active' : ''}"><span></span></div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    tooltipAnchor: [0, -34],
  });

function Picker({ onPick }) {
  useMapEvents({
    click(e) {
      if (onPick) onPick(+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5));
    },
  });
  return null;
}

function Fit({ markers }) {
  const map = useMap();
  const key = markers.map((m) => m.id).join('|');
  useEffect(() => {
    if (markers.length === 1) map.setView([markers[0].lat, markers[0].lng], 13);
    else if (markers.length > 1)
      map.fitBounds(
        markers.map((m) => [m.lat, m.lng]),
        { padding: [36, 36], maxZoom: 11 },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/* Interactive OpenStreetMap (React Leaflet). Click-to-pick in "onPick" mode. */
export function PropertyMap({
  markers = [],
  activeId,
  onSelect,
  onPick,
  picked,
  showLocalities = true,
  height = 360,
}) {
  const icons = useMemo(() => ({ on: pinIcon(true), off: pinIcon(false) }), []);
  return (
    <div className="map-shell overflow-hidden rounded-2xl border border-line" style={{ height }}>
      <MapContainer
        center={[10.4, 76.4]}
        zoom={7}
        scrollWheelZoom={Boolean(onPick)}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!onPick && <Fit markers={markers} />}
        {onPick && <Picker onPick={onPick} />}
        {showLocalities &&
          LOCALITIES.map((l) => (
            <CircleMarker
              key={l.id}
              center={[l.lat, l.lng]}
              radius={5}
              pathOptions={{
                color: '#0F3D2E',
                weight: 1.5,
                fillColor: '#0F3D2E',
                fillOpacity: 0.35,
              }}
            >
              <Tooltip>{l.name}</Tooltip>
            </CircleMarker>
          ))}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.id === activeId ? icons.on : icons.off}
            eventHandlers={{ click: () => onSelect && onSelect(m.id) }}
            keyboard
            title={m.label}
          >
            <Tooltip>{m.label}</Tooltip>
          </Marker>
        ))}
        {picked && (
          <CircleMarker
            center={[picked.lat, picked.lng]}
            radius={9}
            pathOptions={{
              color: '#fff',
              weight: 3,
              fillColor: '#1FA463',
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="top">
              Selected location
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
