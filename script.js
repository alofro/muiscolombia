// API Key von OpenRouteService
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Beispiel-Koordinaten für Kolumbien (Start- und Zielpunkt)
const coordinates = [
  [-74.2973, 4.5709],  // Bogotá
  [-74.0, 4.7]         // Ziel in der Nähe
];

// Karte erstellen
const map = L.map('map').setView([4.5709, -74.2973], 7);

// OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker setzen
coordinates.forEach(coord => {
  L.marker([coord[1], coord[0]]).addTo(map);
});

// Route von OpenRouteService anfragen
fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': apiKey
  },
  body: JSON.stringify({
    coordinates: coordinates
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(geojson => {
    const coords = geojson.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    L.polyline(coords, { color: 'blue' }).addTo(map);
  })
  .catch(error => {
    console.error('Fehler bei der Routenberechnung:', error);
  });
