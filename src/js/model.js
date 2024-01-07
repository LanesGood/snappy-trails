import { ConvertDMSToDD } from './helpers.js';
const { GRAPHHOPPER_KEY } = process.env;
export const state = {
  images: [],
  transportMode: 'foot',
  routeData: {},
};
export function addImage(image) {
  state.images.push(image);
}
export function removeImage(key, value) {
  state.images = state.images.filter((img) => img[key] !== value);
}
export function sortImages(order) {
  state.images = state.images
    .sort((a, b) => order.indexOf(a.imgId) - order.indexOf(b.imgId))
    .map((img, i) => ({ ...img, imgOrder: i }));
}
export function setTransportMode(mode) {
  state.transportMode = mode;
}
// Extract image EXIF data in a promise
export async function getExifData(file) {
  file.exifData = null;
  const exifData = await new Promise((resolve, reject) =>
    EXIF.getData(file, function () {
      resolve({
        Make: EXIF.getTag(this, 'Make'),
        DateTime: EXIF.getTag(this, 'DateTime'),
        GPSLatitudeRef: EXIF.getTag(this, 'GPSLatitudeRef'),
        GPSLatitude: EXIF.getTag(this, 'GPSLatitude'),
        GPSLongitudeRef: EXIF.getTag(this, 'GPSLongitudeRef'),
        GPSLongitude: EXIF.getTag(this, 'GPSLongitude'),
      });
      reject(
        new Error(file.name + ': There was an error extracting EXIF data from this image')
      );
    })
  );
  return exifData;
}
export function prepareImageData(tags, filename) {
  const {
    DateTime,
    GPSLatitudeRef,
    GPSLatitude,
    GPSLongitudeRef,
    GPSLongitude,
  } = tags;
  if (!GPSLatitudeRef || !GPSLatitude) {
    throw new Error(filename + ' has no location data');
  }
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
    latitude,
    longitude,
  };
  return imageData;
}

export async function getRoute(transportMode) {
  try {
    const pointArray = state.images
      .sort((a, b) => a.imgOrder - b.imgOrder)
      .map(({ latitude, longitude }) => [+longitude, +latitude]);
    const query = new URLSearchParams({
      key: GRAPHHOPPER_KEY,
    }).toString();
    const res = await fetch(`https://graphhopper.com/api/1/route?${query}`, {
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
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message}`);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

export const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
