const express = require('express')
const InventoriesService = require('./InventoriesService')
const {requireAuth}=require('../middleware/jwt-auth')
const jsonBodyParser= express.json();

const inventoriesRouter = express.Router()



inventoriesRouter
.use(requireAuth)
  // .route('/')
   
  
  inventoriesRouter
  .post('/',jsonBodyParser, (req, res, next) => {
    const { item_name,description,quantity,unit_type,price,location } = req.body;
    const newItem = { item_name,description,quantity,unit_type,price,location };

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

         newItem.user_id=req.user.id;

    InventoriesService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location('/:itemId')
          .json(item);
      })
      .catch(next);
  })

  inventoriesRouter
  .get('/',(req, res,next) => {
    InventoriesService.getItemsFromTable(
      req.app.get('db'),
      req.user.id
    )
    .then(items=>
      res
      .status(200)
      .json(items)
      )
      // .catch(next)
  })
inventoriesRouter
  .delete('/:id',(req,res,next)=>{
    InventoriesService.deleteItemFromTable(
      req.app.get('db'),
      //To do pass in through path or params..
      req.params.id
    

    )
    .then(()=>{
      
     return res
      .status(204).end()

    })
    .catch(next);

  })
inventoriesRouter
  .put('/:id',(req,res)=>{
    const { item_name,description,quantity,unit_type,price,location } = req.body;
    const newItem = { item_name,description,quantity,unit_type,price,location };

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    InventoriesService.UpdateItem(
      req.app.get('db'),
      req.body.id,
      req.body.item_name,
      req.body.description,
      req.body.quantity,
      req.body.unit_type,
      req.body.price,
      req.body.location
      
    )
    .then(items=>{
     return res
      .status(200)
      .location('/:itemid')
      .json(items)
    })
  })

  inventoriesRouter
  .route('/:itemId')
  .get((req,res,next)=>{
    const{itemId}=req.params;
    return InventoriesService.getById(req.app.get('db'),itemId)
    .then(item=>{
      if(!item){
        return res.status(404).json({
          error:{message:'Item Not Found'}
        })
      }
      return res.json(item);
    })
  })
  
    
      
  




/* async/await syntax for promises */
async function checkInventoryExists(req, res, next) {
  try {
    const inventory = await InventoriesService.getById(
      req.app.get('db'),
      req.params.inventory_id
    )

    if (!inventory)
      return res.status(404).json({
        error: `Inventory doesn't exist`
      })

    res.thing = thing
    next()
  } catch (error) {
    next(error)
  }
}
  



module.exports = inventoriesRouter
