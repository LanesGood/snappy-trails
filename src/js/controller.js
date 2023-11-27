import * as model from './model.js';
import panelView from './views/panelView.js';
import mapView from './views/mapView.js';

if (module.hot) {
  module.hot.accept();
}
const { state } = model;

const controlAddFiles = async function (fileList) {
  let nextImgOrder = state.images.length; // Initialize with the current count
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    if (!state.images.some((img) => img.file?.name === file.name)) {
      const imgOrder = nextImgOrder++;
      const imgId = crypto.randomUUID();

      try {
        const exifData = await model.getExifData(file);
        const { latitude, longitude } = exifData;

        const newImage = {
          file,
          imgId,
          imgOrder,
          latitude,
          longitude,
        };

        state.images.push(newImage);

        mapView.renderPhotoMarker(latitude, longitude, file, imgId);
        panelView.renderPreviewCard(newImage);
        mapView.flyToImageBounds(state.images);
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
  panelView.checkSubmitBtn(state.images.length);
};

const controlPreviewClick = function (i) {
  const img = state.images.find((img) => img.imgId === i);
  mapView.map.flyTo([img.latitude, img.longitude], 15);
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.imgId === i) {
      layer.openPopup();
    }
  });
};

const controlRouteCardClick = function () {
  panelView.renderRoutePanel(state.routeData, state.transportMode);
};
const controlRouteBackClick = function () {
  panelView.routePanel.remove();
  panelView.renderAllImgs(state.images);
};
// Remove image from state and prevew when close (x) button clicked
const controlRemoveImage = function (i) {
  mapView.photoMarkers.eachLayer((layer) => {
    if (layer.imgId === i) {
      mapView.map.removeLayer(layer);
    }
  });
  panelView.imageList.removeChild(
    panelView.imageList.querySelector(`[data-img-id="${i}"]`)
  );
  state.images = state.images.filter((img) => img.imgId !== i);
  mapView.clearRouteLine();
  panelView.checkSubmitBtn(state.images.length);
};

const controlUserLocation = async function (e) {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await model.getPosition();
      // Add current location to images array
      state.images.push({
        file: null,
        imgId: 'currentCoords',
        imgOrder: 1000,
        latitude,
        longitude,
        currentPosition: true,
      });
      // Add current location marker
      mapView.currentPositionMarker.setLatLng([latitude, longitude]);
      mapView.currentPositionMarker.bindPopup('Current location');
      mapView.photoMarkers.addLayer(mapView.currentPositionMarker);

      // Add current location preview card
      panelView.renderLocationCard([latitude, longitude]);
      mapView.currentPositionMarker.openPopup();
      mapView.flyToImageBounds(state.images);
      panelView.checkSubmitBtn(state.images.length);
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
    state.images = state.images.filter(image => !image.currentPosition);

    // Set map view based on existing images
    if (state.images.length > 0) {
      mapView.flyToImageBounds(state.images);
    } else {
      mapView.flyToDefaultCoords();
    }
    // Remove location preview card
    panelView.imageList.removeChild(panelView.locationPreviewCard);
    // Remove current position marker
    mapView.photoMarkers.removeLayer(mapView.currentPositionMarker);
    panelView.checkSubmitBtn(state.images.length);
    return state.images;
  }
};
const controlLocationPreviewClick = function () {
  let currentCoords = state.images.find(image => image.currentPosition);
  mapView.map.flyTo([currentCoords.latitude, currentCoords.longitude], 15);
};

const controlRemoveLocationPreview = function () {
  // Remove current location from coords array
  state.images = state.images.filter(image => !image.currentPosition);
  // Remove location preview card
  panelView.imageList.removeChild(panelView.locationPreviewCard);
  panelView.checkSubmitBtn(state.images.length);
  // Remove map marker for current location
  if (mapView.map.hasLayer(mapView.currentPositionMarker)) {
    mapView.map.removeLayer(mapView.currentPositionMarker);
  }
};

// Update the model based on preview cards sorted via drag
const controlImagesOrder = function () {
  const sortOrder = [
    ...panelView.imageList.querySelectorAll('.preview__card'),
  ].map((el) => el.getAttribute('data-img-id'));
  state.images = state.images
    .sort((a, b) => sortOrder.indexOf(a.imgId) - sortOrder.indexOf(b.imgId))
    .map((img, i) => ({ ...img, imgOrder: i }));
};

const controlSubmit = async function (transportMode) {
  state.transportMode = transportMode;
  const routeData = await model.getRoute(state.transportMode);
  state.routeData = routeData;
  mapView.flyToImageBounds(state.images);
  mapView.renderRouteLine(state.routeData, state.transportMode);
  panelView.renderRoutePreviewCard(state.routeData, state.transportMode);
};

const controlClear = function () {
  // Remove all images
  state.images.length = 0;
  // remove all photo markers
  mapView.photoMarkers.clearLayers();
  // remove route from map
  mapView.clearRouteLine();
  // Reset map view
  mapView.flyToDefaultCoords();
  // Remove all image previews
  panelView.imageList.replaceChildren();
  !!panelView.routePreviewCard && panelView.routePreviewCard.remove();
  !!panelView.routePanel && panelView.routePanel.remove();

  // reset to default coords/world view
  panelView.form.reset();
  panelView.checkSubmitBtn(state.images.length);
};

export const init = function () {
  console.log('Snappy trails is up and running. Reticulating splines');

  state.images.length > 0 && panelView.renderAllImgs(state.images);
  mapView.render();
  panelView.addHandlerUserLocation(controlUserLocation);
  panelView.addHandlerFileInput(controlAddFiles);
  panelView.addHandlerDropInput(controlAddFiles);
  panelView.addHandlerPreviewClick(controlPreviewClick);
  panelView.addHandlerDragPreviewCard(controlImagesOrder);
  panelView.addHandlerLocationPreviewClick(controlLocationPreviewClick);
  panelView.addHandlerRemoveCurrentLocation(controlRemoveLocationPreview);
  panelView.addHandlerRemoveImage(controlRemoveImage);
  panelView.addHandlerSubmit(controlSubmit);
  panelView.addHandlerRouteCardClick(controlRouteCardClick);
  panelView.addHandlerRoutePanelBack(controlRouteBackClick);
  panelView.addHandlerClear(controlClear);
};
