// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definiere die Koordinaten, Bogotá, Subía, Natagaima, Espinal
var bogotaCoords = [-74.0787, 4.6459];  // Bogotá: [longitude, latitude]
var subiaCoords = [-74.3834, 4.4709];  // Subia: [longitude, latitude]
var natagaimaCoords = [-75.1002, 3.6266];  // Natagaima: [longitude, latitude]
var neivaCoords = [-75.3116, 2.9541]; // Neiva: [longitude, latitude]
var espinalCoords = [-74.891551, 4.1501]; // Espinal [longitude, latitude]

// Hübsche Marker
function createNumberedMarker(lat, lon, number, color) {
  var icon = L.divIcon({
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 0 3px rgba(0,0,0,0.5);
    ">${number}</div>`,
    className: ''  // Kein zusätzliches Leaflet-CSS
  });
  return L.marker([lat, lon], { icon: icon }).addTo(map);
}


// Marker für Bogotá, Subia, Natagaima, Neiva (mit Zahlen und Farbe)
var bogotaMarker = L.marker([bogotaCoords[1], bogotaCoords[0]]).addTo(map);
bogotaMarker.bindPopup("<strong>Bogotá</strong><br>Startpunkt");

var subiaMarker = createNumberedMarker(subiaCoords[1], subiaCoords[0], 1, 'green');
subiaMarker.bindPopup("<strong>Subia</strong><br>Zwischenziel");

var natagaimaMarker = createNumberedMarker(natagaimaCoords[1], natagaimaCoords[0], 2, 'green');
natagaimaMarker.bindPopup("<strong>Natagaima</strong><br>Zwischenziel");

var neivaMarker = createNumberedMarker(neivaCoords[1], neivaCoords[0], 3, 'green');
neivaMarker.bindPopup("<strong>Neiva</strong><br>Zwischenziel");

var espinalMarker = L.marker([espinalCoords[1], espinalCoords[0]]).addTo(map);
var espinalContent = `
  <div style="width: 200px;">
    <img src="bilder/espinal.jpg" alt="Espinal" style="width: 100%; border-radius: 8px;">
    <p style="font-size: 0.9em; margin-top: 5px;">
      Espinal war ein heißer, aber schöner Zwischenstopp – perfekt für eine Pause mit Mangos und Musik.
    </p>
  </div>
`;
espinalMarker.bindPopup(espinalContent);


// Routenberechnung mit OpenRouteService API 
var apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';  // Mein API-Key 

var routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson?api_key=${apiKey}`;

var routeRequestData = {
    coordinates: [
        [bogotaCoords[0], bogotaCoords[1]],     // Bogotá
        [subiaCoords[0], subiaCoords[1]],        // Subia
        [natagaimaCoords[0], natagaimaCoords[1]], // Natagaima
        [neivaCoords[0], neivaCoords[1]], // Neiva
        [espinalCoords[0], espinalCoords[1]] // Espinal
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
