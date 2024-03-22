import express from 'express'
import { User, Product, Bid } from '../orm/index.js'
import { MissingUser } from '../error/error.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {

  try{

    const user = await User.findByPk(req.params.userId);
    console.log(user);
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
