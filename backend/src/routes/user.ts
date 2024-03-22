import express from 'express'
import { User, Product, Bid } from '../orm/index'
import { MissingUser } from '../error/error'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {

  try{
    const { userId } = req.params;

    const user = await User.findByPk(userId, {attributes: ['id', 'username', 'email', 'admin'],
      include: [{model: Product,as: 'products',attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate']
     }, {model: Bid, as: "bids", attributes: ['id', 'price', 'date'], include: [{model: Product, as: "product", attributes: ['id', 'name']}]}]
     });
    if(!user) throw new MissingUser()
    return res.status(200).json(user);

  }catch(e){

    if(e instanceof MissingUser){
      return res.status(404).json({error: "User not found"})
    }
    return res.status(500).json({error: "Internal server error"})
  }
  

  
})

export default router
