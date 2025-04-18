// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definiere die Koordinaten, Bogotá, Subía, Natagaima, Espinal
var bogotaCoords = [-74.0787, 4.6459];  // Bogotá: [longitude, latitude]
var subiaCoords = [-74.3834, 4.4709];  // Subia: [longitude, latitude]
var melgarCoords = [-74.7634, 4.247982]; // Melgar
var pinchada1Coords = [-75.0689, 3.7844]; // Pinchada1
var natagaimaCoords = [-75.1002, 3.6266];  // Natagaima: [longitude, latitude]
var pinchada2Coords = [-75.2441, 3.2398]; // Pinchada2
var neivaCoords = [-75.3116, 2.9541]; // Neiva: [longitude, latitude]
var espinalCoords = [-74.891551, 4.1501]; // Espinal [longitude, latitude]
var pinchada3Coords = [-75.5201, 2.5238]; // Pinchada3
var giganteCoords = [-75.5476, 2.386522]; // Gigante [longitude, latitude]
var altamiraCoords = [-75.7895, 2.0650]; // Altamira [longitude, latitude]
var timanaCoords = [-75.9326, 1.9723]; // Timaná
var bruselasCoords = [-76.1703, 1.7714]; // Bruselas

//Awesome Markers - spezielle Symbole für Marker
var etapaMarker = L.AwesomeMarkers.icon({
  icon: 'flag',
  markerColor: 'green',
  prefix: 'fa'  // Font Awesome
});
var flatTireMarker = L.AwesomeMarkers.icon({
  icon: 'wrench',
  markerColor: 'red',
  prefix: 'fa'  // Font Awesome
});
var cameraMarker = L.AwesomeMarkers.icon({
  icon: 'camera',
  markerColor: 'blue',
  prefix: 'fa'  // Font Awesome
});

// Marker für Bogotá, Subia, Natagaima, Neiva, etc
var bogotaMarker = L.marker([bogotaCoords[1], bogotaCoords[0]]).addTo(map);
bogotaMarker.bindPopup("<strong>Bogotá</strong><br>Punto de partida");

var subiaMarker = L.marker([subiaCoords[1], subiaCoords[0]],{ icon: etapaMarker }).addTo(map);
subiaMarker.bindPopup("<strong>Subia</strong><br>Etapa 1");

var natagaimaMarker = L.marker([natagaimaCoords[1], natagaimaCoords[0]], { icon: etapaMarker }).addTo(map);
natagaimaMarker.bindPopup("<strong>Natagaima</strong><br>Etapa 2");

var pinchada1Marker = L.marker([pinchada1Coords[1], pinchada1Coords[0]], { icon: flatTireMarker }).addTo(map);
var pinchada1Content = `
  <div style="width: 200px;">
    <img src="bilder/pinchada1.jpg" alt="Pinchada" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Pinchada a 1/2 de camino entre Saldaña y Natagaima; por eso -excepcionalmente, pese a que me iba cogiendo la noche- tomé la decisión de proseguir hasta Natagaima.
    </p>
  </div>
`;
pinchada1Marker.bindPopup(pinchada1Content);

var pinchada2Marker = L.marker([pinchada2Coords[1], pinchada2Coords[0]], { icon: flatTireMarker }).addTo(map);
var pinchada2Content = `
  <div style="width: 200px;">
    <img src="bilder/pinchada2.jpg" alt="Pinchada2" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Senza parole 😒
    </p>
  </div>
`;
pinchada2Marker.bindPopup(pinchada2Content);

var melgarMarker = L.marker([melgarCoords[1], melgarCoords[0]], { icon: cameraMarker }).addTo(map);
var melgarContent = `
  <div style="width: 200px;">
    <img src="bilder/melgar.jpg" alt="Melgar" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Toma entre Melgar y El Espinal donde me encuentro descansando; hoy fue una etapa de 95km (abundantes bajadas y una que otra subida que coroné sin bajarme a empujar -tal parece que mis cuádriceps de atleta se están acostumbrando al deporte de las bielas)    </p>
  </div>
`;
melgarMarker.bindPopup(melgarContent);

