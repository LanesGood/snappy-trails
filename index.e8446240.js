function e(e,t,r,n){Object.defineProperty(e,t,{get:r,set:n,enumerable:!0,configurable:!0})}var t={};function r(e){return.000621371192*e}function n(e){return new Date(e).toISOString().slice(11,-5)}function a(e,t){return Math.round(e*t)/t}function i(e,t,r,n){var a=e+t/60+r/3600;return"S"!=n&&"W"!=n||(a*=-1),a}e(t,"state",(()=>o)),e(t,"getExifData",(()=>d)),e(t,"getRoute",(()=>s)),e(t,"getPosition",(()=>c));const o={images:[],currentLatLng:[],transportMode:"",routeData:{}};function d(e){return new Promise((function(t,r){EXIF.getData(e,(function(){const{DateTime:e,GPSImgDirection:n,GPSImgDirectionRef:a,GPSLatitudeRef:o,GPSLatitude:d,GPSLongitudeRef:s,GPSLongitude:c,Make:l,Model:u}=EXIF.getAllTags(this),m=i(d[0],d[1],d[2],o),g=i(c[0],c[1],c[2],s);t({DateTime:e,GPSImgDirection:n,GPSImgDirectionRef:a,latitude:m,longitude:g,Make:l,Model:u}),r(new Error("There was an error "))}))}))}async function s(e){try{const t=o.images.sort(((e,t)=>e.imgOrder-t.imgOrder)).map((({latitude:e,longitude:t})=>[+t,+e])),r=new URLSearchParams({key:"db56c0cf-613e-456d-baea-46650066da62"}).toString(),n=await fetch(`https://graphhopper.com/api/1/route?${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:e,points:t,points_encoded:!1})}),a=await n.json();if(!n.ok)throw new Error(`${a.message}`);return a}catch(e){return console.error(e),e}}const c=function(){return new Promise((function(e,t){navigator.geolocation.getCurrentPosition(e,t)}))};var l=new class{_parentElement=document.querySelector("#upload-form");input=document.querySelector("#fileInput");_submitBtn=document.querySelector("#submit-route-btn");_clearBtn=document.querySelector("#clear-btn");_userLocationInput=document.querySelector("#user-location");imageList=document.querySelector("#image_list");form=document.querySelector("form");dropZone=document.querySelector("#drop_zone");routePreviewCard;routePanel;locationPreviewCard;addHandlerFileInput(e){this.input.addEventListener("change",(async function(t){const r=this.files;r.length&&e(r)}))}addHandlerDropInput(e){["dragenter","dragover","dragleave","drop"].forEach((e=>{this.dropZone.addEventListener(e,a,!1)})),["dragenter","dragover"].forEach((e=>{this.dropZone.addEventListener(e,r,!1)})),["dragleave","drop"].forEach((e=>{this.dropZone.addEventListener(e,n,!1)})),this.dropZone.addEventListener("drop",(async function(t){let r=t.dataTransfer.files;r.length&&e(r)}),!1);const t=document.querySelector("#drop_zone small");function r(e){this.classList.add("highlight"),t.innerText="Drop images to upload"}function n(e){this.classList.remove("highlight"),t.innerText="Upload up to 10 images"}function a(e){e.preventDefault(),e.stopPropagation()}}addHandlerRemoveImage(e){this.imageList.addEventListener("click",(function(t){t.preventDefault();if(!t.target.closest(".preview__card--remove-btn"))return;t.stopImmediatePropagation();const r=t.target.closest(".preview__card").dataset.imgId;e(r)}),!0)}addHandlerPreviewClick(e){this.imageList.addEventListener("click",(function(t){t.preventDefault();const r=t.target.closest(".preview__card")?.dataset.imgId;r&&e(r)}))}addHandlerRouteCardClick(e){document.addEventListener("click",(function(t){t.target.closest(".preview__card--route")&&e()}))}addHandlerLocationPreviewClick(e){this.imageList.addEventListener("click",(function(t){t.preventDefault();t.target.closest(".preview__card--location")&&e()}))}addHandlerRemoveCurrentLocation(e){this.imageList.addEventListener("click",(function(t){if(!t.target.closest(".location__card--remove-btn"))return;t.stopImmediatePropagation(),e();document.querySelector("#user-location").checked=!1}))}addHandlerSubmit(e){this.form.addEventListener("submit",(async t=>{t.preventDefault();const r=new FormData(this.form).get("transport-mode");e(r)}))}addHandlerClear(e){this._clearBtn.addEventListener("click",(t=>{e()}))}addHandlerUserLocation(e){this._userLocationInput.addEventListener("change",(t=>e(t)))}addHandlerRoutePanelBack(e){document.addEventListener("click",(function(t){t.target.closest(".route-panel--back-btn")&&e()}))}addHandlerDragPreviewCard(e){this.imageList.addEventListener("dragstart",(function(e){const t=e.target.closest(".preview__card");t&&t.classList.add("dragging")})),this.imageList.addEventListener("dragend",(function(e){const t=e.target.closest(".preview__card");t&&t.classList.remove("dragging")})),this.imageList.addEventListener("dragover",(function(e){e.preventDefault();const t=document.querySelector(".dragging"),r=(n=this,a=e.clientY,[...n.querySelectorAll(".preview__card:not(.dragging)")].reduce(((e,t)=>{const r=t.getBoundingClientRect(),n=a-r.top-r.height/2;return n<0&&n>e.offset?{offset:n,element:t}:e}),{offset:Number.NEGATIVE_INFINITY}).element);var n,a;null==r?this.appendChild(t):this.insertBefore(t,r);[...this.querySelectorAll(".preview__card")].forEach(((e,t)=>{e.setAttribute("data-img-order",t)}))})),this.imageList.addEventListener("drop",(function(t){t.preventDefault(),e()}))}renderPreviewCard({file:e,file:{exifdata:t},latitude:r,longitude:n,imgId:a,imgOrder:i}){const o=document.createElement("div");o.classList.add("preview__card"),o.setAttribute("draggable","true"),o.setAttribute("title","Drag to reorder image"),o.dataset.imgOrder=i,o.dataset.imgId=a;const d=document.createElement("div");d.classList.add("preview__card--header");const s=document.createElement("div");s.classList.add("preview__card--text");const c=document.createElement("button");c.innerText="✕",c.setAttribute("title","Remove this item"),c.classList.add("preview__card--remove-btn");const l=document.createElement("img");l.classList.add("preview__image"),l.src=URL.createObjectURL(e);const[u,m,g,p,h,L]=t.DateTime.split(/[: ]/),f=new Date(u,m-1,g,p,h,L);s.innerHTML=`\n\n      <dl>\n        <dt>Date:</dt><dd>${f.toLocaleDateString()}</dd>\n        <dt>Time:</dt><dd>${f.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</dd>\n        <dt>lat, lng: </dt><dd>${r.toFixed(2)}, ${n.toFixed(2)}</dd>\n        <dt>Camera:</dd><dd> ${t.Make} ${t.Model}</dd>\n      </dl>\n    `,d.appendChild(l),o.appendChild(d),o.appendChild(c),o.appendChild(s),this.imageList.insertAdjacentElement("beforeend",o)}renderRoutePreviewCard(e){const t=n(e.paths[0].time),i=e.paths[0].distance;document.getElementsByClassName("preview__card--route").length||(this.routePreviewCard=document.createElement("div"),this.routePreviewCard.classList.add("preview__card--text","preview__card--route","preview__card"),this.imageList.insertAdjacentElement("beforebegin",this.routePreviewCard)),this.routePreviewCard.innerHTML=`\n    <h4>Route</h4>\n    <span><h4>${t}</h4>\n    <p>${a(r(i),100)} mi</p>\n    </span>\n    `}renderRoutePanel(e,t){const i=n(e.paths[0].time),o=e.paths[0].distance;document.getElementsByClassName("route-panel").length||(this.routePanel=document.createElement("div"),this.routePanel.classList.add("route-panel","preview__card--text"));const d=e.paths[0].points.coordinates[0].map((e=>e.toFixed(2))).join(", "),s=e.paths[0].points.coordinates.pop().map((e=>e.toFixed(2))).join(", ");this.routePanel.innerHTML=`\n    <h3>${t} Route</h3>\n    <p>From <strong>${d}</strong></p>\n    <p>To <strong>${s}</strong></p>\n    <h2>\n    ${i} <span>(${a(r(o),100)} miles)</span>\n    </h2>\n    `;const c=document.createElement("button");c.innerText="← Back",c.setAttribute("title","Back"),c.classList.add("route-panel--back-btn","btn--small"),this.routePanel.appendChild(c),this.imageList.replaceChildren(this.routePanel);const l=document.createElement("dl");l.innerHTML=`${e.paths[0].instructions.map(((e,t)=>`\n        <dt>${t+1}</dt>\n        <dd>${e.text}</dd>\n      `)).join("")}`,this.routePanel.appendChild(l)}renderLocationCard(e){if(!e)return;document.getElementsByClassName("preview__card--location").length||(this.locationPreviewCard=document.createElement("div"),this.locationPreviewCard.classList.add("preview__card","preview__card--location","preview__card--text"),this.locationPreviewCard.setAttribute("draggable","true"),this.imageList.insertAdjacentElement("afterbegin",this.locationPreviewCard)),this.locationPreviewCard.innerHTML=`\n      <header><h4>Current Location: </h4>\n      <span><p>${e[0].toFixed(2)},${e[1].toFixed(2)}</p>\n      </span></header>\n    `;const t=document.createElement("button");t.innerText="x",t.setAttribute("title","Remove current location"),t.classList.add("location__card--remove-btn"),this.locationPreviewCard.appendChild(t)}renderAllImgs(e){e.sort(((e,t)=>e.imgOrder-t.imgOrder)).filter((e=>null!=e.file)).map((e=>this.renderPreviewCard(e)))}};const u=[-77.041493,38.930859];var m=new class{constructor(){this.map=L.map("map").setView([u[1],u[0]],5),this.tiles=L.tileLayer("https://api.mapbox.com/styles/v1/lanesgood/clhsi5wdt00yk01pffukxf1s4/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuZXNnb29kIiwiYSI6ImNsaHNoeDJ4czJ4b3UzbHFrZHQ3cHNteGsifQ.Pcn60PP-gOgbEb2z9TOAMA",{minZoom:0,maxZoom:22}),this.routeLine=L.polyline([]),this.photoMarkers=L.layerGroup(),this.currentPositionMarker=L.marker()}render(){this.tiles.addTo(this.map),this.photoMarkers.addTo(this.map)}renderPhotoMarker(e,t,r,n){const a=URL.createObjectURL(r),i=L.popup({autoClose:!1}).setContent(`<img class='marker-photo' src='${a}' />`),o=L.marker([e,t]);o.imgId=n,this.photoMarkers.addLayer(o),o.bindPopup(i).openPopup()}flyToDefaultCoords(){this.map.flyTo([u[1],u[0]],10)}flyToImageBounds(e){this.map.flyToBounds(e.map((({latitude:e,longitude:t})=>[e,t])))}renderRouteLine(e,t){const r=e.paths[0].points.coordinates.map((e=>[e[1],e[0]])),a=n(e.paths[0].time);this.routeLine.setLatLngs(r).addTo(this.map),this.routeLine.bindPopup(`${t}: ${a}`).openPopup()}clearRouteLine(){this.routeLine=L.polyline([])}};const{state:g}=t,p=async function(e){l._submitBtn.disabled=!1;let r=g.images.length;for(let n=0;n<e.length;n++){const a=e[n];if(g.images.some((e=>e.file.name===a.name)))alert(`${a.name} is already in the destination list`);else{const e=r++,n=e;try{const r=await t.getExifData(a),{latitude:i,longitude:o}=r,d={file:a,imgId:n,imgOrder:e,latitude:i,longitude:o};g.images.push(d),m.renderPhotoMarker(i,o,a,n),l.renderPreviewCard(d),m.flyToImageBounds(g.images)}catch(e){console.error(e),alert("Could not extract location data for this image")}}}m.clearRouteLine(),l.input.value=""},h=function(e){const t=g.images.find((t=>t.imgId===+e));m.map.flyTo([t.latitude,t.longitude],15),m.photoMarkers.eachLayer((t=>{t.imgId===+e&&t.openPopup()}))},f=function(){l.renderRoutePanel(g.routeData,g.transportMode)},v=function(){l.routePanel.remove(),l.renderAllImgs(g.images),g.currentLatLng.length>0&&l.renderLocationCard(g.currentLatLng)},P=function(e){m.photoMarkers.eachLayer((t=>{t.imgId===+e&&m.map.removeLayer(t)})),l.imageList.removeChild(l.imageList.querySelector(`[data-img-id="${e}"]`)),g.images=g.images.filter((t=>t.imgId!==+e)),m.clearRouteLine()},w=async function(e){if(e.target.checked)try{const{coords:{latitude:e,longitude:r}}=await t.getPosition();g.currentLatLng.push(e,r),g.images.push({file:null,imgId:1e3,imgOrder:1e3,latitude:e,longitude:r}),m.currentPositionMarker.setLatLng(g.currentLatLng),m.currentPositionMarker.bindPopup("Current location"),m.photoMarkers.addLayer(m.currentPositionMarker),l.renderLocationCard(g.currentLatLng),m.currentPositionMarker.openPopup(),m.flyToImageBounds(g.images)}catch(e){console.error(e),alert("User location not available")}else if(!e.target.checked)return m.map.hasLayer(m.currentPositionMarker)&&m.map.removeLayer(m.currentPositionMarker),g.images=g.images.filter((e=>!(e.latitude===g.currentLatLng[0]&&e.longitude===g.currentLatLng[1]))),g.currentLatLng.length=0,g.images.length>0?m.flyToImageBounds(g.images):m.flyToDefaultCoords(),l.imageList.removeChild(l.locationPreviewCard),m.photoMarkers.removeLayer(m.currentPositionMarker),g.images},y=function(){m.map.flyTo([g.currentLatLng[0],g.currentLatLng[1]],15)},C=function(){g.images=g.images.filter((e=>!(e.latitutde===g.currentLatLng[0]&&e.longitude===g.currentLatLng[1]))),g.currentLatLng.length=0,l.imageList.removeChild(l.locationPreviewCard),m.map.hasLayer(m.currentPositionMarker)&&m.map.removeLayer(m.currentPositionMarker)},_=function(){const e=[...l.imageList.querySelectorAll(".preview__card")].map((e=>+e.getAttribute("data-img-id")));g.images=g.images.sort(((t,r)=>e.indexOf(t.imgId)-e.indexOf(r.imgId))).map(((e,t)=>({...e,imgOrder:t})))},b=async function(e){g.transportMode=e;const r=await t.getRoute(g.transportMode);g.routeData=r,m.flyToImageBounds(g.images),m.renderRouteLine(g.routeData,g.transportMode),l.renderRoutePreviewCard(g.routeData)},k=function(){g.images.length=0,m.photoMarkers.clearLayers(),m.clearRouteLine(),m.flyToDefaultCoords(),l.imageList.replaceChildren(),l.routePreviewCard&&l.routePreviewCard.remove(),l.routePanel.remove(),l.form.reset(),l._submitBtn.disabled=!0};console.log("Snappy trails is up and running. Reticulating splines"),g.images.length>0&&l.renderAllImgs(g.images),m.render(),l.addHandlerUserLocation(w),l.addHandlerFileInput(p),l.addHandlerDropInput(p),l.addHandlerPreviewClick(h),l.addHandlerDragPreviewCard(_),l.addHandlerLocationPreviewClick(y),l.addHandlerRemoveCurrentLocation(C),l.addHandlerRemoveImage(P),l.addHandlerSubmit(b),l.addHandlerRouteCardClick(f),l.addHandlerRoutePanelBack(v),l.addHandlerClear(k);
//# sourceMappingURL=index.e8446240.js.map
