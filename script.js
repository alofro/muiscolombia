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
const map = L.map('map').setView([4.711, -74.072], 6); // Bogotá als Beispiel

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
}).addTo(map);

// Beispielmarker
//const marker = L.marker([4.711, -74.072]).addTo(map);
//marker.bindPopup('Start in Bogotá').openPopup();

// Karte initialisieren
const map = L.map('map').setView([4.6, -74.2], 9); // Zwischen Bogotá & Subía

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
}).addTo(map);

// Marker für Bogotá
const bogota = L.marker([4.711, -74.072]).addTo(map);
bogota.bindPopup('<b>Tag 1 Start</b><br>Bogotá');

// Marker für Subía
const subia = L.marker([4.75, -74.45]).addTo(map);
subia.bindPopup('<b>Tag 1 Ziel</b><br>Subía');

// Linie von Bogotá nach Subía
const route1 = L.polyline([
  [4.711, -74.072],
  [4.75, -74.45]
], {
  color: 'blue'
}).addTo(map);
route1.bindPopup('Etappe 1: Bogotá → Subía');


// Höhenprofil-Dummy
const ctx = document.getElementById('elevationChart').getContext('2d');
const elevationChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['0 km', '10 km', '20 km', '30 km'],
    datasets: [{
      label: 'Höhenmeter',
      data: [2600, 2800, 2500, 2700],
      fill: false,
      borderColor: 'green',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});
