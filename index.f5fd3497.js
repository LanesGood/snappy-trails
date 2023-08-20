function e(e){return new Date(e).toISOString().slice(11,-5)}function t(e,t,r,n){var o=e+t/60+r/3600;return"S"!=n&&"W"!=n||(o*=-1),o}const r={imageCoords:[],uploadedImages:[],currentLatLng:[]};var n=new class{_parentElement=document.querySelector("#upload-form");_input=document.querySelector("#fileInput");_submitBtn=document.querySelector("#submit-route-btn");_clearBtn=document.querySelector("#clear-btn");_userLocationInput=document.querySelector("#user-location");preview=document.querySelector("#preview");form=document.querySelector("form");routePreviewCard;locationPreviewCard;addHandlerFileInput(e){this._input.addEventListener("change",(async function(t){const r=this.files;r.length&&(e(r),this.value=null)}))}addHandlerRemoveImage(e){this.preview.addEventListener("click",(function(t){if(!t.target.closest(".preview__card--remove-btn"))return;t.stopImmediatePropagation();const r=t.target.closest(".preview__card").dataset.photoIndex;e(r)}),!0)}addHandlerPreviewClick(e){this.preview.addEventListener("click",(function(t){t.preventDefault();const r=t.target.closest(".preview__card").dataset.photoIndex;r&&e(r)}))}addHandlerLocationPreviewClick(e){this.preview.addEventListener("click",(function(t){t.preventDefault();t.target.closest(".location__card")&&e()}))}addHandlerRemoveCurrentLocation(e){this.preview.addEventListener("click",(function(t){if(!t.target.closest(".location__card--remove-btn"))return;t.stopImmediatePropagation(),e();document.querySelector("#user-location").checked=!1}))}addHandlerSubmit(e){this.form.addEventListener("submit",(async t=>{t.preventDefault();const r=new FormData(this.form).get("transport-mode");e(r)}))}addHandlerClear(e){this._clearBtn.addEventListener("click",(t=>{e(),this.preview.replaceChildren(),this.routePreviewCard.remove(),this.form.reset(),this._submitBtn.disabled=!0}))}addHandlerUserLocation(e){this._userLocationInput.addEventListener("change",(t=>e(t)))}renderPreviewCard(e,t,r){const n=document.createElement("div");n.classList.add("preview__card"),n.dataset.photoIndex=r;const o=document.createElement("div");o.classList.add("preview__card--header");const a=document.createElement("div");a.classList.add("preview__card--text");const i=document.createElement("button");i.innerText="X",i.setAttribute("title","Remove this item"),i.classList.add("preview__card--remove-btn");const d=document.createElement("img");d.classList.add("preview__image"),d.src=URL.createObjectURL(e);const[s,c,l,u,p,m]=t.DateTime.split(/[: ]/),h=new Date(s,c-1,l,u,p,m);a.innerHTML=`\n      <h4>${e.name}</h4>\n      <dl>\n        <dt>Date:</dt><dd>${h.toLocaleDateString()}</dd>\n        <dt>Time:</dt><dd>${h.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</dd>\n        <dt>lat, lng: </dt><dd>${t.latitude.toFixed(2)}, ${t.longitude.toFixed(2)}</dd>\n        <dt>Camera:</dd><dd> ${t.Make} ${t.Model}</dd>\n      </dl>\n    `,o.appendChild(d),n.appendChild(o),n.appendChild(i),n.appendChild(a),this.preview.insertAdjacentElement("afterbegin",n)}renderRoutePreviewCard(t){const r=e(t.paths[0].time),n=t.paths[0].distance;var o,a,i;document.getElementsByClassName("preview__card--route").length||(this.routePreviewCard=document.createElement("div"),this.routePreviewCard.classList.add("preview__card--text","preview__card--route","preview__card"),this.preview.insertAdjacentElement("beforebegin",this.routePreviewCard)),this.routePreviewCard.innerHTML=`\n    <h4>Route</h4>\n    <span><h4>${r}</h4>\n    <p>${i=n,o=.000621371192*i,a=100,Math.round(o*a)/a} mi</p>\n    </span>\n    `}renderLocationCard(e){if(!e)return;document.getElementsByClassName("location__card").length||(this.locationPreviewCard=document.createElement("div"),this.locationPreviewCard.classList.add("preview__card","preview__card--text","location__card"),this.preview.insertAdjacentElement("afterbegin",this.locationPreviewCard)),this.locationPreviewCard.innerHTML=`\n      <h4>Current Location</h4>\n      <span><h4>${e}</h4>\n      </span>\n    `;const t=document.createElement("button");t.innerText="X",t.setAttribute("title","Remove current location"),t.classList.add("location__card--remove-btn"),this.locationPreviewCard.appendChild(t)}};const o=[-77.041493,38.930859];var a=new class{constructor(){this.map=L.map("map").setView([o[1],o[0]],5),this.tiles=L.tileLayer("https://api.mapbox.com/styles/v1/lanesgood/clhsi5wdt00yk01pffukxf1s4/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuZXNnb29kIiwiYSI6ImNsaHNoeDJ4czJ4b3UzbHFrZHQ3cHNteGsifQ.Pcn60PP-gOgbEb2z9TOAMA",{minZoom:0,maxZoom:22}),this.routeLine=L.polyline([]),this.photoMarkers=L.layerGroup(),this.currentPositionMarker=L.marker()}render(){this.tiles.addTo(this.map),this.photoMarkers.addTo(this.map)}renderPhotoMarker(e,t,r,n){const o=URL.createObjectURL(r),a=L.popup({autoClose:!1}).setContent(`<img class='marker-photo' src='${o}' />`),i=L.marker([e,t]);i.photoIndex=n,this.photoMarkers.addLayer(i),i.bindPopup(a).openPopup()}renderRouteLine(t){const r=t.paths[0].points.coordinates.map((e=>[e[1],e[0]])),n=e(t.paths[0].time);this.routeLine.setLatLngs(r).addTo(this.map),this.routeLine.bindPopup(`${n}`).openPopup()}clearRouteLine(){this.routeLine=L.polyline([])}};const i=async function(e){n._submitBtn.disabled=!1,Array.from(e).forEach((async(e,o)=>{if(r.uploadedImages.some((t=>t.file.name===e.name)))alert(`${e.name} is already in the destination list`);else{r.uploadedImages.push({file:e,photoIndex:o});try{const i=await function(e){return new Promise((function(r,n){EXIF.getData(e,(function(){const{DateTime:e,GPSImgDirection:o,GPSImgDirectionRef:a,GPSLatitudeRef:i,GPSLatitude:d,GPSLongitudeRef:s,GPSLongitude:c,Make:l,Model:u}=EXIF.getAllTags(this),p=t(d[0],d[1],d[2],i),m=t(c[0],c[1],c[2],s);r({DateTime:e,GPSImgDirection:o,GPSImgDirectionRef:a,latitude:p,longitude:m,Make:l,Model:u}),n(new Error("There was an error "))}))}))}(e),{latitude:d,longitude:s}=i;r.imageCoords.push({photoIndex:o,lat:d,lng:s}),a.renderPhotoMarker(d,s,e,o),n.renderPreviewCard(e,i,o),a.map.flyToBounds(r.imageCoords)}catch(e){console.error(e),alert("Could not extract location data for this image")}}})),a.clearRouteLine()},d=function(e){const t=r.imageCoords.find((t=>t.photoIndex===+e));a.map.flyTo([t.lat,t.lng],15),a.photoMarkers.eachLayer((t=>{t.photoIndex===+e&&t.openPopup()}))},s=function(e){a.photoMarkers.eachLayer((t=>{t.photoIndex===+e&&a.map.removeLayer(t)})),n.preview.removeChild(n.preview.querySelector(`[data-photo-index="${e}"]`)),r.uploadedImages=r.uploadedImages.filter((t=>t.photoIndex!==+e)),r.imageCoords=r.imageCoords.filter((t=>t.photoIndex!==+e)),a.clearRouteLine()},c=async function(e){if(e.target.checked)try{const{coords:{latitude:e,longitude:t}}=await new Promise((function(e,t){navigator.geolocation.getCurrentPosition(e,t)}));r.currentLatLng.push(e,t),r.imageCoords.push({photoIndex:1e3,lat:e,lng:t}),a.currentPositionMarker.setLatLng(r.currentLatLng),a.currentPositionMarker.bindPopup("Current location"),a.photoMarkers.addLayer(a.currentPositionMarker),n.renderLocationCard(r.currentLatLng),a.currentPositionMarker.openPopup(),a.map.flyToBounds(r.imageCoords)}catch(e){console.error(e),alert("User location not available")}else if(!e.target.checked)return a.map.hasLayer(a.currentPositionMarker)&&a.map.removeLayer(a.currentPositionMarker),r.imageCoords=r.imageCoords.filter((e=>!(e.lat===r.currentLatLng[0]&&e.lng===r.currentLatLng[1]))),r.currentLatLng.length=0,r.imageCoords.length>0?a.map.flyToBounds(r.imageCoords):a.map.flyTo([o[1],o[0]],10),n.preview.removeChild(n.locationPreviewCard),a.photoMarkers.removeLayer(a.currentPositionMarker),r.imageCoords},l=function(){a.map.flyTo([r.currentLatLng[0],r.currentLatLng[1]],15)},u=function(){r.imageCoords=r.imageCoords.filter((e=>!(e.lat===r.currentLatLng[0]&&e.lng===r.currentLatLng[1]))),r.currentLatLng.length=0,n.preview.removeChild(n.locationPreviewCard),a.map.hasLayer(a.currentPositionMarker)&&a.map.removeLayer(a.currentPositionMarker)},p=async function(e){const t=await async function(e){try{const t=r.imageCoords.map((({lat:e,lng:t})=>[+t,+e])),n=new URLSearchParams({key:"db56c0cf-613e-456d-baea-46650066da62"}).toString(),o=await fetch(`https://graphhopper.com/api/1/route?${n}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:e,points:t,points_encoded:!1})}),a=await o.json();if(!o.ok)throw new Error(`${a.message}`);return a}catch(e){return console.error(e),e}}(e);a.map.flyToBounds(r.imageCoords),a.renderRouteLine(t),n.renderRoutePreviewCard(t)},m=function(){r.uploadedImages.length=0,r.imageCoords.length=0,a.photoMarkers.clearLayers(),a.routeLine.remove(),a.map.flyTo([o[1],o[0]],10)};console.log("Snappy trails is up and running. Reticulating splines"),a.render(),n.addHandlerUserLocation(c),n.addHandlerFileInput(i),n.addHandlerPreviewClick(d),n.addHandlerLocationPreviewClick(l),n.addHandlerRemoveCurrentLocation(u),n.addHandlerRemoveImage(s),n.addHandlerSubmit(p),n.addHandlerClear(m);
//# sourceMappingURL=index.f5fd3497.js.map
