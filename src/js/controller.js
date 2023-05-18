import * as model from './model.js';
import panelView from './views/panelView.js';
import mapView from './views/mapView.js';
import { DEFAULT_COORDS } from './config.js';

if (module.hot) {
  module.hot.accept();
}
const controlAddFiles = async function (fileList) {
  panelView._submitBtn.disabled = false;
  Array.from(fileList).forEach(async (file, i) => {
    if (
      !model.state.uploadedImages.some((img) => img.file.name === file.name)
    ) {
      // only add photos if they haven't been added yet
      model.state.uploadedImages.push({ file, photoIndex: i });
      try {
        const exifData = await model.getExifData(file);
        const { latitude, longitude } = exifData;
        model.state.imageCoords.push({
          photoIndex: i,
          lat: latitude,
          lng: longitude,
        });

        // Create a photo marker
        mapView.renderPhotoMarker(latitude, longitude, file, i);
        panelView.renderPreviewCard(file, exifData, i);
        mapView.map.flyToBounds(model.state.imageCoords);
      } catch (e) {
        console.error(e);
        alert('Could not extract location data for this image');
      }
    } else {
      alert(`${file.name} is already in the destination list`);
    }
  });
};

const controlPreviewClick = function (i) {
  const img = model.state.imageCoords.find((img) => img.photoIndex === +i);
  mapView.map.flyTo([img.lat, img.lng], 15);
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === +i) {
      layer.openPopup();
    }
  });
};

const controlRemoveImage = function (i) {
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === +i) {
      mapView.map.removeLayer(layer);
    }
  });
  panelView.preview.removeChild(
    panelView.preview.querySelector(`[data-photo-index="${i}"]`)
  );
  model.state.uploadedImages = model.state.uploadedImages.filter(
    (img) => img.photoIndex !== +i
  );
  model.state.imageCoords = model.state.imageCoords.filter(
    (img) => img.photoIndex !== +i
  );
};

const controlUserLocation = async function (e) {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await model.getPosition();
      model.state.currentLatLng.push(latitude, longitude);
      // Add current location from coordinates array
      model.state.imageCoords.push({
        photoIndex: 1000,
        lat: latitude,
        lng: longitude,
      });
      // Add current location marker
      mapView.currentPositionMarker.setLatLng(model.state.currentLatLng);
      mapView.currentPositionMarker.bindPopup('Current location');
      mapView.photoMarkers.addLayer(mapView.currentPositionMarker);
      mapView.currentPositionMarker.openPopup();
      mapView.map.flyToBounds(model.state.imageCoords);
    } catch (e) {
      console.error(e);
      alert('User location not available'); // Replace with toast
    }
  } else if (!e.target.checked) {
    // Remove current location marker
    if (mapView.map.hasLayer(mapView.currentPositionMarker)) {
      mapView.map.removeLayer(mapView.currentPositionMarker);
    }
    // Remove current location from coords array
    model.state.imageCoords = model.state.imageCoords.filter(
      (imgCoord) =>
        !(
          imgCoord.lat === model.state.currentLatLng[0] &&
          imgCoord.lng === model.state.currentLatLng[1]
        )
    );

    if (model.state.imageCoords.length > 0) {
      mapView.map.flyToBounds(model.state.imageCoords);
    } else {
      mapView.map.flyTo([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
    }
    return model.state.imageCoords;
  }
};
const controlSubmit = async function (transportMode) {
  const routeData = await model.getRoute(transportMode);
  mapView.map.flyToBounds(model.state.imageCoords);
  mapView.renderRouteLine(routeData);
  panelView.renderRoutePreview(routeData);
};

const controlClear = function () {
  // Remove all images
  model.state.uploadedImages.length = 0;
  model.state.imageCoords.length = 0;
  // remove all photo markers
  mapView.photoMarkers.clearLayers();
  // remove route from map
  mapView.routeLine.remove(map);
  // Reset map view
  mapView.map.flyTo([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
};

const init = function () {
  console.log('Snappy trails is up and running. Reticulating splines');

  mapView.render();
  panelView.addHandlerUserLocation(controlUserLocation);
  panelView.addHandlerFileInput(controlAddFiles);
  panelView.addHandlerPreviewClick(controlPreviewClick);
  panelView.addHandlerRemoveImage(controlRemoveImage);
  panelView.addHandlerSubmit(controlSubmit);
  panelView.addHandlerClear(controlClear);
};
init();
