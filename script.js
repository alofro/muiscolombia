// Karte anzeigen
function showMap() {
  document.getElementById("map").style.display = "block";
  document.getElementById("elevationChart").style.display = "none";
}

// Höhenprofil anzeigen
function showElevation() {
  document.getElementById("map").style.display = "none";
  document.getElementById("elevationChart").style.display = "block";
}

// Leaflet-Karte initialisieren
const map = L.map('map').setView([4.7, -74.3], 10); // Zwischen Bogotá & Subía

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
}).addTo(map);

// Marker für Bogotá
const bogota = L.marker([4.711, -74.072]).addTo(map);
bogota.bindPopup('<b>Tag 1 Start</b><br>Bogotá');

// Marker für Subía
const subia = L.marker([4.75, -74.45]).addTo(map);
subia.bindPopup('<b>Tag 1 Ziel</b><br>Sub
