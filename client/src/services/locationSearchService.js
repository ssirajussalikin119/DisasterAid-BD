import { districtList } from '../data/bangladeshDistricts';

// Known Bangladesh Localities for instant offline search fallback
const LOCAL_BANGLADESH_PLACES = [
  { name: 'Khilgaon', displayName: 'Khilgaon, Dhaka', districtName: 'Dhaka', latitude: 23.7516, longitude: 90.4244, type: 'locality' },
  { name: 'Mirpur', displayName: 'Mirpur, Dhaka', districtName: 'Dhaka', latitude: 23.8067, longitude: 90.3687, type: 'locality' },
  { name: 'Rajbag', displayName: 'Rajbag, Dhaka', districtName: 'Dhaka', latitude: 23.7380, longitude: 90.4190, type: 'locality' },
  { name: 'Raypur', displayName: 'Raypur, Lakshmipur', districtName: 'Lakshmipur', latitude: 23.0375, longitude: 90.7681, type: 'upazila' },
  { name: 'Keshobpur', displayName: 'Keshobpur, Jashore', districtName: 'Jashore', latitude: 22.9067, longitude: 89.2241, type: 'upazila' },
  { name: 'Dhanmondi', displayName: 'Dhanmondi, Dhaka', districtName: 'Dhaka', latitude: 23.7461, longitude: 90.3742, type: 'locality' },
  { name: 'Gulshan', displayName: 'Gulshan, Dhaka', districtName: 'Dhaka', latitude: 23.7925, longitude: 90.4078, type: 'locality' },
  { name: 'Uttara', displayName: 'Uttara, Dhaka', districtName: 'Dhaka', latitude: 23.8759, longitude: 90.3795, type: 'locality' },
  { name: 'Mohakhali', displayName: 'Mohakhali, Dhaka', districtName: 'Dhaka', latitude: 23.7778, longitude: 90.4055, type: 'locality' },
  { name: 'Sylhet Sadar', displayName: 'Sylhet Sadar, Sylhet', districtName: 'Sylhet', latitude: 24.8949, longitude: 91.8687, type: 'upazila' },
  { name: 'Chilmari', displayName: 'Chilmari, Kurigram', districtName: 'Kurigram', latitude: 25.5568, longitude: 89.6714, type: 'upazila' },
  { name: 'Kotwali', displayName: 'Kotwali, Chattogram', districtName: 'Chattogram', latitude: 22.3569, longitude: 91.7832, type: 'locality' },
  { name: 'Kalapara', displayName: 'Kalapara, Patuakhali', districtName: 'Patuakhali', latitude: 21.9861, longitude: 90.2423, type: 'upazila' },
  { name: 'Rangamati Sadar', displayName: 'Rangamati Sadar, Rangamati', districtName: 'Rangamati', latitude: 22.6533, longitude: 92.1751, type: 'upazila' },
  { name: 'Rajshahi City', displayName: 'Rajshahi City, Rajshahi', districtName: 'Rajshahi', latitude: 24.3745, longitude: 88.6042, type: 'locality' },
  { name: 'Sunamganj Sadar', displayName: 'Sunamganj Sadar, Sunamganj', districtName: 'Sunamganj', latitude: 25.0658, longitude: 91.3950, type: 'upazila' },
  { name: 'Shyamnagar', displayName: 'Shyamnagar, Satkhira', districtName: 'Satkhira', latitude: 22.3305, longitude: 89.1028, type: 'upazila' },
  { name: 'Komolganj', displayName: 'Komolganj, Moulvibazar', districtName: 'Moulvibazar', latitude: 24.3512, longitude: 91.8498, type: 'upazila' },
  { name: 'Fulchhari', displayName: 'Fulchhari, Gaibandha', districtName: 'Gaibandha', latitude: 25.1754, longitude: 89.6532, type: 'upazila' }
];

export async function searchLocations(query) {
  const trimmed = String(query ?? '').trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const results = [];

  // 1. Search local 64 Districts (which have real polygons)
  for (const d of districtList) {
    if (d.name.toLowerCase().includes(lower) || d.division.toLowerCase().includes(lower)) {
      results.push({
        id: `district-${d.name}`,
        name: d.name,
        displayName: `${d.name} District, ${d.division}`,
        type: 'district',
        districtName: d.name,
        latitude: d.centroid[0],
        longitude: d.centroid[1],
        hasPolygon: true,
      });
    }
  }

  // 2. Search local Bangladesh places/upazilas/localities
  for (const p of LOCAL_BANGLADESH_PLACES) {
    if (
      p.name.toLowerCase().includes(lower) ||
      p.displayName.toLowerCase().includes(lower)
    ) {
      // Avoid duplicate if district already matched
      if (!results.some((r) => r.name.toLowerCase() === p.name.toLowerCase() && r.type === 'district')) {
        results.push({
          id: `local-${p.name}`,
          name: p.name,
          displayName: p.displayName,
          type: p.type,
          districtName: p.districtName,
          latitude: p.latitude,
          longitude: p.longitude,
          hasPolygon: false,
        });
      }
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim API restricted to Bangladesh
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed,
    )}&countrycodes=bd&format=jsonv2&limit=6&addressdetails=1`;

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      for (const item of data) {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const name = item.name || item.display_name.split(',')[0];
          const displayName = item.display_name;

          // Deduplicate if already present
          const alreadyExists = results.some(
            (r) =>
              Math.abs(r.latitude - lat) < 0.005 && Math.abs(r.longitude - lon) < 0.005,
          );

          if (!alreadyExists) {
            const districtFromAddress = item.address?.state_district || item.address?.county || item.address?.state;
            results.push({
              id: `osm-${item.place_id}`,
              name,
              displayName,
              type: 'locality',
              districtName: districtFromAddress || null,
              latitude: lat,
              longitude: lon,
              hasPolygon: false,
            });
          }
        }
      }
    }
  } catch {
    // Network or timeout: return local results seamlessly
  }

  return results.slice(0, 8);
}
