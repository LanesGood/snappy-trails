'use strict';

// DOM elements and variables
const input = document.querySelector('input[type=file]');
const submitBtn = document.querySelector('#submit-route-btn');
const form = document.querySelector('form');
const clearBtn = document.querySelector('#clear-btn');
const preview = document.querySelector('#preview');
const userLocationInput = document.querySelector('#user-location');
let currentLatLng = [];
const defaultCoords = [-77.041493, 38.930859];
const uploadedImages = [];
let imageCoordsArray = [];
let routePreviewCard;

// Utility functions
const toMiles = (meters) => meters * 0.000621371192;
const toMeters = (miles) => miles * 1609.344;
function round(number, precision) {
  return Math.round(number * precision) / precision;
}
const miliToTime = (mili) => new Date(mili).toISOString().slice(11, -5); // Currently doesnt work for time > 24 hrs

// Leaflet objects and initialization
const map = L.map('map').setView([defaultCoords[1], defaultCoords[0]], 10);
const Stamen_TonerLite = L.tileLayer(
  'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
  }
).addTo(map);
const routeLine = L.polyline([]); // Set empty routeline to allow later clearing. Will likely later change to array of features to permit multiple lines
const photoMarkers = L.layerGroup();
const currentPositionMarker = L.marker();
photoMarkers.addTo(map);

// Function to convert degree minute second coordinates to decimal degrees
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  // decimal = degrees + (minutes ÷ 60) + (seconds ÷ 3,600)
  var dd = degrees + minutes / 60 + seconds / 3600;
  if (direction == 'S' || direction == 'W') {
    dd = dd * -1;
  }
  return dd;
}

// Extract image EXIF data in a promise
function getExifData(file) {
  return new Promise(function (resolve, reject) {
    EXIF.getData(file, function () {
      const {
        DateTime,
        GPSImgDirection,
        GPSImgDirectionRef,
        GPSLatitudeRef,
        GPSLatitude,
        GPSLongitudeRef,
        GPSLongitude,
        Make,
        Model,
      } = EXIF.getAllTags(this);
      const latitude = ConvertDMSToDD(
        GPSLatitude[0],
        GPSLatitude[1],
        GPSLatitude[2],
        GPSLatitudeRef
      );
      const longitude = ConvertDMSToDD(
        GPSLongitude[0],
        GPSLongitude[1],
        GPSLongitude[2],
        GPSLongitudeRef
      );
      const imageData = {
        DateTime,
        GPSImgDirection,
        GPSImgDirectionRef,
        latitude,
        longitude,
        Make,
        Model,
      };
      resolve(imageData);
    });
    reject(new Error('There was an error '));
  });
}

