// Initialisieren der Karte
const map = L.map('map').setView([4.60971, -74.08175], 12); // Startpunkt Bogotá

// OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Die Koordinaten der Routenpunkte
const waypoints = [
    [4.60971, -74.08175],  // Bogotá
    [4.5982, -74.0223],    // Subía (Beispiel, du kannst hier weitere Punkte hinzufügen)
];

// Marker für die Punkte setzen
const markers = waypoints.map(coord => {
    const marker = L.marker(coord).addTo(map);
    marker.bindPopup('Marker');
    return marker;
});

// URL der API für die Route
const url = 'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson';

// Deine OpenRouteService API-Key
const apiKey = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78';

// Berechnung der Route von den Waypoints
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

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: body
    });

    if (response.ok) {
        const geojson = await response.json();
        console.log('GeoJSON Antwort:', geojson);

        // Route auf der Karte anzeigen
        L.geoJSON(geojson, {
            style: {
                color: 'blue',
                weight: 4
            }
        }).addTo(map);
    } else {
        console.error('Error loading the route data:', response.statusText);
    }
}

// Aufrufen der Funktion, um die Route zu laden
getRoute();
