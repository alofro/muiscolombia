// Funktion zum Anzeigen der Karte
function showMap() {
  document.getElementById("map").style.display = "block";
  document.getElementById("elevationChart").style.display = "none";
}

// Funktion zum Anzeigen des Höhenprofils
function showElevation() {
  document.getElementById("map").style.display = "none";
  document.getElementById("elevationChart").style.display = "block";
}

// Leaflet-Karte initialisieren
const map = L.map('map').setView([4.7, -74.3], 10); // Zwischen Bogotá & Subía

// OpenStreetMap als TileLayer verwenden
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
}).addTo(map);

// Marker für Bogotá
const bogota = L.marker([4.711, -74.072]).addTo(map);
bogota.bindPopup('<b>Tag 1 Start</b><br>Bogotá');

// Marker für Subía
const subia = L.marker([4.75, -74.45]).addTo(map);
subia.bindPopup('<b>Tag 1 Ziel</b><br>Subía');

// OpenRouteService API-Aufruf
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';  // Dein OpenRouteService API-Schlüssel
const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=-74.072,4.711&end=-74.45,4.75`;

fetch(routeUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Netzwerkantwort war nicht ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('API Antwort:', data);  // Zeigt die gesamte API-Antwort in der Konsole an

    // Prüfen, ob das 'features'-Array in der Antwort vorhanden ist
    if (data.features && data.features.length > 0) {
      // Extrahiere die Koordinaten aus dem ersten Feature im 'features'-Array
      const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Koordinaten umkehren

      // Linie der Route hinzufügen
      const route1 = L.polyline(coordinates, {
        color: 'blue',
        weight: 4,
        opacity: 0.7
      }).addTo(map);
      route1.bindPopup('Etappe 1: Bogotá →
