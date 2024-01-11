'use strict';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '41511602-ac1f0d864a13fd01c911f294b';
const searchForm = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const loaderEl = document.querySelector('.loader');
loaderEl.style.display = 'none';

searchForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();
  const inputValue = event.target.elements.searchQuery.value.trim();

  if (!inputValue) {
    iziToast.warning({
      title: 'Warning!',
      message: 'Please enter image name!',
      position: 'topRight',
    });
    return;
  }

  clearGallery();
  loaderEl.style.display = 'block';

  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  fetch(`https://pixabay.com/api/?${searchParams}`)
    .then(response => {
      loaderEl.style.display = 'none';

      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      if (data.hits.length === 0) {
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
          color: '#EF4040',
        });
        return;
      }
      renderImages(data.hits);
      lightbox.refresh();
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      iziToast.error({
        message: 'Failed to fetch images. Please try again later.',
        position: 'topRight',
      });
    });
}

function renderImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(image => {
    const imageCardEl = createImageCard(image);
    fragment.appendChild(imageCardEl);
  });

  galleryContainer.appendChild(fragment);
}

function createImageCard(image) {
  const imageCardEl = document.createElement('div');
  imageCardEl.classList.add('card');

  imageCardEl.innerHTML = `
    <a class="gallery-link" href="${image.largeImageURL}">
        <img class="card-image" src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
      </a>
      <div class="card-info">
        <p class="card-text"><b>Likes:</b> ${image.likes}</p>
        <p class="card-text"><b>Views:</b> ${image.views}</p>
        <p class="card-text"><b>Comments:</b> ${image.comments}</p>
        <p class="card-text"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    `;

  return imageCardEl;
}

function clearGallery() {
  galleryContainer.innerHTML = '';
}
