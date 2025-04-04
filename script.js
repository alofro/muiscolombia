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
subia.bindPopup('<b>Tag 1 Ziel</b><br>Subía');

// OpenRouteService API-Aufruf
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';  // Dein OpenRouteService API-Schlüssel
const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=-74.072,4.711&end=-74.45,4.75`;

fetch(routeUrl)
  .then(response => response.json())
  .then(data => {
    console.log('API Antwort:', data);  // Ausgabe der gesamten API-Antwort
    const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);  // Umkehrung der Koordinaten (wegen GeoJSON)

    // Linie der Route hinzufügen
    const route1 = L.polyline(coordinates, {
      color: 'blue',
      weight: 4,
      opacity: 0.7
    }).addTo(map);
    route1.bindPopup('Etappe 1: Bogotá → Subía');
  })
  .catch(error => console.error('Error fetching route:', error));

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
