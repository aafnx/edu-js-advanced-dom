'use strict'

const URL = "https://api.unsplash.com/photos/";
const URL_RANDOM_PHOTO = `${URL}/random`;
const REDIRECT_URI = 'http://localhost:63342/homework/index.html';
const USER_SCOPE = 'public+write_likes';

const rootEl = document.querySelector('#inspirational-photo');

async function fetchKey(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error fetching key');
    }
    return await response.json();
}
async function fetchPhoto(API, url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept-Version': 'v1',
            Authorization: `Client-ID ${API}`,
        }
    })
    if (response.ok) {
        return await response.json();
    } else {
        checkResponseStatus(response.status);
    }
}

function render(data) {
    const markup = `
        <h1 class="title">Inspirational photo</h1>
        <div class="photo-container">
            <img data-id="${data.id}" class="photo" src="${data.urls.regular}?&w=1024&h=768" alt="${data.alt_description}">
        </div>
        <div class="flex">
            <div class="photo-info">
                <p class="author">Author: ${data.user.name}</p>
                <p class="description" ${data.description ? '' : 'style="display:none;"'}>${data.description}</p>
                <p class="views">Views: ${data.views}</p>
                <p class="likes">Likes: <span class="like-count">${data.likes}</span></p>
            </div>
            <button class="like"><svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg></i></button>
        </div>
    `
    rootEl.insertAdjacentHTML('afterbegin', markup);
}
function renderAuthorization(apiKey, redirectUri, userScope) {
    const markup = `
        <a class="authorization" href="https://unsplash.com/oauth/authorize?client_id=${apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=${userScope}">autorization unsplash</a>
    `
    rootEl.insertAdjacentHTML('beforeend', markup);
}
function renderError(error) {
    rootEl.innerHTML = `<h1 class="error">${error}</h1>`;
}
function renderViewedPhotos(data) {
    const photoCardsMarkup = data.reverse().reduce((markup, photo) =>
        (markup += `
            <div class="photo-card">
                <a href="${photo.links.download}" class="photo-link" target="_blank">
                    <img data-id="${photo.id}" class="photo" src="${photo.urls.small}?&w=1024&h=768" alt="${photo.alt_description}">
                </a>
            </div>
        `
    ), "");

    const markup = `
        <div class="viewed-photos">
            <h2 class="title">Viewed photos</h2>
            <div class="viewed-photos-container">
                ${photoCardsMarkup}
            </div>
        </div>
    `

    rootEl.insertAdjacentHTML('afterend', markup);
}
function makeLiked(buttonHTMLEl, likeTextSelector) {
    if (likeTextSelector) {
        const likeCountEL = rootEl.querySelector(likeTextSelector);
        likeCountEL.innerText = Number(likeCountEL.innerText) + 1;
    }
    buttonHTMLEl.innerHTML = `<svg class="liked" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>`;
}

function getUserAuthorizationCodeFromQueryParams() {
    return window.location.search.split('?code=').pop();
}
async function getUserTokenData(apiKey, appSecret, redirectUri, authorizationCode){
     const response = await fetch(`https://unsplash.com/oauth/token?&client_id=${apiKey}&client_secret=${appSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code&code=${authorizationCode}`, {
         method: 'POST',
     })

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Ошибка получения токена пользователя');
    }
}
async function likePhoto(id, userAccessToken) {
    // POST /photos/:id/like
    const response = await fetch(`${URL}/${id}/like`, {
        method: 'POST',
        headers: {
            'Accept-Version': 'v1',
            Authorization: `Bearer ${userAccessToken}`,
        }
    });
    if (response.ok) {
        return await response.json();
    } else {
        checkResponseStatus(response.status);
    }

}
function checkResponseStatus(responseStatus) {
    switch (responseStatus) {
        case 401:
            throw new Error(`${responseStatus} — вы не авторизированы!`);
        case 403:
            throw new Error(`${responseStatus} — доступ запрещен`);
        default:
            throw new Error(`${responseStatus} — ошибка`);
    }
}
function updatePhotoData(photo, newData) {
    const result = {...photo};
    result.likes = newData.likes;
    result.liked_by_user = newData.liked_by_user;
    return result;
}
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}
function updateViewedPhotos(updatedPhoto, keyLocalStorage) {
    const viewedPhotos = getFromLocalStorage(keyLocalStorage);
    const indexInLocalStorage = viewedPhotos.findIndex(photo => photo.id === updatedPhoto.id);
    viewedPhotos.splice(indexInLocalStorage, 1);
    viewedPhotos.push(updatedPhoto);
    saveToLocalStorage(keyLocalStorage, viewedPhotos);
}

async function main() {
    const keyUserTokenLocalStorage = 'user_token';
    const keyPhotoLocalStorage = 'photo';
    const keyViewedPhotos = 'viewed_photos';

    const API = await fetchKey('api.json');
    const APP_SECRET = await fetchKey('app-secret.json');

    const photoData = await fetchPhoto(API, URL_RANDOM_PHOTO);

    // init photo history
    let viewedPhotos = getFromLocalStorage(keyViewedPhotos);
    if (!viewedPhotos) {
        viewedPhotos = [];
    }
    const findPhoto = viewedPhotos.find(photo => photo.id === photoData.id);
    if (!findPhoto) {
        viewedPhotos.push(photoData);
        saveToLocalStorage(keyViewedPhotos, viewedPhotos);
    }

    await render(photoData);
    if (viewedPhotos.length) {
        renderViewedPhotos(viewedPhotos);
    }

    let userTokenData = getFromLocalStorage(keyUserTokenLocalStorage);
    if (!userTokenData) {
        const userAuthorizationCode = getUserAuthorizationCodeFromQueryParams();

        if (userAuthorizationCode) {
            userTokenData = await getUserTokenData(API, APP_SECRET, REDIRECT_URI, userAuthorizationCode);
            saveToLocalStorage(keyUserTokenLocalStorage, userTokenData);
        } else {
            renderAuthorization(API, REDIRECT_URI, USER_SCOPE);
        }
    }

    const photoContainerEl = rootEl.querySelector('.photo-container');
    const likeButton = rootEl.querySelector('.like');
    if (photoData.liked_by_user) {
        makeLiked(likeButton);
    }

    likeButton.addEventListener('click', async () => {
        try {
            const responseData = await likePhoto(photoData.id, userTokenData?.access_token);
            makeLiked(likeButton, '.like-count');

            const updatedPhoto = updatePhotoData(photoData, responseData.photo);
            updateViewedPhotos(updatedPhoto, keyViewedPhotos);
            saveToLocalStorage(keyPhotoLocalStorage, updatedPhoto);
        } catch (error) {
            alert(error.message)
        }
    })

    photoContainerEl.addEventListener('click', () => location.reload())
}

window.addEventListener('load', () => {
    main()
        .catch(error => {
            console.error(error.message);
            renderError(error.message);
        })
})



