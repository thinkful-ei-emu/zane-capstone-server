const express = require('express')
const InventoriesService = require('./InventoriesService')
const {requireAuth}=require('../middleware/jwt-auth')

const inventoriesRouter = express.Router()



inventoriesRouter
  .route('/:inventory_id')
  .all(requireAuth)
  .all(checkInventoryExists)
  .get((req, res) => {
    res.json(InventoriesService.serializeThing(res.thing))
  })


/* async/await syntax for promises */
async function checkInventoryExists(req, res, next) {
  try {
    const thing = await InventoriesService.getById(
      req.app.get('db'),
      req.params.thing_id
    )

    if (!thing)
      return res.status(404).json({
        error: `Thing doesn't exist`
      })

    res.thing = thing
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = inventoriesRouter
