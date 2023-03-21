'use strict';

// DOM elements and variables
const input = document.querySelector('input[type=file]');
const submitBtn = document.querySelector('#submit-route-btn');
const preview = document.querySelector('#preview');
let latDMS, latRef, latitude, longDMS, longRef, longitude;
const defaultCoords = [-77.041493, 38.930859];
const imageCoordsArray = [];

const map = L.map('map').setView([defaultCoords[1], defaultCoords[0]], 13);
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
      latitude = ConvertDMSToDD(
        GPSLatitude[0],
        GPSLatitude[1],
        GPSLatitude[2],
        GPSLatitudeRef
      );
      longitude = ConvertDMSToDD(
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
      reject(new Error('There was an error '));
    });
  });
}

// Async function to get routing data from graphhopper. Called after extracting photo EXIF data
async function getRoute(imageCoordsArray) {
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
      // profile: 'foot',
      points: pointArray,
      points_encoded: false,
    }),
  });
  const data = await resp.json();
  return data;
}

function drawRoute(routeData) {
  const routeCoords = routeData.paths[0].points.coordinates.map((coords) => [
    coords[1],
    coords[0],
  ]);
  L.polyline(routeCoords).addTo(map);
}

// Function to print image, info and coords to preview area
function renderImageInfo(file, exifData) {
  const previewCard = document.createElement('div');
  previewCard.classList.add('preview__card');
  const previewCardHeader = document.createElement('div');
  previewCardHeader.classList.add('preview__card--header');
  const previewCardText = document.createElement('div');
  previewCardText.classList.add('preview__card--text');
  const previewImage = document.createElement('img');
  previewImage.classList.add('preview__image');

  // Convert image date from exif data format to javascript format
  const [year, month, day, hours, minutes, seconds] =
    exifData.DateTime.split(/[: ]/);
  const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

  previewImage.src = URL.createObjectURL(file);
  previewCardHeader.appendChild(previewImage);
  previewCard.appendChild(previewCardHeader);
  previewCardText.innerHTML = `
  <h4>${file.name}</h4>
  <dl>
    <dd>Date:</dd><dt>${dateObject.toLocaleDateString()}</dt>
    <dd>Time:</dd><dt>${dateObject.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}</dt>
    <dd>lat, lng: </dd><dt>${exifData.latitude.toFixed(
      2
    )}, ${exifData.longitude.toFixed(2)}</dt>
    <dd>Camera:</dd><dt> ${exifData.Make} ${exifData.Model}</dt>
  </dl>
`;

  previewCard.appendChild(previewCardText);
  preview.insertAdjacentElement('afterbegin', previewCard);
}

// Add marker to map for each image added
function setPhotoMarker(latitude, longitude, file) {
  const imageURL = URL.createObjectURL(file);
  const photoPopup = L.popup({
    autoClose: false,
  }).setContent(`<img class='marker-photo' src='${imageURL}' />`);
  L.marker([latitude, longitude]).addTo(map).bindPopup(photoPopup).openPopup();
}

// Event handler to run all functions on image and image data
input.addEventListener('change', async () => {
  const fileList = input.files;
  if (!fileList.length) return;
  for (const file of fileList) {
    const exifData = await getExifData(file);
    const { latitude, longitude } = exifData;
    imageCoordsArray.push([latitude, longitude]);
    setPhotoMarker(latitude, longitude, file);
    renderImageInfo(file, exifData);
  }
  map.flyToBounds(imageCoordsArray);
});

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const routeData = await getRoute(imageCoordsArray);
  console.log(routeData);
  map.flyToBounds(imageCoordsArray);
  drawRoute(routeData);
});
