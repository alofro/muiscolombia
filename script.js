fetch(routeUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Netzwerkantwort war nicht ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('API Antwort:', data);  // Überprüfe die gesamte API-Antwort in der Konsole

    // Überprüfe, ob die 'features' existieren
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].geometry.coordinates;
      console.log('Koordinaten:', coordinates);  // Sieh dir die Koordinaten an

      const polylineCoordinates = coordinates.map(coord => [coord[1], coord[0]]); // Koordinaten umkehren
      console.log('PolyLine Koordinaten:', polylineCoordinates); // Sieh dir die Polyline-Koordinaten an

      // Linie der Route hinzufügen
      const route1 = L.polyline(polylineCoordinates, {
        color: 'blue',
        weight: 4,
        opacity: 0.7
      }).addTo(map);

      route1.bindPopup('<b>Etappe 1: Bogotá → Subía</b>');  // PopUp mit HTML
    } else {
      console.error('Keine Route in der API-Antwort gefunden:', data);  // Fehlerbehandlung
    }
  })
  .catch(error => console.error('Fehler beim Abrufen der Route:', error));
