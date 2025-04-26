import json
import requests
import time
import math

INPUT_ROUTE = "data/route.geojson"
INPUT_ELEVATION = "data/elevation.geojson"
OUTPUT_ELEVATION = "data/elevation.geojson"
OUTPUT_SIMPLIFIED = "data/elevation_simplified.geojson"

API_KEY = "5b3ce3597851110001cf624848d187f9337702a33e524bd53cb545d634318d18b1a1a664d99f88db"
CHUNK_SIZE = 100
SLEEP_TIME = 1.5

def load_coords_from_geojson(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["features"][0]["geometry"]["coordinates"]

def save_elevation(coords):
    geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            }
        }]
    }
    with open(OUTPUT_ELEVATION, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"✓ Höhenprofil gespeichert in {OUTPUT_ELEVATION}")

def request_elevation(coords):
    url = "https://api.openrouteservice.org/elevation/line"
    headers = {
        "Authorization": API_KEY,
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
        time.sleep(10)
        return request_elevation(coords)
    else:
        print("Fehler bei Anfrage:", response.status_code)
        print(response.text)
        return []

def coords_equal_2d(a, b):
    return abs(a[0] - b[0]) < 1e-9 and abs(a[1] - b[1]) < 1e-9

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

def simplify_and_save(coords, output_file=OUTPUT_SIMPLIFIED, tolerance=0.0001):
    simplified = douglas_peucker(coords, tolerance)
    geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": simplified
            }
        }]
    }
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)
    print(f"✓ Vereinfachtes Höhenprofil gespeichert in {output_file}")
    print(f"➡ Ursprünglich: {len(coords)} Punkte → Vereinfacht: {len(simplified)} Punkte")

def main():
    print("📥 Lade route.geojson …")
    route_coords = load_coords_from_geojson(INPUT_ROUTE)
    try:
        elevation_coords = load_coords_from_geojson(INPUT_ELEVATION)
    except FileNotFoundError:
        print("⚠️  elevation.geojson nicht gefunden – starte neu.")
        elevation_coords = []

    print(f"→ Gesamtpunkte in route.geojson: {len(route_coords)}")
    start_index = len(elevation_coords)
    print(f"→ Bereits mit Höhen: {start_index} Punkte")
    new_coords = route_coords[start_index:]

    if not new_coords:
        print("🔁 Keine neuen Punkte. Nichts zu tun.")
        return

    updated_coords = elevation_coords.copy()
    print(f"⛰️  Frage {len(new_coords)} neue Punkte in Chunks à {CHUNK_SIZE} ab…")
    for i in range(0, len(new_coords), CHUNK_SIZE):
        chunk = new_coords[i:i + CHUNK_SIZE + 1]
        print(f"  ↳ Chunk {i//CHUNK_SIZE + 1} mit {len(chunk)} Punkten")
        chunk_elevated = request_elevation(chunk)
        if updated_coords:
            chunk_elevated = chunk_elevated[1:]  # ersten Punkt entfernen, um Doppelpunkte zu vermeiden
        updated_coords.extend(chunk_elevated)
        time.sleep(SLEEP_TIME)

    save_elevation(updated_coords)
    simplify_and_save(updated_coords)

if __name__ == "__main__":
    main()
