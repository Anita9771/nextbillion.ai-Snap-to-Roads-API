import React, { useEffect, useState } from "react";
import axios from "axios";
import nextbillion, { NBMap } from "@nbai/nbmap-gl";
import "@nbai/nbmap-gl/dist/nextbillion.css";
import "./App.css";

// set your nextbillion api key
nextbillion.setApiKey(`${process.env.REACT_APP_API_KEY}`);

let nbmap;

let snappedCoordinates = [];

const handleClick = () => {
  nbmap.map.removeLayer(`polyline-layer`);
  nbmap.map.removeSource(`polyline-source`);
  snappedCoordinates = [];
};

function App() {
  const [useMarker, setUseMarker] = useState([]);
  const [coordinates, setCoordinates] = useState([]);

  const drawPolyline = (nbmap) => {
    nbmap.map.addSource(`polyline-source`, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          ...snappedCoordinates.map((coord) => ({
            type: "Feature",
            properties: {
              color: "#e74747", // red clolor
            },
            geometry: {
              type: "LineString",
              coordinates: coord,
            },
          })),
        ],
      },
    });
    nbmap.map.addLayer({
      id: `polyline-layer`,
      type: "line",
      source: `polyline-source`,
      paint: {
        "line-width": 3,
        // get color from the source
        "line-color": ["get", "color"],
      },
    });
  };

  useEffect(() => {
    nbmap = new NBMap({
      container: "map",
      zoom: 12,
      style: "https://api.nextbillion.io/maps/streets/style.json",
      center: { lat: 34.08572, lng: -118.324569 },
    });

    nbmap.on("click", (e) => {
      setCoordinates((prevCoordinates) => [
        ...prevCoordinates,
        { lat: e.lngLat.lat, lng: e.lngLat.lng },
      ]);
      const marker = new nextbillion.maps.Marker()
        .setLngLat({ lat: e.lngLat.lat, lng: e.lngLat.lng })
        .addTo(nbmap.map);
      setUseMarker((useMarker) => [...useMarker, marker]);
    });
  }, []);

  // API call
  const handleSnap = async () => {
    try {
      const response = await axios.get(
        "https://api.nextbillion.io/snapToRoads/json",
        {
          params: {
            key: process.env.REACT_APP_API_KEY,
            path: coordinates
              .map((coordinate) => `${coordinate.lat},${coordinate.lng}`)
              .join("|"),
            // interpolate: true,
          },
        }
      );

      const getPoints = (arr) =>
        arr.map((item) => [item.location.longitude, item.location.latitude]);

      snappedCoordinates.push([...getPoints(response.data.snappedPoints)]);
      // setSnappedCoordinates(response.data.snappedPoints);
      drawPolyline(nbmap);

      for (const points of useMarker) {
        points.remove();
      }
      setUseMarker([]);
      setCoordinates([]);
    } catch (err) {
      console.log("=========>Err", err);
    }
  };

  return (
    <div className="app">
      <div id="map"></div>
      <div className="btns">
        <button className="snap" onClick={handleSnap}>Snap</button>
        <button className="clear" onClick={handleClick}>Clear</button>
      </div>
    </div>
  );
}

export default App;
