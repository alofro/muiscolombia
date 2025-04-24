// elevation.js (Etapas auf X-Achse + alle Punkte auf Höhenlinie)
let elevationChartInstance = null;

function drawElevationChart() {
  Promise.all([
    fetch('data/elevation_simplified.geojson').then(res => res.json()),
    fetch('data/points.json').then(res => res.json())
  ])
    .then(([elevationGeojson, pointsData]) => {
      const coords = elevationGeojson.features[0].geometry.coordinates;

      let totalDistance = 0;
      const chartData = coords.map((pt, idx) => {
        const [lon, lat, ele] = pt;
        if (idx > 0) {
          const [lon0, lat0] = coords[idx - 1];
          totalDistance += haversine(lon0, lat0, lon, lat);
        }
        return { x: totalDistance, y: ele };
      });

      const elevations = chartData.map(p => p.y);
      const minElevation = Math.min(...elevations) - 10;

      // Etapas als rote Punkte auf X-Achse
      const etapaLabels = {};
      const scatterDataEtapas = [];
      pointsData.filter(p => p.type === 'etapa' && typeof p.distancia === 'number')
        .forEach(p => {
          const d = new Date(p.fecha);
          const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(-2)}`;
          const sinceStr = p.kmDesdeEtapa != null ? p.kmDesdeEtapa.toFixed(1).replace('.', ',') : '';
          const totalStr = p.distancia.toFixed(1).replace('.', ',');
          const timeStr = p.tiempo ? p.tiempo.replace(':', 'h ') + ' min' : '';
          let label = `${dateStr}: ${p.description}: ${p.name}`;
          if (timeStr) label += `, ${timeStr}`;
          if (sinceStr) label += `, ${sinceStr} km de etapa`;
          label += `, dist. total: ${totalStr} km`;
          etapaLabels[p.distancia] = label;
          scatterDataEtapas.push({ x: p.distancia, y: minElevation });
        });

      // Alle Punkte auf Höhenlinie zeigen
      const scatterDataOnLine = pointsData
        .filter(p => typeof p.distancia === 'number')
        .map(p => ({
          x: p.distancia,
          y: getElevationAtDistance(chartData, p.distancia),
          label: p.name
        }));

      const ctx = document.getElementById('elevationChart').getContext('2d');
      if (elevationChartInstance) elevationChartInstance.destroy();

      const datasets = [
        {
          type: 'line',
          label: 'Perfil de altura (m)',
          data: chartData,
          borderColor: 'rgb(0, 123, 255)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          parsing: false,
          order: 0
        },
        {
          type: 'scatter',
          label: 'Etapas',
          data: scatterDataEtapas,
          backgroundColor: 'red',
          pointRadius: 6,
          showLine: false,
          parsing: false,
          order: 1
        },
        {
          type: 'scatter',
          label: 'Puntos de ruta',
          data: scatterDataOnLine,
          backgroundColor: 'orange',
          pointRadius: 6,
          showLine: false,
          parsing: false,
          order: 2
        }
      ];

      elevationChartInstance = new Chart(ctx, {
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              title: { display: true, text: 'Distancia (km)' },
              ticks: {
                callback: v => etapaLabels[v] || (v % 100 === 0 && v !== 0 ? `${v} km` : ''),
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
                label: context => {
                  const ds = context.chart.data.datasets[context.datasetIndex];
                  if (ds.label === 'Etapas') {
                    return etapaLabels[context.raw.x] || '';
                  } else if (ds.label === 'Puntos de ruta') {
                    return context.raw.label || '';
                  } else {
                    return ` ${context.raw.y.toFixed(0)} m`;
                  }
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

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toggle-view').addEventListener('click', () => {
    const elevDiv = document.getElementById('elevation-profile');
    if (elevDiv.style.display === 'block') setTimeout(drawElevationChart, 50);
  });
});

function haversine(lon1, lat1, lon2, lat2) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getElevationAtDistance(data, dist) {
  return data.reduce((closest, p) =>
    Math.abs(p.x - dist) < Math.abs(closest.x - dist) ? p : closest
  ).y;
}
