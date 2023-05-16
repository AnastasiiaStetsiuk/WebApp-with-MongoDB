import mongoosePkg from 'mongoose'

const { Schema, model, models } = mongoosePkg

const RouteSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
})

export const TrainSchema = new Schema({
    id: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    route: {
        type: RouteSchema,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
})

TrainSchema.pre('save', async function (next) {
    const last = await TrainModel.findOne().sort({ id: -1 })
    this.id = last ? last.id + 1 : 1
    next()
})

export const TrainModel = models.train ?? model('train', TrainSchema)
