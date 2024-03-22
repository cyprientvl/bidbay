import {User} from './models/user'
import {Bid} from './models/bid'
import {Product} from './models/product'
import { sequelize } from './database'

export async function initializeDatabase () {
  return await sequelize.sync()
}

export { User, Bid, Product }
