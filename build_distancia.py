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
    # Durchlaufe die Koordinaten im Elevation-Daten
    for feature in elevation_data['features']:
        coordinates = feature['geometry']['coordinates']
        # Suche nach dem Punkt, der der Etappe am nächsten ist
        for coord in coordinates:
            ele_lon, ele_lat, ele_elevation = coord
            distance = haversine(lon, lat, ele_lon, ele_lat)
            if distance < min_distance:
                min_distance = distance
                closest_elevation = ele_elevation
    return closest_elevation

# Funktion zur Berechnung der Distanzen entlang der Route
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

    # Nächsten Punkt auf Route für jeden Punkt finden
    def find_closest_index(lon, lat):
        best_idx = 0
        best_dist = float('inf')
        for i, (r_lon, r_lat) in enumerate(route_coords):
            d = haversine(lon, lat, r_lon, r_lat)
            if d < best_dist:
                best_dist = d
                best_idx = i
        return best_idx

    # Berechne 'distancia', 'kmDesdeEtapa' und 'elevation'
    last_etapa_distancia = None
    for point in points:
        idx = find_closest_index(point["lon"], point["lat"])
        point["distancia"] = round(distances[idx], 2)
        
        if point.get("type") in ["etapa", "start"]:
            if last_etapa_distancia is None:
                point["kmDesdeEtapa"] = 0.0
            else:
                point["kmDesdeEtapa"] = round(point["distancia"] - last_etapa_distancia, 2)
            last_etapa_distancia = point["distancia"]

        # Berechne Höhe für 'etapa' Punkte
        if point['type'] == 'etapa':  # Nur Etappenpunkte verarbeiten
            lat = point.get('lat')
            lon = point.get('lon')
            if lat and lon:
                height = find_elevation(lat, lon, elevation_data)
                point['elevation'] = height

    # Speichern der aktualisierten Punkte
    with open(points_file, 'w', encoding="utf-8") as f:
        json.dump(points, f, indent=2, ensure_ascii=False)

    print("✅ 'distancia', 'kmDesdeEtapa' und 'elevation' wurden berechnet und gespeichert.")

if __name__ == "__main__":
    # Lade die Elevationsdaten
    with open('data/elevation.geojson', 'r') as file:
        elevation_data = json.load(file)

    # Berechne Distanz und Höhe
    add_distances_along_route("data/points.json", "data/route.geojson", elevation_data)
