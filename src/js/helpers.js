// Utility functions
export function toMiles(meters) {
  return meters * 0.000621371192;
}
export function toMeters(miles) {
  miles * 1609.344;
}

export function miliToTime(mili) {
  return new Date(mili).toISOString().slice(11, -5);
} // Currently doesnt work for time > 24 hrs

export function round(number, precision) {
  return Math.round(number * precision) / precision;
}

// Function to convert degree minute second coordinates to decimal degrees
export function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  // decimal = degrees + (minutes ÷ 60) + (seconds ÷ 3,600)
  var dd = degrees + minutes / 60 + seconds / 3600;
  if (direction == 'S' || direction == 'W') {
    dd = dd * -1;
  }
  return dd;
}
