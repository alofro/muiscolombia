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
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a
