import json
import requests

# API-Key für OpenRouteService
api_key = '5b3ce3597851110001cf62484213859626f6c091cb6e59e6db2764c382442cd76a3c4492e26519f5'

# Lade die points.json Datei
with open('data/points.json', 'r') as f:
    route_points = json.load(f)

# Extrahiere die Koordinaten aus den Routenpunkten
coordinates = [(point['lon'], point['lat']) for point in route_points]

# 1. Routenberechnung (Route)
route_url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'
route_request_data = {
    "coordinates": coordinates
}

# Anfrage an den OpenRouteService API für Routenberechnung
route_response = requests.post(route_url, json=route_request_data, headers={'Authorization': api_key})

if route_response.status_code == 200:
    route_data = route_response.json()
    # Speichere die Route in route.geojson
    with open('data/route.geojson', 'w') as outfile:
        json.dump(route_data, outfile, indent=4)
    print("Routenberechnung erfolgreich und in route.geojson gespeichert.")
else:
    print(f"Fehler bei der Routenberechnung: {route_response.status_code}")
