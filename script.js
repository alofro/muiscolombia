// Karte erstellen
var map = L.map('map').setView([4.5709, -74.2973], 7);

// OpenStreetMap-Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker-Daten direkt im Code
const markers = [
  {
    name: "Startpunkt",
    description: "Bogotá",
    coords: [4.5709, -74.2973]
  },
  {
    name: "Zielpunkt",
    description: "Irgendwo westlich von Bogotá",
    coords: [4.7, -74.0]
  }
];

// Marker hinzufügen
markers.forEach(marker => {
  const m = L.marker(marker.coords).addTo(map);
  m.bindPopup(`<strong>${marker.name}</strong><br>${marker.description}`);
});

// Route abrufen über OpenRouteService
async function getRoute() {
  const coordinates = markers.map(m => [m.coords[1], m.coords[0]]); // [lon, lat]
  const body = {
    coordinates: coordinates
  };

  try {
    const response = await fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson', {
      method: 'POST',
      headers: {
        'Authorization': '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }

    const geojson = await response.json();
    L.geoJSON(geojson, {
      style: { color: 'blue', weight: 4 }
    }).addTo(map);

  } catch (error) {
    console.error('Fehler bei der Routenberechnung:', error);
  }
}

getRoute();
