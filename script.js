// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker-Daten aus routes.json laden
fetch('https://raw.githubusercontent.com/alofro/muiscolombia/main/routes.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
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

  })
  .catch(error => {
    console.error('Error loading the route data:', error);
  });
