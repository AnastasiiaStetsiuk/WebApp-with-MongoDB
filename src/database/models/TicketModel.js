import mongoosePkg from 'mongoose'

const { Schema, model, models } = mongoosePkg

const TicketSchema = new Schema({
    id: {
        type: Number,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    passenger: {
        type: Number,
        required: true,
    },
    train: {
        type: Number,
        required: true,
    },
    seat: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
})

TicketSchema.pre('save', async function (next) {
    const last = await TicketModel.findOne().sort({ id: -1 })
    this.id = last ? last.id + 1 : 1
    next()
})

export const TicketModel = models.ticket ?? model('ticket', TicketSchema)
