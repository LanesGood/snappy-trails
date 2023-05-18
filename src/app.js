'use strict';

// DOM elements and variables
// const input = document.querySelector('input[type=file]');
// const submitBtn = document.querySelector('#submit-route-btn');
// const form = document.querySelector('form');
// const clearBtn = document.querySelector('#clear-btn');
// const preview = document.querySelector('#preview');
const userLocationInput = document.querySelector('#user-location');
// let currentLatLng = [];
// const defaultCoords = [-77.041493, 38.930859];
// let uploadedImages = [];
// let imageCoords = [];
// let routePreviewCard;

// Utility functions
// const toMiles = (meters) => meters * 0.000621371192;
// const toMeters = (miles) => miles * 1609.344;
// function round(number, precision) {
//   return Math.round(number * precision) / precision;
// }
// const miliToTime = (mili) => new Date(mili).toISOString().slice(11, -5); // Currently doesnt work for time > 24 hrs

// Leaflet objects and initialization
// const map = L.map('map').setView([defaultCoords[1], defaultCoords[0]], 10);
// const Stamen_TonerLite = L.tileLayer(
//   'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
//   {
//     attribution:
//       'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//     subdomains: 'abcd',
//     minZoom: 0,
//     maxZoom: 20,
//     ext: 'png',
//   }
// ).addTo(map);
// const routeLine = L.polyline([]); // Set empty routeline to allow later clearing. Will likely later change to array of features to permit multiple lines
// const photoMarkers = L.layerGroup();
// const currentPositionMarker = L.marker();
// photoMarkers.addTo(map);

// Function to convert degree minute second coordinates to decimal degrees
// function ConvertDMSToDD(degrees, minutes, seconds, direction) {
//   // decimal = degrees + (minutes ÷ 60) + (seconds ÷ 3,600)
//   var dd = degrees + minutes / 60 + seconds / 3600;
//   if (direction == 'S' || direction == 'W') {
//     dd = dd * -1;
//   }
//   return dd;
// }

// // Function to print image, info and coords to preview area
// function renderPreviewCard(file, exifData, i) {
//   const previewCard = document.createElement('div');
//   previewCard.classList.add('preview__card');
//   previewCard.dataset.photoIndex = i;
//   const previewCardHeader = document.createElement('div');
//   previewCardHeader.classList.add('preview__card--header');
//   const previewCardText = document.createElement('div');
//   previewCardText.classList.add('preview__card--text');

//   // Create remove button
//   const previewCardRemoveBtn = document.createElement('button');
//   previewCardRemoveBtn.innerText = 'X';
//   previewCardRemoveBtn.setAttribute('title', 'Remove this item');
//   previewCardRemoveBtn.classList.add('preview__card--remove-btn');

//   // Create card image
//   const previewImage = document.createElement('img');
//   previewImage.classList.add('preview__image');
//   previewImage.src = URL.createObjectURL(file);

//   // Append card items
//   previewCardHeader.appendChild(previewImage);
//   previewCard.appendChild(previewCardHeader);
//   previewCard.appendChild(previewCardRemoveBtn);
//   previewCardRemoveBtn.addEventListener('click', () => removeImageHandler(i));

//   // Convert image date from exif data format to javascript format
//   const [year, month, day, hours, minutes, seconds] =
//     exifData.DateTime.split(/[: ]/);
//   const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

//   previewCardText.innerHTML = `
//   <h4>${file.name}</h4>
//   <dl>
//     <dt>Date:</dt><dd>${dateObject.toLocaleDateString()}</dd>
//     <dt>Time:</dt><dd>${dateObject.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     })}</dd>
//     <dt>lat, lng: </dt><dd>${exifData.latitude.toFixed(
//       2
//     )}, ${exifData.longitude.toFixed(2)}</dd>
//     <dt>Camera:</dd><dd> ${exifData.Make} ${exifData.Model}</dd>
//   </dl>
// `;

//   previewCard.appendChild(previewCardText);
//   previewCard.addEventListener('click', () =>
//     previewCardClickHandler(exifData, i)
//   );
//   preview.insertAdjacentElement('afterbegin', previewCard);
// }

// Flyto and Open Photo Marker
function previewCardClickHandler(exifData, i) {
  map.flyTo([exifData.latitude, exifData.longitude], 15);
  photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === i) layer.openPopup();
  });
}

function removeImageHandler(i) {
  photoMarkers.eachLayer((layer) => {
    if (layer.photoIndex === i) photoMarkers.removeLayer(layer);
  });
  preview.removeChild(preview.querySelector(`[data-photo-index="${i}"]`));
  uploadedImages = uploadedImages.filter((img) => img.photoIndex !== i);
  imageCoords = imageCoords.filter((img) => img.photoIndex !== i);
}

// Add preview item for current location

// Add marker with popup to map for each image added
// function setPhotoMarker(latitude, longitude, file, i) {
//   const imageURL = URL.createObjectURL(file);
//   const photoPopup = L.popup({
//     autoClose: false,
//   }).setContent(`<img class='marker-photo' src='${imageURL}' />`);
//   const photoMarker = L.marker([latitude, longitude]);
//   photoMarker.photoIndex = i;
//   photoMarkers.addLayer(photoMarker);
//   photoMarker.bindPopup(photoPopup).openPopup();
// }

// const getPosition = function () {
//   return new Promise(function (resolve, reject) {
//     navigator.geolocation.getCurrentPosition(resolve, reject);
//   });
// };

// Event handler to run all functions on image and image data
// input.addEventListener('change', async () => {
//   const fileList = input.files;
//   if (!fileList.length) return;
//   submitBtn.disabled = false;
//   Array.from(fileList).forEach(async (file, i) => {
//     if (!uploadedImages.some((f) => f.name === file.name)) {
//       // only add photos if they haven't been added yet
//       uploadedImages.push({ file, photoIndex: i });
//       try {
//         const exifData = await getExifData(file);
//         const { latitude, longitude } = exifData;
//         imageCoords.push({ photoIndex: i, lat: latitude, lng: longitude });

//         // Create a photo marker
//         setPhotoMarker(latitude, longitude, file, i);
//         renderPreviewCard(file, exifData, i);
//         map.flyToBounds(imageCoords);
//       } catch (e) {
//         console.error(e);
//         alert('Could not extract location data for this image');
//       }
//     } else {
//       alert(`${file.name} is already in the destination list`);
//     }
//   });
//   input.value = null;
// });

// Locate user when checkbox checked
userLocationInput.addEventListener('change', async (e) => {
  if (e.target.checked) {
    try {
      const {
        coords: { latitude, longitude },
      } = await getPosition();
      currentLatLng.push(latitude, longitude);
      // Add current location from coordinates array
      imageCoords.push({
        photoIndex: 1000,
        lat: latitude,
        lng: longitude,
      });
      // Add current location marker
      currentPositionMarker.setLatLng(currentLatLng);
      currentPositionMarker.bindPopup('Current location');
      photoMarkers.addLayer(currentPositionMarker);
      currentPositionMarker.openPopup();
      map.flyToBounds(imageCoords);
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
    imageCoords = imageCoords.filter(
      (imgCoord) =>
        !(imgCoord.lat === currentLatLng[0] && imgCoord.lng === currentLatLng[1])
    );

    if (imageCoords.length > 0) {
      map.flyToBounds(imageCoords);
    } else {
      map.flyTo([defaultCoords[1], defaultCoords[0]], 10);
    }
    return imageCoords;
  }
});

