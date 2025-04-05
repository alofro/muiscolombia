// Initialisiere die Karte
var map = L.map('map').setView([4.60971, -74.08175], 12);  // Startpunkt: Bogotá

// Füge OpenStreetMap-Kachel-Layer hinzu
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// GPS-Daten für die Route (Beispiel)
const routeCoords = [
  [4.60971, -74.08175],  // Bogotá
  [4.61000, -74.07800],  // Zwischenpunkt
  [4.61500, -74.07000]   // Subía
];

// Route auf der Karte hinzufügen
var routeLine = L.polyline(routeCoords, {color: 'blue'}).addTo(map);
routeLine.bindPopup('Etappe 1: Bogotá → Subía');

// Beispiel-Daten für das Höhenprofil
const elevationData = [1000, 1100, 1050, 1200, 1250, 1300, 1350];  // Höhenangaben in Metern

// Höhlenprofil im Diagramm anzeigen
const elevationChart = new Chart(document.getElementById('elevationChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: Array.from({ length: elevationData.length }, (_, i) => `${i} km`), // X-Achse mit km-Werten
    datasets: [{
      label: 'Höhenmeter',
      data: elevationData,  // Höheninformationen aus den API-Daten
      fill: false,
      borderColor: 'green',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,  // Stellt sicher, dass das Diagramm auf die Containergröße reagiert
    maintainAspectRatio: false,  // Deaktiviert das Festhalten am Seitenverhältnis
    scales: {
      x: {
        title: {
          display: true,
          text: 'Kilometer'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Höhenmeter'
        }
      }
    }
  }
});

// Funktion, um die Karte anzuzeigen
function showMap() {
  map.invalidateSize(); // Karte neu zeichnen
  document.getElementById('elevationChart').style.display = 'none';  // Versteckt das Höhenprofil
  document.getElementById('map').style.display = 'block';  // Zeigt die Karte an
}

// Funktion, um das Höhenprofil anzuzeigen
function showElevation() {
  map.invalidateSize(); // Karte neu zeichnen
  document.getElementById('map').style.display = 'none';  // Versteckt die Karte
  document.getElementById('elevationChart').style.display = 'block';  // Zeigt das Höhenprofil an
}

// Startansicht: Zeigt die Karte
showMap();