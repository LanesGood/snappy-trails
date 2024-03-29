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
        const imageData = model.prepareImageData(exifData, file.name)
        const { latitude, longitude } = imageData;

        const newImage = {
          file,
          imgId,
          imgOrder,
          latitude,
          longitude,
        };

        model.addImage(newImage);
        mapView.renderPhotoMarker(latitude, longitude, file, imgId);
        panelView.renderPreviewCard(newImage);
        mapView.flyToImageBounds(state.images);
      } catch (e) {
        panelView.renderToast(e)
        console.error(e);
      }
    } else {
      panelView.renderToast(`${file.name} is already in the destination list`, 'info');
    }
  }

  mapView.clearRouteLine();
  panelView.removeRouteInfo();
  panelView.fileInput.value = '';
  controlSubmit(state.transportMode);
};

const controlTransportMode = function (e) {
  mapView.clearRouteLine();
  panelView.removeRouteInfo();
  let transportMode = e.target.value;
  model.setTransportMode(transportMode);
  controlSubmit(state.transportMode);
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
  model.removeImage('imgId', i);
  mapView.clearRouteLine();
  panelView.removeRouteInfo();
  controlSubmit(state.transportMode);
};

const controlUserLocation = async function (e) {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await model.getPosition();
      // Add current location to images array
      model.addImage({
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
      controlSubmit(state.transportMode);
    } catch (e) {
      console.error(e);
      panelView.renderToast(e.message);
    }
  } else if (!e.target.checked) {
    // Remove current location marker
    if (mapView.map.hasLayer(mapView.currentPositionMarker)) {
      mapView.map.removeLayer(mapView.currentPositionMarker);
    }
    // Remove current location from coords array
    model.removeImage('currentPosition', true);

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
    panelView.removeRouteInfo();
    mapView.clearRouteLine();
    controlSubmit(state.transportMode);
    return state.images;
  }
};
const controlLocationPreviewClick = function () {
  let currentCoords = state.images.find((image) => image.currentPosition);
  mapView.map.flyTo([currentCoords.latitude, currentCoords.longitude], 15);
};

const controlRemoveLocationPreview = function () {
  // Remove current location from coords array
  model.removeImage('currentPosition', true);
  // Remove location preview card
  panelView.imageList.removeChild(panelView.locationPreviewCard);
  panelView.removeRouteInfo();
  mapView.clearRouteLine();
  // Remove map marker for current location
  if (mapView.map.hasLayer(mapView.currentPositionMarker)) {
    mapView.map.removeLayer(mapView.currentPositionMarker);
  }
  controlSubmit(state.transportMode);
};

// Update the model based on preview cards sorted via drag
const controlImagesOrder = function () {
  const sortOrder = [
    ...panelView.imageList.querySelectorAll('.preview__card'),
  ].map((el) => el.getAttribute('data-img-id'));
  model.sortImages(sortOrder);
  controlSubmit(state.transportMode);
};

const controlSubmit = async function (transportMode) {
  if (state.images.length < 2) return;
  panelView.removeRouteInfo();
  mapView.clearRouteLine();
  model.setTransportMode(transportMode);
  try {
    const routeData = await model.getRoute(state.transportMode);
    state.routeData = routeData;
    mapView.flyToImageBounds(state.images);
    mapView.renderRouteLine(state.routeData, state.transportMode);
    panelView.renderRoutePreviewCard(state.routeData, state.transportMode);
  } catch(e) {
    panelView.renderToast(e);
  }
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
  panelView.removeRouteInfo();

  // reset to default coords/world view
  panelView.form.reset();
};

export const init = function () {
  console.log('Snappy trails is up and running. Reticulating splines');

  state.images.length > 0 && panelView.renderAllImgs(state.images);
  mapView.render();
  panelView.addHandlerUserLocation(controlUserLocation);
  panelView.addHandlerFileInput(controlAddFiles);
  panelView.addHandlerTransportButton(controlTransportMode);
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
