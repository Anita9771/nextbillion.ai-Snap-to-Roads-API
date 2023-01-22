import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import nextbillion, { NBMap } from "@nbai/nbmap-gl";
import "@nbai/nbmap-gl/dist/nextbillion.css";
import "./App.css";

// set your nextbillion api key
nextbillion.setApiKey(`${process.env.REACT_APP_API_KEY}`);

let nbmap;
let snappedCoordinates = [];

function App() {
  const [useMarker, setUseMarker] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [formData, setFormData] = useState({});
  const [usePopup, setUsePopup] = useState([]);

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
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    setCoordinates((prevCoordinates) => [
      ...prevCoordinates,
      { lat: formData.lat, lng: formData.lng },
    ]);
    // console.log(event.target.name);
    const marker = new nextbillion.maps.Marker()
      .setLngLat({ lat: formData.lat, lng: formData.lng })
      .addTo(nbmap.map);
    setUseMarker((useMarker) => [...useMarker, marker]);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    // setInputValue(event.target.value);
    // console.log(event.target.name);
  };

  const handleClick = () => {
  nbmap.map.removeLayer(`polyline-layer`);
  nbmap.map.removeSource(`polyline-source`);
  snappedCoordinates = [];
  for (const points of useMarker) {
    points.remove();
  }
  setUseMarker([])

  for (const m of usePopup) {
    m.remove();
  }
  setUsePopup([])
};

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
            interpolate: true,
          },
        }
      );

      const getPoints = (arr) =>
        arr.map((item) => [item.location.longitude, item.location.latitude]);

      snappedCoordinates.push([...getPoints(response.data.snappedPoints)]);
      
      drawPolyline(nbmap);

      for (const points of useMarker) {
        points.remove();
      }
      setUseMarker([])
      setCoordinates([]);
      console.log(response);

      const popupOffsets = {
        top: [0, 0],
        'top-left': [0, 0]
      }
      // add a popup
     const popup = new nextbillion.maps.Popup({
        offset: popupOffsets,
        closeButton: true,
        closeOnClick: false
      })
        .setLngLat({ lat: 34.05815, lng: -118.24648 })
        .setHTML(`<h4>Distance : ${response.data.distance}m</h4>`)
        .setMaxWidth('500px')
        .addTo(nbmap.map)
        setUsePopup((usePopup) => [...usePopup, popup]);

    } catch (err) {
      console.log("=========>Err", err);
    }
  };

  return (
    <div className="app">
      <div id="map"></div>
      <div className="btns">
        <div className="btns-top">
          <button className="snap" onClick={handleSnap}>
            Snap
          </button>
          <button className="clear" onClick={handleClick}>
            Clear
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            name="lat"
            step="any"
            placeholder="Latitude"
            onChange={handleChange}
          />
          <input
            type="number"
            name="lng"
            step="any"
            placeholder="Longitude"
            onChange={handleChange}
          />
          <button>UPDATE</button>
        </form>
      </div>
    </div>
  );
}

export default App;
