This code generates the website: https://alofro.github.io/muiscolombia


# Muiscolombia

Dieses Projekt ermöglicht es, eine Radroute mit verschiedenen Tagesetappen, Zwischenfällen und Sehenswürdigkeiten auf einer Karte darzustellen. Die Daten für die Route und die Punkte werden in JSON-Formaten gespeichert und können einfach bearbeitet werden.

## Schritt 1: Routenpunkte in `data/points.json` ergänzen

Die Routenpunkte werden in der Datei `data/points.json` gespeichert. Jeder Punkt hat einen Namen, geografische Koordinaten und eine Beschreibung. Zusätzlich muss jeder Punkt mit einem `type` versehen werden, um zu bestimmen, welche Art von Marker angezeigt wird.

**Mögliche 'type' Einträge in den Routenpunkten:**

- `start`: Markiert den Startpunkt der Route (kein Icon zugewiesen). Kann auch als Endpunkt genutzt werden.
- `etapa`: Etappenziel, z.B. Zwischenstopps oder Endpunkte der Tagesetappen.
- `pinchazo`: Zwischenfälle, z.B. Pannen oder Probleme auf der Route.
- `foto`: Bildpunkte, an denen es interessante Sehenswürdigkeiten oder Fotos gibt.

Beispiel für einen Routenpunkt in `data/points.json`:

```json
{
    "name": "Natagaima",
    "type": "etapa",
    "lat": 3.6266,
    "lon": -75.1002,
    "description": "Etapa 3",
    "tiempo": "4:51",
    "fecha": "2025-04-01"
  },
```

## Schritt 2: Route berechnen

Um die Route zwischen den einzelnen Punkten zu berechnen, müssen die Koordinaten der Routenpunkte verwendet werden. Dies geschieht durch Ausführen des Python-Skripts build_route.py.

**Befehl zum Ausführen des Skripts:**

Stelle sicher, dass du Python und die benötigten Bibliotheken installiert hast (insbesondere requests).

Navigiere im Terminal zum Projektordner.

Führe das Skript im Verzeichnisordner aus:

```python3 build_route.py
```

Das Skript berechnet die Route und speichert die Ergebnisse als data/route.geojson. Dieses GeoJSON kann dann in der Karte angezeigt werden.

Um das Höhenprofil zu berechnen, musst Du ein weiteres Skript ausführen. Führe das Skript im Verzeichnisordner aus:

```python3 build_route_elevation.py
```
Dieses Skript berechnet die Höhenpunkte entlang von route.geojson (die Du mit dem vorh. Skript erzeugt hast) und reduziert die Anzahl der Punkte auf route_elevation.geojson, um sie im Höhenprofil anzeigen zu können.

Um die Distanz zwischen den Etappen zu berechnen, musst Du ein weiteres Skript ausführen. Führe das Skript im Verzeichnisordner aus:

```python3 build_distancia.py
```
Damit werden in points.json die Attribute "distancia" und "kmDesdeEtapa" (nur bei ype "etapa")berechnet und geschrieben.


## Schritt 3: Testen auf lokalem Server

**Um das Projekt lokal zu testen, folge diesen Schritten:**

Starte einen lokalen Webserver:

Du kannst einen einfachen HTTP-Server mit Python starten. Wenn du Python 3.x verwendest, öffne ein Terminal und führe den folgenden Befehl aus:

```python -m http.server
```

Dadurch wird der Server auf http://localhost:8000 gestartet.

**Öffne die Seite im Browser:**

Geh in deinem Browser zu http://localhost:8000 und du solltest die interaktive Karte mit den Routenpunkten und der berechneten Route sehen.





# 🚴 Muiscolombia Route Project

This project documents a cycling journey with structured geodata and interactive visualizations. The core of the data structure is the `points.json` file, which contains all waypoints and metadata used to generate the route, map markers, elevation profiles, and more.

---

## 🧭 Route Point Structure (`points.json`)

Each point along the route is defined with metadata that controls how it is displayed and processed. Fields are either manually added or automatically computed by scripts.

### 📌 Required Fields

| Field       | Description |
|-------------|-------------|
| `name`      | Free text – typically a place name or point of interest. |
| `type`      | Type of point. One of: `start`, `etapa` (stage), `foto` (photo), `pinchazo` (breakdown), `bus`. |
| `lat`, `lon`| Geographic coordinates (WGS84). |
| `description` | Optional text shown in tooltips or on the map. |
| `modo`      | Mode of transport. Either `"bici"` for cycling or `"bus"` for transferred segments. |

### 🖼️ Optional Fields (manually added)

| Field       | Description |
|-------------|-------------|
| `images`    | Array of image filenames to display on hover. |
| `tiempo`    | Travel time (used for stages, shown in elevation profile). |
| `fecha`     | Arrival date (format: `YYYY-MM-DD`). |

### ⚙️ Automatically Computed Fields (by scripts)

These fields are filled in by the following scripts

