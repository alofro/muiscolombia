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
const marker = L.marker([4.711, -74.072]).addTo(map);
marker.bindPopup('Start in Bogotá').openPopup();

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
