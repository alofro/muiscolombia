let elevationChartInstance = null;

fetch('data/elevation_simplified.geojson')
  .then(res => res.text())
  .then(text => {
    console.log("elevation_simplified.geojson Inhalt:", text.slice(0, 100));
    return JSON.parse(text);
  });

function drawElevationChart() {
  Promise.all([
    fetch('data/elevation_simplified.geojson').then(res => res.json()),
    fetch('data/points.json').then(res => res.json())
  ])
    .then(([elevationGeojson, pointsData]) => {
      const rawCoords = elevationGeojson.features[0].geometry.coordinates;

      // Distanzwerte, an denen Busabschnitte beginnen/enden
      const busDistances = pointsData
        .filter(p => p.type === 'bus' && typeof p.distancia === 'number')
        .map(p => p.distancia);

      console.log("busDistances:", busDistances);

      let totalDistance = 0;
      const chartData = [];

      // Strecke und Höhenprofil mit Lücken bei Busabschnitten
      rawCoords.forEach((pt, idx) => {
        const [lon, lat, ele] = pt;
        if (idx > 0) {
          const [lon0, lat0] = rawCoords[idx - 1];
          totalDistance += haversine(lon0, lat0, lon, lat);
        }

        // Prüfen, ob wir uns in einem Bussegment befinden
        const inBusSegment = busDistances.some(d => Math.abs(d - totalDistance) < 0.001);

        // Nur Höhenwerte für bici-Abschnitte verwenden, Busabschnitte bleiben als Lücke
        if (inBusSegment) {
          chartData.push(null);
        } else {
          chartData.push({ x: totalDistance, y: ele });
        }
      });

      console.log("Beispiel chartData (erste 10 Punkte):", chartData.slice(0, 10));

      // Berechne y-Achse Minimum
      const yValues = chartData.filter(pt => pt !== null).map(pt => pt.y);
      const minElevation = yValues.length > 0 ? Math.min(...yValues) - 10 : 1000;

      // Etappenpunkte für X-Achse nur für 'bici' verwenden
      const etapaLabels = {};
      const scatterEtapas = [];
      pointsData
        .filter(p => p.type === 'etapa' && p.modo === 'bici' && typeof p.distancia === 'number')
        .forEach(p => {
          const d = new Date(p.fecha);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yy = String(d.getFullYear()).slice(-2);
          const dateStr = `${dd}.${mm}.${yy}`;
          const sinceStr = p.kmDesdeEtapa != null
            ? p.kmDesdeEtapa.toFixed(1).replace('.', ',')
            : '';
          const totalStr = p.distancia.toFixed(1).replace('.', ',');
          const timeStr = p.tiempo ? p.tiempo.replace(':', 'h ') + ' min' : '';

          let label = `${dateStr}: ${p.description}: ${p.name}`;
          if (timeStr) label += `, ${timeStr}`;
          if (sinceStr) label += `, ${sinceStr} km de etapa`;
          label += `, dist. total: ${totalStr} km`;

          etapaLabels[p.distancia] = label;
          scatterEtapas.push({ x: p.distancia, y: minElevation });
        });

      // Alle übrigen Punkte auf Höhenlinie nur für 'bici' verwenden
      const scatterAll = pointsData
        .filter(p => p.modo === 'bici' && typeof p.distancia === 'number' && p.type !== 'bus')
        .map(p => ({
          x: p.distancia,
          y: getElevationAtDistance(chartData, p.distancia),
          label: p.name
        }));

      const ctx = document.getElementById('elevationChart').getContext('2d');
      if (elevationChartInstance) elevationChartInstance.destroy();

      elevationChartInstance = new Chart(ctx, {
        data: {
          datasets: [
            {
              type: 'line',
              label: 'Perfil de altura (m)',
              data: chartData,
              borderColor: 'rgb(0, 123, 255)',
              borderDash: context => context.raw === null ? [5, 5] : [],  // gestrichelt an Lücken
              spanGaps: false,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              parsing: false,
              order: 0
            },
            {
              type: 'scatter',
              label: 'Etapas',
              data: scatterEtapas,
              backgroundColor: 'red',
              pointRadius: 6,
              showLine: false,
              parsing: false,
              order: 1
            },
            {
              type: 'scatter',
              label: 'Puntos de ruta',
              data: scatterAll,
              backgroundColor: 'orange',
              pointRadius: 6,
              showLine: false,
              parsing: false,
              order: 2
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
                  const ds = ctx.chart.data.datasets[ctx.datasetIndex];
                  if (ds.label === 'Etapas') {
                    return etapaLabels[ctx.raw.x] || '';
                  }
                  if (ds.label === 'Puntos de ruta') {
                    return ctx.raw.label || '';
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

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toggle-view').addEventListener('click', () => {
    const elevDiv = document.getElementById('elevation-profile');
    if (elevDiv.style.display === 'block') setTimeout(drawElevationChart, 50);
  });
});

function haversine(lon1, lat1, lon2, lat2) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getElevationAtDistance(data, dist) {
  // wähle aus den nicht-null-Punkten den nächsten zur gegebenen dist
  const valid = data.filter(p => p !== null);
  const closest = valid.reduce((c, p) =>
    Math.abs(p.x - dist) < Math.abs(c.x - dist) ? p : c
  );
  return closest.y;
}
