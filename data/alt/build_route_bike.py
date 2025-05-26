# build_route_bike.py

import json
import os

# Eingabe- und Ausgabedateien
INPUT_FILE = 'data/route.geojson'
OUTPUT_FILE = 'data/route_bike.geojson'

def main():
    print("🚴‍♂️ Lade Gesamtroute...")

    if not os.path.exists(INPUT_FILE):
        print(f"❌ Datei {INPUT_FILE} nicht gefunden.")
        return

    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)

    if 'features' not in data:
        print("❌ Keine Features gefunden.")
        return

    # Nur Features vom Typ 'bike' übernehmen
    bike_features = []
    for feature in data['features']:
        properties = feature.get('properties', {})
        if properties.get('type') == 'bike':
            bike_features.append(feature)

    if not bike_features:
        print("⚠️ Keine Fahrradabschnitte gefunden.")
        return

    # Neue GeoJSON-Datei schreiben
    output_data = {
        "type": "FeatureCollection",
        "features": bike_features
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"✅ Datei {OUTPUT_FILE} erfolgreich erstellt mit {len(bike_features)} Fahrradabschnitten.")

if __name__ == '__main__':
    main()
