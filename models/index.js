const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Section = require('./Section')(sequelize, Sequelize);
db.Settings = require('./Settings')(sequelize, Sequelize);
db.Media = require('./Media')(sequelize, Sequelize);

module.exports = db;
