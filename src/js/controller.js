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
    if (!model.state.uploadedImages.includes((f) => f.name === file.name)) {
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
  // input.value = null;
  console.log(model.state);
};
// TODO: wire up and fix image removal handler
const controlRemoveImage = function (i) {
  console.log('test');
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === i) mapView.photoMarkers.removeLayer(layer);
  });
  panelView.preview.removeChild(
    panelView.preview.querySelector(`[data-photo-index="${i}"]`)
  );
  model.state.uploadedImages = model.state.uploadedImages.filter(
    (img) => img.photoIndex !== i
  );
  model.state.imageCoords = model.state.imageCoords.filter(
    (img) => img.photoIndex !== i
  );
};

const controlSubmit = async function (transportMode) {
  const routeData = await model.getRoute(transportMode);
  mapView.map.flyToBounds(model.state.imageCoords);
  mapView.renderRouteLine(routeData);
  panelView.renderRoutePreview(routeData);
};
const controlClear = function () {
  model.state.uploadedImages.length = 0;
  model.state.imageCoords.length = 0;
  // remove all photo markers
  mapView.photoMarkers.clearLayers();
  // remove route from map
  mapView.routeLine.remove(map);
  mapView.map.flyTo([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
};
const init = function () {
  console.log('Snappy trails is up and running. Reticulating splines');

  mapView.render();
  panelView.addHandlerFileInput(controlAddFiles);
  // panelView.addHandlerRemoveImage(controlRemoveImage);
  panelView.addHandlerSubmit(controlSubmit);
  panelView.addHandlerClear(controlClear);
};
init();