// Async function to get routing data from graphhopper. Called after extracting photo EXIF data
async function getRoute(imageCoordsArray, transportMode) {
  try {
    const pointArray = imageCoordsArray.map(([latitude, longitude]) => [
      +longitude,
      +latitude,
    ]);
    const query = new URLSearchParams({
      key: 'db56c0cf-613e-456d-baea-46650066da62', // remove from github
    }).toString();
    const resp = await fetch(`https://graphhopper.com/api/1/route?${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: transportMode,
        points: pointArray,
        points_encoded: false,
      }),
    });
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

function drawRoute(routeData) {
  const routeCoords = routeData.paths[0].points.coordinates.map((coords) => [
    coords[1],
    coords[0],
  ]);
  const routeTime = miliToTime(routeData.paths[0].time);
  console.log(routeData);
  routeLine.setLatLngs(routeCoords).addTo(map);
  routeLine.bindPopup(`${routeTime}`).openPopup();
}

function renderRoutePreview(routeData) {
  const routeTime = miliToTime(routeData.paths[0].time);
  const routeDistance = routeData.paths[0].distance;
  const routePreviewEl = document.getElementsByClassName(
    'preview__card--route'
  );
  if (!routePreviewEl.length) {
    routePreviewCard = document.createElement('div');
    routePreviewCard.classList.add(
      'preview__card--text',
      'preview__card--route',
      'preview__card'
    );
    preview.insertAdjacentElement('afterbegin', routePreviewCard);
  }
  routePreviewCard.innerHTML = `
  <h4>Route</h4>
  <span><h4>${routeTime}</h4>
  <p>${round(toMiles(routeDistance), 100)} mi</p>
  </span>
  `;
}

// Function to print image, info and coords to preview area
function renderPreviewCard(file, exifData, i) {
  const previewCard = document.createElement('div');
  previewCard.classList.add('preview__card');
  previewCard.dataset.photoIndex = i;
  const previewCardHeader = document.createElement('div');
  previewCardHeader.classList.add('preview__card--header');
  const previewCardText = document.createElement('div');
  previewCardText.classList.add('preview__card--text');
  const previewImage = document.createElement('img');
  previewImage.classList.add('preview__image');
  previewImage.src = URL.createObjectURL(file);
  previewCardHeader.appendChild(previewImage);
  previewCard.appendChild(previewCardHeader);

  // Convert image date from exif data format to javascript format
  const [year, month, day, hours, minutes, seconds] =
    exifData.DateTime.split(/[: ]/);
  const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

  previewCardText.innerHTML = `
  <h4>${file.name}</h4>
  <dl>
    <dt>Date:</dt><dd>${dateObject.toLocaleDateString()}</dd>
    <dt>Time:</dt><dd>${dateObject.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}</dd>
    <dt>lat, lng: </dt><dd>${exifData.latitude.toFixed(
      2
    )}, ${exifData.longitude.toFixed(2)}</dd>
    <dt>Camera:</dd><dd> ${exifData.Make} ${exifData.Model}</dd>
  </dl>
`;

  previewCard.appendChild(previewCardText);
  previewCard.addEventListener('click', () =>
    previewCardClickHandler(exifData, i)
  );
  preview.insertAdjacentElement('afterbegin', previewCard);
}

// Flyto and Open Photo Marker
function previewCardClickHandler(exifData, i) {
  map.flyTo([exifData.latitude, exifData.longitude], 15);
  photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === i) layer.openPopup();
  });
}

// Add preview item for current location

// Add marker with popup to map for each image added
function setPhotoMarker(latitude, longitude, file, i) {
  const imageURL = URL.createObjectURL(file);
  const photoPopup = L.popup({
    autoClose: false,
  }).setContent(`<img class='marker-photo' src='${imageURL}' />`);
  const photoMarker = L.marker([latitude, longitude]);
  photoMarker.photoIndex = i;
  photoMarkers.addLayer(photoMarker);
  photoMarker.bindPopup(photoPopup).openPopup();
}

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Event handler to run all functions on image and image data
input.addEventListener('change', async () => {
  const fileList = input.files;
  if (!fileList.length) return;
  submitBtn.disabled = false;
  // Push all files into array
  for (const file of fileList) {
    uploadedImages.push(file);
  }
  uploadedImages.forEach(async (file, i) => {
    try {
      const exifData = await getExifData(file);
      const { latitude, longitude } = exifData;
      imageCoordsArray.push([latitude, longitude]);

      setPhotoMarker(latitude, longitude, file, i);
      renderPreviewCard(file, exifData, i);
      map.flyToBounds(imageCoordsArray);
    } catch (e) {
      console.error(e);
      alert('Could not extract location data for this image');
    }
  });
});

// Locate user when checkbox checked
userLocationInput.addEventListener('change', async (e) => {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await getPosition();
      currentLatLng.push(latitude, longitude);
      // Add current location from coordinates array
      imageCoordsArray.push(currentLatLng);
      // Add current location marker
      currentPositionMarker.setLatLng(currentLatLng);
      currentPositionMarker.bindPopup('Current location');
      photoMarkers.addLayer(currentPositionMarker);
      currentPositionMarker.openPopup();
      map.flyToBounds(imageCoordsArray);
    } catch (e) {
      console.error(e);
      alert('User location not available'); // Replace with toast
    }
  } else if (!e.target.checked) {
    // Remove current location marker
    if (map.hasLayer(currentPositionMarker)) {
      map.removeLayer(currentPositionMarker);
    }
    // Remove current location from coords array
    imageCoordsArray = imageCoordsArray.filter(
      (latlng) =>
        !(latlng[0] === currentLatLng[0] && latlng[1] === currentLatLng[1])
    );

    if (imageCoordsArray.length > 0) {
      map.flyToBounds(imageCoordsArray);
    } else {
      map.flyTo([defaultCoords[1], defaultCoords[0]], 10);
    }
    return imageCoordsArray;
  }
});

clearBtn.addEventListener('click', (e) => {
  uploadedImages.length = 0;
  imageCoordsArray.length = 0;
  // remove all photo markers
  photoMarkers.clearLayers();
  // remove route from map
  routeLine.remove(map);

  // Remove all image previews
  preview.replaceChildren();

  // reset to default coords/world view
  form.reset();
  submitBtn.disabled = true;
  map.flyTo([defaultCoords[1], defaultCoords[0]], 10);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const transportMode = formData.get('transport-mode');
  const routeData = await getRoute(imageCoordsArray, transportMode);

  map.flyToBounds(imageCoordsArray);
  drawRoute(routeData);
  renderRoutePreview(routeData);
});
