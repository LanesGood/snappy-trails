import * as model from './model.js';
import panelView from './views/panelView.js';
import mapView from './views/mapView.js';
import { DEFAULT_COORDS } from './config.js';

if (module.hot) {
  module.hot.accept();
}
const { state } = model;

const controlAddFiles = async function (fileList) {
  panelView._submitBtn.disabled = false;
  let nextPhotoIndex = state.uploadedImages.length; // Initialize with the current count
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    if (!state.uploadedImages.some((img) => img.file.name === file.name)) {
      const photoIndex = nextPhotoIndex++;

      try {
        const exifData = await model.getExifData(file);
        const { latitude, longitude } = exifData;

        const newImage = {
          file,
          photoIndex,
          latitude,
          longitude,
        };

        state.uploadedImages.push(newImage);
        state.imageCoords.push({
          photoIndex,
          lat: latitude,
          lng: longitude,
        });

        mapView.renderPhotoMarker(latitude, longitude, file, photoIndex);
        panelView.renderPreviewCard(newImage);
        mapView.map.flyToBounds(state.imageCoords);
      } catch (e) {
        console.error(e);
        alert('Could not extract location data for this image');
      }
    } else {
      alert(`${file.name} is already in the destination list`);
    }
  }

  mapView.clearRouteLine();
  panelView.input.value = '';
};
  
const controlPreviewClick = function (i) {
  const img = state.imageCoords.find((img) => img.photoIndex === +i);
  mapView.map.flyTo([img.lat, img.lng], 15);
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === +i) {
      layer.openPopup();
    }
  });
};

const controlRouteCardClick = function () {
  panelView.renderRoutePanel(state.routeData, state.transportMode);
};
const controlRouteBackClick = function () {
  panelView.routePanel.remove();
  panelView.renderAllImgs(state);
  (state.currentLatLng.length > 0 && panelView.renderLocationCard(state.currentLatLng))
}
// Remove image from state and prevew when close (x) button clicked
const controlRemoveImage = function (i) {
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === +i) {
      mapView.map.removeLayer(layer);
    }
  });
  panelView.imageList.removeChild(
    panelView.imageList.querySelector(`[data-photo-index="${i}"]`)
  );
  state.uploadedImages = state.uploadedImages.filter(
    (img) => img.photoIndex !== +i
  );
  state.imageCoords = state.imageCoords.filter((img) => img.photoIndex !== +i);
  mapView.clearRouteLine();
};

const controlUserLocation = async function (e) {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await model.getPosition();
      state.currentLatLng.push(latitude, longitude);
      // Add current location from coordinates array
      state.imageCoords.push({
        photoIndex: 1000,
        lat: latitude,
        lng: longitude,
      });
      // Add current location marker
      mapView.currentPositionMarker.setLatLng(state.currentLatLng);
      mapView.currentPositionMarker.bindPopup('Current location');
      mapView.photoMarkers.addLayer(mapView.currentPositionMarker);

      // Add current location preview card
      panelView.renderLocationCard(state.currentLatLng);
      mapView.currentPositionMarker.openPopup();
      mapView.map.flyToBounds(state.imageCoords);
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
    state.imageCoords = state.imageCoords.filter(
      (imgCoord) =>
        !(
          imgCoord.lat === state.currentLatLng[0] &&
          imgCoord.lng === state.currentLatLng[1]
        )
    );
    // Remove current lat long
    state.currentLatLng.length = 0;

    // Set map view based on existing images
    if (state.imageCoords.length > 0) {
      mapView.map.flyToBounds(state.imageCoords);
    } else {
      mapView.map.flyTo([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
    }
    // Remove location preview card
    panelView.imageList.removeChild(panelView.locationPreviewCard);
    // Remove current position marker
    mapView.photoMarkers.removeLayer(mapView.currentPositionMarker);
    return state.imageCoords;
  }
};
const controlLocationPreviewClick = function () {
  mapView.map.flyTo([state.currentLatLng[0], state.currentLatLng[1]], 15);
};

const controlRemoveLocationPreview = function () {
  // Remove current location from coords array
  state.imageCoords = state.imageCoords.filter(
    (imgCoord) =>
      !(
        imgCoord.lat === state.currentLatLng[0] &&
        imgCoord.lng === state.currentLatLng[1]
      )
  );
  // Remove current lat long
  state.currentLatLng.length = 0;
  // Remove location preview card
  panelView.imageList.removeChild(panelView.locationPreviewCard);
  // Remove map marker for current location
  if (mapView.map.hasLayer(mapView.currentPositionMarker)) {
    mapView.map.removeLayer(mapView.currentPositionMarker);
  }
};

const controlSubmit = async function (transportMode) {
  state.transportMode = transportMode;
  const routeData = await model.getRoute(state.transportMode);
  state.routeData = routeData;
  mapView.map.flyToBounds(state.imageCoords);
  mapView.renderRouteLine(state.routeData, state.transportMode);
  panelView.renderRoutePreviewCard(state.routeData);
};

const controlClear = function () {
  // Remove all images
  state.uploadedImages.length = 0;
  state.imageCoords.length = 0;
  // remove all photo markers
  mapView.photoMarkers.clearLayers();
  // remove route from map
  mapView.clearRouteLine();
  // Reset map view
  mapView.map.flyTo([DEFAULT_COORDS[1], DEFAULT_COORDS[0]], 10);
  // Remove all image previews
  panelView.imageList.replaceChildren();
  !!panelView.routePreviewCard && panelView.routePreviewCard.remove();
  panelView.routePanel.remove();

  // reset to default coords/world view
  panelView.form.reset();
  panelView._submitBtn.disabled = true;
};

export const init = function () {
  console.log('Snappy trails is up and running. Reticulating splines');

  state.imageCoords.length > 0 && panelView.renderAllImgs(state);
  mapView.render();
  panelView.addHandlerUserLocation(controlUserLocation);
  panelView.addHandlerFileInput(controlAddFiles);
  panelView.addHandlerDropInput(controlAddFiles);
  panelView.addHandlerPreviewClick(controlPreviewClick);
  panelView.addHandlerLocationPreviewClick(controlLocationPreviewClick);
  panelView.addHandlerRemoveCurrentLocation(controlRemoveLocationPreview);
  panelView.addHandlerRemoveImage(controlRemoveImage);
  panelView.addHandlerSubmit(controlSubmit);
  panelView.addHandlerRouteCardClick(controlRouteCardClick);
  panelView.addHandlerRoutePanelBack(controlRouteBackClick);
  panelView.addHandlerClear(controlClear);
};
