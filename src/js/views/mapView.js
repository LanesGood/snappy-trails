import { DEFAULT_COORDS } from '../config';
import { miliToTime } from '../helpers';
class MapView {
  // Leaflet objects and initialization
  constructor() {
    this.map = L.map('map').setView([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
    this.Stamen_TonerLite = L.tileLayer(
      'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'mapbox://styles/lanesgood/clhsi5wdt00yk01pffukxf1s4',
      {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png',
      }
    );
    this.routeLine = L.polyline([]); // Set empty routeline to allow later clearing. Will likely later change to array of features to permit multiple lines
    this.photoMarkers = L.layerGroup();
    this.currentPositionMarker = L.marker();
  }
  render() {
    this.Stamen_TonerLite.addTo(this.map);
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
    console.log(routeData);
    this.routeLine.setLatLngs(routeCoords).addTo(this.map);
    this.routeLine.bindPopup(`${routeTime}`).openPopup();
  }
}
export default new MapView();
