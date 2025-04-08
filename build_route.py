import json
import requests

# API-Key für OpenRouteService
api_key = '5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78'

# Lade die points.json Datei
with open('data/points.json', 'r') as f:
    route_points = json.load(f)

# Extrahiere die Koordinaten aus den Routenpunkten
coordinates = [(point['lon'], point['lat']) for point in route_points]

# Setze die URL für die OpenRouteService API
route_url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'

# Anfrage-Daten für die Routenberechnung
route_request_data = {
    "coordinates": coordinates
}

# Sende die Anfrage an die OpenRouteService API
response = requests.post(route_url, json=route_request_data, headers={'Authorization': api_key})

if response.status_code == 200:
    route_data = response.json()
    
    # Speichere das Ergebnis als route.geojson
    with open('data/route.geojson', 'w') as outfile:
        json.dump(route_data, outfile, indent=4)
    
    print("Routenberechnung erfolgreich und in route.geojson gespeichert.")
else:
    print(f"Fehler bei der Routenberechnung: {response.status_code}")
