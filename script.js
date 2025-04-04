// Dein API-Key
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

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
    // Konsolenausgabe, um den Inhalt zu überprüfen
    console.log('GeoJSON Daten:', data);  // Ausgabe des geladenen JSON-Daten
    
    // Marker hinzufügen
    data.features.forEach(function (feature) {
      const coords = feature.geometry.coordinates;
      const latLng = [coords[1], coords[0]]; // Keine Umkehrung nötig, weil GeoJSON bereits [lon, lat] ist

      // Marker erstellen und hinzufügen
      const marker = L.marker(latLng).addTo(map);
      const popupContent = `<strong>${feature.properties.name}</strong><br>Etappe: ${feature.properties.description}`;
      marker.bindPopup(popupContent);
    });

    // Route zwischen den Markern zeichnen
    const routeCoordinates = data.features.map(function (feature) {
      const coords = feature.geometry.coordinates;
      return [coords[1], coords[0]]; // Koordinaten umkehren, falls nötig
    });

    // Wenn du Routen über die OpenRouteService API berechnen möchtest:
    const coordinatesForRoute = routeCoordinates.map(coord => [coord[1], coord[0]]); // ggf. wieder [lat, lon] umkehren
    const body = {
      coordinates: coordinatesForRoute
    };

    // Routenanfrage an OpenRouteService
    fetch(`https://api.openrouteservice.org/v2/directions/cycling-regular/geojson?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(routeData => {
      // Konsolenausgabe der API-Antwort
      console.log('API-Antwort von OpenRouteService:', routeData);  // Ausgabe der API-Antwort
      
      // Überprüfe, ob die Antwort den erwarteten GeoJSON-Standard erfüllt
      if (!routeData || !routeData.features || !Array.isArray(routeData.features)) {
        throw new Error('Ungültiges GeoJSON-Datenformat von der API');
      }

      // Route von OpenRouteService zeichnen
      L.geoJSON(routeData).addTo(map);
    })
    .catch(error => {
      console.error('Fehler bei der Routenberechnung:', error);
    });

    // Linie zwischen den Markern hinzufügen (falls keine API-Route benötigt wird)
    L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);

  })
  .catch(error => {
    console.error('Fehler beim Laden der Routen-Daten:', error);
  });
