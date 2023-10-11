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
      // Remove all image previews
      this.preview.replaceChildren();
      !!this.routePreviewCard && this.routePreviewCard.remove();

      // reset to default coords/world view
      this.form.reset();
      this._submitBtn.disabled = true;
    });
  }
  addHandlerUserLocation(handler) {
    this._userLocationInput.addEventListener('change', (e) => handler(e));
  }
  // Function to print image, info and coords to preview area
  renderPreviewCard(img) {
    const {
      file,
      file: { exifdata },
      latitude,
      longitude,
      photoIndex,
    } = img;

    // Create preview card element
    const previewCard = document.createElement('div');
    previewCard.classList.add('preview__card');
    previewCard.dataset.photoIndex = photoIndex;
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
  // Render all cards from state
  renderAllImgs(state) {
    state.uploadedImages.map((img) => this.renderPreviewCard(img));
  }
}

export default new PanelView();
