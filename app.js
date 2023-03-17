'use strict';

// DOM elements and variables
const input = document.querySelector('input[type=file]');
const output = document.querySelector('#output');
let latDMS, latRef, latitude, longDMS, longRef, longitude;
const defaultCoords = [-77.041493, 38.930859];

const map = L.map('map').setView([defaultCoords[1], defaultCoords[0]], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Function to convert degree minute second coordinates to decimal degrees
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  // decimal = degrees + (minutes ÷ 60) + (seconds ÷ 3,600)
  var dd = degrees + minutes / 60 + seconds / 3600;
  if (direction == 'S' || direction == 'W') {
    dd = dd * -1;
  }
  return dd;
}

// Write image GPS information to the page
const renderCoordinates = ({
  latRef,
  latDMS,
  latitude,
  longRef,
  longDMS,
  longitude,
}) => {
  let html = `
              <div>
                <h4>Image 1</h4>
                <h5>${latRef}</h5>
                <p>${latDMS}</p>
                <p>${latitude}</p>
                <h5>${longRef}</h5>
                <p>${longDMS}</p>   
                <p>${longitude}</p>
              </div>
              `;
  output.insertAdjacentHTML('afterbegin', html);
};

// Extract image EXIF data in a promise
function getExifData(file) {
  return new Promise(function (resolve, reject) {
    EXIF.getData(file, function () {
      latRef = EXIF.getTag(this, 'GPSLatitudeRef');
      latDMS = EXIF.getTag(this, 'GPSLatitude');
      longRef = EXIF.getTag(this, 'GPSLongitudeRef');
      longDMS = EXIF.getTag(this, 'GPSLongitude');
      latitude = ConvertDMSToDD(latDMS[0], latDMS[1], latDMS[2], latRef);
      longitude = ConvertDMSToDD(longDMS[0], longDMS[1], longDMS[2], longRef);
      resolve({ latRef, latDMS, latitude, longRef, longDMS, longitude });
      reject(new Error('There was an error '));
    });
  });
}

// Async function to get routing data from graphhopper. Called after extracting photo EXIF data
async function getRoute({ latitude, longitude }) {
  const query = new URLSearchParams({
    key: 'db56c0cf-613e-456d-baea-46650066da62',
  }).toString();

  const resp = await fetch(`https://graphhopper.com/api/1/route?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      points: [[+longitude, +latitude], defaultCoords],
      points_encoded: false,
    }),
  });
  const data = await resp.json();
  return data
}

function drawRoute(routeData) {
  const routeCoords = routeData.paths[0].points.coordinates.map((coords) =>  [coords[1], coords[0]]);  
  L.polyline(routeCoords).addTo(map);
}

// Event handler to run all functions on image and image data
input.addEventListener('change', async () => {
  const [file] = input.files;
  if (!file) return;
  const imageCoords = await getExifData(file);
  renderCoordinates(imageCoords);
  const routeData = await getRoute(imageCoords);
  drawRoute(routeData)
});
