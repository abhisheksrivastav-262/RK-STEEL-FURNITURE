const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.VERCEL
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '..', 'database.sqlite');

let sequelize;
if (process.env.DATABASE_URL) {
  // Use Postgres if configured (e.g. Vercel Postgres, Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Fallback to local SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    dialectModule: require('sqlite3'),
    storage: dbPath,
    logging: false
  });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Section = require('./Section')(sequelize, Sequelize);
db.Settings = require('./Settings')(sequelize, Sequelize);
db.Media = require('./Media')(sequelize, Sequelize);

module.exports = db;
