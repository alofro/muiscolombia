// Erstelle eine Karte
var map = L.map('map').setView([4.5709, -74.2973], 7);  // Zentrales Koordinaten für Kolumbien

// OpenStreetMap Tiles einfügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definiere die Koordinaten für Bogotá und Subía
var bogotaCoords = [-74.0721, 4.7110];  // Bogotá: [longitude, latitude]
var subiaCoords = [-74.6250, 4.6167];  // Subía: [longitude, latitude]

// Marker für Bogotá und Subía
var bogotaMarker = L.marker([bogotaCoords[1], bogotaCoords[0]]).addTo(map);
bogotaMarker.bindPopup("<strong>Bogotá</strong><br>Startpunkt");

var subiaMarker = L.marker([subiaCoords[1], subiaCoords[0]]).addTo(map);
subiaMarker.bindPopup("<strong>Subía</strong><br>Zielpunkt");

// Routenberechnung mit OpenRouteService API
var apiKey = 'DEIN_API_KEY'; // Deinen OpenRouteService API-Key hier einfügen

var routeUrl = `https://api.openrouteservice.org/v2/directions/cycling-regular/geojson?api_key=${apiKey}`;

var routeRequestData = {
    coordinates: [
        [bogotaCoords[0], bogotaCoords[1]],  // Bogotá
        [subiaCoords[0], subiaCoords[1]]     // Subía
    ]
};

fetch(routeUrl, {
    method:
