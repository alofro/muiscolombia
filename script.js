// API Key von OpenRouteService
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Koordinaten der Marker
const coordinates = [
  [-74.2973, 4.5709],  // Startpunkt
  [-74.0, 4.7]         // Zielpunkt
];

// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker-Daten aus routes.json laden
fetch('https://raw.githubusercontent.com/alofro/muiscolombia/main/routes.json')
  .then(response => response.json())
  .then(data => {
    // Marker hinzufügen
    data.features.forEach(function (feature) {
      const coords = feature.geometry.coordinates;
      const latLng = [coords[1], coords[0]]; // Koordinaten umkehren, weil GeoJSON [lon, lat] ist

      // Marker erstellen und hinzufügen
      const marker = L.marker(latLng).addTo(map);
      const popupContent = `<strong>${feature.properties.name}</strong><br>Etappe: ${feature.properties.description}`;
      marker.bindPopup(popupContent);
    });

    // Route zwischen den Markern zeichnen
    const routeCoordinates = data.features.map(function (feature) {
      const coords = feature.geometry.coordinates;
      return [coords[1], coords[0]]; // Koordinaten umkehren
    });

    // Linie zwischen den Markern hinzufügen
    L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);

    // POST-Anfrage an OpenRouteService API senden
    const routeRequestBody = {
      "coordinates": coordinates,
      "profile": "cycling-regular"
    };

    fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson?api_key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(routeRequestBody)
    })
    .then(response => response.json())
    .then(routeData => {
      if (routeData.type === 'FeatureCollection') {
        // Routen-Daten sind im GeoJSON-Format
        const routeCoordinates = routeData.features[0].geometry.coordinates.map(function (coord) {
          return [coord[1], coord[0]]; // Umkehren der Koordinaten
        });

        // Route auf der Karte darstellen
        L.polyline(routeCoordinates, { color: 'red' }).addTo(map);
      } else {
        console.error('Ungültiges GeoJSON von der API');
      }
    })
    .catch(error => {
      console.error('Fehler bei der Routenberechnung:', error);
    });
  })
  .catch(error => {
    console.error('Error loading the route data:', error);
  });
