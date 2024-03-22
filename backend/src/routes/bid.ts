import authMiddleware from '../middlewares/auth'
import { Bid, Product } from '../orm/index'
import express from 'express'
import { getDetails } from '../validators/index'
import { MissingBid, MissingProduct } from '~/error/error'
import { validateRequestBody } from '~/middlewares/body'

const router = express.Router()

router.delete('/api/bids/:bidId', authMiddleware, async (req, res) => {
  
  try{
    const { bidId } = req.params;
    let bid

    if(req.user.admin){
      bid = await Bid.findOne({ where: { id: bidId}});
    }else{
      bid = await Bid.findOne({ where: { id: bidId, bidderId: req.user.id}});
    }

    if(!bid) throw new MissingBid();
    
    await bid.destroy();
    return res.status(204).end();

  }catch(e){
    
    if(e instanceof MissingBid){
      return res.status(404).json({error: "Bid not found"})
    }
  
    return res.status(500).json({error: "Internal server error"})
  }
 
})

router.post('/api/products/:productId/bids', authMiddleware, validateRequestBody(["price"]), async (req, res) => {

  try{

    const { productId } = req.params;
    const { price } = req.body;

    const product = await Product.findByPk(productId);

    if(!product) throw new MissingProduct();

    const bdi = await Bid.create({productId: productId, bidderId: req.user.id, price: price, date: new Date()})

    return res.status(201).json(bdi);
  }catch(e){
    if(e instanceof MissingProduct){
      return res.status(404).json({error: "Product not found"})
    }
    return res.status(500).json({error: "Internal server error"})
  }

})

export default router
