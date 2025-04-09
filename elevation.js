// elevation.js
fetch('data/route_elevation.geojson')
  .then(response => response.json())
  .then(data => {
    console.log('API-Antwort:', data);  // Debugging: Ausgabe der gesamten API-Antwort
    if (data && data.features) {
      // Extrahiere die Höhenwerte und Koordinaten
      const elevationData = data.features.map(feature => feature.properties.ele);
      const labels = data.features.map((feature, index) => index + 1); // Etappe 1, 2, 3, ...

      const ctx = document.getElementById('elevationChart').getContext('2d');
      const elevationChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Höhenprofil',
            data: elevationData,
            borderColor: 'blue',
            fill: false,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Koordinaten'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Höhe (m)'
              }
            }
          }
        }
      });
    } else {
      console.error("Keine gültigen Höhenangaben gefunden.");
    }
  })
  .catch(error => console.error("Fehler beim Laden der Höhenangaben:", error));
