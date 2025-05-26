let elevationChartInstance = null;

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function drawElevationChart() {
  const [elevationGeojson, pointsData] = await Promise.all([
    fetch('data/elevation_simplified.geojson').then(res => res.json()),
    fetch('data/points.json').then(res => res.json())
  ]);

  const datasets = [];
  const allRoutePoints = [];
  const tramoSegments = [];
  let globalDistance = 0;

  function getNearestEtapaName(lat, lon) {
    let nearest = null;
    let bestDist = Infinity;
    for (const p of pointsData) {
      if (!['start', 'etapa'].includes(p.type)) continue;
      const d = haversine(lat, lon, p.lat, p.lon);
      if (d < bestDist) {
        bestDist = d;
        nearest = p.name;
      }
    }
    return nearest || 'punto';
  }

  elevationGeojson.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const modo = feature.properties?.modo || 'bici';
    const distances = [];
    const elevations = [];
    const segmentPoints = [];

    for (let i = 0; i < coords.length; i++) {
      const [lon, lat, elev] = coords[i];
      if (i > 0) {
        const [lonPrev, latPrev] = coords[i - 1];
        globalDistance += haversine(latPrev, lonPrev, lat, lon);
      }
      const d = globalDistance;
      distances.push(d);
      elevations.push(elev);
      const punto = { lat, lon, distancia: d, elevation: elev };
      segmentPoints.push(punto);
      allRoutePoints.push(punto);
    }

    const startName = getNearestEtapaName(coords[0][1], coords[0][0]);
    const endName = getNearestEtapaName(coords[coords.length - 1][1], coords[coords.length - 1][0]);
    const segmentLabel = `tramo en ${modo} ${startName}–${endName}`;

    tramoSegments.push({ label: segmentLabel, points: segmentPoints });

    datasets.push({
      label: segmentLabel,
      data: distances.map((d, i) => ({ x: d, y: elevations[i] })),
      borderColor: modo === 'bici' ? 'rgba(0,123,255,1)' : 'rgba(150,150,150,0.6)',
      borderWidth: 2,
      borderDash: modo === 'bici' ? [] : [5, 5],
      fill: false,
      pointRadius: 0,
      tension: 0.3,
      segmentLabel,
      showInLegend: true
    });
  });

  const markerPoints = [];

  pointsData
    .filter(p =>
      ['start', 'etapa'].includes(p.type) &&
      typeof p.lat === 'number' &&
      typeof p.lon === 'number'
    )
    .forEach(p => {
      let bestMatch = null;
      let bestDist = Infinity;
      for (const segment of tramoSegments) {
        for (const r of segment.points) {
          const d = haversine(p.lat, p.lon, r.lat, r.lon);
          if (d < bestDist) {
            bestDist = d;
            bestMatch = {
              distancia: r.distancia,
              elevation: r.elevation,
              segmentLabel: segment.label
            };
          }
        }
      }

      if (bestMatch) {
        markerPoints.push({
          x: bestMatch.distancia,
          y: bestMatch.elevation,
          name: p.name,
          tipo: p.type,
          description: p.description || '',
          fecha: p.fecha || '',
          tiempo: p.tiempo || '',
          distancia: p.distancia,
          kmDesdeEtapa: p.kmDesdeEtapa,
          segmentLabel: bestMatch.segmentLabel
        });
      }
    });

  const markerDataset = {
    label: '__puntos__global',
    data: markerPoints,
    parsing: false,
    showLine: false,
    pointRadius: ctx => {
      const chart = ctx.chart;
      const segmentLabel = ctx.raw?.segmentLabel;
      const isVisible = chart.data.datasets.some(d =>
        d.label === segmentLabel && chart.isDatasetVisible(chart.data.datasets.indexOf(d))
      );
      return isVisible ? 5 : 0;
    },
    pointStyle: 'circle',
    backgroundColor: ctx => {
      const tipo = ctx?.raw?.tipo;
      return (tipo === 'etapa' || tipo === 'start') ? 'green' : 'red';
    },
    borderWidth: 0,
    showInLegend: false
  };

  datasets.push(markerDataset);

  const ctx = document.getElementById('elevationChart').getContext('2d');
  if (elevationChartInstance) elevationChartInstance.destroy();

  elevationChartInstance = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            usePointStyle: true,
            pointStyle: 'line',
            boxWidth: 20,
            padding: 20,
            filter: item => !item.text.startsWith('__puntos__')
          },
          onClick: (e, legendItem, legend) => {
            const label = legendItem.text;
            const chart = legend.chart;
            chart.data.datasets.forEach((ds, i) => {
              if (ds.label === label) {
                const visible = chart.isDatasetVisible(i);
                chart.setDatasetVisibility(i, !visible);
              }
            });
            chart.update();
          }
        },
        tooltip: {
          mode: 'nearest',
          intersect: true,
          callbacks: {
            title: ctx => {
              const r = ctx[0]?.raw || {};
              return r.name || r.description || '';
            },
            label: ctx => {
              const p = ctx.raw;
              const lines = [];
              if (p.description) lines.push(p.description);
              if (p.fecha) lines.push(`📅 ${p.fecha}`);
              if (p.tiempo) lines.push(`⏱️ ${p.tiempo}`);
              if (typeof p.kmDesdeEtapa === 'number') {
                lines.push(`🚴 ${p.kmDesdeEtapa} km desde última etapa`);
              }
              if (typeof p.distancia === 'number') {
                lines.push(`📍 km total en bici: ${p.distancia}`);
              }
              return lines;
            },
            footer: () => ''
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Distancia (km)' }
        },
        y: {
          title: { display: true, text: 'Altitud (m)' }
        }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const chartContainer = document.getElementById("elevation-profile");
  if (chartContainer && chartContainer.style.display !== "none") {
    drawElevationChart();
  }

  document.getElementById("toggle-view").addEventListener("click", () => {
    setTimeout(() => {
      if (document.getElementById("elevation-profile").style.display !== "none") {
        drawElevationChart();
      }
    }, 300);
  });
});
