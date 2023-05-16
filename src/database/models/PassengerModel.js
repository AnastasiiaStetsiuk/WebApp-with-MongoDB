import mongoosePkg from 'mongoose'

const { Schema, model, models } = mongoosePkg

export const PassengerSchema = new Schema({
    id: {
        type: Number,
        unique: true,
    },
    surname: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    passport: {
        type: Number,
        required: true,
        unique: true,
    },
})

PassengerSchema.pre('save', async function (next) {
    const last = await PassengerModel.findOne().sort({ id: -1 })
    this.id = last ? last.id + 1 : 1
    next()
})

export const PassengerModel = models.passenger ?? model('passenger', PassengerSchema)
