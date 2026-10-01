/**
 * Build script: real Bangladesh administrative boundaries for DisasterAid BD.
 *
 * HOW THE FILES WERE PRODUCED
 * ---------------------------
 * 1. Source: geoBoundaries (gbOpen) BGD ADM2 (64 districts) and ADM3
 *    (544 subdistricts/upazilas), which republishes Bangladesh Bureau of
 *    Statistics (BBS) / OCHA ROAP geometry (CC BY 3.0 IGO).
 *      ADM2 metadata: https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM2
 *      ADM3 metadata: https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM3
 *    The script downloads the `*_simplified.geojson` variants linked there.
 * 2. Coordinates are rounded to 5 decimals (~1 m) and rings are simplified
 *    with Douglas-Peucker (tolerances below). No geometry is invented:
 *    every polygon comes from the source files; simplification only drops
 *    vertices.
 * 3. Upazila -> district parenting is derived by spatial join (majority vote
 *    of upazila vertices inside district polygons, bounding-box indexed).
 *    Upazilas with no containing district fall back to the nearest district
 *    centroid and are printed so the gap is visible, not hidden.
 * 4. Outputs:
 *      client/public/geo/districts.geojson
 *      client/public/geo/upazilas.geojson
 *      config/geo-areas.php (code lists for Laravel validation)
 *
 * RUN: `node client/scripts/build-geo.mjs` from the repo root.
 * Requires network access for the one-time download.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = join(ROOT, 'client', 'public', 'geo');
const CONFIG_OUT = join(ROOT, 'config', 'geo-areas.php');

const ADM2_URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM2/geoBoundaries-BGD-ADM2_simplified.geojson';
const ADM3_URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM3/geoBoundaries-BGD-ADM3_simplified.geojson';

const DISTRICT_TOLERANCE = 0.004;
const UPAZILA_TOLERANCE = 0.002;

const round5 = (n) => Math.round(n * 100000) / 100000;

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.hypot(point[0] - (start[0] + clamped * dx), point[1] - (start[1] + clamped * dy));
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points.slice();
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let maxIndex = -1;
    for (let i = first + 1; i < last; i += 1) {
      const dist = perpendicularDistance(points[i], points[first], points[last]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    if (maxDist > tolerance && maxIndex !== -1) {
      keep[maxIndex] = true;
      stack.push([first, maxIndex], [maxIndex, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function cleanRing(ring, tolerance) {
  const rounded = [];
  for (const [x, y] of ring) {
    const rx = round5(x);
    const ry = round5(y);
    const prev = rounded[rounded.length - 1];
    if (!prev || prev[0] !== rx || prev[1] !== ry) rounded.push([rx, ry]);
  }
  if (rounded.length > 2) {
    const first = rounded[0];
    const last = rounded[rounded.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) rounded.push([first[0], first[1]]);
  }
  const simplified = douglasPeucker(rounded, tolerance);
  if (simplified.length > 2) {
    const first = simplified[0];
    const last = simplified[simplified.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) simplified.push([first[0], first[1]]);
  }
  return simplified.length >= 4 ? simplified : rounded;
}

function cleanGeometry(geometry, tolerance) {
  const mapRings = (polygon) => {
    const rings = polygon.map((ring) => cleanRing(ring, tolerance)).filter((ring) => ring.length >= 4);
    return rings;
  };
  if (geometry.type === 'Polygon') {
    return { type: 'Polygon', coordinates: mapRings(geometry.coordinates) };
  }
  if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates.map(mapRings).filter((rings) => rings.length > 0);
    return { type: 'MultiPolygon', coordinates: polys };
  }
  return null;
}

function bboxOfPolygon(polygon) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of polygon) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return [minX, minY, maxX, maxY];
}

function ringContains(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContains(polygon, x, y) {
  if (polygon.length === 0 || !ringContains(polygon[0], x, y)) return false;
  for (let h = 1; h < polygon.length; h += 1) {
    if (ringContains(polygon[h], x, y)) return false;
  }
  return true;
}

function multiContains(multi, x, y) {
  for (const polygon of multi) {
    const [minX, minY, maxX, maxY] = bboxOfPolygon(polygon);
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    if (polygonContains(polygon, x, y)) return true;
  }
  return false;
}

async function downloadJson(url, label) {
  console.log(`Downloading ${label} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
  return res.json();
}

function centroidOf(rings) {
  const ring = rings[0] || [];
  if (ring.length === 0) return null;
  let cx = 0;
  let cy = 0;
  for (const [x, y] of ring) {
    cx += x;
    cy += y;
  }
  return [cx / ring.length, cy / ring.length];
}

const adm2 = await downloadJson(ADM2_URL, 'ADM2 districts');
const adm3 = await downloadJson(ADM3_URL, 'ADM3 upazilas');

const districts = [];
for (const feature of adm2.features ?? []) {
  const geometry = cleanGeometry(feature.geometry, DISTRICT_TOLERANCE);
  if (!geometry) continue;
  const code = String(feature.properties?.shapeID ?? '');
  const name = String(feature.properties?.shapeName ?? '');
  if (!code || !name) continue;
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  districts.push({ code, name_en: name, geometry, polys });
}
console.log(`Districts kept: ${districts.length}`);

const districtIndex = districts.map((d) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const polygon of d.polys) {
    const [x0, y0, x1, y1] = bboxOfPolygon(polygon);
    if (x0 < minX) minX = x0;
    if (y0 < minY) minY = y0;
    if (x1 > maxX) maxX = x1;
    if (y1 > maxY) maxY = y1;
  }
  return { ...d, bbox: [minX, minY, maxX, maxY] };
});

const upazilas = [];
const unmatched = [];
for (const feature of adm3.features ?? []) {
  const geometry = cleanGeometry(feature.geometry, UPAZILA_TOLERANCE);
  if (!geometry) continue;
  const code = String(feature.properties?.shapeID ?? '');
  const name = String(feature.properties?.shapeName ?? '');
  if (!code || !name) continue;
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  const votes = new Map();
  for (const polygon of polys) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        for (const d of districtIndex) {
          const [minX, minY, maxX, maxY] = d.bbox;
          if (x < minX || x > maxX || y < minY || y > maxY) continue;
          if (multiContains(d.polys, x, y)) {
            votes.set(d.code, (votes.get(d.code) ?? 0) + 1);
            break;
          }
        }
      }
    }
  }

  let parent = null;
  let best = 0;
  for (const [districtCode, count] of votes) {
    if (count > best) {
      best = count;
      parent = districtCode;
    }
  }

  if (!parent) {
    const centroid = centroidOf(polys[0]);
    let nearest = null;
    let nearestDist = Infinity;
    for (const d of districts) {
      const c = centroidOf(d.polys[0]);
      if (!c || !centroid) continue;
      const dist = Math.hypot(c[0] - centroid[0], c[1] - centroid[1]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = d.code;
      }
    }
    parent = nearest;
    unmatched.push(name);
  }

  upazilas.push({ code, name_en: name, parent_district_code: parent, geometry });
}
console.log(`Upazilas kept: ${upazilas.length}`);
if (unmatched.length > 0) {
  console.log(`Upazilas without containing district (nearest-centroid fallback): ${unmatched.join(', ')}`);
}

const districtByCode = new Map(districts.map((d) => [d.code, d]));

const districtsGeojson = {
  type: 'FeatureCollection',
  features: districts.map((d) => ({
    type: 'Feature',
    properties: { code: d.code, name_en: d.name_en },
    geometry: d.geometry,
  })),
};

const upazilasGeojson = {
  type: 'FeatureCollection',
  features: upazilas.map((u) => ({
    type: 'Feature',
    properties: {
      code: u.code,
      name_en: u.name_en,
      parent_district_code: u.parent_district_code,
      parent_district_name: districtByCode.get(u.parent_district_code)?.name_en ?? null,
    },
    geometry: u.geometry,
  })),
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'districts.geojson'), JSON.stringify(districtsGeojson));
writeFileSync(join(OUT_DIR, 'upazilas.geojson'), JSON.stringify(upazilasGeojson));

const phpList = (codes) => `['${codes.join("', '")}']`;
const configPhp = `<?php

declare(strict_types=1);

// GENERATED by client/scripts/build-geo.mjs from geoBoundaries BGD ADM2/ADM3.
// Do not edit by hand; regenerate with the script.
return [
    'districts' => ${phpList(districts.map((d) => d.code))},
    'upazilas' => ${phpList(upazilas.map((u) => u.code))},
];
`;
writeFileSync(CONFIG_OUT, configPhp);

console.log('Wrote client/public/geo/districts.geojson, upazilas.geojson and config/geo-areas.php');
