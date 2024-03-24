import { Sequelize } from 'sequelize-typescript';
import {Product} from "./models/product";
import {Bid} from "./models/bid";
import {User} from "./models/user";

export const sequelize = new Sequelize({
    database: 'db',
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [Bid, Product, User],
})


