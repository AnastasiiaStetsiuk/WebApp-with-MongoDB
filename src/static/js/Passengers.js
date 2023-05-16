import { $, FETCH, fetchService, rabinKarp, removeChildren } from './utlls.js'

export class PassengerService {
    constructor() {
        this.serviceName = 'passengers'

        if (!$(`#${this.serviceName}`)) {
            return
        }
        console.log(this.serviceName)

        this.asyncConstructor()
    }

    async asyncConstructor() {
        this.data = await fetchService(this.serviceName)

        // add
        this.addSurnameInput = $('input#add-surname')
        this.addNameInput = $('input#add-name')
        this.addPassportInput = $('input#add-passport')
        this.addButton = $('button#add')

        // edit
        this.editSurnameInput = $('input#edit-surname')
        this.editIdInput = $('input#edit-id')
        this.editNameInput = $('input#edit-name')
        this.editPassportInput = $('input#edit-passport')
        this.editButton = $('button#edit')

        // remove
        this.removeInput = $('input#remove')
        this.removeButton = $('button#remove')

        // search
        this.searchInput = $('input#search')

        // log
        this.logElement = $('#log')

        // table
        this.table = $('#table')

        this.addButton?.addEventListener('click', this.add.bind(this))
        this.editButton?.addEventListener('click', this.edit.bind(this))
        this.removeButton?.addEventListener('click', this.remove.bind(this))
        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.render(this.data)
    }

    async add() {
        const surname = this.addSurnameInput.value
        const name = this.addNameInput.value
        const passport = this.addPassportInput.value

        if (!this.validateData({ surname, name, passport })) {
            return
        }

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'POST',
            body: JSON.stringify({
                surname,
                name,
                passport,
            }),
        })

        if (typeof res?.id !== 'number') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.addSurnameInput.value = ''
        this.addNameInput.value = ''
        this.addPassportInput.value = ''

        this.data.push(res)
        this.render(this.data)
        this.log('Пасажира додано ✅')
    }

    async edit() {
        const id = this.editIdInput.value
        const surname = this.editSurnameInput.value
        const name = this.editNameInput.value
        const passport = this.editPassportInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ surname, name, passport })) {
            return
        }

        const oldData = this.data.find(item => +item.id === +id)

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...oldData,
                surname,
                name,
                passport,
            }),
        })

        if (res?.message !== 'updated') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.editIdInput.value = ''
        this.editSurnameInput.value = ''
        this.editNameInput.value = ''
        this.editPassportInput.value = ''

        this.data = await fetchService(this.serviceName)
        this.render(this.data)
        this.log('Пасажира змінено ✅')
    }

    async remove() {
        const id = this.removeInput.value

        if (!this.validateId(id)) {
            return
        }

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'DELETE',
            body: JSON.stringify({
                id,
            }),
        })

        if (res?.message !== 'deleted') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.removeInput.value = ''

        this.data = await fetchService(this.serviceName)
        this.render(this.data)
        this.log('Пасажира видалено ✅')
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.data)
            return this.log('Пошук скасовано. Введіть запит для пошуку')
        }

        const filtered = this.data.filter(item => {
            const id = item.id.toString()
            const surname = item.surname.toLowerCase()
            const name = item.name.toLowerCase()
            const passport = item.passport.toString()

            return rabinKarp(`${id} ${surname} ${name} ${passport}`, query)
        })

        this.render(filtered)
        this.log(`Знайдено ${filtered.length} квитків ✅`)
    }

    log(message) {
        this.logElement.innerHTML = message
    }

    render(data) {
        if (!this.table || !Array.isArray(data)) {
            return
        }

        const createRow = ({ id, surname, name, passport }) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const eSurname = document.createElement('td')
            const eName = document.createElement('td')
            const ePassport = document.createElement('td')

            eId.setAttribute('scope', 'row')

            eId.innerHTML = id
            eSurname.innerHTML = surname
            eName.innerHTML = name
            ePassport.innerHTML = passport

            row.appendChild(eId)
            row.appendChild(eSurname)
            row.appendChild(eName)
            row.appendChild(ePassport)

            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const tr = createRow(item)
            this.table.appendChild(tr)
        })
    }

    // helpers

    validateId(id) {
        if (id.length === 0) {
            this.log('Введіть ID пасажира')
            return false
        }
        if (isNaN(id)) {
            this.log('ID повинен містити тільки цифри')
            return false
        }
        if (!this.data.find(item => +item.id === +id)) {
            this.log(`Пасажира з ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ surname, name, passport }) {
        const isPassportUnique = this.data.every(item => +item.passport !== +passport)

        if (surname.length === 0) {
            this.log('Введіть прізвище пасажира')
            return false
        }
        if (name.length === 0) {
            this.log('Введіть імʼя пасажира')
            return false
        }
        if (passport.length === 0) {
            this.log('Введіть паспорт пасажира')
            return false
        }
        if (isNaN(passport)) {
            this.log('Паспорт повинен містити тільки цифри')
            return false
        }
        if (!isPassportUnique) {
            this.log(`Паспорт ${passport} вже існує в базі даних`)
            return false
        }

        return true
    }
}
