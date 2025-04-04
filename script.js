// Funktion, um die Routen aus der JSON-Datei zu laden
fetch('https://raw.githubusercontent.com/alofro/muiscolombia/refs/heads/main/routes.js')
  .then(response => response.json())
  .then(data => {
    // Hier werden die Marker auf der Karte gesetzt
    let routeCoords = [];
    data.forEach(point => {
      routeCoords.push(point.coordinates);
      L.marker(point.coordinates)
        .addTo(map)
        .bindPopup(point.name);  // Setzt den Namen als Popup
    });

    // Zeigt die Route auf der Karte an
    L.polyline(routeCoords, {color: 'blue'}).addTo(map);
  })
  .catch(error => {
    console.error('Error loading the route data:', error);
  });
