import { bangladeshDistrictsGeoJSON } from './bangladeshDistrictsGeoJSON';

function computeCentroid(coords) {
  const ring = coords[0] || [];
  if (ring.length === 0) return [23.7, 90.4];
  let cx = 0;
  let cy = 0;
  for (const [x, y] of ring) {
    cx += x;
    cy += y;
  }
  return [cy / ring.length, cx / ring.length];
}

export const bangladeshDistricts = bangladeshDistrictsGeoJSON;

export const districtList = bangladeshDistrictsGeoJSON.features.map((feature) => ({
  name: feature.properties.name,
  division: feature.properties.division,
  centroid: computeCentroid(feature.geometry.coordinates),
  rawCoords: feature.geometry.coordinates,
}));