var espinalMarker = L.marker([espinalCoords[1], espinalCoords[0]], { icon: cameraMarker }).addTo(map);
var espinalContent = `
  <div style="width: 200px;">
    <img src="bilder/espinal.jpg" alt="Espinal" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Parque Mitológico de El Espinal por la mañana.
    </p>
  </div>
`;
espinalMarker.bindPopup(espinalContent);


var neivaMarker = L.marker([neivaCoords[1], neivaCoords[0]], { icon: etapaMarker }).addTo(map);
neivaMarker.bindPopup("<strong>Neiva</strong><br>Etapa 3");

var pinchada3Marker = L.marker([pinchada3Coords[1], pinchada3Coords[0]], { icon: flatTireMarker }).addTo(map);
var pinchada3Content = `
  <div style="width: 200px;">
    <img src="bilder/pinchada3.jpg" alt="Pinchada3" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      ¿?
    </p>
  </div>
`;
pinchada3Marker.bindPopup(pinchada3Content);

var giganteMarker = L.marker([giganteCoords[1], giganteCoords[0]], { icon: etapaMarker }).addTo(map);
giganteMarker.bindPopup("<strong>Gigante</strong><br>Etapa 4");

var altamiraMarker = L.marker([altamiraCoords[1], altamiraCoords[0]], { icon: etapaMarker }).addTo(map);
altamiraMarker.bindPopup("<strong>Altamira</strong><br>Etapa 5");

var timanaMarker = L.marker([timanaCoords[1], timanaCoords[0]], { icon: cameraMarker }).addTo(map);
var timanaContent = `
  <div style="width: 200px;">
    <img src="bilder/timana.jpg" alt="Timana" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Timaná.
    </p>
  </div>
`;
timanaMarker.bindPopup(timanaContent);


var bruselasMarker = L.marker([bruselasCoords[1], bruselasCoords[0]], { icon: etapaMarker }).addTo(map);
bruselasMarker.bindPopup("<strong>Bruselas</strong><br>Etapa 6");




// Routenberechnung mit OpenRouteService API 
var apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';  // Mein API-Key 

var routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson?api_key=${apiKey}`;

var routeRequestData = {
    coordinates: [
        [bogotaCoords[0], bogotaCoords[1]],     // Bogotá
        [subiaCoords[0], subiaCoords[1]],        // Subia
        [melgarCoords[0], melgarCoords[1]],        // Melgar
        [pinchada1Coords[0], pinchada1Coords[1]], // Pinchada1 
        [espinalCoords[0], espinalCoords[1]], // Espinal
        [natagaimaCoords[0], natagaimaCoords[1]], // Natagaima
        [pinchada2Coords[0], pinchada2Coords[1]], // Pinchada2
        [neivaCoords[0], neivaCoords[1]], // Neiva
        [giganteCoords[0], giganteCoords[1]], // Gigante
        [altamiraCoords[0], altamiraCoords[1]], // Altamira
        [timanaCoords[0], timanaCoords[1]], // Timana
        [bruselasCoords[0], bruselasCoords[1]] // Bruselas
        
    ]
};

// Stelle sicher, dass die API-Aufruf korrekt ist
fetch(routeUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(routeRequestData)
})
.then(response => response.json())
.then(data => {
    console.log(data);  // Gib die gesamte Antwort der API in der Konsole aus
    if (data.features && data.features.length > 0) {
        var routeCoordinates = data.features[0].geometry.coordinates.map(function(coord) {
            return [coord[1], coord[0]];  // GeoJSON [lon, lat] in [lat, lon] umkehren
        });

        L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
    } else {
        console.error("Keine gültige Route gefunden oder leere Antwort.");
    }
})
.catch(error => {
    console.error('Fehler bei der Routenberechnung:', error);
});