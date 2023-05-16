import { Router } from 'express'

export const generateRouter = Model => {
    const router = Router()

    router.get('/', async (req, res) => {
        try {
            const { _id, id } = req.body || req.query

            if (_id) {
                const data = await Model.find({ _id }).lean()
                return res.status(200).send(data)
            }
            if (id) {
                const data = await Model.find({ id }).lean()
                return res.status(200).send(data)
            }

            const data = await Model.find().lean()

            return res.status(200).send(data)
        } catch (error) {
            console.error(error)
            return res.status(500).send(error)
        } finally {
            res.end()
        }
    })

    router.post('/', async (req, res) => {
        try {
            const newData = req.body

            const newItem = await Model(newData)
            const validate = newItem.validateSync()

            if (validate !== undefined) {
                return res.status(400).send({ message: 'invalid data' })
            }

            await newItem.save()

            return res.status(200).send(newItem)
        } catch (error) {
            console.error(error)
            return res.status(500).send(error)
        } finally {
            res.end()
        }
    })

    router.put('/', async (req, res) => {
        try {
            const newData = req.body

            const foundItem = await Model.findOne({ _id: newData._id })

            if (foundItem === null || newData?._id === undefined) {
                return res.status(400).send({ message: 'invalid data', foundItem, newData })
            }

            await Model.updateOne({ _id: newData._id }, newData)

            return res.status(200).send({ message: 'updated' })
        } catch (error) {
            console.error(error)
            return res.status(500).send(error)
        } finally {
            res.end()
        }
    })

    router.delete('/', async (req, res) => {
        try {
            const objToDelete = req.body

            const foundItem = await Model.findOne(objToDelete)

            if (!foundItem) {
                return res.status(400).send({ message: 'invalid data' })
            }

            await Model.deleteOne(objToDelete)

            return res.status(200).send({ message: 'deleted' })
        } catch (error) {
            console.error(error)
            return res.status(500).send(error)
        } finally {
            res.end()
        }
    })

    return router
}
