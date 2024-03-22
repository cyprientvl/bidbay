import express from 'express'

import { Product, Bid, User } from '../orm/index'

import authMiddleware from '../middlewares/auth'
import { validateRequestBody } from '~/middlewares/body'

const router = express.Router()
  
router.get('/api/products', async (req, res, next) => {
  const products = await Product.findAll({ attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'], include: ['seller', 'bids']})
  res.json(products).status(200).send()
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




router.delete('/api/products/:productId', async (req, res) =>
{
  try {
    await Product.destroy({
      where: {
        id: req.params.productId
      }

    });

    res.status(200).send();

  } catch (error) {

    console.log(error);

    res.status(400).send();

  }

})




export default router
