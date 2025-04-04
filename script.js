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

// Die Route-URL muss vor dem fetch-Aufruf definiert werden
const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=-74.072,4.711&end=-74.45,4.75`;

fetch(routeUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Netzwerkantwort war nicht ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('API Antwort:', data);  // Überprüfe die gesamte API-Antwort in der Konsole

    // Überprüfe, ob die 'features' existieren
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].geometry.coordinates;
      console.log('Koordinaten:', coordinates);  // Sieh dir die Koordinaten an

      const polylineCoordinates = coordinates.map(coord => [coord[1], coord[0]]); // Koordinaten umkehren
      console.log('PolyLine Koordinaten:', polylineCoordinates); // Sieh dir die Polyline-Koordinaten an

      // Linie der Route hinzufügen
      const route1 = L.polyline(polylineCoordinates, {
        color: 'blue',
        weight: 4,
        opacity: 0.7
      }).addTo(map);

      route1.bindPopup('<b>Etappe 1: Bogotá → Subía</b>');  // PopUp mit HTML
    } else {
      console.error('Keine Route in der API-Antwort gefunden:', data);  // Fehlerbehandlung
    }
  })
  .catch(error => console.error('Fehler beim Abrufen der Route:', error));

// Höhenprofil-Dummy (Chart.js)
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
