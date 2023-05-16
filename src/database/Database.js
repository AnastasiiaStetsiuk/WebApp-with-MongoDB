import { connect, set } from 'mongoose'

import { DB_CONNSTR, DB_NAME } from '../config.js'

set('strictQuery', false)

export class Database {
    instance = null

    constructor() {
        if (Database.instance === null) Database.instance = this
        return Database.instance
    }

    connect = async () => {
        console.log('[DB] Connecting...')
        try {
            await connect(DB_CONNSTR)
            console.log(`[DB] Connected to "${DB_NAME}"`)
        } catch (error) {
            console.error('[DB] Connection error')
            console.error(error)
        }
    }
}
