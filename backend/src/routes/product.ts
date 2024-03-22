import express from 'express'
import { Product, Bid, User } from '../orm/index'
import authMiddleware from '../middlewares/auth'
import { getDetails } from '../validators/index'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  res.status(600).send()
})

router.get('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', (req, res) => {
  res.status(600).send()
})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
