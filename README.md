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
  "name": "Bogotá",
  "type": "start",
  "lat": 4.6459,
  "lon": -74.0787,
  "description": "Punto de partida"
}
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


## Schritt 3: Testen auf lokalem Server

**Um das Projekt lokal zu testen, folge diesen Schritten:**

Starte einen lokalen Webserver:

Du kannst einen einfachen HTTP-Server mit Python starten. Wenn du Python 3.x verwendest, öffne ein Terminal und führe den folgenden Befehl aus:

```python -m http.server
```

Dadurch wird der Server auf http://localhost:8000 gestartet.

**Öffne die Seite im Browser:**

Geh in deinem Browser zu http://localhost:8000 und du solltest die interaktive Karte mit den Routenpunkten und der berechneten Route sehen.
