// Karte initialisieren
const map = L.map('map').setView([4.60971, -74.08175], 9);

// OpenStreetMap-Layer hinzufügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Dein OpenRouteService API-Key
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Daten aus routes.json laden
fetch('routes.json')
  .then(response => response.json())
  .then(async data => {
    const coords = data.map(point => point.coordinates);
    const latlngs = [];

    data.forEach((point, index) => {
      const marker = L.marker(point.coordinates).addTo(map);
      marker.bindPopup(`${index + 1}. Etappe: ${point.name}`);
    });

    // Anfrage an OpenRouteService
    const response = await fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: coords
      })
    });

    const geojson = await response.json();

    // Route auf der Karte darstellen
    const route = L.geoJSON(geojson, {
      style: {
        color: 'blue',
        weight: 4
      }
    }).addTo(map);

    map.fitBounds(route.getBounds());
  })
  .catch(error => {
    console.error('Error loading the route data:', error);
  });
