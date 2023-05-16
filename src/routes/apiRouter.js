import { Router } from 'express'

import { PassengerModel } from '../database/models/PassengerModel.js'
import { TicketModel } from '../database/models/TicketModel.js'
import { TrainModel } from '../database/models/TrainModel.js'
import { generateRouter } from './generateRouter.js'

const apiRouter = Router()

apiRouter.use('/passengers', generateRouter(PassengerModel))
apiRouter.use('/trains', generateRouter(TrainModel))
apiRouter.use('/tickets', generateRouter(TicketModel))

export { apiRouter }
