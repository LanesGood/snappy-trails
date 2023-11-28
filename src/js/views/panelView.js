import { miliToTime, round, toMiles, ROUTE_MODES } from '../helpers';
class PanelView {
  uploadForm = document.querySelector('#upload-form');
  input = document.querySelector('#fileInput');
  _submitBtn = document.querySelector('#submit-route-btn');
  _clearBtn = document.querySelector('#clear-btn');
  _userLocationInput = document.querySelector('#user-location');
  imageList = document.querySelector('#image_list');
  dropZone = document.querySelector('#drop_zone');
  routePreviewCard;
  routePanel;
  locationPreviewCard;

  addHandlerFileInput(handler) {
    this.input.addEventListener('change', async function (e) {
      const fileList = this.files;
      if (!fileList.length) return;
      handler(fileList);
    });
  }
  // Drag and drop functions for file upload
  addHandlerDropInput(handler) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, unhighlight, false);
    });
    this.dropZone.addEventListener(
      'drop',
      async function (e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        if (!files.length) return;
        handler(files);
      },
      false
    );

    const helperText = document.querySelector('#drop_zone small');

    function highlight(e) {
      this.classList.add('highlight');
      helperText.innerText = 'Drop images to upload';
    }

    function unhighlight(e) {
      this.classList.remove('highlight');
      helperText.innerText = 'Upload up to 10 images';
    }

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  addHandlerRemoveImage(handler) {
    this.imageList.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        const removeBtn = e.target.closest('.preview__card--remove-btn');
        if (!removeBtn) return;
        e.stopImmediatePropagation();
        const imgId = e.target.closest('.preview__card').dataset.imgId;
        handler(imgId);
      },
      true
    );
  }
  addHandlerPreviewClick(handler) {
    this.imageList.addEventListener('click', function (e) {
      e.preventDefault();
      const imgId = e.target.closest('.preview__card')?.dataset.imgId;
      if (!imgId) return;
      handler(imgId);
    });
  }
  addHandlerRouteCardClick(handler) {
    document.addEventListener('click', function (e) {
      const routePreviewCard = e.target.closest('.preview__card--route');
      if (!routePreviewCard) return;
      handler();
    });
  }
  addHandlerLocationPreviewClick(handler) {
    this.imageList.addEventListener('click', function (e) {
      e.preventDefault();
      const locationPreviewCard = e.target.closest('.preview__card--location');
      if (!locationPreviewCard) return;
      handler();
    });
  }
  addHandlerRemoveCurrentLocation(handler) {
    this.imageList.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('.location__card--remove-btn');
      if (!removeBtn) return;
      e.stopImmediatePropagation();
      handler();
      const _userLocationInput = document.querySelector('#user-location');
      _userLocationInput.checked = false; // Why must this be re-declared rather than using declaration from above?
    });
  }
  addHandlerSubmit(handler) {
    this.uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.uploadForm);
      const transportMode = formData.get('transport-mode');
      handler(transportMode);
    });
  }
  addHandlerClear(handler) {
    this._clearBtn.addEventListener('click', (e) => {
      handler();
    });
  }
  addHandlerUserLocation(handler) {
    this._userLocationInput.addEventListener('change', (e) => handler(e));
  }
  addHandlerRoutePanelBack(handler) {
    document.addEventListener('click', function (e) {
      const routePanelBackBtn = e.target.closest('.route-panel--back-btn');
      if (!routePanelBackBtn) return;
      handler();
    });
  }
  // Drag event listener for image cards
  addHandlerDragPreviewCard(handler) {
    // Add dragging class to card when dragstart
    this.imageList.addEventListener('dragstart', function (e) {
      const previewCard = e.target.closest('.preview__card');
      if (!previewCard) return;
      previewCard.classList.add('dragging');
    });
    // Remove dragging class to card when dragstart
    this.imageList.addEventListener('dragend', function (e) {
      const previewCard = e.target.closest('.preview__card');
      if (!previewCard) return;
      previewCard.classList.remove('dragging');
    });
    // Add dragging class to card when dragstart
    this.imageList.addEventListener('dragover', function (e) {
      e.preventDefault();
      const draggingElement = document.querySelector('.dragging');
      const afterElement = getDragAfterElement(this, e.clientY);
      if (afterElement == null) {
        this.appendChild(draggingElement);
      } else {
        this.insertBefore(draggingElement, afterElement);
      }
      // Reset card order according to UI order
      const cards = [...this.querySelectorAll('.preview__card')];
      cards.forEach((card, i) => {
        card.setAttribute('data-img-order', i);
      });
    });
    this.imageList.addEventListener('drop', function (e) {
      e.preventDefault();
      handler();
    });
    // Function to determine which element in the list comes after current dragging element
    function getDragAfterElement(container, y) {
      const draggableElements = [
        ...container.querySelectorAll('.preview__card:not(.dragging)'),
      ];
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  }
  // Render function to print image, info and coords to preview area
  renderPreviewCard({
    file,
    file: { exifdata },
    latitude,
    longitude,
    imgId,
    imgOrder,
  }) {
    // Create preview card element
    const previewCard = document.createElement('div');
    previewCard.classList.add('preview__card');
    previewCard.setAttribute('draggable', 'true');
    previewCard.setAttribute('title', 'Drag to reorder image');
    previewCard.dataset.imgOrder = imgOrder;
    previewCard.dataset.imgId = imgId;
    const previewCardHeader = document.createElement('div');
    previewCardHeader.classList.add('preview__card--header');
    const previewCardText = document.createElement('div');
    previewCardText.classList.add('preview__card--text');

    // Create remove button
    const previewCardRemoveBtn = document.createElement('button');
    previewCardRemoveBtn.innerText = '✕';
    previewCardRemoveBtn.setAttribute('title', 'Remove this item');
    previewCardRemoveBtn.classList.add('preview__card--remove-btn');

    // Create card image
    const previewImage = document.createElement('img');
    previewImage.classList.add('preview__image');
    previewImage.src = URL.createObjectURL(file);

    // Convert image date from exif data format to javascript format
    const [year, month, day, hours, minutes, seconds] =
      exifdata.DateTime.split(/[: ]/);
    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    previewCardText.innerHTML = `

      <dl>
        <dt>Date:</dt><dd>${dateObject.toLocaleDateString()}</dd>
        <dt>Time:</dt><dd>${dateObject.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}</dd>
        <dt>lat, lng: </dt><dd>${latitude.toFixed(2)}, ${longitude.toFixed(
      2
    )}</dd>
        <dt>Camera:</dd><dd> ${exifdata.Make} ${exifdata.Model}</dd>
      </dl>
    `;
    // Append card items
    previewCardHeader.appendChild(previewImage);
    previewCard.appendChild(previewCardHeader);
    previewCard.appendChild(previewCardRemoveBtn);
    previewCard.appendChild(previewCardText);
    
    this.imageList.insertAdjacentElement('beforeend', previewCard);
  }
  renderRoutePreviewCard(routeData, transportMode) {
    const routeTime = miliToTime(routeData.paths[0].time);
    const routeDistance = routeData.paths[0].distance;
    const routePreviewEl = document.getElementsByClassName(
      'preview__card--route'
    );
    if (!routePreviewEl.length) {
      this.routePreviewCard = document.createElement('div');
      this.routePreviewCard.classList.add(
        'preview__card--text',
        'preview__card--route',
        'preview__card'
      );
      this.imageList.insertAdjacentElement(
        'beforebegin',
        this.routePreviewCard
      );
    }
    this.routePreviewCard.innerHTML = `
    <h4>${ROUTE_MODES[transportMode]} Route</h4>
    <span><h4>${routeTime}</h4>
    <p>${round(toMiles(routeDistance), 100)} mi</p>
    </span>
    `;
  }
  renderRoutePanel(routeData, transportMode) {
    const routemode = ROUTE_MODES[transportMode];
    const routeTime = miliToTime(routeData.paths[0].time);
    const routeDistance = routeData.paths[0].distance;
    const routePreviewEl = document.getElementsByClassName('route-panel');
    if (!routePreviewEl.length) {
      this.routePanel = document.createElement('div');
      this.routePanel.classList.add('route-panel', 'preview__card--text');
    }
    const routePanelHeader = document.createElement('header');
    const routePanelTitle = document.createElement('h2');
    routePanelTitle.innerHTML = `${routemode} Route`;
    routePanelHeader.appendChild(routePanelTitle);

    const startPoint = routeData.paths[0].points.coordinates[0]
      .map((e) => e.toFixed(3))
      .join(', ');
    const endPoint = routeData.paths[0].points.coordinates
      .pop()
      .map((e) => e.toFixed(3))
      .join(', ');
    const routeOverview = document.createElement('div');
    routeOverview.classList.add('route-panel__overview');
    routeOverview.innerHTML = `
    <p>From: <strong>${startPoint}</strong></p>
    <p>To: <strong>${endPoint}</strong></p>
    `;
    routeOverview.insertAdjacentHTML(
      'beforeend',
      `<p class="route-length"><strong>${routeTime}</strong> (${round(
        toMiles(routeDistance),
        100
      )} miles)</p>`
    );

    // Create back button
    const routePanelBackBtn = document.createElement('button');
    routePanelBackBtn.innerText = '←';
    routePanelBackBtn.setAttribute('title', 'Back to image list');
    routePanelBackBtn.classList.add('route-panel--back-btn', 'btn--small');

    routeOverview.appendChild(routePanelBackBtn);
    routePanelHeader.appendChild(routeOverview);
    this.routePanel.appendChild(routePanelHeader);

    // Add route instructions
    const routePanelInstructions = document.createElement('dl');
    routePanelInstructions.innerHTML = `${routeData.paths[0].instructions
      .map((step, index) => {
        return `
        <dt>${index + 1}</dt>
        <dd>${step.text}</dd>
        `;
      })
      .join('')}`;
    this.routePanel.appendChild(routePanelInstructions);

    this.imageList.replaceChildren(this.routePanel);
  }
  renderLocationCard(location) {
    if (!location) return;
    const locationCardEl = document.getElementsByClassName(
      'preview__card--location'
    );
    if (!locationCardEl.length) {
      this.locationPreviewCard = document.createElement('div');
      this.locationPreviewCard.classList.add(
        'preview__card',
        'preview__card--location',
        'preview__card--text'
      );
      this.locationPreviewCard.setAttribute('draggable', 'true');

      this.imageList.insertAdjacentElement(
        'afterbegin',
        this.locationPreviewCard
      );
    }
    this.locationPreviewCard.innerHTML = `
      <header><h4>Current Location:${' '}</h4>
      <span><p>${location[0].toFixed(2)},${location[1].toFixed(2)}</p>
      </span></header>
    `;
    this.locationPreviewCard.dataset.imgId = 'currentCoords';
    this.locationPreviewCard.dataset.imgOrder = 0;
    // Create remove button
    const previewCardRemoveBtn = document.createElement('button');
    previewCardRemoveBtn.innerText = 'x';
    previewCardRemoveBtn.setAttribute('title', 'Remove current location');
    previewCardRemoveBtn.classList.add('location__card--remove-btn');
    this.locationPreviewCard.appendChild(previewCardRemoveBtn);
  }
  // Render all cards from state
  renderAllImgs(images) {
    images
      .sort((a, b) => a.imgOrder - b.imgOrder)
      .map((img) =>
        img.currentPosition
          ? this.renderLocationCard([img.latitude, img.longitude])
          : this.renderPreviewCard(img)
      );
  }
  checkSubmitBtn(numImages) {
    this._submitBtn.disabled = numImages >= 2 ? false : true;
  }
  removeRouteInfo(){
    !!this.routePreviewCard && this.routePreviewCard.remove();
    !!this.routePanel && this.routePanel.remove();
  }
}

export default new PanelView();
