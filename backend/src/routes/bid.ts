import authMiddleware from '../middlewares/auth'
import { Bid, Product } from '../orm/index'
import express from 'express'
import { getDetails } from '../validators/index'

const router = express.Router()

router.delete('/api/bids/:bidId', async (req, res) => {
  res.status(600).send()
})

router.post('/api/products/:productId/bids', async (req, res) => {
  res.status(600).send()
})

export default router
