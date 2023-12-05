'use strict';

class SchedulesView {
    #keyStorage = 'schedules';
    #data = [];
    constructor(options) {
        this.root = document.querySelector(options.id);
        if (!this.root) {
            throw new Error(`Не найден HTML элемент с id ${options.id}`);
        }
        this.init(options);

    }
    get key() {
        return this.#keyStorage;
    }
    get data() {
        return this.#data;
    }

    set data(data) {
        this.#data = data;
    }
    init(options) {
        const dataFromLocalStorage = this.getFromLocalStorage();
        if (dataFromLocalStorage) {
            this.data = dataFromLocalStorage;
            this.render()
            this.addEventListeners();
        } else {
            this.requestToBD(options.urlToBD);
        }
    }
    requestToBD(url) {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Ошибка загрузки данных');
            })
            .then(data => {
                this.data = data;
                this.refreshDataModel();
                this.render(data);
                this.addEventListeners();
            })
            .catch((error) => error);
    }
    addEventListeners() {
        this.container.addEventListener('click', event => {
            if (event.target.classList.contains('cancel')) {
                const cancelBtnEl = event.target;
                this.changeLessonCheckin(cancelBtnEl.dataset.id, false);
            }
            if (event.target.classList.contains('check-in')) {
                const checkInBtn = event.target;
                this.changeLessonCheckin(checkInBtn.dataset.id, true);
            }
        })
    }
    changeLessonCheckin(lessonId, isCheckin) {
        if (isCheckin) {
            this.increaseParticipant(lessonId);
        } else {
            this.reductionParticipant(lessonId);
        }
        this.refreshDataModel();
        this.saveToLocalStorage();
        this.renderTable();
    }
    findLesson(id) {
        return this.data.find(lesson => lesson.id === Number(id));
    }
    refreshDataModel() {
        this.calcRestParticipants();
    }
    renderTable(data = this.data) {

        const markupTableRows = data.reduce((row, lesson) => (
            row += `
                    <p data-id="${lesson.id}" class="cell">${lesson.name}</p>
                    <p data-id="${lesson.id}" class="cell">${lesson.time}</p>
                    <p data-id="${lesson.id}" class="cell">${lesson.currentParticipants}</p>
                    <p data-id="${lesson.id}" class="cell">${lesson.maxParticipants}</p>
                    <p data-id="${lesson.id}" class="cell">${lesson.restParticipants}</p>
                    <button data-id="${lesson.id}" class="cell cancel">Отменить запись</button>
                    <button data-id="${lesson.id}" class="cell check-in" ${lesson.restParticipants ? '' : 'disabled'}>Записаться</button>
            `
        ), "");
        this.container.innerHTML = `
            <div class="table">
                    <p class="cell cell_title">Название занятия</p>
                    <p class="cell cell_title">Время занятия</p>
                    <p class="cell cell_title">Записано участников</p>
                    <p class="cell cell_title">Всего мест</p>
                    <p class="cell cell_title">Доступно мест для записи</p>
                    <p class="cell cell_title"></p>
                    <p class="cell cell_title"></p>
                    ${markupTableRows}
            </div>
        `;
    }
    render(data = this.data) {
        const titleEl = document.createElement('h1');
        titleEl.innerText = 'Расписание занятий';
        titleEl.classList.add('title');
        this.root.insertAdjacentElement('afterbegin', titleEl);

        const container = document.createElement('div');
        container.classList.add('container');
        this.container = container;
        this.root.insertAdjacentElement('beforeend', container);

        this.renderTable(data);
    }
    increaseParticipant(lessonId) {
        const lesson = this.findLesson(lessonId);
        if (!lesson) {
            throw new Error(`Занятие с id ${lessonId} не найдено!`);
        }
        lesson.currentParticipants += 1;
        if (lesson.currentParticipants > lesson.maxParticipants) {
            lesson.currentParticipants = lesson.maxParticipants;
        }
    }
    reductionParticipant(lessonId) {
        const lesson = this.findLesson(lessonId);
        if (!lesson) {
            throw new Error(`Занятие с id ${lessonId} не найдено!`);
        }
        lesson.currentParticipants -= 1;
        if (lesson.currentParticipants < 0) {
            lesson.currentParticipants = 0;
        }
    }
    calcRestParticipants() {
        this.data.map(lesson => {
            const restParticipants = lesson.maxParticipants - lesson.currentParticipants;
            if (restParticipants  < 0 ) {
                lesson.restParticipants = 0;
            } else {
                lesson.restParticipants = restParticipants;
            }
        })
    }
    getFromLocalStorage(key = this.key) {
        return JSON.parse(localStorage.getItem(key));
    }
    saveToLocalStorage(data = this.data, key = this.#keyStorage) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

new SchedulesView({
    id: '#schedules',
    urlToBD: 'data.json'
})
