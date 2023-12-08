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
export function getExifData(file) {
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
      reject(new Error('There was an error '));
    });
  });
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
    console.error(error);
    return error;
  }
}

export const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
