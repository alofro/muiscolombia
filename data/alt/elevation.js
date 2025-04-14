<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Muiscolombia</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="data:," type="image/x-icon">

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

  <!-- Font Awesome (für Symbole in Awesome Markers) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <!-- Leaflet Awesome Markers CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet.awesome-markers@2.0.5/dist/leaflet.awesome-markers.css">

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- CSS für schönes Design -->
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h1 {
      margin-top: 20px;
      font-size: 2rem;
      color: #333;
    }

    #map, #elevation-profile {
      width: 80%;
      max-width: 900px;
      height: 400px;
      margin-top: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    #toggle-container {
      margin-top: 20px;
      text-align: center;
    }

    #toggle-view {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      font-size: 1.1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    #toggle-view:hover {
      background-color: #0056b3;
    }

    /* Optional: Stile für den Elevation-Chart */
    canvas {
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <h1>Aventura Muiscolombia</h1>

  <!-- Button zum Wechseln zwischen Karte und Höhenprofil -->
  <div id="toggle-container">
    <button id="toggle-view" onclick="toggleView()">Höhenprofil anzeigen</button>
  </div>

  <!-- Karte -->
  <div id="map"></div>

  <!-- Höhenprofil -->
  <div id="elevation-profile" style="display: none;">
    <canvas id="elevationChart"></canvas>
  </div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <!-- Leaflet Awesome Markers JS -->
  <script src="https://unpkg.com/leaflet.awesome-markers@2.0.5/dist/leaflet.awesome-markers.js"></script>

  <!-- Dein eigenes Script (nutzt routePoints aus points.js) -->
  <script src="script.js"></script>

  <script>
    let isMapVisible = true; // Start mit der Karte als sichtbare Ansicht

    // Funktion zum Umschalten zwischen Karte und Höhenprofil
    function toggleView() {
      if (isMapVisible) {
        document.getElementById("map").style.display = "none";
        document.getElementById("elevation-profile").style.display = "block";
        document.getElementById("toggle-view").innerText = "Karte anzeigen";
      } else {
        document.getElementById("map").style.display = "block";
        document.getElementById("elevation-profile").style.display = "none";
        document.getElementById("toggle-view").innerText = "Höhenprofil anzeigen";
      }
      isMapVisible = !isMapVisible;
    }

    // Funktion zum Laden der GeoJSON-Datei für das Höhenprofil
    async function loadElevationData() {
      try {
        const response = await fetch('data/elevation_simplified.geojson');
        const data = await response.json();
        
        // Extrahiere Höhenwerte aus den GeoJSON-Daten
        const coordinates = data.features[0].geometry.coordinates;
        const distances = [];
        const elevations = [];

        coordinates.forEach((coord, index) => {
          distances.push(index);  // x-Achse: Index als Platzhalter für Entfernung (kann angepasst werden)
          elevations.push(coord[2]);  // y-Achse: Höhe
        });

        return { distances, elevations };
      } catch (error) {
        console.error('Fehler beim Laden der GeoJSON-Datei:', error);
      }
    }

    // Funktion zum Erstellen des Höhenprofils
    async function createElevationChart() {
      const { distances, elevations } = await loadElevationData();

      const elevationData = {
        labels: distances,  // X-Achse: Entfernungen (hier als Index)
        datasets: [{
          label: "Höhenprofil",
          data: elevations,  // Y-Achse: Höhenwerte
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      const ctx = document.getElementById('elevationChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: elevationData,
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Entfernung (km)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Höhe (m)'
              }
            }
          }
        });
    }

    // Beim Laden der Seite das Höhenprofil erstellen
    createElevationChart();
  </script>
</body>
</html>