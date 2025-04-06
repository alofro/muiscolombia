// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definiere die Koordinaten für Bogotá, Subía, Natagaima
var bogotaCoords = [-74.0721, 4.7110];  // Bogotá: [longitude, latitude]
var subiaCoords = [-74.6250, 4.6167];  // Subía: [longitude, latitude]
var natagaimaCoords = [-75.5203, 4.1178];  // Natagaima: [longitude, latitude]

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
        [bogotaCoords[0], bogotaCoords[1]],     // Bogotá
        [subiaCoords[0], subiaCoords[1]],        // Subía
        [natagaimaCoords[0], natagaimaCoords[1]], // Natagaima
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
