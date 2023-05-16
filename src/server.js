import express from 'express'
import path from 'path'
import cors from 'cors'

import { CWD } from './config.js'
import { apiRouter } from './routes/apiRouter.js'

export class Server {
    constructor(PORT) {
        if (typeof PORT !== 'number') {
            throw new Error('PORT must be a number')
        }

        this.server = express()
        this.PORT = PORT

        this.server.use(express.static(`${CWD}/static`))
        this.server.use(express.urlencoded({ extended: true }))
        this.server.use(express.json())
        this.server.use(cors({
            origin: '*'
        }))

        this.server.set('views', path.join(CWD, '/static/views'))
        this.server.set('view engine', 'pug')

        this.server.get('/', (req, res) => {
            res.render('pages/index')
        })

        this.server.get('/passengers', (req, res) => {
            res.render('pages/passengers')
        })

        this.server.get('/tickets', (req, res) => {
            res.render('pages/tickets')
        })

        this.server.get('/trains', (req, res) => {
            res.render('pages/trains')
        })

        this.server.get('/statistics', (req, res) => {
            res.render('pages/statistics')
        })

        this.server.use('/api', apiRouter)
    }

    start() {
        this.server.listen(this.PORT, () => {
            console.log(`[SERVER] Listening on port ${this.PORT}`)
        })
    }
}
