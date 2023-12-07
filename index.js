'use strict'

const pathToImgs = './img';
const imgsSrc = [];
const imgLength = 6;

for (let i = 1; i <= imgLength; i++) {
    imgsSrc.push(`${pathToImgs}/img${i}.jpg`);
}

const rootEl = document.querySelector('#slider');
const imgEl = rootEl.querySelector('.main-img');
const paginationEl = rootEl.querySelector('.pagination');
const paginationItemEls = [];


function changePagination(paginationItemEls, id) {
    paginationItemEls.forEach(item => {
        if (item.dataset.id == id) {
            item.classList.add('pagination__item_active');
        } else {
            item.classList.remove('pagination__item_active');
        }
    });
}

function animationSlide(htmlEl, options) {
    const distance = '500px';
    const direction = options.direction ? `translateX(${distance})` : `translateX(-${distance})`;
    htmlEl.animate([
        {
            transform: direction,
            opacity: 0
        },
        {
            transform: 'translateX(0)',
            opacity: 1
        }
    ], {
        duration: options.duration ?? 500,
        fill: 'both',
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)'
    })
}

function showNext() {
    const currentSlide = imgEl.src;
    imgEl.src = slideData.next();
    rootEl.style.backgroundImage = `url(${currentSlide})`
    animationSlide(imgEl, {direction: true})
    changePagination(paginationItemEls, slideData.getSlide());
}

function showPrevious() {
    const currentSlide = imgEl.src;
    imgEl.src = slideData.back();
    rootEl.style.backgroundImage = `url(${currentSlide})`
    animationSlide(imgEl, {direction: false})
    changePagination(paginationItemEls, slideData.getSlide());
}

function initSlideData(srcArr) {
    let slide = 0;
    const imgsSrc = srcArr;
    return {
        getImgsSrc() {
            return imgsSrc;
        },
        getSlide() {
            return slide;
        },
        next(isSaveState = true) {
            const currentSLide = slide >= imgsSrc.length - 1 ? 0 : slide + 1;
            if (isSaveState) {
                slide = currentSLide;
            }
            return imgsSrc[currentSLide]
        },
        back(isSaveState = true) {
            const currentSLide = slide <= 0 ? imgsSrc.length - 1 : slide - 1;
            if (isSaveState) {
                slide = currentSLide;
            }
            return imgsSrc[currentSLide];
        },
        getSrc(id = slide) {
            slide = Number(id);
            return imgsSrc[slide]
        },
    }
}

function initPaginationItems(imgsArray, containerHTMLEl, paginationItemsArray) {
    imgsArray.forEach((_, index) => {
        const paginationItemEl = document.createElement('button');
        paginationItemEl.classList.add('pagination__item');
        paginationItemEl.setAttribute('data-id', index);
        containerHTMLEl.append(paginationItemEl);
        paginationItemsArray.push(paginationItemEl);
    })
}


const slideData = initSlideData(imgsSrc);
initPaginationItems(slideData.getImgsSrc(), paginationEl, paginationItemEls)

imgEl.src = slideData.getSrc();
rootEl.style.backgroundImage = `url(${slideData.getSrc()})`
changePagination(paginationItemEls, slideData.getSlide());

rootEl.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('.next')) {
        showNext();
    }
    if (target.closest('.back')) {
        showPrevious();
    }
});

paginationEl.addEventListener('click', event => {
    if (event.target.classList.contains('pagination__item')) {
        rootEl.style.backgroundImage = `url(${slideData.getSrc()})`
        changePagination(paginationItemEls, Number(event.target.dataset.id))
        imgEl.src = slideData.getSrc(Number(event.target.dataset.id))
        animationSlide(imgEl, {direction: true});
    }
});

document.addEventListener('keyup', event => {
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrevious();
})


