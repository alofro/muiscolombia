let elevationChartInstance = null;

function drawElevationChart() {
  fetch('data/elevation_simplified.geojson')
    .then(response => response.json())
    .then(elevationGeojson => {
      fetch('data/points.json')
        .then(response => response.json())
        .then(pointsData => {
          const coords = elevationGeojson.features[0].geometry.coordinates;

          const elevationData = [];
          const distanceLabels = [];
          const pointMarkers = [];

          let totalDistance = 0;

          for (let i = 0; i < coords.length; i++) {
            const [lon2, lat2, ele] = coords[i];
            if (i > 0) {
              const [lon1, lat1] = coords[i - 1];
              const toRad = deg => deg * Math.PI / 180;
              const R = 6371;
              const dLat = toRad(lat2 - lat1);
              const dLon = toRad(lon2 - lon1);
              const a = Math.sin(dLat / 2) ** 2 +
                        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                        Math.sin(dLon / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const d = R * c;
              totalDistance += d;
            }

            elevationData.push(ele);
            distanceLabels.push(totalDistance.toFixed(2));
          }

          // Etappen-Marker vorbereiten
          const markers = pointsData.filter(p => p.type === "etapa");
          const annotationPoints = markers.map(p => ({
            label: `Etapa ${p.label || ''}`,
            distance: p.distancia?.toFixed(2) || null,
            description: p.description || ''
          })).filter(p => p.distance !== null);

          // Chart erstellen
          const ctx = document.getElementById('elevationChart').getContext('2d');

          if (elevationChartInstance) elevationChartInstance.destroy();

          elevationChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: distanceLabels,
              datasets: [{
                label: 'Höhenprofil (m)',
                data: elevationData,
                borderColor: 'rgb(0, 123, 255)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                pointRadius: 0,
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return ` ${context.raw} m`;
                    }
                  }
                },
                annotation: {
                  annotations: annotationPoints.map(p => ({
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: p.distance,
                    borderColor: 'green',
                    borderWidth: 2,
                    label: {
                      enabled: true,
                      content: `${p.label} (${p.distance} km)`,
                      rotation: 90,
                      backgroundColor: 'rgba(0,128,0,0.2)',
                      color: 'green',
                      font: {
                        size: 10
                      }
                    }
                  }))
                }
              }
            }
          });
        });
    });
}
