import json
import requests
import math
import time
from shapely.geometry import LineString, Point

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

INPUT_FILE = "data/route.geojson"
OUTPUT_FILE = "data/elevation.geojson"
CHUNK_SIZE = 100
SLEEP_TIME = 1.5  # Sekunden zwischen API-Calls

def request_elevation(coords):
    url = "https://api.openrouteservice.org/elevation/line"
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }

    body = {
        "format_in": "geojson",
        "format_out": "geojson",
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        }
    }

    response = requests.post(url, headers=headers, json=body)
    if response.ok:
        return response.json()["geometry"]["coordinates"]
    elif response.status_code == 429:
        print("✋ Rate limit erreicht. Warte...")
        time.sleep(10)  # Längere Pause
        return request_elevation(coords)  # Wiederholen
    else:
        print("Fehler bei Anfrage:", response.status_code)
        print(response.text)
        return []

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    coords = data["features"][0]["geometry"]["coordinates"]
    print(f"→ {len(coords)} Koordinaten geladen.")

    elevation_coords = []
    for i in range(0, len(coords), CHUNK_SIZE):
        chunk = coords[i:i+CHUNK_SIZE+1]
        print(f"  ↳ Bearbeite Chunk {i//CHUNK_SIZE + 1}")
        chunk_elevation = request_elevation(chunk)
        if i > 0:
            chunk_elevation = chunk_elevation[1:]
        elevation_coords.extend(chunk_elevation)
        time.sleep(SLEEP_TIME)

    elevation_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": elevation_coords
            }
        }]
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(elevation_geojson, f, indent=2)

    print(f"✓ Höhenprofil gespeichert in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

def douglas_peucker(points, tolerance):
    if len(points) <= 2:
        return points

    def perpendicular_distance(point, start, end):
        if start == end:
            return math.dist(point[:2], start[:2])
        else:
            x0, y0 = point[0], point[1]
            x1, y1 = start[0], start[1]
            x2, y2 = end[0], end[1]
            num = abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1)
            den = math.hypot(x2 - x1, y2 - y1)
            return num / den

    max_dist = 0.0
    index = 0
    for i in range(1, len(points) - 1):
        dist = perpendicular_distance(points[i], points[0], points[-1])
        if dist > max_dist:
            index = i
            max_dist = dist

    if max_dist > tolerance:
        rec_results1 = douglas_peucker(points[:index + 1], tolerance)
        rec_results2 = douglas_peucker(points[index:], tolerance)
        return rec_results1[:-1] + rec_results2
    else:
        return [points[0], points[-1]]

def simplify_geojson(input_file, output_file, tolerance):
    with open(input_file, 'r') as f:
        data = json.load(f)

    coords = data["features"][0]["geometry"]["coordinates"]
    simplified = douglas_peucker(coords, tolerance)

    data["features"][0]["geometry"]["coordinates"] = simplified

    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✔ Datei gespeichert unter: {output_file}")
    print(f"➡ Ursprünglich: {len(coords)} Punkte → Vereinfacht: {len(simplified)} Punkte")

# Anpassen je nach gewünschter Toleranz (z. B. 0.0001 oder 0.00005)
simplify_geojson("data/elevation.geojson", "data/elevation_simplified.geojson", tolerance=0.0001)

from shapely.geometry import LineString, Point

def add_distances_to_points(points_file, route_file):
    # Lade die Route
    with open(route_file, 'r', encoding='utf-8') as f:
        route_data = json.load(f)
    route_coords = route_data['features'][0]['geometry']['coordinates']

    # Erzeuge LineString für die Route
    route_line = LineString(route_coords)

    # Lade die Punkte
    with open(points_file, 'r', encoding='utf-8') as f:
        points = json.load(f)

    updated_points = []
    for point in points:
        pt = Point(point["lon"], point["lat"])
        projected_distance = route_line.project(pt)
        point["distancia"] = round(projected_distance / 1000, 2)  # in km
        updated_points.append(point)

    # Speichere aktualisierte Datei
    with open(points_file, 'w', encoding='utf-8') as f:
        json.dump(updated_points, f, indent=2, ensure_ascii=False)

    print("✓ Punkte aktualisiert mit 'distancia' in km")

# Füge diesen Aufruf am Ende von main() hinzu:
add_distances_to_points("data/points.json", "data/route.geojson")
