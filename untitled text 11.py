curl -X POST "https://api.openrouteservice.org/elevation/line" \
  -H "Authorization: 5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78" \
  -H "Content-Type: application/json" \
  -d '{
    "format_in": "geojson",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-74.0787, 4.6459],
        [-74.3834, 4.4709]
      ]
    }
  }'




curl -X POST https://api.openrouteservice.org/v2/directions/cycling-regular/geojson \
  -H "Authorization: 5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      [-74.0787, 4.6459],
      [-74.3834, 4.4709]
    ]
  }' > route1.geojson



curl -X POST https://api.openrouteservice.org/elevation/line \
  -H "Authorization: 5b3ce3597851110001cf6248ef05ac1a70a6483086189e15a986bf78" \
  -H "Content-Type: application/json" \
  -d @<(jq '{format_in: "geojson", format_out: "geojson", geometry: .features[0].geometry}' route1.geojson) \
  > route_elevation1.geojson
