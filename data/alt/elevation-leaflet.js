// elevation-leaflet.js

// Icons für die Etappen und Zwischenfälle
const icons = {
  etapa: L.AwesomeMarkers.icon({ icon: 'flag', markerColor: 'green', prefix: 'fa' }),
  pinchazo: L.AwesomeMarkers.icon({ icon: 'wrench', markerColor: 'red', prefix: 'fa' }),
  foto: L.AwesomeMarkers.icon({ icon: 'camera', markerColor: 'blue', prefix: 'fa' })
};

// Initialisierung der Karte
const map = L.map('map').setView([4.5, -74.5], 6); // Hier Beispiel-Koordinaten (anpassen)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Funktion zum Laden der GeoJSON-Daten
Promise.all([
  fetch('data/elevation_simplified.geojson').then(res => res.json()), // Höheninformationen
  fetch('data/points.json').then(res => res.json()) // Punkte mit Etappen
])
  .then(([elevationData, pointsData]) => {
    // Linien für das Höhenprofil hinzufügen
    const elevationCoordinates = elevationData.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lon]
    const elevationLine = L.polyline(elevationCoordinates, { color: 'blue', weight: 3 }).addTo(map);

    // Etappen und Punkte auf der Karte als Marker hinzufügen
    pointsData.filter(p => p.type === 'etapa' || p.type === 'pinchazo' || p.type === 'foto')
      .forEach(p => {
        const icon = icons[p.type] || icons.foto; // Standard: foto
        const marker = L.marker([p.lat, p.lon], { icon })
          .bindPopup(`
            <strong>${p.name}</strong><br>
            ${p.description}<br>
            Distancia: ${p.distancia} km
          `)
          .addTo(map);
      });

    // Karte anpassen, damit das Höhenprofil gut sichtbar ist
    map.fitBounds(elevationLine.getBounds());
  })
  .catch(err => console.error('Fehler beim Laden der Daten:', err));

