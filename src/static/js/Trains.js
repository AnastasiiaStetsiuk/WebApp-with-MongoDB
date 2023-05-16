import { $, FETCH, fetchService, rabinKarp, removeChildren } from './utlls.js'

export class TrainService {
    constructor() {
        this.serviceName = 'trains'

        if (!$(`#${this.serviceName}`)) {
            return
        }
        console.log(this.serviceName)

        this.asyncConstructor()
    }

    async asyncConstructor() {
        this.data = await fetchService(this.serviceName)

        // add
        this.addNameInput = $('input#add-name')
        this.addFromInput = $('input#add-from')
        this.addToInput = $('input#add-to')
        this.addCapacityInput = $('input#add-capacity')

        this.addButton = $('button#add')

        // edit
        this.editIdInput = $('input#edit-id')
        this.editNameInput = $('input#edit-name')
        this.editFromInput = $('input#edit-from')
        this.editToInput = $('input#edit-to')
        this.editCapacityInput = $('input#edit-capacity')

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
        const name = this.addNameInput.value
        const from = this.addFromInput.value
        const to = this.addToInput.value
        const capacity = this.addCapacityInput.value

        if (!this.validateData({ name, from, to, capacity })) {
            return
        }

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'POST',
            body: JSON.stringify({
                name,
                route: {
                    from,
                    to,
                },
                capacity,
            }),
        })

        if (typeof res?.id !== 'number') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.addNameInput.value = ''
        this.addFromInput.value = ''
        this.addToInput.value = ''
        this.addCapacityInput.value = ''

        this.data.push(res)
        this.render(this.data)
        this.log('Потяг додано ✅')
    }

    async edit() {
        const id = this.editIdInput.value
        const name = this.editNameInput.value
        const from = this.editFromInput.value
        const to = this.editToInput.value
        const capacity = this.editCapacityInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ name, from, to, capacity })) {
            return
        }

        const oldData = this.data.find(item => +item.id === +id)

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...oldData,
                name,
                route: {
                    from,
                    to,
                },
                capacity,
            }),
        })

        if (res?.message !== 'updated') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.editIdInput.value = ''
        this.editNameInput.value = ''
        this.editFromInput.value = ''
        this.editToInput.value = ''
        this.editCapacityInput.value = ''

        this.data = await fetchService(this.serviceName)
        this.render(this.data)
        this.log('Потяг змінено ✅')
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
        this.log('Потяг видалено ✅')
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.data)
            return this.log('Пошук скасовано. Введіть запит для пошуку')
        }

        const filtered = this.data.filter(item => {
            const id = item.id.toString()
            const name = item.name.toLowerCase()
            const route = `${item.route.from.toLowerCase()}-${item.route.to.toLowerCase()}`
            const capacity = item.capacity.toString()

            return rabinKarp(`${id} ${name} ${route} ${capacity}`, query)
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

        const createRow = ({ id, name, route, capacity }) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const eName = document.createElement('td')
            const eFrom = document.createElement('td')
            const eTo = document.createElement('td')
            const eCapacity = document.createElement('td')

            eId.setAttribute('scope', 'row')

            eId.innerHTML = id
            eName.innerHTML = name
            eFrom.innerHTML = route.from
            eTo.innerHTML = route.to
            eCapacity.innerHTML = capacity

            row.appendChild(eId)
            row.appendChild(eName)
            row.appendChild(eFrom)
            row.appendChild(eTo)
            row.appendChild(eCapacity)

            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const row = createRow(item)
            this.table.appendChild(row)
        })
    }

    // helpers

    validateId(id) {
        if (id.length === 0) {
            this.log('Введіть ID потягу')
            return false
        }
        if (isNaN(id)) {
            this.log('ID потягу повинен містити тільки цифри')
            return false
        }
        if (!this.data.find(item => +item.id === +id)) {
            this.log(`Потягу з ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ name, from, to, capacity }) {
        if (!name) {
            this.log('Введіть назву потягу')
            return false
        }
        if (!from) {
            this.log('Введіть маршрут потягу')
            return false
        }
        if (!to) {
            this.log('Введіть маршрут потягу')
            return false
        }
        if (!capacity) {
            this.log('Введіть кількість місць в потягу')
            return false
        }
        if (isNaN(capacity)) {
            this.log('Кількість місць повинна містити тільки цифри')
            return false
        }

        return true
    }
}
