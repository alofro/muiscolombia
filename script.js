// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker-Icons definieren
const icons = {
  etapa: L.AwesomeMarkers.icon({ icon: 'flag', markerColor: 'green', prefix: 'fa' }),
  pinchazo: L.AwesomeMarkers.icon({ icon: 'wrench', markerColor: 'red', prefix: 'fa' }),
  foto: L.AwesomeMarkers.icon({ icon: 'camera', markerColor: 'blue', prefix: 'fa' })
};

// GeoJSON-Daten aus der Datei laden und auf der Karte darstellen
fetch('data/route.geojson')
  .then(response => response.json())
  .then(data => {
    if (data.features && data.features.length > 0) {
      const routeCoordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
    } else {
      console.error("Keine gültige Route in der GeoJSON-Datei gefunden.");
    }
  })
  .catch(error => {
    console.error('Fehler beim Laden der GeoJSON-Datei:', error);
  });

// Marker aus points.json hinzufügen
fetch('data/points.json')
  .then(response => response.json())
  .then(routePoints => {
    routePoints.forEach(point => {
      let markerOptions = {};

      if (point.type && icons[point.type]) {
        markerOptions.icon = icons[point.type];
      } else if (point.type !== 'start') {
        console.warn(`Kein gültiges Icon für den Typ "${point.type}" gefunden, Standard-Icon wird verwendet.`);
      }

      const marker = L.marker([point.lat, point.lon], markerOptions).addTo(map);

      // Popup-Inhalt
      let popupContent = `<div style="width: 200px;">`;

      // Bild, falls vorhanden
      if (point.image) {
        popupContent += `<img src="bilder/${point.image}" alt="${point.name || ''}" style="width: 100%; border-radius: 8px; margin-bottom: 5px;">`;
      }

      // Name des Markers
      if (point.name) {
        popupContent += `<strong>${point.name}</strong><br>`;
      }

      // Beschreibung
      if (point.description) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.description}</p>`;
      }

      // Optionaler Text
      if (point.text) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.text}</p>`;
      }

      popupContent += `</div>`;
      marker.bindPopup(popupContent);
    });
  })
  .catch(error => {
    console.error('Fehler beim Laden der Punkte-Datei:', error);
  });
