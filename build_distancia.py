import json
from geopy.distance import geodesic  # Zum Berechnen der geographischen Distanz

# Funktion zur Berechnung der geographischen Distanz zwischen zwei Punkten
def calculate_distance(point1, point2):
    coord1 = (point1['lat'], point1['lon'])
    coord2 = (point2['lat'], point2['lon'])
    return geodesic(coord1, coord2).kilometers

# Beispiel-Daten: Lade die points.json-Datei
with open('data/points.json', 'r', encoding='utf-8') as f:
    points = json.load(f)

# Variable zur Berechnung der Distanz seit der letzten Etappe
previous_distance = 0
previous_etapa = None

# Variable zur Kennzeichnung, ob die erste etapa behandelt wird
first_etapa = True

# Durchlaufe alle Punkte und berechne die Distanzen
for i, point in enumerate(points):
    if point['modo'] == 'bici':
        # Berechne die Distanz nur für 'bici'-Abschnitte
        if i > 0 and points[i-1]['modo'] == 'bici':
            # Berechne die Distanz zum vorherigen Punkt
            distance = calculate_distance(points[i-1], point)
            previous_distance += distance
            point['distancia'] = round(previous_distance)  # Aufrunden auf volle Kilometer
        elif i > 0 and points[i-1]['modo'] == 'bus':
            # Wenn der vorherige Punkt ein 'bus'-Abschnitt war, keine Distanz berechnen
            point['distancia'] = round(previous_distance)  # Aufrunden auf volle Kilometer
            point['kmDesdeEtapa'] = 0  # kmDesdeEtapa wird auf 0 gesetzt
        elif first_etapa:
            # Für die erste etapa: Berechne Distanz zum 'start'-Punkt
            start_point = next(p for p in points if p['type'] == 'start')  # Suche den Startpunkt
            distance = calculate_distance(start_point, point)
            point['distancia'] = round(distance)  # Aufrunden auf volle Kilometer
            point['kmDesdeEtapa'] = 0  # Die erste Etappe hat keine vorherige Etappe
            previous_distance = point['distancia']
            first_etapa = False  # Setze auf False, damit diese Berechnung nur einmal erfolgt
        else:
            # Wenn der erste Punkt ein 'bici'-Abschnitt ist, setze die Distanz auf 0
            point['distancia'] = 0
            point['kmDesdeEtapa'] = 0
    elif point['modo'] == 'bus':
        # Bei Busabschnitten übernehmen wir die Distanz des vorherigen Punktes
        point['distancia'] = round(previous_distance)  # Übernehme die Distanz des vorherigen Punktes
        point['kmDesdeEtapa'] = 0  # Setze kmDesdeEtapa auf 0
        continue  # Busabschnitte beeinflussen die Distanzberechnung nicht direkt weiter

    # Berechne den Wert für kmDesdeEtapa, wenn der Punkt 'type': 'etapa' ist
    if point['type'] == 'etapa':
        if previous_etapa is not None:
            if points[i-1]['modo'] == 'bici':
                # Falls der vorherige Punkt 'bici' war, berechne die Distanz zur letzten Etappe
                point['kmDesdeEtapa'] = round(calculate_distance(previous_etapa, point))  # Aufrunden
            elif points[i-1]['modo'] == 'bus':
                # Falls der vorherige Punkt ein 'bus'-Abschnitt war, setze kmDesdeEtapa auf 0
                point['kmDesdeEtapa'] = 0

        # Speichere den aktuellen Punkt als 'previous_etapa' für die nächste Iteration
        previous_etapa = point

    # Speichern der berechneten Distanz für den Bici-Abschnitt
    if point['modo'] == 'bici':
        previous_distance = point['distancia']  # Setze die vorherige Distanz

# Speichern der angepassten Daten zurück in die points.json
with open('data/points.json', 'w', encoding='utf-8') as f:
    json.dump(points, f, ensure_ascii=False, indent=4)

print("Berechnungen abgeschlossen und gespeichert.")
