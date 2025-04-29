import json
import requests
import math
import time

# API-Key für OpenRouteService
api_key = '5b3ce3597851110001cf624848d187f9337702a33e524bd53cb545d634318d18b1a1a664d99f88db'

INPUT_FILE = "data/route_test.geojson"
OUTPUT_FILE = "data/elevation_test.geojson"
CHUNK_SIZE = 200
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
        time.sleep(10)
        return request_elevation(coords)
    else:
        print("Fehler bei Anfrage:", response.status_code)
        print(response.text)
        return []

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

def haversine(lon1, lat1, lon2, lat2):
    R = 6371.0  # Erdradius in Kilometern
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def main():
    # Höhenprofil abrufen und speichern
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    coords = data["features"][0]["geometry"]["coordinates"]
    print(f"→ {len(coords)} Koordinaten geladen.")

    elevation_coords = []

    # Nur Abschnitte mit 'modo' bici verarbeiten
    for feature in data["features"]:
        if 'properties' in feature and 'modo' in feature['properties']:
            if feature['properties']['modo'] == 'bici':  # Nur bici berücksichtigen
                segment_coords = feature['geometry']['coordinates']
                print(f"→ Verarbeite Segment mit modo: {feature['properties']['modo']}, {len(segment_coords)} Koordinaten")
                
                for i in range(0, len(segment_coords), CHUNK_SIZE):
                    chunk = segment_coords[i:i+CHUNK_SIZE+1]
                    print(f"  ↳ Bearbeite Chunk {i//CHUNK_SIZE + 1}")
                    chunk_elevation = request_elevation(chunk)
                    if i > 0:
                        chunk_elevation = chunk_elevation[1:]
                    elevation_coords.extend(chunk_elevation)
                    time.sleep(SLEEP_TIME)

    # GeoJSON mit Höheninformationen speichern
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

    # Vereinfachen
    simplify_geojson("data/elevation_test.geojson", "data/elevation_simplified_test.geojson", tolerance=0.0001)

    # Distanz ergänzen
    #add_distances_along_route("data/points.json", "data/route.geojson")

if __name__ == "__main__":
    main()
