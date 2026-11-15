// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Grid-cell sizes in degrees (latitude x longitude).
const POWER_CELL = [0.5, 0.625]; // NASA POWER / MERRA-2
const IMERG_CELL = [0.1, 0.1]; // GPM IMERG
const box = (lat, lon, [dLat, dLon]) => [[lat - dLat / 2, lon - dLon / 2], [lat + dLat / 2, lon + dLon / 2]];

// Small map that shows how coarse the gridded data is next to the town.
// Boxes are drawn centred on the point to show cell size, not the exact grid position.
export default function ResolutionMap({ location }) {
  const el = useRef(null);
  useEffect(() => {
    const { lat, lon } = location;
    const map = L.map(el.current, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 13, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    const power = L.rectangle(box(lat, lon, POWER_CELL), { color: '#0072B2', weight: 3, fillOpacity: 0.08 }).addTo(map)
      .bindTooltip('NASA POWER cell size: 0.5° x 0.625° (about 55 x 66 km)');
    L.rectangle(box(lat, lon, IMERG_CELL), { color: '#D55E00', weight: 3, fillOpacity: 0.15 }).addTo(map)
      .bindTooltip('GPM IMERG cell size: 0.1° (about 11 km)');
    L.circleMarker([lat, lon], { radius: 7, color: '#1c1917', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }).addTo(map)
      .bindTooltip(`${location.name} (${lat}, ${lon})`);
    map.fitBounds(power.getBounds(), { padding: [16, 16] });
    return () => map.remove();
  }, [location]);
  return (
    <div>
      <div ref={el} className="h-80 w-full overflow-hidden rounded-xl border border-stone-300" role="img"
        aria-label={`Map of ${location.name} with one NASA POWER grid cell and one GPM IMERG grid cell drawn around it`} />
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border-2 border-stone-900 bg-white" />Modelled point (town centre)</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-3 w-5 border-2" style={{ borderColor: '#0072B2' }} />One NASA POWER cell (0.5° x 0.625°)</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-3 w-3 border-2" style={{ borderColor: '#D55E00' }} />One GPM IMERG cell (0.1°)</li>
      </ul>
      <p className="mt-2 text-sm">Everything inside the blue box shares one NASA POWER value, so two farms many kilometres apart get the same numbers. The boxes are centred on the point to show cell size; the real grid lines fall elsewhere. Map tiles © OpenStreetMap contributors.</p>
    </div>
  );
}
