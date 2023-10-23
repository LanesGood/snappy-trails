function e(e,t,r,n){Object.defineProperty(e,t,{get:r,set:n,enumerable:!0,configurable:!0})}var t={};function r(e){return.000621371192*e}function n(e){return new Date(e).toISOString().slice(11,-5)}function a(e,t){return Math.round(e*t)/t}function o(e,t,r,n){var a=e+t/60+r/3600;return"S"!=n&&"W"!=n||(a*=-1),a}e(t,"state",(()=>i)),e(t,"getExifData",(()=>d)),e(t,"getRoute",(()=>s)),e(t,"getPosition",(()=>c));const i={imageCoords:[],uploadedImages:[],currentLatLng:[],transportMode:"",routeData:{}};function d(e){return new Promise((function(t,r){EXIF.getData(e,(function(){const{DateTime:e,GPSImgDirection:n,GPSImgDirectionRef:a,GPSLatitudeRef:i,GPSLatitude:d,GPSLongitudeRef:s,GPSLongitude:c,Make:l,Model:u}=EXIF.getAllTags(this),p=o(d[0],d[1],d[2],i),m=o(c[0],c[1],c[2],s);t({DateTime:e,GPSImgDirection:n,GPSImgDirectionRef:a,latitude:p,longitude:m,Make:l,Model:u}),r(new Error("There was an error "))}))}))}async function s(e){try{const t=i.imageCoords.map((({lat:e,lng:t})=>[+t,+e])),r=new URLSearchParams({key:"db56c0cf-613e-456d-baea-46650066da62"}).toString(),n=await fetch(`https://graphhopper.com/api/1/route?${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:e,points:t,points_encoded:!1})}),a=await n.json();if(!n.ok)throw new Error(`${a.message}`);return a}catch(e){return console.error(e),e}}const c=function(){return new Promise((function(e,t){navigator.geolocation.getCurrentPosition(e,t)}))};var l=new class{_parentElement=document.querySelector("#upload-form");input=document.querySelector("#fileInput");_submitBtn=document.querySelector("#submit-route-btn");_clearBtn=document.querySelector("#clear-btn");_userLocationInput=document.querySelector("#user-location");preview=document.querySelector("#preview");form=document.querySelector("form");routePreviewCard;routePanel;locationPreviewCard;addHandlerFileInput(e){this.input.addEventListener("change",(async function(t){const r=this.files;r.length&&e(r)}))}addHandlerRemoveImage(e){this.preview.addEventListener("click",(function(t){if(!t.target.closest(".preview__card--remove-btn"))return;t.stopImmediatePropagation();const r=t.target.closest(".preview__card").dataset.photoIndex;e(r)}),!0)}addHandlerPreviewClick(e){this.preview.addEventListener("click",(function(t){t.preventDefault();const r=t.target.closest(".preview__card").dataset.photoIndex;r&&e(r)}))}addHandlerRouteCardClick(e){document.addEventListener("click",(function(t){t.target.closest(".preview__card--route")&&e()}))}addHandlerLocationPreviewClick(e){this.preview.addEventListener("click",(function(t){t.preventDefault();t.target.closest(".location__card")&&e()}))}addHandlerRemoveCurrentLocation(e){this.preview.addEventListener("click",(function(t){if(!t.target.closest(".location__card--remove-btn"))return;t.stopImmediatePropagation(),e();document.querySelector("#user-location").checked=!1}))}addHandlerSubmit(e){this.form.addEventListener("submit",(async t=>{t.preventDefault();const r=new FormData(this.form).get("transport-mode");e(r)}))}addHandlerClear(e){this._clearBtn.addEventListener("click",(t=>{e()}))}addHandlerUserLocation(e){this._userLocationInput.addEventListener("change",(t=>e(t)))}addHandlerRoutePanelBack(e){document.addEventListener("click",(function(t){t.target.closest(".route-panel--back-btn")&&e()}))}renderPreviewCard({file:e,file:{exifdata:t},latitude:r,longitude:n,photoIndex:a}){const o=document.createElement("div");o.classList.add("preview__card"),o.dataset.photoIndex=a;const i=document.createElement("div");i.classList.add("preview__card--header");const d=document.createElement("div");d.classList.add("preview__card--text");const s=document.createElement("button");s.innerText="X",s.setAttribute("title","Remove this item"),s.classList.add("preview__card--remove-btn");const c=document.createElement("img");c.classList.add("preview__image"),c.src=URL.createObjectURL(e);const[l,u,p,m,h,g]=t.DateTime.split(/[: ]/),L=new Date(l,u-1,p,m,h,g);d.innerHTML=`\n\n      <dl>\n        <dt>Date:</dt><dd>${L.toLocaleDateString()}</dd>\n        <dt>Time:</dt><dd>${L.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</dd>\n        <dt>lat, lng: </dt><dd>${r.toFixed(2)}, ${n.toFixed(2)}</dd>\n        <dt>Camera:</dd><dd> ${t.Make} ${t.Model}</dd>\n      </dl>\n    `,i.appendChild(c),o.appendChild(i),o.appendChild(s),o.appendChild(d),this.preview.insertAdjacentElement("afterbegin",o)}renderRoutePreviewCard(e){const t=n(e.paths[0].time),o=e.paths[0].distance;document.getElementsByClassName("preview__card--route").length||(this.routePreviewCard=document.createElement("div"),this.routePreviewCard.classList.add("preview__card--text","preview__card--route","preview__card"),this.preview.insertAdjacentElement("beforebegin",this.routePreviewCard)),this.routePreviewCard.innerHTML=`\n    <h4>Route</h4>\n    <span><h4>${t}</h4>\n    <p>${a(r(o),100)} mi</p>\n    </span>\n    `}renderRoutePanel(e,t){const o=n(e.paths[0].time),i=e.paths[0].distance;document.getElementsByClassName("route-panel").length||(this.routePanel=document.createElement("div"),this.routePanel.classList.add("route-panel","preview__card--text"));const d=e.paths[0].points.coordinates[0].map((e=>e.toFixed(2))),s=e.paths[0].points.coordinates.pop().map((e=>e.toFixed(2)));this.routePanel.innerHTML=`\n    <h3>Selected Route</h3>\n    <h4>Traveling by ${t} from ${d} to ${s}</h4>\n    <dl>\n      <dt>${o}</dt>\n      <dd>${a(r(i),100)} miles</dd>\n    </dl>\n    `;const c=document.createElement("dl");c.innerHTML=`${e.paths[0].instructions.map(((e,t)=>`\n        <dt>${t+1}</dt>\n        <dd>${e.text}</dd>\n      `)).join("")}`,this.routePanel.appendChild(c);const l=document.createElement("button");l.innerText="←",l.setAttribute("title","Back"),l.classList.add("route-panel--back-btn"),this.routePanel.insertAdjacentElement("afterbegin",l),this.preview.replaceChildren(this.routePanel)}renderLocationCard(e){if(!e)return;document.getElementsByClassName("location__card").length||(this.locationPreviewCard=document.createElement("div"),this.locationPreviewCard.classList.add("preview__card","preview__card--text","location__card"),this.preview.insertAdjacentElement("afterbegin",this.locationPreviewCard)),this.locationPreviewCard.innerHTML=`\n      <h4>Current Location</h4>\n      <span><h4>${e}</h4>\n      </span>\n    `;const t=document.createElement("button");t.innerText="X",t.setAttribute("title","Remove current location"),t.classList.add("location__card--remove-btn"),this.locationPreviewCard.appendChild(t)}renderAllImgs(e){e.uploadedImages.map((e=>this.renderPreviewCard(e)))}};const u=[-77.041493,38.930859];var p=new class{constructor(){this.map=L.map("map").setView([u[1],u[0]],5),this.tiles=L.tileLayer("https://api.mapbox.com/styles/v1/lanesgood/clhsi5wdt00yk01pffukxf1s4/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuZXNnb29kIiwiYSI6ImNsaHNoeDJ4czJ4b3UzbHFrZHQ3cHNteGsifQ.Pcn60PP-gOgbEb2z9TOAMA",{minZoom:0,maxZoom:22}),this.routeLine=L.polyline([]),this.photoMarkers=L.layerGroup(),this.currentPositionMarker=L.marker()}render(){this.tiles.addTo(this.map),this.photoMarkers.addTo(this.map)}renderPhotoMarker(e,t,r,n){const a=URL.createObjectURL(r),o=L.popup({autoClose:!1}).setContent(`<img class='marker-photo' src='${a}' />`),i=L.marker([e,t]);i.photoIndex=n,this.photoMarkers.addLayer(i),i.bindPopup(o).openPopup()}renderRouteLine(e){const t=e.paths[0].points.coordinates.map((e=>[e[1],e[0]])),r=n(e.paths[0].time);this.routeLine.setLatLngs(t).addTo(this.map),this.routeLine.bindPopup(`${r}`).openPopup()}clearRouteLine(){this.routeLine=L.polyline([])}};const{state:m}=t,h=async function(e){l._submitBtn.disabled=!1;let r=m.uploadedImages.length;for(let n=0;n<e.length;n++){const a=e[n];if(m.uploadedImages.some((e=>e.file.name===a.name)))alert(`${a.name} is already in the destination list`);else{const e=r++;try{const r=await t.getExifData(a),{latitude:n,longitude:o}=r,i={file:a,photoIndex:e,latitude:n,longitude:o};m.uploadedImages.push(i),m.imageCoords.push({photoIndex:e,lat:n,lng:o}),p.renderPhotoMarker(n,o,a,e),l.renderPreviewCard(i),p.map.flyToBounds(m.imageCoords)}catch(e){console.error(e),alert("Could not extract location data for this image")}}}p.clearRouteLine(),l.input.value=""},g=function(e){const t=m.imageCoords.find((t=>t.photoIndex===+e));p.map.flyTo([t.lat,t.lng],15),p.photoMarkers.eachLayer((t=>{t.photoIndex===+e&&t.openPopup()}))},v=function(){l.renderRoutePanel(t.state.routeData,t.state.transportMode)},f=function(){l.routePanel.remove(),l.renderAllImgs(m)},P=function(e){p.photoMarkers.eachLayer((t=>{t.photoIndex===+e&&p.map.removeLayer(t)})),l.preview.removeChild(l.preview.querySelector(`[data-photo-index="${e}"]`)),m.uploadedImages=m.uploadedImages.filter((t=>t.photoIndex!==+e)),m.imageCoords=m.imageCoords.filter((t=>t.photoIndex!==+e)),p.clearRouteLine()},w=async function(e){if(e.target.checked)try{const{coords:{latitude:e,longitude:r}}=await t.getPosition();m.currentLatLng.push(e,r),m.imageCoords.push({photoIndex:1e3,lat:e,lng:r}),p.currentPositionMarker.setLatLng(m.currentLatLng),p.currentPositionMarker.bindPopup("Current location"),p.photoMarkers.addLayer(p.currentPositionMarker),l.renderLocationCard(m.currentLatLng),p.currentPositionMarker.openPopup(),p.map.flyToBounds(m.imageCoords)}catch(e){console.error(e),alert("User location not available")}else if(!e.target.checked)return p.map.hasLayer(p.currentPositionMarker)&&p.map.removeLayer(p.currentPositionMarker),m.imageCoords=m.imageCoords.filter((e=>!(e.lat===m.currentLatLng[0]&&e.lng===m.currentLatLng[1]))),m.currentLatLng.length=0,m.imageCoords.length>0?p.map.flyToBounds(m.imageCoords):p.map.flyTo([u[1],u[0]],10),l.preview.removeChild(l.locationPreviewCard),p.photoMarkers.removeLayer(p.currentPositionMarker),m.imageCoords},C=function(){p.map.flyTo([m.currentLatLng[0],m.currentLatLng[1]],15)},y=function(){m.imageCoords=m.imageCoords.filter((e=>!(e.lat===m.currentLatLng[0]&&e.lng===m.currentLatLng[1]))),m.currentLatLng.length=0,l.preview.removeChild(l.locationPreviewCard),p.map.hasLayer(p.currentPositionMarker)&&p.map.removeLayer(p.currentPositionMarker)},k=async function(e){m.transportMode=e;const r=await t.getRoute(m.transportMode);m.routeData=r,p.map.flyToBounds(m.imageCoords),p.renderRouteLine(m.routeData),l.renderRoutePreviewCard(m.routeData)},_=function(){m.uploadedImages.length=0,m.imageCoords.length=0,p.photoMarkers.clearLayers(),p.clearRouteLine(),p.map.flyTo([u[1],u[0]],10),l.preview.replaceChildren(),l.routePreviewCard&&l.routePreviewCard.remove(),l.routePanel.remove(),l.form.reset(),l._submitBtn.disabled=!0};console.log("Snappy trails is up and running. Reticulating splines"),m.imageCoords.length>0&&l.renderAllImgs(m),p.render(),l.addHandlerUserLocation(w),l.addHandlerFileInput(h),l.addHandlerPreviewClick(g),l.addHandlerLocationPreviewClick(C),l.addHandlerRemoveCurrentLocation(y),l.addHandlerRemoveImage(P),l.addHandlerSubmit(k),l.addHandlerRouteCardClick(v),l.addHandlerRoutePanelBack(f),l.addHandlerClear(_);
//# sourceMappingURL=index.91e96d63.js.map