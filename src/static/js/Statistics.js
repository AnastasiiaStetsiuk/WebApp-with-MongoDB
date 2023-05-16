import { $, fetchService, formatDate, removeChildren } from './utlls.js'

export class StatisticsService {
    constructor() {
        this.serviceName = 'statistics'

        if (!$(`#${this.serviceName}`)) {
            return
        }
        console.log(this.serviceName)

        this.asyncConstructor()
    }

    async asyncConstructor() {
        this.trains = await fetchService('trains')
        this.tickets = await fetchService('tickets')

        this.searchInput = $('input#search')

        this.table = $('#table')

        this.popularRoutes = $('#popular-routes')
        this.profitableRoutes = $('#profitable-routes')
        this.emptyRoutes = $('#empty-routes')

        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.render(this.tickets)
    }

    async search() {
        const query = this.searchInput.value

        if (query.length === 0) {
            this.render(this.tickets)
            return
        }
        if (isNaN(query)) {
            return
        }

        const filteredTickets = this.tickets.filter(item => +item.train === +query)

        this.render(filteredTickets)
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

        this.renderPopularRoutes()
        this.renderProfitableRoutes()
        this.renderEmptyRoutes()
    }

    renderPopularRoutes() {
        if (!this.popularRoutes || !Array.isArray(this.tickets)) {
            return
        }

        const routes = this.tickets.reduce((acc, item) => {
            if (!acc[item.train]) {
                acc[item.train] = 1
            } else {
                acc[item.train] += 1
            }

            return acc
        }, {})

        const sortedRoutes = Object.entries(routes).sort((a, b) => b[1] - a[1])

        removeChildren(this.popularRoutes)

        sortedRoutes.forEach(([train, count]) => {
            const li = document.createElement('li')
            li.innerHTML = `Train ${train} - ${count} tickets`
            this.popularRoutes.appendChild(li)
        })
    }

    renderProfitableRoutes() {
        if (!this.profitableRoutes || !Array.isArray(this.tickets)) {
            return
        }

        const routes = this.tickets.reduce((acc, item) => {
            if (!acc[item.train]) {
                acc[item.train] = item.price
            } else {
                acc[item.train] += item.price
            }

            return acc
        }, {})

        const sortedRoutes = Object.entries(routes).sort((a, b) => b[1] - a[1])

        removeChildren(this.profitableRoutes)

        sortedRoutes.forEach(([train, price]) => {
            const li = document.createElement('li')
            li.innerHTML = `Train ${train} - ${price} $`
            this.profitableRoutes.appendChild(li)
        })
    }

    renderEmptyRoutes() {
        if (!this.emptyRoutes || !Array.isArray(this.trains) || !Array.isArray(this.tickets)) {
            return
        }

        const routes = this.trains.reduce((acc, item) => {
            if (!acc[item.id]) {
                acc[item.id] = 0
            }

            return acc
        }, {})

        this.tickets.forEach(item => {
            if (routes[item.train] !== undefined) {
                routes[item.train] += 1
            }
        })

        const sortedRoutes = Object.entries(routes).sort((a, b) => a[1] - b[1])

        removeChildren(this.emptyRoutes)

        sortedRoutes.forEach(([train, count]) => {
            const li = document.createElement('li')
            li.innerHTML = `Train ${train} - ${count} tickets`
            this.emptyRoutes.appendChild(li)
        })
    }
}
