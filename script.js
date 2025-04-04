// API-URL und dein API-Schlüssel von OpenRouteService
const url = 'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson';
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Beispielkoordinaten für zwei Punkte (Bogotá und Subía)
const waypoints = [
    [-74.0721, 4.7110],  // Bogotá
    [-74.0158, 4.9023]   // Subía
];

// Karte initialisieren
const map = L.map('map').setView([4.7110, -74.0721], 13);

// OpenStreetMap Tile Layer hinzufügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker für die beiden Punkte (Bogotá und Subía) setzen
L.marker([4.7110, -74.0721]).addTo(map)
    .bindPopup('Startpunkt: Bogotá')
    .openPopup();
L.marker([4.9023, -74.0158]).addTo(map)
    .bindPopup('Zielpunkt: Subía');

// Funktion, um die Route von OpenRouteService abzurufen und anzuzeigen
async function getRoute() {
    // Umkehren der Koordinaten [lat, lon] → [lon, lat]
    const coordinates = waypoints.map(point => point.reverse());

    // Überprüfen der Koordinaten
    console.log("Koordinaten, die an die API geschickt werden:", coordinates);

    const body = JSON.stringify({
        coordinates: coordinates,
        profile: 'cycling-regular',
        format: 'geojson'
    });

    try {
        // API-Request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: body
        });

        // Wenn der Antwortstatus nicht OK ist, werfen wir einen Fehler
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status}`);
        }

        // Antwort als JSON parsen
        const geojson = await response.json();
        console.log('GeoJSON Antwort:', geojson);

        // Route auf der Karte anzeigen
        L.geoJSON(geojson, {
            style: {
                color: 'blue',
                weight: 4
            }
        }).addTo(map);

    } catch (error) {
        // Fehlerbehandlung: Fehler in der Konsole anzeigen
        console.error('Fehler beim Laden der Route:', error);
    }
}

// Rufe die getRoute-Funktion auf, um die Route zu laden
getRoute();
