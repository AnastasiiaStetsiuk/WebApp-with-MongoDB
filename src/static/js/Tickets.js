import { $, FETCH, fetchService, formatDate, rabinKarp, removeChildren } from './utlls.js'

export class TicketService {
    constructor() {
        this.serviceName = 'tickets'

        if (!$(`#${this.serviceName}`)) {
            return
        }
        console.log(this.serviceName)

        this.asyncConstructor()
    }

    async asyncConstructor() {
        this.data = await fetchService(this.serviceName)

        // add
        this.addPassengerInput = $('input#add-passenger')
        this.addTrainInput = $('input#add-train')
        this.addPriceInput = $('input#add-price')
        this.addSeatInput = $('input#add-seat')
        this.addDateInput = $('input#add-date')

        this.addButton = $('button#add')

        // edit
        this.editIdInput = $('input#edit-id')
        this.editPriceInput = $('input#edit-price')
        this.editPassengerInput = $('input#edit-passenger')
        this.editTrainInput = $('input#edit-train')
        this.editSeatInput = $('input#edit-seat')
        this.editDateInput = $('input#edit-date')

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
        const passenger = this.addPassengerInput.value
        const train = this.addTrainInput.value
        const price = this.addPriceInput.value
        const seat = this.addSeatInput.value
        const date = this.addDateInput.value

        if (!(await this.validateData({ passenger, train, price, seat, date }))) {
            return
        }

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'POST',
            body: JSON.stringify({
                passenger,
                train,
                price,
                seat,
                date,
            }),
        })

        if (typeof res?.id !== 'number') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.addPassengerInput.value = ''
        this.addTrainInput.value = ''
        this.addPriceInput.value = ''
        this.addSeatInput.value = ''
        this.addDateInput.value = ''

        this.data.push(res)
        this.render(this.data)
        this.log(`Квиток додано ✅`)
    }

    async edit() {
        const id = this.editIdInput.value
        const passenger = this.addPassengerInput.value
        const train = this.addTrainInput.value
        const price = this.addPriceInput.value
        const seat = this.addSeatInput.value
        const date = this.addDateInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!(await this.validateData({ passenger, train, price, seat, date }))) {
            return
        }

        const oldData = this.data.find(item => +item.id === +id)

        const res = await FETCH(`/api/${this.serviceName}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...oldData,
                passenger,
                train,
                price,
                seat,
                date,
            }),
        })

        if (res?.message !== 'updated') {
            console.log(res)
            return this.log('Виникла помилка')
        }

        this.editIdInput.value = ''
        this.editPassengerInput.value = ''
        this.editTrainInput.value = ''
        this.editPriceInput.value = ''
        this.editSeatInput.value = ''
        this.editDateInput.value = ''

        this.data = await fetchService(this.serviceName)
        this.render(this.data)
        this.log(`Квиток відредаговано ✅`)
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
        this.log(`Квиток видалено ✅`)
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.data)
            this.log('Пошук скасовано. Введіть запит для пошуку')
            return
        }

        const filtered = this.data.filter(item => {
            const passenger = item.passenger.toString()
            const train = item.train.toString()
            const price = item.price.toString()
            const seat = item.seat.toString()
            const date = item.date.toLowerCase()

            return rabinKarp(`${passenger} ${train} ${price} ${seat} ${formatDate(date)}`, query)
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

        const createRow = ({ id, passenger, train, price, seat, date }) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const ePassenger = document.createElement('td')
            const eTrain = document.createElement('td')
            const ePrice = document.createElement('td')
            const eSeat = document.createElement('td')
            const eDate = document.createElement('td')

            eId.setAttribute('scope', 'row')

            eId.innerHTML = id
            ePassenger.innerHTML = passenger
            eTrain.innerHTML = train
            ePrice.innerHTML = price
            eSeat.innerHTML = seat
            eDate.innerHTML = formatDate(date)

            row.appendChild(eId)
            row.appendChild(ePassenger)
            row.appendChild(eTrain)
            row.appendChild(ePrice)
            row.appendChild(eSeat)
            row.appendChild(eDate)

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
            this.log('Введіть ID квитка')
            return false
        }
        if (isNaN(id)) {
            this.log('ID повинен містити тільки цифри')
            return false
        }
        if (!this.data.find(item => +item.id === +id)) {
            this.log(`Квитка з ID ${id} не існує`)
            return false
        }

        return true
    }

    async validateData({ passenger, train, price, seat, date }) {
        const passengers = await fetchService('passengers')
        const trains = await fetchService('trains')

        if (passenger.length === 0) {
            this.log('Введіть ID пасажира')
            return false
        }
        if (train.length === 0) {
            this.log('Введіть ID поїзда')
            return false
        }
        if (price.length === 0) {
            this.log('Введіть ціну квитка')
            return false
        }
        if (seat.length === 0) {
            this.log('Введіть номер місця')
            return false
        }
        if (date.length === 0) {
            this.log('Введіть дату відправлення')
            return false
        }
        if (isNaN(passenger)) {
            this.log('ID пасажира повинен містити тільки цифри')
            return false
        }
        if (isNaN(train)) {
            this.log('ID поїзда повинен містити тільки цифри')
            return false
        }
        if (isNaN(price)) {
            this.log('Ціна квитка повинна містити тільки цифри')
            return false
        }
        if (isNaN(seat)) {
            this.log('Номер місця повинен містити тільки цифри')
            return false
        }

        if (!passengers.find(item => +item.id === +passenger)) {
            this.log(`Пасажира з ID ${passenger} не існує`)
            return false
        }
        if (!trains.find(item => +item.id === +train)) {
            this.log(`Поїзда з ID ${train} не існує`)
            return false
        }

        const ticket = this.data.find(
            item => +item.train === +train && +item.seat === +seat && item.date === date,
        )

        if (ticket) {
            this.log(
                `Квиток на поїзд ${train} з номером місця ${seat} на дату ${formatDate(
                    date,
                )} вже існує`,
            )
            return false
        }

        const seats = trains.find(item => +item.id === +train).capacity
        const tickets = this.data.filter(item => +item.train === +train && item.date === date)

        if (tickets.length >= seats) {
            this.log(`Поїзд ${train} вже заповнений`)
            return false
        }

        return true
    }
}
