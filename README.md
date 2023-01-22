# NBMap GL

NBMap GL is a web map SDK for JavaScript that enables interactive maps with NextBillion's vector tiles service in your web apps, basing on Maplibre.

# Development

Before start, please install `Node.js` and `yarn` to install dependencies.

```bash
yarn
```

You can start developing with this command:

```bash
yarn dev
```

You can build a minified version of the SDK with this command:

```bash
yarn build
```

# Usage

## Plain HTML
```Html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>NBMap GL Basic Example</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }

      #map {
        width: 100vw;
        height: 100vh;
      }
    </style>
    <link rel="stylesheet" type="text/css" href="https://maps-gl.nextbillion.io/maps/v2/api/css"></link>
    <script src="https://maps-gl.nextbillion.io/maps/v2/api/js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      nextbillion.setApiKey('Your API key')
      var nbmap = new nextbillion.maps.Map({
        container: document.getElementById('map'),
        style: 'https://api.nextbillion.io/maps/streets/style.json',
        zoom: 11,
        center: { lat: 34.08572, lng: -118.324569 },
      })

      nbmap.on('load', function () {
        const marker = new nextbillion.maps.Marker().setLngLat({ lat: 34.08572, lng: -118.324569 }).addTo(nbmap.map)
      })
    </script>
  </body>
</html>
```
## Typescript
```Typescript
import '@nbai/nbmap-gl/dist/nextbillion.css';
import nextbillion, { Map, Marker } from '@nbai/nbmap-gl';

nextbillion.setApiKey('Your API key');
const nbmap = new Map({
  container: 'map',
  style: 'https://api.nextbillion.io/maps/streets/style.json',
  zoom: 11,
  center: { lat: 34.08572, lng: -118.324569 },
});
nbmap.on('load', () => {
  const marker: Marker = new Marker()
    .setLngLat({ lat: 34.08572, lng: -118.324569 })
    .addTo(nbmap.map);
})
```
