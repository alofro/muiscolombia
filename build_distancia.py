import json
import math
from geopy.distance import geodesic

# Berechnet die Distanz in km zwischen zwei Punkten
def calculate_distance(p1, p2):
    return geodesic((p1['lat'], p1['lon']), (p2['lat'], p2['lon'])).kilometers

# Haversine für Nearest‐Neighbor‐Suche (Fallback)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# --- 1) Daten einladen ---
with open("data/points.json", "r", encoding="utf-8") as f:
    points = json.load(f)

with open("data/elevation.geojson", "r", encoding="utf-8") as f:
    elevation_data = json.load(f)

# --- 2) Elevationspunkte extrahieren ---
elev_points = []
for feat in elevation_data["features"]:
    for lon, lat, ele in feat["geometry"]["coordinates"]:
        elev_points.append({"lat": lat, "lon": lon, "ele": ele})

# --- 3) Höhenwerte ZUWEISEN (unabhängig von Modus/Type) ---
for point in points:
    lat, lon = point["lat"], point["lon"]
    # nächstgelegenen Elevationspunkt suchen
    nearest = min(
        elev_points,
        key=lambda p: haversine(lat, lon, p["lat"], p["lon"])
    )
    point["elevation"] = round(nearest["ele"])

# --- 4) Distancia- und kmDesdeEtapa-Berechnung ---
distancia = 0
previous_bici_point = None
previous_etapa_or_start = None
previous_point = None

for i, point in enumerate(points):
    modo = point.get("modo")
    typ  = point.get("type")

    # ---- distancia ----
    if typ == "start":
        distancia = 0
        point["distancia"] = 0
        previous_bici_point = point

    elif modo == "bus":
        # einfrieren auf letzten distancia-Wert
        prev_dist = previous_point.get("distancia", 0) if previous_point else 0
        point["distancia"] = prev_dist

    elif modo == "bici":
        if typ == "etapa" and previous_point and previous_point.get("modo") == "bus":
            # Etapa nach Bus: keine Änderung
            point["distancia"] = previous_point["distancia"]
        else:
            # sonst aufsummieren
            if previous_bici_point:
                distancia += calculate_distance(previous_bici_point, point)
            point["distancia"] = round(distancia)
        previous_bici_point = point

    else:
        point.pop("distancia", None)

    # ---- kmDesdeEtapa ----
    if modo == "bici" and typ in ["start", "etapa"]:
        if typ == "start":
            point["kmDesdeEtapa"] = 0
        else:
            if previous_etapa_or_start:
                km = calculate_distance(previous_etapa_or_start, point)
                point["kmDesdeEtapa"] = round(km)
            else:
                point["kmDesdeEtapa"] = 0
        previous_etapa_or_start = point
    else:
        point.pop("kmDesdeEtapa", None)

    previous_point = point

# --- 5) Zurückschreiben ---
with open("data/points.json", "w", encoding="utf-8") as f:
    json.dump(points, f, ensure_ascii=False, indent=4)

print("✅ elevation, distancia und kmDesdeEtapa erfolgreich gesetzt.")
