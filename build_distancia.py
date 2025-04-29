import json
import math

# Haversine-Funktion zur Berechnung der Entfernung zwischen zwei geographischen Punkten
def haversine(lon1, lat1, lon2, lat2):
    R = 6371.0  # Radius der Erde in Kilometern
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))

# Funktion zur Berechnung der Höhe basierend auf den geographischen Koordinaten
def find_elevation(lat, lon, elevation_data):
    min_distance = float('inf')
    closest_elevation = None
    for feature in elevation_data['features']:
        coordinates = feature['geometry']['coordinates']
        for coord in coordinates:
            ele_lon, ele_lat, ele_elevation = coord
            distance = haversine(lon, lat, ele_lon, ele_lat)
            if distance < min_distance:
                min_distance = distance
                closest_elevation = ele_elevation
    return closest_elevation

def add_distances_along_route(points_file, route_file, elevation_data):
    with open(route_file, 'r') as f:
        route_coords = json.load(f)["features"][0]["geometry"]["coordinates"]

    with open(points_file, 'r', encoding="utf-8") as f:
        points = json.load(f)

    # Kumulierte Distanz entlang der Route berechnen
    distances = [0.0]
    for i in range(1, len(route_coords)):
        lon1, lat1 = route_coords[i - 1]
        lon2, lat2 = route_coords[i]
        dist = haversine(lon1, lat1, lon2, lat2)
        distances.append(distances[-1] + dist)

    # Hilfsfunktion: nächsten Index auf der Route finden
    def find_closest_index(lon, lat):
        best_idx = 0
        best_dist = float('inf')
        for i, (r_lon, r_lat) in enumerate(route_coords):
            d = haversine(lon, lat, r_lon, r_lat)
            if d < best_dist:
                best_dist = d
                best_idx = i
        return best_idx

    # --- Hauptlogik ---
    custom_mode = False         # Sind wir im manuellen Modus nach einem Bus?
    last_valid_distancia = 0.0   # Letzter gültiger Wert
    last_idx = 0                 # Letzter Index auf der Route

    for point in points:
        idx = find_closest_index(point["lon"], point["lat"])

        if point.get("type") == "bus":
            # Bus gefunden -> bleibe im custom Mode
            custom_mode = True
            point["distancia"] = last_valid_distancia
            point["kmDesdeEtapa"] = 0.0
            last_idx = idx
            continue

        if custom_mode:
            # Berechne manuell Distanz vom letzten Index bis jetzt
            distance_since_last = 0.0
            for i in range(last_idx, idx):
                lon1, lat1 = route_coords[i]
                lon2, lat2 = route_coords[i + 1]
                distance_since_last += haversine(lon1, lat1, lon2, lat2)

            last_valid_distancia += round(distance_since_last, 2)
            point["distancia"] = last_valid_distancia

            if point.get("type") in ["etapa", "start"]:
                point["kmDesdeEtapa"] = round(distance_since_last, 2)
            else:
                point["kmDesdeEtapa"] = 0.0

            last_idx = idx

        else:
            # Standardfall: benutze echte kumulierte Distanz
            current_distance_on_route = distances[idx]
            point["distancia"] = round(current_distance_on_route, 2)

            if point.get("type") in ["etapa", "start"]:
                if last_valid_distancia == 0.0:
                    point["kmDesdeEtapa"] = 0.0
                else:
                    point["kmDesdeEtapa"] = round(point["distancia"] - last_valid_distancia, 2)

                last_valid_distancia = point["distancia"]

            else:
                point["kmDesdeEtapa"] = 0.0

            last_idx = idx

        # Höhe setzen
        if point.get('type') == 'etapa':
            lat = point.get('lat')
            lon = point.get('lon')
            if lat and lon:
                height = find_elevation(lat, lon, elevation_data)
                point['elevation'] = height

    # Speichern der aktualisierten Punkte
    with open(points_file, 'w', encoding="utf-8") as f:
        json.dump(points, f, indent=2, ensure_ascii=False)

    print("✅ 'distancia', 'kmDesdeEtapa' und 'elevation' wurden korrekt gespeichert.")

if __name__ == "__main__":
    with open('data/elevation.geojson', 'r') as file:
        elevation_data = json.load(file)

    add_distances_along_route("data/points.json", "data/route.geojson", elevation_data)
