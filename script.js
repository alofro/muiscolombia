// Erstelle eine Karte
var map = L.map('map').setView([2.9541, -75.3116], 7);

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker-Icons definieren
const icons = {
  etapa: L.AwesomeMarkers.icon({ icon: 'flag', markerColor: 'green', prefix: 'fa' }),
  pinchazo: L.AwesomeMarkers.icon({ icon: 'wrench', markerColor: 'red', prefix: 'fa' }),
  foto: L.AwesomeMarkers.icon({ icon: 'camera', markerColor: 'blue', prefix: 'fa' })
};

let routePoints = [];

// Punkte laden
fetch('data/points.json')
  .then(response => response.json())
  .then(data => {
    routePoints = data;

    // Bestimme die min. und max. Koordinaten
    let latitudes = routePoints.map(p => p.lat);
    let longitudes = routePoints.map(p => p.lon);
    let bounds = [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ];

    // Setze den Kartenausschnitt basierend auf den extremen Koordinaten
    map.fitBounds(bounds);

    routePoints.forEach(point => {
      if (point.type === 'bus') return; // Keine Marker für Buspunkte

      let markerOptions = {};

      if (point.type && icons[point.type]) {
        markerOptions.icon = icons[point.type];
      } else {
        console.warn(`Kein gültiges Icon für den Typ "${point.type}" gefunden, Standard-Icon wird verwendet.`);
      }

      const marker = L.marker([point.lat, point.lon], markerOptions).addTo(map);

      let popupContent = `<div style="width: 200px;">`;
      const imageId = `img-${Math.random().toString(36).substr(2, 9)}`;

      if (point.images && point.images.length > 0) {
        const imagesData = encodeURIComponent(JSON.stringify(point.images));
        popupContent += `
          <div style="position: relative; width: 100%;">
            <img id="${imageId}" src="bilder/${point.images[0]}" alt="${point.name}" 
                 style="width: 100%; border-radius: 8px;" data-images="${imagesData}" data-index="0">
            <div id="${imageId}-counter" style="text-align: center; font-size: 0.8em; margin-top: 4px;">
              1 / ${point.images.length}
            </div>
            <button onclick="prevImage('${imageId}')" 
                    style="position: absolute; top: 50%; left: 5px; transform: translateY(-50%);
                           background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%;
                           width: 25px; height: 25px;">◀</button>
            <button onclick="nextImage('${imageId}')" 
                    style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);
                           background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%;
                           width: 25px; height: 25px;">▶</button>
          </div>`;
      } else if (point.image) {
        popupContent += `
          <img src="bilder/${point.image}" alt="${point.name}" style="width: 100%; border-radius: 8px;">`;
      }

      if (point.name) {
        popupContent += `<strong>${point.name}</strong><br>`;
      }

      if (point.description) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.description}</p>`;
      }

      popupContent += `</div>`;
      marker.bindPopup(popupContent);
    });

    drawRouteSegments(); // Starte Zeichnen der Route erst nach Laden der Punkte
  })
  .catch(error => {
    console.error('Fehler beim Laden der Punkte-Datei:', error);
  });

// Routenabschnitte zeichnen (normal oder bus)
function drawRouteSegments() {
  fetch('data/route.geojson')
    .then(response => response.json())
    .then(data => {
      const routeCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

      const busStops = routePoints
        .filter(p => p.type === 'bus')
        .map(p => [parseFloat(p.lat.toFixed(5)), parseFloat(p.lon.toFixed(5))]);

      const isBusPoint = (lat, lon) =>
        busStops.some(stop =>
          Math.abs(stop[0] - lat) < 0.0001 && Math.abs(stop[1] - lon) < 0.0001
        );

      const segments = [];
      let currentSegment = [];
      let inBusSegment = false;

      for (let i = 0; i < routeCoords.length; i++) {
        const [lat, lon] = routeCoords[i];
        currentSegment.push([lat, lon]);

        if (isBusPoint(lat, lon)) {
          if (currentSegment.length > 1) {
            segments.push({
              coords: [...currentSegment],
              type: inBusSegment ? 'bus' : 'normal'
            });
            currentSegment = [[lat, lon]];
            inBusSegment = !inBusSegment;
          }
        }
      }

      if (currentSegment.length > 1) {
        segments.push({
          coords: currentSegment,
          type: inBusSegment ? 'bus' : 'normal'
        });
      }

      segments.forEach(seg => {
        L.polyline(seg.coords, {
          color: seg.type === 'bus' ? 'gray' : 'blue',
          dashArray: seg.type === 'bus' ? '5,10' : null,
          weight: 4
        }).addTo(map);
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der GeoJSON-Datei:', error);
    });
}

// Slideshow-Funktionen mit Zähler
function nextImage(id) {
  const img = document.getElementById(id);
  const images = JSON.parse(decodeURIComponent(img.dataset.images));
  let index = parseInt(img.dataset.index);
  index = (index + 1) % images.length;
  img.src = 'bilder/' + images[index];
  img.dataset.index = index;
  document.getElementById(`${id}-counter`).textContent = `${index + 1} / ${images.length}`;
}

function prevImage(id) {
  const img = document.getElementById(id);
  const images = JSON.parse(decodeURIComponent(img.dataset.images));
  let index = parseInt(img.dataset.index);
  index = (index - 1 + images.length) % images.length;
  img.src = 'bilder/' + images[index];
  img.dataset.index = index;
  document.getElementById(`${id}-counter`).textContent = `${index + 1} / ${images.length}`;
}
