import {Model, Sequelize} from "sequelize";

export interface Factory{
    init : (db : Sequelize) => typeof Model,
    relations : (db : Sequelize) => void
}