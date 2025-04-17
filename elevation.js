// elevation.js (überarbeitet: kmDesdeEtapa & total in X-Achsen-Labels)

let elevationChartInstance = null;

function drawElevationChart() {
  Promise.all([
    fetch('data/elevation_simplified.geojson').then(res => res.json()),
    fetch('data/points.json').then(res => res.json())
  ])
    .then(([elevationGeojson, pointsData]) => {
      const coords = elevationGeojson.features[0].geometry.coordinates;

      // Strecke berechnen und Chart-Daten
      let totalDistance = 0;
      const chartData = coords.map((pt, idx) => {
        const [lon, lat, ele] = pt;
        if (idx > 0) {
          const [lon0, lat0] = coords[idx - 1];
          totalDistance += haversine(lon0, lat0, lon, lat);
        }
        return { x: totalDistance, y: ele };
      });

      // Minimum-Höhe für X-Achsen-Punkte
      const elevations = chartData.map(p => p.y);
      const minElevation = Math.min(...elevations) - 10; // etwas unter Minimum

      // Etappenpunkte und Label-Infos
      const etapaLabels = {};
      const scatterData = [];
      pointsData
        .filter(p => p.type === 'etapa' && typeof p.distancia === 'number')
        .forEach(p => {
          // Datum formatieren
          const d = new Date(p.fecha);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yy = String(d.getFullYear()).slice(-2);
          const dateStr = `${dd}.${mm}.${yy}`;

          // Distanzstrings
          const totalStr = p.distancia.toFixed(1).replace('.', ',');
          const sinceStr = p.kmDesdeEtapa != null
            ? p.kmDesdeEtapa.toFixed(1).replace('.', ',')
            : '';

          // Zeitstring
          const timeStr = p.tiempo ? p.tiempo.replace(':', 'h ') + ' min' : '';

          // Label zusammenstellen: Datum, Etapa, Name, Zeit, seitEtape, total
          let label = `${dateStr}: ${p.description}: ${p.name}`;
          if (timeStr) label += `, ${timeStr}`;
          if (sinceStr) label += `, ${sinceStr} km de etapa`;
          label += `, dist. total: ${totalStr} km`;

          etapaLabels[p.distancia] = label;

          // Punkt auf X-Achse
          scatterData.push({ x: p.distancia, y: minElevation });
        });

      // Chart initialisieren oder updaten
      const ctx = document.getElementById('elevationChart').getContext('2d');
      if (elevationChartInstance) elevationChartInstance.destroy();

      elevationChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Perfil de altura (m)',
              data: chartData,
              borderColor: 'rgb(0, 123, 255)',
              fill: false,
              tension: 0.1,
              parsing: false
            },
            {
              type: 'scatter',
              label: 'Etapas',
              data: scatterData,
              backgroundColor: 'red',
              pointRadius: 6,
              showLine: false,
              parsing: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              title: { display: true, text: 'Distancia (km)' },
              ticks: {
                callback: value => etapaLabels[value] || (value % 100 === 0 && value !== 0 ? `${value} km` : ''),
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              title: { display: true, text: 'Altura (m)' },
              min: minElevation
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => {
                  if (ctx.dataset.type === 'scatter') {
                    return etapaLabels[ctx.raw.x] || '';
                  }
                  return ` ${ctx.raw.y.toFixed(0)} m`;
                }
              }
            }
          },
          interaction: { mode: 'nearest', intersect: false }
        }
      });
    })
    .catch(err => console.error('Fehler beim Laden der Daten:', err));
}

// Chart zeichnen, wenn Profil sichtbar wird
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toggle-view').addEventListener('click', () => {
    const elevDiv = document.getElementById('elevation-profile');
    if (elevDiv.style.display === 'block') setTimeout(drawElevationChart, 50);
  });
});

// Haversine zur Distanzberechnung
function haversine(lon1, lat1, lon2, lat2) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// nächstgelegenen Höhenwert finden (falls noch benötigt)
function getElevationAtDistance(data, dist) {
  return data.reduce((c,p) => Math.abs(p.x - dist) < Math.abs(c.x - dist) ? p : c).y;
}
