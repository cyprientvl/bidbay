import express from 'express'
import { Request, Response } from 'express'
import { Product, Bid, User } from '../orm/index'
import authMiddleware from '../middlewares/auth'
import { MissingProduct, UserNotGranted } from '~/error/error'
import { validateRequestBody } from '~/middlewares/body'

const router = express.Router()
  
router.get('/api/products', async (req: Request<{},{},{}, {}>, res: Response) => {
  try{
    const products = await Product.findAll({ order: [['endDate', 'DESC']], attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'], include: ['seller', {model: Bid, as: 'bids', order:  ['price', 'DESC']}]})
    return res.status(200).json(products);
  }catch(e){
    return res.status(500).json({error: "Internal server error"})
  }
  
})

router.get('/api/products/:productId',  async (req: Request<{ productId: string }, {}, {}>, res) => {
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
async(req: Request<{}, {}, {name: string, description: string, category: string, originalPrice: number, pictureUrl: string, endDate: string}, {}>, res: Response) => {
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


router.put('/api/products/:productId', authMiddleware, async (req: Request<{productId: string}, {}, {}, {}>, res: Response) =>
{
  try {

    let product = await Product.findByPk(req.params.productId);
    if(!product) throw new MissingProduct();

    if(product.sellerId != req.user.id && !req.user.admin) throw new UserNotGranted()

    product = await product.update(req.body);
    
    console.log("end");
    console.log(product);
    return res.status(200).json(product);

  } catch (error) {
    console.log(error)
    if(error instanceof UserNotGranted){
      return res.status(403).json({error: "forbidden, when non owner edit"})
    }
    if(error instanceof MissingProduct){
      return res.status(404).json({error: "not found"});
    }

    return res.status(400).send();
  }
})




router.delete('/api/products/:productId', authMiddleware, async (req: Request<{productId: string}, {}, {}, {}>, res: Response) =>
{
  try {
    
    const {productId} = req.params;

    const product = await Product.findOne({where: {id: productId}});
    if(!product) throw new MissingProduct();

    if(product.sellerId != req.user.id && !req.user.admin) throw new UserNotGranted();
    
    await Bid.destroy({where: {productId: req.params.productId}})
    await product.destroy();

    return res.status(204).end();
  } catch (error) {
    if(error instanceof MissingProduct){
      return res.status(404).json({error: "Product not found"})
    }
    if(error instanceof UserNotGranted){
      return res.status(403).json({error: "User not granted"})
    }
    console.log(error)
    return res.status(500).json({error: "Internal server error"});
  }

})




export default router
