import json
import requests

def main():
    print("🚴‍♂️ Lade Punkte...")

    # OpenRouteService API-Key
    api_key = '5b3ce3597851110001cf624848d187f9337702a33e524bd53cb545d634318d18b1a1a664d99f88db'

    # Lade Punkte
    with open('data/points.json', 'r') as f:
        points = json.load(f)

    # Segmentiere die Punkte nach 'modo'
    segments = []
    current_segment = {
        'modo': points[0]['modo'],
        'points': [points[0]]
    }

    for point in points[1:]:
        if point['modo'] == current_segment['modo']:
            current_segment['points'].append(point)
        else:
            segments.append(current_segment)
            current_segment = {
                'modo': point['modo'],
                'points': [point]
            }
    segments.append(current_segment)

    print(f"🔍 Gefundene Segmente: {len(segments)}")

    # Verarbeitung der Segmente
    all_features = []

    for idx, segment in enumerate(segments):
        start_point = segment['points'][0]
        end_point = segment['points'][-1]
        start_name = start_point.get('name', f"({start_point['lat']}, {start_point['lon']})")
        end_name = end_point.get('name', f"({end_point['lat']}, {end_point['lon']})")

        if len(segment['points']) < 2:
            print(f"❗ Segment {idx+1} ({segment['modo']}) enthält nur einen Punkt: {start_name}")
            print(f"⚠️  Segment {idx+1} wird übersprungen, da eine Route mindestens zwei Punkte benötigt.\n")
            continue

        print(f"➡️  Anfrage für Segment {idx+1} ({segment['modo']}) mit {len(segment['points'])} Punkten: Start = {start_name}, Ende = {end_name}...")

        coordinates = [(p['lon'], p['lat']) for p in segment['points']]

        route_url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'
        route_request_data = {
            "coordinates": coordinates
        }

        try:
            route_response = requests.post(route_url, json=route_request_data, headers={'Authorization': api_key})
            route_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"❌ Fehler bei Segment {idx+1}: {e}")
            continue

        # Hole das erste Feature aus der Antwort
        feature = route_response.json()
        
        if 'features' in feature and len(feature['features']) > 0:
            feature = feature['features'][0]
            feature['properties']['modo'] = segment['modo']  # Modo hinzufügen

            all_features.append(feature)
            print(f"✅ Segment {idx+1} erfolgreich geladen.\n")
        else:
            print(f"❌ Fehler: Keine Features in der Antwort für Segment {idx+1}\n")

    # GeoJSON-Datei schreiben
    final_geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }

    with open('data/route.geojson', 'w') as f:
        json.dump(final_geojson, f, indent=4)

    print("🏁 Fertig! Route gespeichert in data/route.geojson")

if __name__ == "__main__":
    main()
