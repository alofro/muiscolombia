// Karte initialisieren
var map = L.map('map').setView([4.5709, -74.2973], 7); // Zentrale Koordinaten für Kolumbien

// OpenStreetMap-Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// API-Key für OpenRouteService
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Funktion zum Abrufen und Anzeigen der Route
async function getRoute(coordinates) {
  const url = 'https://api.openrouteservice.org/v2/directions/cycling-regular/';

  const body = {
    coordinates: coordinates
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status}`);
  }

  const geojson = await response.json();

  // Route auf der Karte anzeigen
  L.geoJSON(geojson, {
    style: {
      color: 'blue',
      weight: 4
    }
  }).addTo(map);
}

// Marker und Route laden
fetch('https://raw.githubusercontent.com/alofro/muiscolombia/main/routes.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Netzwerkfehler beim Laden der routes.json');
    }
    return response.json();
  })
  .then(data => {
    const coordinates = [];

    data.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      coordinates.push([lng, lat]);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.description}`);
    });

    return getRoute(coordinates);
  })
  .catch(error => {
    console.error('Fehler bei der Routenberechnung:', error);
  });
