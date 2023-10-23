import { miliToTime, round, toMiles } from '../helpers';
class PanelView {
  _parentElement = document.querySelector('#upload-form');
  _input = document.querySelector('#fileInput');
  _submitBtn = document.querySelector('#submit-route-btn');
  _clearBtn = document.querySelector('#clear-btn');
  _userLocationInput = document.querySelector('#user-location');
  preview = document.querySelector('#preview');
  form = document.querySelector('form');
  routePreviewCard;
  routePanel;
  locationPreviewCard;

  addHandlerFileInput(handler) {
    this._input.addEventListener('change', async function (e) {
      const fileList = this.files;
      if (!fileList.length) return;
      handler(fileList);
      this.value = null;
    });
  }
  addHandlerRemoveImage(handler) {
    this.preview.addEventListener(
      'click',
      function (e) {
        const removeBtn = e.target.closest('.preview__card--remove-btn');
        if (!removeBtn) return;
        e.stopImmediatePropagation();
        const imgIndex = e.target.closest('.preview__card').dataset.photoIndex;
        handler(imgIndex);
      },
      true
    );
  }
  addHandlerPreviewClick(handler) {
    this.preview.addEventListener('click', function (e) {
      e.preventDefault();
      const imgIndex = e.target.closest('.preview__card').dataset.photoIndex;
      if (!imgIndex) return;
      handler(imgIndex);
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
    this.preview.addEventListener('click', function (e) {
      e.preventDefault();
      const locationPreviewCard = e.target.closest('.location__card');
      if (!locationPreviewCard) return;
      handler();
    });
  }
  addHandlerRemoveCurrentLocation(handler) {
    this.preview.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('.location__card--remove-btn');
      if (!removeBtn) return;
      e.stopImmediatePropagation();
      handler();
      const _userLocationInput = document.querySelector('#user-location');
      _userLocationInput.checked = false; // Why must this be re-declared rather than using declaration from above?
    });
  }
  addHandlerSubmit(handler) {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
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
  // Function to print image, info and coords to preview area
  renderPreviewCard(file, exifData, i) {
    // Create preview card element
    const previewCard = document.createElement('div');
    previewCard.classList.add('preview__card');
    previewCard.dataset.photoIndex = i;
    const previewCardHeader = document.createElement('div');
    previewCardHeader.classList.add('preview__card--header');
    const previewCardText = document.createElement('div');
    previewCardText.classList.add('preview__card--text');

    // Create remove button
    const previewCardRemoveBtn = document.createElement('button');
    previewCardRemoveBtn.innerText = 'X';
    previewCardRemoveBtn.setAttribute('title', 'Remove this item');
    previewCardRemoveBtn.classList.add('preview__card--remove-btn');

    // Create card image
    const previewImage = document.createElement('img');
    previewImage.classList.add('preview__image');
    previewImage.src = URL.createObjectURL(file);

    // Convert image date from exif data format to javascript format
    const [year, month, day, hours, minutes, seconds] =
      exifData.DateTime.split(/[: ]/);
    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    previewCardText.innerHTML = `

      <dl>
        <dt>Date:</dt><dd>${dateObject.toLocaleDateString()}</dd>
        <dt>Time:</dt><dd>${dateObject.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}</dd>
        <dt>lat, lng: </dt><dd>${exifData.latitude.toFixed(
          2
        )}, ${exifData.longitude.toFixed(2)}</dd>
        <dt>Camera:</dd><dd> ${exifData.Make} ${exifData.Model}</dd>
      </dl>
    `;
    // Append card items
    previewCardHeader.appendChild(previewImage);
    previewCard.appendChild(previewCardHeader);
    previewCard.appendChild(previewCardRemoveBtn);
    previewCard.appendChild(previewCardText);
    this.preview.insertAdjacentElement('afterbegin', previewCard);
  }
  renderRoutePreviewCard(routeData) {
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
      this.preview.insertAdjacentElement('beforebegin', this.routePreviewCard);
    }
    this.routePreviewCard.innerHTML = `
    <h4>Route</h4>
    <span><h4>${routeTime}</h4>
    <p>${round(toMiles(routeDistance), 100)} mi</p>
    </span>
    `;
  }
  renderRoutePanel(routeData, transportMode) {
    const routeTime = miliToTime(routeData.paths[0].time);
    const routeDistance = routeData.paths[0].distance;
    const routePreviewEl = document.getElementsByClassName('route-panel');
    if (!routePreviewEl.length) {
      this.routePanel = document.createElement('div');
      this.routePanel.classList.add('route-panel', 'preview__card--text');
    }

    const startPoint = routeData.paths[0].points.coordinates[0].map((e) =>
      e.toFixed(2)
    );
    const endPoint = routeData.paths[0].points.coordinates
      .pop()
      .map((e) => e.toFixed(2));
    this.routePanel.innerHTML = `
    <h3>Selected Route</h3>
    <h4>Traveling by ${transportMode} from ${startPoint} to ${endPoint}</h4>
    <dl>
      <dt>${routeTime}</dt>
      <dd>${round(toMiles(routeDistance), 100)} miles</dd>
    </dl>
    `;

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

    // Create back button
    const routePanelBackBtn = document.createElement('button');
    routePanelBackBtn.innerText = '←';
    routePanelBackBtn.setAttribute('title', 'Back');
    routePanelBackBtn.classList.add('route-panel--back-btn');
    this.routePanel.insertAdjacentElement('afterbegin', routePanelBackBtn);

    this._parentElement.replaceChildren(this.routePanel);
  }
  renderLocationCard(location) {
    if (!location) return;
    const locationCardEl = document.getElementsByClassName('location__card');
    if (!locationCardEl.length) {
      this.locationPreviewCard = document.createElement('div');
      this.locationPreviewCard.classList.add(
        'preview__card',
        'preview__card--text',
        'location__card'
      );

      this.preview.insertAdjacentElement(
        'afterbegin',
        this.locationPreviewCard
      );
    }
    this.locationPreviewCard.innerHTML = `
      <h4>Current Location</h4>
      <span><h4>${location}</h4>
      </span>
    `;
    // Create remove button
    const previewCardRemoveBtn = document.createElement('button');
    previewCardRemoveBtn.innerText = 'X';
    previewCardRemoveBtn.setAttribute('title', 'Remove current location');
    previewCardRemoveBtn.classList.add('location__card--remove-btn');
    this.locationPreviewCard.appendChild(previewCardRemoveBtn);
  }
}

export default new PanelView();
