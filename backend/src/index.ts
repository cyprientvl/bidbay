import express from 'express'
import { initializeDatabase } from './orm/index'
import { regenerateFixtures } from './orm/fixtures/index'
import devRoutes from './routes/dev'
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import userRoutes from './routes/user'
import bidRoutes from './routes/bid'
import cors from 'cors'
import { Token } from './types/types'

const app = express()
app.use(express.json())
app.use(cors({}))

declare global{
  namespace Express{
    interface Request {
      user: Token
    }
  }
}

async function main () {
  await initializeDatabase()
  await regenerateFixtures()

  app.use((req, res, next)=>{
    console.log("call to the api");
    next();
  })
  console.log("call")

  app.use(devRoutes)
  app.use(authRoutes)
  app.use(productRoutes)
  app.use(userRoutes)
  app.use(bidRoutes)

  app.listen(process.env.PORT || 3000, () => {
    console.log('Server started on port 3000')
  })
}

main().catch(e => console.error(e))
