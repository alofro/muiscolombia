// Erstelle eine Karte
var map = L.map('map', {
  scrollWheelZoom: false, // Deaktiviert Scrollen zum Zoomen auf mobilen Geräten
  dragging: true,         // Ermöglicht das Verschieben der Karte
  touchZoom: true         // Ermöglicht Touch-Zoom
}).setView([2.9541, -75.3116], 7); // Start-Zentrum (kann später dynamisch angepasst werden)

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
let routeBounds = [];

// Punkte laden
fetch('data/points.json')
  .then(response => response.json())
  .then(data => {
    routePoints = data;

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

      // Kommentar unter dem Bild
      if (point.text) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.text}</p>`;
      }

      if (point.name) {
        popupContent += `<strong>${point.name}</strong><br>`;
      }

      if (point.description) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.description}</p>`;
      }

      popupContent += `</div>`;
      marker.bindPopup(popupContent);

      // Koordinaten für den Kartenbereich (Bounds) speichern
      routeBounds.push([point.lat, point.lon]);
    });

    drawRouteSegments(); // Starte Zeichnen der Route erst nach Laden der Punkte
    updateMapBounds();    // Passe den Kartenausschnitt an, um alle Punkte anzuzeigen
  })
  .catch(error => {
    console.error('Fehler beim Laden der Punkte-Datei:', error);
  });

// Routenabschnitte zeichnen
function drawRouteSegments() {
  fetch('data/route.geojson')
    .then(response => response.json())
    .then(data => {
      data.features.forEach(feature => {
        const coords = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const modo = feature.properties.modo; // Lese den Modus ("bici" oder "bus")

        if (modo === 'bici') {
          L.polyline(coords, {
            color: 'blue',
            weight: 4
          }).addTo(map);
        } else if (modo === 'bus') {
          L.polyline(coords, {
            color: 'gray',
            dashArray: '5,10',
            weight: 4
          }).addTo(map);
        } else {
          console.warn('Unbekannter Modus:', modo);
        }
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

// Kartenausschnitt anpassen, um alle Punkte anzuzeigen
function updateMapBounds() {
  if (routeBounds.length > 0) {
    const bounds = L.latLngBounds(routeBounds);
    map.fitBounds(bounds, { padding: [50, 50] }); // Padding für bessere Anzeige
  }
}
