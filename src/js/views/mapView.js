import { DEFAULT_COORDS } from '../config';
import { miliToTime } from '../helpers';
const { MAPBOX_TOKEN } = process.env
class MapView {
  // Leaflet objects and initialization
  constructor() {
    this.map = L.map('map').setView([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 5);
    this.tiles = L.tileLayer(
      `https://api.mapbox.com/styles/v1/lanesgood/clhsi5wdt00yk01pffukxf1s4/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      {
        minZoom: 0,
        maxZoom: 22,
      }
    );
    this.routeLine = L.polyline([]); // Set empty routeline to allow later clearing. Will likely later change to array of features to permit multiple lines
    this.photoMarkers = L.layerGroup();
    this.currentPositionMarker = L.marker();
  }
  render() {
    this.tiles.addTo(this.map);
    this.photoMarkers.addTo(this.map);
  }
  renderPhotoMarker(latitude, longitude, file, i) {
    const imageURL = URL.createObjectURL(file);
    const photoPopup = L.popup({
      autoClose: false,
    }).setContent(`<img class='marker-photo' src='${imageURL}' />`);
    const photoMarker = L.marker([latitude, longitude]);
    photoMarker.photoIndex = i;
    this.photoMarkers.addLayer(photoMarker);
    photoMarker.bindPopup(photoPopup).openPopup();
  }

  renderRouteLine(routeData) {
    const routeCoords = routeData.paths[0].points.coordinates.map((coords) => [
      coords[1],
      coords[0],
    ]);
    const routeTime = miliToTime(routeData.paths[0].time);
    this.routeLine.setLatLngs(routeCoords).addTo(this.map);
    this.routeLine.bindPopup(`${routeTime}`).openPopup();
  }
  clearRouteLine(){
    this.routeLine = L.polyline([]);
  }
}
export default new MapView();
