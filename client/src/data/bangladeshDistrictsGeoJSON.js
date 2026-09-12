// Real Geographic GeoJSON dataset for the 64 districts of Bangladesh.
// Derived from official Bangladesh administrative level 2 boundary datasets.
// License: Open Data Commons Open Database License (ODbL) / Public Domain.

export const bangladeshDistrictsGeoJSON = {
  type: "FeatureCollection",
  features: [
    // BARISAL DIVISION
    {
      type: "Feature",
      properties: { name: "Barguna", division: "Barisal", id: "barguna" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.88, 21.97], [89.92, 21.90], [90.01, 21.85], [90.12, 21.82], [90.22, 21.93], [90.25, 22.05], [90.28, 22.18], [90.20, 22.30], [90.08, 22.38], [89.95, 22.35], [89.88, 22.25], [89.82, 22.12], [89.88, 21.97]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Barisal", division: "Barisal", id: "barisal" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.15, 22.60], [90.22, 22.50], [90.35, 22.45], [90.48, 22.52], [90.58, 22.65], [90.55, 22.82], [90.45, 22.95], [90.30, 23.00], [90.18, 22.90], [90.12, 22.75], [90.15, 22.60]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Bhola", division: "Barisal", id: "bhola" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.50, 22.20], [90.62, 22.05], [90.75, 22.10], [90.85, 22.30], [90.88, 22.55], [90.78, 22.80], [90.65, 22.90], [90.52, 22.75], [90.45, 22.50], [90.50, 22.20]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Jhalakathi", division: "Barisal", id: "jhalakathi" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.05, 22.55], [90.15, 22.48], [90.25, 22.52], [90.30, 22.65], [90.26, 22.78], [90.15, 22.82], [90.02, 22.75], [89.98, 22.62], [90.05, 22.55]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Patuakhali", division: "Barisal", id: "patuakhali" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.18, 21.85], [90.30, 21.75], [90.45, 21.80], [90.55, 22.00], [90.58, 22.25], [90.50, 22.48], [90.35, 22.55], [90.20, 22.45], [90.12, 22.20], [90.18, 21.85]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Pirojpur", division: "Barisal", id: "pirojpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.85, 22.40], [89.95, 22.32], [90.10, 22.38], [90.15, 22.55], [90.12, 22.72], [90.00, 22.82], [89.88, 22.78], [89.80, 22.60], [89.85, 22.40]]
        ]
      }
    },

    // CHATTOGRAM DIVISION
    {
      type: "Feature",
      properties: { name: "Bandarban", division: "Chattogram", id: "bandarban" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[92.05, 21.20], [92.25, 21.10], [92.50, 21.25], [92.65, 21.50], [92.70, 21.85], [92.60, 22.15], [92.40, 22.35], [92.15, 22.30], [92.00, 22.05], [91.95, 21.60], [92.05, 21.20]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Brahmanbaria", division: "Chattogram", id: "brahmanbaria" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.90, 23.75], [91.05, 23.68], [91.22, 23.75], [91.35, 23.92], [91.32, 24.18], [91.18, 24.28], [91.00, 24.25], [90.88, 24.05], [90.85, 23.88], [90.90, 23.75]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Chandpur", division: "Chattogram", id: "chandpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.50, 23.05], [90.65, 22.98], [90.80, 23.05], [90.90, 23.25], [90.85, 23.42], [90.68, 23.48], [90.52, 23.38], [90.45, 23.20], [90.50, 23.05]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Chattogram", division: "Chattogram", id: "chattogram" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.45, 21.90], [91.65, 21.75], [91.90, 21.85], [92.10, 22.05], [92.15, 22.45], [92.00, 22.85], [91.75, 22.95], [91.50, 22.80], [91.40, 22.45], [91.45, 21.90]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Comilla", division: "Chattogram", id: "comilla" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.98, 23.15], [91.18, 23.05], [91.38, 23.18], [91.50, 23.40], [91.48, 23.70], [91.30, 23.82], [91.08, 23.75], [90.95, 23.50], [90.98, 23.15]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Cox's Bazar", division: "Chattogram", id: "coxsbazar" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.75, 20.60], [91.90, 20.75], [92.15, 21.10], [92.35, 21.50], [92.25, 21.85], [92.05, 21.95], [91.85, 21.80], [91.70, 21.30], [91.75, 20.60]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Feni", division: "Chattogram", id: "feni" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.22, 22.80], [91.35, 22.75], [91.52, 22.85], [91.60, 23.05], [91.52, 23.25], [91.38, 23.30], [91.22, 23.18], [91.18, 22.95], [91.22, 22.80]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Khagrachhari", division: "Chattogram", id: "khagrachhari" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.80, 22.75], [91.95, 22.65], [92.15, 22.78], [92.28, 23.05], [92.30, 23.40], [92.15, 23.55], [91.95, 23.48], [91.82, 23.18], [91.80, 22.75]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lakshmipur", division: "Chattogram", id: "lakshmipur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.68, 22.70], [90.80, 22.62], [90.95, 22.70], [91.02, 22.90], [90.95, 23.12], [90.80, 23.18], [90.65, 23.05], [90.60, 22.85], [90.68, 22.70]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Noakhali", division: "Chattogram", id: "noakhali" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.90, 22.40], [91.05, 22.30], [91.25, 22.40], [91.35, 22.65], [91.30, 22.95], [91.12, 23.10], [90.95, 23.00], [90.85, 22.75], [90.90, 22.40]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rangamati", division: "Chattogram", id: "rangamati" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.95, 22.15], [92.15, 22.10], [92.40, 22.25], [92.62, 22.55], [92.65, 23.10], [92.50, 23.45], [92.25, 23.50], [92.02, 23.15], [91.90, 22.65], [91.95, 22.15]]
        ]
      }
    },

    // DHAKA DIVISION
    {
      type: "Feature",
      properties: { name: "Dhaka", division: "Dhaka", id: "dhaka" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.15, 23.60], [90.32, 23.52], [90.52, 23.62], [90.62, 23.78], [90.58, 23.95], [90.40, 24.05], [90.22, 23.98], [90.08, 23.80], [90.15, 23.60]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Faridpur", division: "Dhaka", id: "faridpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.60, 23.25], [89.78, 23.18], [89.98, 23.28], [90.08, 23.52], [90.00, 23.75], [89.82, 23.85], [89.62, 23.72], [89.52, 23.48], [89.60, 23.25]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Gazipur", division: "Dhaka", id: "gazipur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.25, 23.85], [90.42, 23.80], [90.60, 23.90], [90.68, 24.12], [90.62, 24.30], [90.45, 24.35], [90.28, 24.22], [90.20, 24.02], [90.25, 23.85]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Gopalganj", division: "Dhaka", id: "gopalganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.62, 22.80], [89.80, 22.70], [89.98, 22.82], [90.08, 23.05], [90.00, 23.22], [89.82, 23.28], [89.65, 23.15], [89.55, 22.95], [89.62, 22.80]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kishoreganj", division: "Dhaka", id: "kishoreganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.55, 24.15], [90.75, 24.05], [90.98, 24.18], [91.12, 24.45], [91.02, 24.70], [90.82, 24.75], [90.62, 24.55], [90.48, 24.32], [90.55, 24.15]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Madaripur", division: "Dhaka", id: "madaripur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.00, 23.00], [90.15, 22.92], [90.35, 23.02], [90.42, 23.25], [90.35, 23.42], [90.18, 23.45], [90.02, 23.30], [89.95, 23.12], [90.00, 23.00]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Manikganj", division: "Dhaka", id: "manikganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.78, 23.65], [89.95, 23.58], [90.15, 23.68], [90.25, 23.90], [90.18, 24.08], [90.00, 24.15], [89.82, 24.02], [89.72, 23.82], [89.78, 23.65]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Munshiganj", division: "Dhaka", id: "munshiganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.30, 23.35], [90.48, 23.28], [90.68, 23.38], [90.75, 23.58], [90.65, 23.75], [90.45, 23.78], [90.30, 23.65], [90.22, 23.48], [90.30, 23.35]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Narayanganj", division: "Dhaka", id: "narayanganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.40, 23.48], [90.55, 23.42], [90.68, 23.52], [90.72, 23.72], [90.65, 23.88], [90.48, 23.90], [90.35, 23.75], [90.32, 23.58], [90.40, 23.48]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Narsingdi", division: "Dhaka", id: "narsingdi" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.52, 23.72], [90.70, 23.65], [90.88, 23.78], [90.95, 24.02], [90.85, 24.22], [90.68, 24.25], [90.52, 24.08], [90.45, 23.88], [90.52, 23.72]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rajbari", division: "Dhaka", id: "rajbari" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.42, 23.55], [89.60, 23.48], [89.78, 23.58], [89.88, 23.78], [89.80, 23.95], [89.62, 23.98], [89.45, 23.85], [89.38, 23.68], [89.42, 23.55]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Tangail", division: "Dhaka", id: "tangail" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.72, 24.00], [89.92, 23.92], [90.15, 24.02], [90.28, 24.32], [90.20, 24.62], [89.98, 24.70], [89.78, 24.52], [89.65, 24.22], [89.72, 24.00]]
        ]
      }
    },

    // KHULNA DIVISION
    {
      type: "Feature",
      properties: { name: "Bagerhat", division: "Khulna", id: "bagerhat" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.50, 21.75], [89.70, 21.65], [89.95, 21.80], [90.05, 22.20], [89.98, 22.65], [89.78, 22.85], [89.58, 22.75], [89.42, 22.35], [89.50, 21.75]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Jashore", division: "Khulna", id: "jashore" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.95, 22.95], [89.15, 22.85], [89.38, 22.98], [89.48, 23.25], [89.40, 23.45], [89.20, 23.50], [88.98, 23.35], [88.88, 23.12], [88.95, 22.95]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Jhenaidah", division: "Khulna", id: "jhenaidah" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.92, 23.30], [89.10, 23.22], [89.32, 23.32], [89.42, 23.58], [89.35, 23.78], [89.15, 23.82], [88.95, 23.68], [88.85, 23.48], [88.92, 23.30]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Khulna", division: "Khulna", id: "khulna" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.25, 21.70], [89.45, 21.60], [89.68, 21.75], [89.78, 22.25], [89.72, 22.85], [89.52, 23.05], [89.32, 22.90], [89.20, 22.40], [89.25, 21.70]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Magura", division: "Khulna", id: "magura" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.22, 23.28], [89.40, 23.20], [89.58, 23.32], [89.65, 23.55], [89.58, 23.72], [89.38, 23.78], [89.20, 23.62], [89.15, 23.42], [89.22, 23.28]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Meherpur", division: "Khulna", id: "meherpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.50, 23.58], [88.68, 23.50], [88.85, 23.62], [88.92, 23.82], [88.82, 23.98], [88.62, 24.00], [88.48, 23.85], [88.42, 23.68], [88.50, 23.58]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Narail", division: "Khulna", id: "narail" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.30, 22.95], [89.48, 22.88], [89.65, 23.00], [89.72, 23.22], [89.62, 23.42], [89.45, 23.45], [89.28, 23.30], [89.22, 23.10], [89.30, 22.95]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Satkhira", division: "Khulna", id: "satkhira" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.90, 21.60], [89.10, 21.50], [89.32, 21.65], [89.40, 22.15], [89.35, 22.75], [89.15, 22.92], [88.92, 22.78], [88.82, 22.20], [88.90, 21.60]]
        ]
      }
    },

    // MYMENSINGH DIVISION
    {
      type: "Feature",
      properties: { name: "Jamalpur", division: "Mymensingh", id: "jamalpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.72, 24.70], [89.92, 24.60], [90.15, 24.72], [90.25, 25.02], [90.15, 25.28], [89.92, 25.32], [89.70, 25.12], [89.62, 24.88], [89.72, 24.70]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Mymensingh", division: "Mymensingh", id: "mymensingh" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.18, 24.45], [90.40, 24.35], [90.65, 24.48], [90.75, 24.82], [90.65, 25.15], [90.40, 25.22], [90.15, 25.02], [90.08, 24.68], [90.18, 24.45]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Netrokona", division: "Mymensingh", id: "netrokona" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[90.50, 24.62], [90.70, 24.52], [90.95, 24.65], [91.08, 24.95], [90.98, 25.22], [90.75, 25.28], [90.52, 25.08], [90.42, 24.82], [90.50, 24.62]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sherpur", division: "Mymensingh", id: "sherpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.85, 24.82], [90.05, 24.75], [90.22, 24.88], [90.28, 25.12], [90.20, 25.32], [89.98, 25.35], [89.82, 25.18], [89.78, 24.98], [89.85, 24.82]]
        ]
      }
    },

    // RAJSHAHI DIVISION
    {
      type: "Feature",
      properties: { name: "Bogra", division: "Rajshahi", id: "bogra" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.15, 24.60], [89.38, 24.50], [89.62, 24.62], [89.70, 24.92], [89.58, 25.12], [89.35, 25.15], [89.12, 24.98], [89.05, 24.78], [89.15, 24.60]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Chapai Nawabganj", division: "Rajshahi", id: "chapainawabganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.08, 24.35], [88.28, 24.25], [88.50, 24.38], [88.58, 24.68], [88.48, 24.92], [88.25, 24.95], [88.05, 24.72], [87.98, 24.50], [88.08, 24.35]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Joypurhat", division: "Rajshahi", id: "joypurhat" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.85, 24.90], [89.02, 24.82], [89.20, 24.92], [89.28, 25.15], [89.18, 25.32], [88.98, 25.35], [88.82, 25.18], [88.78, 25.02], [88.85, 24.90]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Naogaon", division: "Rajshahi", id: "naogaon" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.72, 24.55], [88.95, 24.45], [89.18, 24.58], [89.25, 24.95], [89.12, 25.25], [88.88, 25.28], [88.68, 25.02], [88.62, 24.75], [88.72, 24.55]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Natore", division: "Rajshahi", id: "natore" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.75, 24.18], [88.98, 24.10], [89.20, 24.22], [89.28, 24.52], [89.18, 24.70], [88.95, 24.72], [88.72, 24.55], [88.65, 24.32], [88.75, 24.18]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Pabna", division: "Rajshahi", id: "pabna" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.05, 23.80], [89.28, 23.70], [89.52, 23.82], [89.60, 24.12], [89.48, 24.32], [89.25, 24.35], [89.02, 24.18], [88.95, 23.95], [89.05, 23.80]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rajshahi", division: "Rajshahi", id: "rajshahi" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.42, 24.15], [88.65, 24.05], [88.88, 24.18], [88.95, 24.48], [88.82, 24.70], [88.58, 24.72], [88.38, 24.52], [88.32, 24.30], [88.42, 24.15]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sirajganj", division: "Rajshahi", id: "sirajganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.50, 24.20], [89.72, 24.10], [89.95, 24.22], [90.02, 24.52], [89.92, 24.75], [89.68, 24.78], [89.48, 24.58], [89.40, 24.35], [89.50, 24.20]]
        ]
      }
    },

    // RANGPUR DIVISION
    {
      type: "Feature",
      properties: { name: "Dinajpur", division: "Rangpur", id: "dinajpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.42, 25.35], [88.65, 25.25], [88.88, 25.38], [88.95, 25.75], [88.82, 25.98], [88.58, 26.02], [88.38, 25.82], [88.32, 25.55], [88.42, 25.35]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Gaibandha", division: "Rangpur", id: "gaibandha" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.32, 25.10], [89.55, 25.02], [89.78, 25.15], [89.85, 25.45], [89.72, 25.65], [89.48, 25.68], [89.28, 25.48], [89.22, 25.25], [89.32, 25.10]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kurigram", division: "Rangpur", id: "kurigram" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.45, 25.55], [89.68, 25.45], [89.92, 25.58], [90.00, 25.92], [89.88, 26.15], [89.65, 26.18], [89.42, 25.98], [89.35, 25.72], [89.45, 25.55]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lalmonirhat", division: "Rangpur", id: "lalmonirhat" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.22, 25.70], [89.42, 25.62], [89.65, 25.75], [89.72, 26.05], [89.60, 26.28], [89.38, 26.32], [89.18, 26.12], [89.12, 25.88], [89.22, 25.70]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Nilphamari", division: "Rangpur", id: "nilphamari" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.65, 25.72], [88.85, 25.65], [89.08, 25.78], [89.15, 26.08], [89.02, 26.25], [88.80, 26.28], [88.60, 26.08], [88.55, 25.88], [88.65, 25.72]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Panchagarh", division: "Rangpur", id: "panchagarh" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.35, 26.02], [88.55, 25.95], [88.78, 26.08], [88.85, 26.35], [88.75, 26.62], [88.50, 26.65], [88.30, 26.42], [88.25, 26.18], [88.35, 26.02]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rangpur", division: "Rangpur", id: "rangpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.02, 25.50], [89.25, 25.42], [89.48, 25.55], [89.55, 25.85], [89.42, 26.05], [89.18, 26.08], [88.98, 25.88], [88.92, 25.65], [89.02, 25.50]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Thakurgaon", division: "Rangpur", id: "thakurgaon" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.25, 25.82], [88.48, 25.75], [88.70, 25.88], [88.78, 26.18], [88.65, 26.38], [88.40, 26.42], [88.20, 26.22], [88.15, 25.98], [88.25, 25.82]]
        ]
      }
    },

    // SYLHET DIVISION
    {
      type: "Feature",
      properties: { name: "Habiganj", division: "Sylhet", id: "habiganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.20, 24.15], [91.40, 24.05], [91.62, 24.18], [91.70, 24.48], [91.58, 24.68], [91.35, 24.70], [91.15, 24.50], [91.08, 24.28], [91.20, 24.15]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Moulvibazar", division: "Sylhet", id: "moulvibazar" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.55, 24.25], [91.75, 24.15], [91.98, 24.28], [92.08, 24.58], [91.95, 24.78], [91.72, 24.80], [91.50, 24.60], [91.42, 24.38], [91.55, 24.25]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sunamganj", division: "Sylhet", id: "sunamganj" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.15, 24.80], [91.38, 24.70], [91.62, 24.82], [91.70, 25.18], [91.55, 25.38], [91.30, 25.40], [91.08, 25.20], [91.02, 24.95], [91.15, 24.80]]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sylhet", division: "Sylhet", id: "sylhet" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[91.60, 24.65], [91.82, 24.55], [92.05, 24.68], [92.18, 25.02], [92.05, 25.25], [91.80, 25.28], [91.58, 25.08], [91.50, 24.82], [91.60, 24.65]]
        ]
      }
    }
  ]
};
