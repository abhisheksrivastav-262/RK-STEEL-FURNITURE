const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const db = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Folders
app.use(express.static(path.join(__dirname, 'public'))); // For styles, scripts, assets
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'))); // For React Admin

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

// Catch-all for React Admin Panel
app.get(/^\/admin(?:\/(.*))?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Sync Database and Start Server
db.sequelize.sync({ force: false }).then(async () => {
    console.log('Database synced successfully.');

    // Auto-migrate: add any new columns that don't exist yet in SQLite
    // (Sequelize sync({force:false}) does NOT add new columns to existing tables in SQLite)
    const qi = db.sequelize.getQueryInterface();
    try {
        const cols = await qi.describeTable('Products');
        const migrations = [
            { col: 'stock', sql: 'ALTER TABLE "Products" ADD COLUMN "stock" INTEGER DEFAULT 0' },
            { col: 'specs',  sql: 'ALTER TABLE "Products" ADD COLUMN "specs" TEXT' },
        ];
        for (const m of migrations) {
            if (!cols[m.col]) {
                await db.sequelize.query(m.sql);
                console.log(`Migration: added column Products.${m.col}`);
            }
        }
    } catch (migErr) {
        console.error('Migration warning (non-fatal):', migErr.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
