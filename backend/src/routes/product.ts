import express from 'express'

import { Product, Bid, User } from '../orm/index'
import authMiddleware from '../middlewares/auth'
import { MissingProduct, UserNotGranted } from '~/error/error'
import { validateRequestBody } from '~/middlewares/body'

const router = express.Router()
  
router.get('/api/products', async (req, res, next) => {
  try{
    const products = await Product.findAll({ attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'], include: ['seller', 'bids']})
    return res.status(200).json(products);
  }catch(e){
    return res.status(500).json({error: "Internal server error"})
  }
  
})

router.get('/api/products/:productId',  async (req, res) => {
  try {
    const { productId } = req.params;

    const products = await Product.findByPk(productId, {
      include: [{model: User,as: 'seller',attributes: ['id', 'username']}, {model: Bid, as: 'bids', attributes: ['id', 'price', 'date'], include: [{model: User, as: 'bidder', attributes: ['id', 'username']}]}]
    });

    if(!products) throw new MissingProduct();

    return res.status(200).json(products);

  } catch (error) {
    if(error instanceof MissingProduct){
      return res.status(404).json({error: "Product not found"})
    }
    return res.status(500).json({error: "Internal server error"})
  }
})

router.post('/api/products', authMiddleware, validateRequestBody(["name", "description", "category", "originalPrice", "pictureUrl", "endDate"]), 
async(req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      originalPrice: req.body.originalPrice,
      pictureUrl: req.body.pictureUrl,
      endDate: req.body.endDate,
      sellerId: req.user.id
    };

    const product = await Product.create(productData);
    return res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
});


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
