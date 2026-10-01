import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const geoUrl = (file) => `${import.meta.env.BASE_URL}geo/${file}`;

let cache = null;
let inflight = null;

function bboxOfGeometry(geometry) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const part of coords) visit(part);
  };
  visit(geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

function indexFeatures(features) {
  return features.map((feature) => ({ feature, bbox: bboxOfGeometry(feature.geometry) }));
}

export async function loadAreas() {
  if (cache) return cache;
  if (!inflight) {
    inflight = (async () => {
      const [districtsRes, upazilasRes] = await Promise.all([
        fetch(geoUrl('districts.geojson')),
        fetch(geoUrl('upazilas.geojson')),
      ]);
      if (!districtsRes.ok || !upazilasRes.ok) {
        throw new Error('Boundary files could not be loaded.');
      }
      const [districts, upazilas] = await Promise.all([districtsRes.json(), upazilasRes.json()]);
      cache = {
        districts: indexFeatures(districts.features ?? []),
        upazilas: indexFeatures(upazilas.features ?? []),
      };
      return cache;
    })().catch((error) => {
      inflight = null;
      throw error;
    });
  }
  return inflight;
}

export function clearAreaCache() {
  cache = null;
  inflight = null;
}

function pointInIndexed(indexed, lng, lat) {
  const point = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [lng, lat] },
  };
  for (const { feature, bbox } of indexed) {
    if (lng < bbox[0] || lng > bbox[2] || lat < bbox[1] || lat > bbox[3]) continue;
    if (booleanPointInPolygon(point, feature)) return feature;
  }
  return null;
}

export async function findAreaByPoint(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return { district: null, upazila: null };
  }
  const areas = await loadAreas();
  const upazila = pointInIndexed(areas.upazilas, lngNum, latNum);
  let district = null;
  if (upazila?.properties?.parent_district_code) {
    district =
      areas.districts.find(
        (entry) => entry.feature.properties.code === upazila.properties.parent_district_code,
      )?.feature ?? null;
  }
  if (!district) {
    district = pointInIndexed(areas.districts, lngNum, latNum);
  }
  return { district, upazila };
}

export async function getAreaBounds(code) {
  const areas = await loadAreas();
  const entry = [...areas.upazilas, ...areas.districts].find(
    (item) => item.feature.properties.code === code,
  );
  if (!entry) return null;
  const [minX, minY, maxX, maxY] = entry.bbox;
  return [
    [minY, minX],
    [maxY, maxX],
  ];
}

export async function listDistricts() {
  const areas = await loadAreas();
  return areas.districts
    .map((entry) => ({
      code: entry.feature.properties.code,
      name_en: entry.feature.properties.name_en,
    }))
    .sort((a, b) => a.name_en.localeCompare(b.name_en));
}

export async function getDistrictFeatures() {
  const areas = await loadAreas();
  return areas.districts.map((entry) => entry.feature);
}

export async function getUpazilaFeatures(districtCode) {
  const areas = await loadAreas();
  return areas.upazilas
    .filter((entry) => entry.feature.properties.parent_district_code === districtCode)
    .map((entry) => entry.feature);
}

export async function listUpazilas(districtCode) {
  const areas = await loadAreas();
  return areas.upazilas
    .filter((entry) => entry.feature.properties.parent_district_code === districtCode)
    .map((entry) => ({
      code: entry.feature.properties.code,
      name_en: entry.feature.properties.name_en,
      parent_district_code: entry.feature.properties.parent_district_code,
      parent_district_name: entry.feature.properties.parent_district_name,
    }))
    .sort((a, b) => a.name_en.localeCompare(b.name_en));
}
