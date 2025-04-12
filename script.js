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

// GeoJSON-Daten aus der Datei laden und auf der Karte darstellen
fetch('data/route.geojson')
  .then(response => response.json())
  .then(data => {
    if (data.features && data.features.length > 0) {
      const routeCoordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
    } else {
      console.error("Keine gültige Route in der GeoJSON-Datei gefunden.");
    }
  })
  .catch(error => {
    console.error('Fehler beim Laden der GeoJSON-Datei:', error);
  });

// Marker aus points.json hinzufügen
fetch('data/points.json')
  .then(response => response.json())
  .then(routePoints => {
    routePoints.forEach(point => {
      let markerOptions = {};
      if (point.type && icons[point.type]) {
        markerOptions.icon = icons[point.type];
      } else if (point.type !== 'start') {
        console.warn(`Kein gültiges Icon für den Typ "${point.type}" gefunden, Standard-Icon wird verwendet.`);
      }

      const marker = L.marker([point.lat, point.lon], markerOptions).addTo(map);

      let popupContent = `<div style="width: 200px;">`;

      const imageId = `img-${Math.random().toString(36).substr(2, 9)}`;

      // Mehrere Bilder
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
      }

      // Ein einzelnes Bild
      else if (point.image) {
        popupContent += `
          <img src="bilder/${point.image}" alt="${point.name}" style="width: 100%; border-radius: 8px;">`;
      }

      // Beschreibungstext
      if (point.name) {
        popupContent += `<strong>${point.name}</strong><br>`;
      }

      if (point.description) {
        popupContent += `<p style="font-size: 0.9em; margin-top: 5px;">${point.description}</p>`;
      }

      popupContent += `</div>`;

      marker.bindPopup(popupContent);
    });
  })
  .catch(error => {
    console.error('Fehler beim Laden der Punkte-Datei:', error);
  });

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
