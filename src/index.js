import { PORT } from './config.js'
import { Database } from './database/Database.js'
import { Server } from './server.js'

const server = new Server(PORT)
const db = new Database()

const main = async () => {
    await db.connect()
    server.start()
}

main()
