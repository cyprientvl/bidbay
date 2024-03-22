import express from 'express'

import { Product, Bid, User } from '../orm/index'

import authMiddleware from '../middlewares/auth'
import { MissingProduct, UserNotGranted } from '~/error/error'
import { validateRequestBody } from '~/middlewares/body'

const router = express.Router()
  
router.get('/api/products', async (req, res, next) => {
  try{
    const products = await Product.findAll({ attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'], include: ['seller', 'bids']})
    return res.json(products).status(200).send()
  }catch(e){
    return res.status(500).json({error: "Internal server error"})
  }
  
})

router.get('/api/products/:productId', async (req, res) => {
  const products = await Product.findByPk(req.params.productId, { attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'], include: ['seller', 'bids']})
  res.json(products).status(200).send()
})

router.post('/api/products', authMiddleware, validateRequestBody(["sellerId"]), async(req, res) => {
  try {
    const products = await Product.create(req.body);
    res.json(products).status(201).send()
  } catch (error) {
    console.log(error)
    res.status(400).send()
  }
})


router.put('/api/products/:productId', async (req, res) =>
{
  try {
    const product = await Product.update(req.body,
{
      where: {
        id: req.params.productId
      }
    });
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
})




router.delete('/api/products/:productId', authMiddleware, async (req, res) =>
{
  try {
    
    const {productId} = req.params;

    const product = await Product.findOne({where: {id: productId}});
    if(!product) throw new MissingProduct();

    if(product.sellerId != req.user.id && !req.user.admin) throw new UserNotGranted();
    
    await product.destroy();

    return res.status(204).end();
  } catch (error) {
    if(error instanceof MissingProduct){
      return res.status(404).json({error: "Product not found"})
    }
    if(error instanceof UserNotGranted){
      return res.status(403).json({error: "User not granted"})
    }

    return res.status(500).json({error: "Internal server error"});
  }

})




export default router
