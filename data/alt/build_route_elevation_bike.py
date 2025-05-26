import json
import requests
import time

# Deinen API-Key hier einfügen
API_KEY = '5b3ce3597851110001cf624848d187f9337702a33e524bd53cb545d634318d18b1a1a664d99f88db'

INPUT_FILE = 'data/route_bike.geojson'
OUTPUT_FILE = 'data/elevation_bike.geojson'
CHUNK_SIZE = 200  # max 200 Punkte pro Request
SLEEP_TIME = 1  # 1 Sekunde warten zwischen Requests

def chunk_list(lst, size):
    """Teilt eine Liste in Chunks der Größe 'size'."""
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

def request_elevation(chunk):
    """Fragt die Höheninformationen für einen Chunk ab."""
    url = 'https://api.openrouteservice.org/elevation/line'
    headers = {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
    }
    body = {
        "format_in": "geojson",
        "format_out": "geojson",
        "geometry": chunk
    }

    response = requests.post(url, headers=headers, json=body)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(f"❌ HTTP-Error {response.status_code}: {response.text}")
        raise
    return response.json()

def main():
    print("🚴‍ Lade Eingabedatei...")

    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)

    all_coords = []
    for feature in data['features']:
        if feature['geometry']['type'] == 'LineString':
            coords = feature['geometry']['coordinates']
            all_coords.extend(coords)

    print(f"🚴‍ Gesamte Anzahl Koordinaten: {len(all_coords)} Punkte")

    features = []
    for idx, chunk in enumerate(chunk_list(all_coords, CHUNK_SIZE)):
        print(f"🚴‍ Anfrage {idx + 1}: {len(chunk)} Punkte werden geschickt...")
        try:
            result = request_elevation(chunk)
            for feature in result['features']:
                features.append(feature)
            time.sleep(SLEEP_TIME)
        except Exception as e:
            print(f"❌ Fehler bei Chunk {idx + 1}: {e}")
            break

    if not features:
        print("❌ Keine Höhenpunkte empfangen, Abbruch.")
        return

    output = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f)

    print(f"✅ Höhenprofil erfolgreich gespeichert: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
