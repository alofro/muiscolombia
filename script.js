// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definiere die Koordinaten für Bogotá, Subía, Natagaima
var bogotaCoords = [-74.0721, 4.7110];  // Bogotá: [longitude, latitude]
var subiaCoords = [-74.6250, 4.6167];  // Subía: [longitude, latitude]
var natagaimaCoords = [4.1178, -75.5203];  // Koordinaten für Natagaima

// Marker für Bogotá und Subía
var bogotaMarker = L.marker([bogotaCoords[1], bogotaCoords[0]]).addTo(map);
bogotaMarker.bindPopup("<strong>Bogotá</strong><br>Startpunkt");

var natagaimaMarker = L.marker([natagaimaCoords[1], natagaimaCoords[0]]).addTo(map);
natagaimaMarker.bindPopup("<b>Natagaima</b><br>Zwischenziel");

var subiaMarker = L.marker([subiaCoords[1], subiaCoords[0]]).addTo(map);
subiaMarker.bindPopup("<strong>Subía</strong><br>Zielpunkt");

// Routenberechnung mit OpenRouteService API
var apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78'; // Dein OpenRouteService API-Key

var routeUrl = `https://api.openrouteservice.org/v2/directions/cycling-regular/geojson?api_key=${apiKey}`;

var routeRequestData = {
    coordinates: [
        [bogotaCoords[0], bogotaCoords[1]],  // Bogotá
        [natagamiaCoords[0], natagamiaCoords[1]],     // Natagaima
        [subiaCoords[0], subiaCoords[1]]     // Subía
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
    // Zeichne die Route auf der Karte
    var routeCoordinates = data.features[0].geometry.coordinates.map(function(coord) {
        return [coord[1], coord[0]];  // GeoJSON [lon, lat] in [lat, lon] umkehren
    });

    L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
})
.catch(error => {
    console.error('Fehler bei der Routenberechnung:', error);
});
